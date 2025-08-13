"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Ticket, Calendar, MapPin, Clock, Download, Tag } from "lucide-react";
import Link from "next/link";
import Spinner from "@/components/Spinner";

export default function MyTicketsPage() {
  const { user, isLoaded } = useUser();
  const tickets = useQuery(api.tickets.getUserTickets, 
    user ? { userId: user.id } : "skip"
  );
  
  // Get passes for all tickets
  const passes = useQuery(api.passes.getEventPasses, 
    tickets?.[0]?.eventId ? { eventId: tickets[0].eventId } : "skip"
  );

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Please sign in to view your tickets</h1>
      </div>
    );
  }

  if (!tickets) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Tickets</h1>
        <p className="text-gray-600 mt-2">View and manage your purchased tickets</p>
      </div>

      {tickets.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <Ticket className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No tickets yet</h3>
          <p className="text-gray-600 mt-1">Purchase tickets to see them here</p>
          <Link href="/" className="inline-block mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Browse Events
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {tickets.map((ticket) => (
            <div key={ticket._id} className="bg-white rounded-lg shadow-md border p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{ticket.eventName}</h3>
                    {(() => {
                      const passInfo = passes?.find(p => p._id === ticket.passId);
                      return passInfo && (
                        <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                          <Tag className="w-3 h-3" />
                          {passInfo.name}
                        </span>
                      );
                    })()
                    }
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(ticket.eventDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {new Date(ticket.eventDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {ticket.eventLocation}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">₹{ticket.price}</div>
                  <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    ticket.status === 'valid' ? 'bg-green-100 text-green-800' : 
                    ticket.status === 'used' ? 'bg-gray-100 text-gray-800' : 
                    'bg-red-100 text-red-800'
                  }`}>
                    {ticket.status}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-sm text-gray-500">
                  <div>Ticket ID: {ticket._id}</div>
                  <div>Purchased: {new Date(ticket.purchasedAt).toLocaleString()}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => window.open(`/tickets/${ticket._id}`, '_blank')}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 flex items-center gap-1"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <Link 
                    href={`/tickets/${ticket._id}`}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
                  >
                    View Ticket
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}