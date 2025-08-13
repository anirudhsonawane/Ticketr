import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { WAITING_LIST_STATUS, TICKET_STATUS } from "./constants";
import { internal } from "./_generated/api";

export const getUserTickets = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.or(
        q.eq(q.field("status"), TICKET_STATUS.VALID),
        q.eq(q.field("status"), TICKET_STATUS.USED)
      ))
      .collect();

    // Get event details for each ticket
    const ticketsWithEvents = await Promise.all(
      tickets.map(async (ticket) => {
        const event = await ctx.db.get(ticket.eventId);
        return {
          ...ticket,
          eventName: event?.name || "Unknown Event",
          eventDate: event?.eventDate || 0,
          eventLocation: event?.location || "Unknown Location",
          price: ticket.amount || 0,
        };
      })
    );

    return ticketsWithEvents.sort((a, b) => b.eventDate - a.eventDate);
  },
});

export const getUserTicketForEvent = query({
  args: {
    eventId: v.id("events"),
    userId: v.string(),
  },
  handler: async (ctx, { eventId, userId }) => {
    // Return first ticket for backward compatibility
    const ticket = await ctx.db
      .query("tickets")
      .withIndex("by_user_event", (q) =>
        q.eq("userId", userId).eq("eventId", eventId)
      )
      .filter((q) => q.or(
        q.eq(q.field("status"), TICKET_STATUS.VALID),
        q.eq(q.field("status"), TICKET_STATUS.USED)
      ))
      .first();

    return ticket;
  },
});

export const getById = query({
  args: { ticketId: v.id("tickets") },
  handler: async (ctx, { ticketId }) => {
    return await ctx.db.get(ticketId);
  },
});

export const getUserTicketsForEvent = query({
  args: {
    eventId: v.id("events"),
    userId: v.string(),
  },
  handler: async (ctx, { eventId, userId }) => {
    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_user_event", (q) =>
        q.eq("userId", userId).eq("eventId", eventId)
      )
      .filter((q) => q.or(
        q.eq(q.field("status"), TICKET_STATUS.VALID),
        q.eq(q.field("status"), TICKET_STATUS.USED)
      ))
      .collect();

    return tickets;
  },
});

export const scanTicket = mutation({
  args: { 
    ticketId: v.id("tickets"),
    scannerId: v.string() // User ID of the person scanning
  },
  handler: async (ctx, { ticketId, scannerId }) => {
    const ticket = await ctx.db.get(ticketId);
    if (!ticket) throw new Error("Ticket not found");
    
    // Get the event to check ownership
    const event = await ctx.db.get(ticket.eventId);
    if (!event) throw new Error("Event not found");
    
    // Only allow event owner to scan tickets
    if (event.userId !== scannerId) {
      throw new Error("Only event owner can scan tickets");
    }
    
    if (ticket.status === TICKET_STATUS.USED) {
      throw new Error("Ticket already scanned");
    }
    
    await ctx.db.patch(ticketId, {
      status: TICKET_STATUS.USED,
      scannedAt: Date.now(),
    });
    
    // Get all tickets for this user and event to show status
    const userTickets = await ctx.db
      .query("tickets")
      .withIndex("by_user_event", (q) => q.eq("userId", ticket.userId).eq("eventId", ticket.eventId))
      .filter((q) => q.or(
        q.eq(q.field("status"), TICKET_STATUS.VALID),
        q.eq(q.field("status"), TICKET_STATUS.USED)
      ))
      .collect();
    
    const scannedCount = userTickets.filter(t => t.status === TICKET_STATUS.USED).length;
    const totalCount = userTickets.length;
    const remainingCount = totalCount - scannedCount;
    
    return { 
      success: true, 
      scannedCount,
      totalCount,
      remainingCount,
      allScanned: remainingCount === 0
    };
  },
});

export const getUserTicketCount = query({
  args: {
    eventId: v.id("events"),
    userId: v.string(),
  },
  handler: async (ctx, { eventId, userId }) => {
    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_user_event", (q) =>
        q.eq("userId", userId).eq("eventId", eventId)
      )
      .filter((q) => q.eq(q.field("status"), TICKET_STATUS.VALID))
      .collect();

    return tickets.length;
  },
});

// Get tickets for event owner to scan
export const getEventTickets = query({
  args: { 
    eventId: v.id("events"),
    ownerId: v.string()
  },
  handler: async (ctx, { eventId, ownerId }) => {
    // Verify event ownership
    const event = await ctx.db.get(eventId);
    if (!event || event.userId !== ownerId) {
      throw new Error("Access denied");
    }
    
    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .filter((q) => q.or(
        q.eq(q.field("status"), TICKET_STATUS.VALID),
        q.eq(q.field("status"), TICKET_STATUS.USED)
      ))
      .collect();
    
    // Get user details for each ticket
    const ticketsWithUsers = await Promise.all(
      tickets.map(async (ticket) => {
        const user = await ctx.db
          .query("users")
          .withIndex("by_user_id", (q) => q.eq("userId", ticket.userId))
          .first();
        return {
          ...ticket,
          user: user || { name: "Unknown", email: "Unknown" }
        };
      })
    );
    
    return ticketsWithUsers;
  },
});

// Issues tickets after successful payment confirmation (supports multiple tickets)
export const issueAfterPayment = mutation({
  args: {
    eventId: v.id("events"),
    userId: v.string(),
    paymentIntentId: v.string(),
    amount: v.number(),
    quantity: v.optional(v.number()),
    passId: v.optional(v.id("passes")),
  },
  handler: async (ctx, { eventId, userId, paymentIntentId, amount, quantity = 1, passId }) => {
    const event = await ctx.db.get(eventId);
    if (!event) throw new ConvexError("Event not found");

    // Idempotency: if tickets already exist for this payment, return existing
    const existingByPayment = await ctx.db
      .query("tickets")
      .withIndex("by_payment_intent", (q) => q.eq("paymentIntentId", paymentIntentId))
      .collect();
    if (existingByPayment.length > 0) {
      return existingByPayment.map(t => t._id);
    }

    // Mark ALL user's waiting list entries as purchased
    const waitingListEntries = await ctx.db
      .query("waitingList")
      .withIndex("by_user_event", (q) => q.eq("userId", userId).eq("eventId", eventId))
      .filter((q) => q.or(
        q.eq(q.field("status"), WAITING_LIST_STATUS.OFFERED),
        q.eq(q.field("status"), WAITING_LIST_STATUS.WAITING)
      ))
      .collect();
    
    for (const entry of waitingListEntries) {
      await ctx.db.patch(entry._id, {
        status: WAITING_LIST_STATUS.PURCHASED,
      });
    }
    
    if (waitingListEntries.length > 0) {
      // Process queue to offer ticket to next person
      await ctx.runMutation(internal.waitingList.processQueue, { eventId });
    }

    // Create tickets based on quantity (ensure exact quantity)
    const ticketIds = [];
    const baseTime = Date.now();
    const ticketQuantity = Math.max(1, quantity || 1); // Ensure at least 1 ticket
    
    for (let i = 0; i < ticketQuantity; i++) {
      const ticketId = await ctx.db.insert("tickets", {
        eventId,
        userId,
        purchasedAt: baseTime + i,
        status: TICKET_STATUS.VALID,
        paymentIntentId,
        amount: passId ? Math.round(amount / ticketQuantity) : event.price,
        passId,
      });
      ticketIds.push(ticketId);
    }
    
    // Update pass sold quantity if passId is provided
    if (passId) {
      const pass = await ctx.db.get(passId);
      if (pass) {
        await ctx.db.patch(passId, {
          soldQuantity: pass.soldQuantity + ticketQuantity,
        });
      }
    }

    return ticketIds;
  },
});
export const getTicketWithDetails = query({
  args: { ticketId: v.id("tickets") },
  handler: async (ctx, { ticketId }) => {
    const ticket = await ctx.db.get(ticketId);
    if (!ticket) return null;
    
    const event = await ctx.db.get(ticket.eventId);
    return {
      ...ticket,
      event
    };
  },
});
export const getTicketStatus = query({
  args: { ticketId: v.id("tickets") },
  handler: async (ctx, { ticketId }) => {
    const ticket = await ctx.db.get(ticketId);
    if (!ticket) return null;
    
    // Get all user tickets for this event
    const userTickets = await ctx.db
      .query("tickets")
      .withIndex("by_user_event", (q) => q.eq("userId", ticket.userId).eq("eventId", ticket.eventId))
      .filter((q) => q.or(
        q.eq(q.field("status"), TICKET_STATUS.VALID),
        q.eq(q.field("status"), TICKET_STATUS.USED)
      ))
      .collect();
    
    const scannedCount = userTickets.filter(t => t.status === TICKET_STATUS.USED).length;
    
    return {
      status: ticket.status,
      scannedAt: ticket.scannedAt,
      scannedCount,
      totalCount: userTickets.length,
      isScanned: ticket.status === TICKET_STATUS.USED
    };
  },
});