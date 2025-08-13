"use client";

import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { useEffect, useState } from "react";
import {
  CalendarDays,
  IdCard,
  MapPin,
  Ticket as TicketIcon,
  User,
} from "lucide-react";
import QRCode from "react-qr-code";
import Spinner from "./Spinner";
import { useStorageUrl } from "@/lib/utils";
import Image from "next/image";

export default function Ticket({ ticketId }: { ticketId: Id<"tickets"> }) {
  const ticket = useQuery(api.tickets.getById, { ticketId });
  const ticketStatus = useQuery(api.tickets.getTicketStatus, { ticketId });
  const event = useQuery(api.events.getById, 
    ticket?.eventId ? { eventId: ticket.eventId } : "skip"
  );
  const user = useQuery(api.users.getUserById, {
    userId: ticket?.userId ?? "",
  });
  const selectedPass = useQuery(api.passes.getPassById, 
    ticket?.passId ? { passId: ticket.passId } : "skip"
  );
  const imageUrl = useStorageUrl(event?.imageStorageId);

  // Force component re-render every 2 seconds for real-time updates
  const [, forceUpdate] = useState({});
  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate({});
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const getUserTheme = (userId: string) => {
    const colors = [
      { bg: "bg-gradient-to-br from-blue-500 to-purple-600", accent: "text-blue-600", light: "bg-blue-50" },
      { bg: "bg-gradient-to-br from-green-500 to-teal-600", accent: "text-green-600", light: "bg-green-50" },
      { bg: "bg-gradient-to-br from-purple-500 to-pink-600", accent: "text-purple-600", light: "bg-purple-50" },
      { bg: "bg-gradient-to-br from-orange-500 to-red-600", accent: "text-orange-600", light: "bg-orange-50" },
      { bg: "bg-gradient-to-br from-indigo-500 to-blue-600", accent: "text-indigo-600", light: "bg-indigo-50" },
      { bg: "bg-gradient-to-br from-pink-500 to-rose-600", accent: "text-pink-600", light: "bg-pink-50" },
      { bg: "bg-gradient-to-br from-teal-500 to-cyan-600", accent: "text-teal-600", light: "bg-teal-50" },
      { bg: "bg-gradient-to-br from-amber-500 to-orange-600", accent: "text-amber-600", light: "bg-amber-50" }
    ];
    const hash = userId.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0);
    return colors[Math.abs(hash) % colors.length];
  };

  if (!ticket || !event || !user || !ticketStatus) {
    return <Spinner />;
  }

  const theme = getUserTheme(user.userId);
  const { scannedCount, totalCount, isScanned, scannedAt } = ticketStatus;

  return (
    <div
      className={`bg-white rounded-xl overflow-hidden shadow-xl border ${event.is_cancelled ? "border-red-200" : "border-gray-100"}`}
    >
      {/* Event Header with Image */}
      <div className="relative">
        {imageUrl && (
          <div className="relative w-full aspect-[21/9] ">
            <Image
              src={imageUrl}
              alt={event.name}
              fill
              className={`object-cover object-center ${event.is_cancelled ? "opacity-50" : ""}`}
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/90" />
          </div>
        )}
        <div
          className={`px-6 py-4 ${imageUrl ? "absolute bottom-0 left-0 right-0" : event.is_cancelled ? "bg-red-600" : theme.bg} `}
        >
          <h2
            className={`text-2xl font-bold ${imageUrl || !imageUrl ? "text-white" : "text-black"}`}
          >
            {event.name}
          </h2>
          {event.is_cancelled && (
            <p className="text-red-300 mt-1">This event has been cancelled</p>
          )}
        </div>
      </div>

      {/* Ticket Content */}
      <div className="p-6">
        <div className="grid grid-cols-2 gap-6">
          {/* Left Column - Event Details */}
          <div className="space-y-4">
            <div className="flex items-center text-gray-600">
              <CalendarDays
                className={`w-5 h-5 mr-3 ${event.is_cancelled ? "text-red-600" : theme.accent}`}
              />
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">
                  {new Date(event.eventDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center text-gray-600">
              <MapPin
                className={`w-5 h-5 mr-3 ${event.is_cancelled ? "text-red-600" : theme.accent}`}
              />
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium">{event.location}</p>
              </div>
            </div>

            <div className="flex items-center text-gray-600">
              <User
                className={`w-5 h-5 mr-3 ${event.is_cancelled ? "text-red-600" : theme.accent}`}
              />
              <div>
                <p className="text-sm text-gray-500">Ticket Holder</p>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center text-gray-600 break-all">
              <IdCard
                className={`w-5 h-5 mr-3 ${event.is_cancelled ? "text-red-600" : theme.accent}`}
              />
              <div>
                <p className="text-sm text-gray-500">Ticket Holder ID</p>
                <p className="font-medium">{user.userId}</p>
              </div>
            </div>

            <div className="flex items-center text-gray-600">
              <TicketIcon
                className={`w-5 h-5 mr-3 ${event.is_cancelled ? "text-red-600" : theme.accent}`}
              />
              <div>
                <p className="text-sm text-gray-500">{selectedPass ? 'Pass Type' : 'Ticket Price'}</p>
                <p className="font-medium">{selectedPass?.name || 'General Admission'}</p>
                <p className="text-sm text-gray-500">₹{selectedPass?.price?.toFixed(2) || event.price.toFixed(2)}</p>
                <p className="text-xs text-gray-400">Pass ID: {ticket.passId || 'None'}</p>
              </div>
            </div>
          </div>

          {/* Right Column - QR Code */}
          <div className="flex flex-col items-center justify-center border-l border-gray-200 pl-6">
            <div
              className={`bg-gray-100 p-4 rounded-lg ${event.is_cancelled ? "opacity-50" : ""}`}
            >
              <QRCode value={ticket._id} className="w-32 h-32" />
            </div>
            <p className="mt-2 text-sm text-gray-500 break-all text-center max-w-[200px] md:max-w-full">
              Ticket ID: {ticket._id}
            </p>
          </div>
        </div>

        {/* Pass Benefits */}
        {selectedPass && selectedPass.benefits && selectedPass.benefits.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Pass Benefits
            </h3>
            <ul className="space-y-2">
              {selectedPass.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Additional Information */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            Important Information
          </h3>
          {event.is_cancelled ? (
            <p className="text-sm text-red-600">
              This event has been cancelled. A refund will be processed if it
              hasn&apos;t been already.
            </p>
          ) : (
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Please arrive at least 30 minutes before the event</li>
              <li>• Have your ticket QR code ready for scanning</li>
              <li>• This ticket is non-transferable</li>
            </ul>
          )}
        </div>
      </div>

      {/* Ticket Footer */}
      <div
        className={`${event.is_cancelled ? "bg-red-50" : theme.light} px-6 py-4 flex justify-between items-center`}
      >
        <span className="text-sm text-gray-500">
          Purchase Date: {new Date(ticket.purchasedAt).toLocaleString()}
        </span>
        <div className="text-right">
          <span
            className={`text-sm font-medium ${event.is_cancelled ? "text-red-600" : isScanned ? "text-green-600" : theme.accent}`}
          >
            {event.is_cancelled ? "Cancelled" : isScanned ? "Scanned" : "Valid Ticket"}
          </span>
          {isScanned && scannedAt && (
            <div className="text-xs text-gray-500 mt-1">
              Scanned: {new Date(scannedAt).toLocaleString()}
            </div>
          )}
          <div className="text-xs text-gray-500 mt-1">
            {scannedCount}/{totalCount} tickets scanned
          </div>
        </div>
      </div>
    </div>
  );
}
