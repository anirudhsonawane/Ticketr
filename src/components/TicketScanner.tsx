"use client";

import { api } from "../../convex/_generated/api"
import { Id } from "../../convex/_generated/dataModel";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { QrCode, CheckCircle, XCircle, User, Calendar, MapPin } from "lucide-react";
import Spinner from "./Spinner";

interface TicketScannerProps {
  eventId: Id<"events">;
}

export default function TicketScanner({ eventId }: TicketScannerProps) {
  const { user } = useUser();
  const [ticketId, setTicketId] = useState("");
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    message: string;
    scannedCount?: number;
    totalCount?: number;
    remainingCount?: number;
    allScanned?: boolean;
  } | null>(null);

  const event = useQuery(api.events.getById, { eventId });
  const tickets = useQuery(api.tickets.getEventTickets, 
    user?.id ? { eventId, ownerId: user.id } : "skip"
  );
  const scanTicket = useMutation(api.tickets.scanTicket);

  if (!event || !tickets) return <Spinner />;

  const validTickets = tickets.filter(t => t.status === "valid");
  const scannedTickets = tickets.filter(t => t.status === "used");

  const handleScan = async () => {
    if (!ticketId.trim() || !user?.id) return;

    setScanResult(null);
    try {
      const result = await scanTicket({ 
        ticketId: ticketId.trim() as Id<"tickets">, 
        scannerId: user.id 
      });
      
      let message = "Ticket scanned successfully!";
      if (result.allScanned) {
        message = `All ${result.totalCount} tickets validated for this user!`;
      } else if (result.remainingCount > 0) {
        message = `${result.scannedCount}/${result.totalCount} tickets scanned. ${result.remainingCount} remaining to scan.`;
      }
      
      setScanResult({
        success: true,
        message,
        ...result
      });
      setTicketId("");
    } catch (error: any) {
      setScanResult({
        success: false,
        message: error.message || "Failed to scan ticket"
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-8 text-white">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <QrCode className="w-6 h-6" />
            Ticket Scanner
          </h2>
          <p className="text-blue-100 mt-2">Scan tickets for: {event.name}</p>
        </div>

        {/* Event Info */}
        <div className="p-6 bg-gray-50 border-b">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <span className="text-sm text-gray-600">
                {new Date(event.eventDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-500" />
              <span className="text-sm text-gray-600">{event.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-gray-500" />
              <span className="text-sm text-gray-600">
                {scannedTickets.length}/{tickets.length} scanned
              </span>
            </div>
          </div>
        </div>

        {/* Scanner Interface */}
        <div className="p-6">
          <div className="max-w-md mx-auto">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter Ticket ID
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value)}
                placeholder="Paste or type ticket ID"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleScan()}
              />
              <button
                onClick={handleScan}
                disabled={!ticketId.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Scan
              </button>
            </div>
          </div>

          {/* Scan Result */}
          {scanResult && (
            <div className={`mt-6 p-4 rounded-lg ${
              scanResult.success 
                ? "bg-green-50 border border-green-200" 
                : "bg-red-50 border border-red-200"
            }`}>
              <div className="flex items-center gap-2">
                {scanResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span className={`font-medium ${
                  scanResult.success ? "text-green-800" : "text-red-800"
                }`}>
                  {scanResult.message}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-4">Scan Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{tickets.length}</div>
              <div className="text-sm text-gray-600">Total Tickets</div>
            </div>
            <div className="bg-white p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{scannedTickets.length}</div>
              <div className="text-sm text-gray-600">Scanned</div>
            </div>
            <div className="bg-white p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-orange-600">{validTickets.length}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="bg-white p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-gray-600">
                {tickets.length > 0 ? Math.round((scannedTickets.length / tickets.length) * 100) : 0}%
              </div>
              <div className="text-sm text-gray-600">Completion</div>
            </div>
          </div>

          {/* Tickets List */}
          {tickets.length > 0 && (
            <div>
              <h4 className="text-md font-semibold mb-3">All Tickets</h4>
              <div className="bg-white rounded-lg overflow-hidden">
                <div className="max-h-60 overflow-y-auto">
                  {tickets.map((ticket: any) => (
                    <div key={ticket._id} className="flex items-center justify-between p-3 border-b border-gray-100 last:border-b-0">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{ticket.user?.name || 'Unknown User'}</div>
                        <div className="text-xs text-gray-500">{ticket.user?.email || 'No email'}</div>
                        <div className="text-xs text-gray-400">ID: {ticket._id}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          ticket.status === 'used' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {ticket.status === 'used' ? 'Scanned' : 'Pending'}
                        </span>
                        {ticket.scannedAt && (
                          <div className="text-xs text-gray-500">
                            {new Date(ticket.scannedAt).toLocaleTimeString()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}