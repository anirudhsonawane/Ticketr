import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

export const getUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => {
    return await ctx.storage.getUrl(storageId);
  },
});

// Generate upload URL for file uploads
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Update event image
export const updateEventImage = mutation({
  args: {
    eventId: v.id("events"),
    storageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, { eventId, storageId }) => {
    await ctx.db.patch(eventId, {
      imageStorageId: storageId,
    });
  },
});

// Delete image from storage
export const deleteImage = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, { storageId }) => {
    await ctx.storage.delete(storageId);
  },
});