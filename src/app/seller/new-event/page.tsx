"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Mail, Shield } from "lucide-react";
import EventForm from "@/components/EventForm";

// Authorized event creators (add developer-approved user IDs here)
const AUTHORIZED_CREATORS: string[] = [
  // Add authorized user IDs here
  "user_30vHGOIpgMB2gXYCo6fEAxQzA0W",
];

export default function NewEventPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/");
      return;
    }

    if (isLoaded && user && !AUTHORIZED_CREATORS.includes(user.id)) {
      router.push("/seller");
    }
  }, [isLoaded, user, router]);

  if (!isLoaded) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg text-center p-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isAuthorized = AUTHORIZED_CREATORS.includes(user.id);

  if (!isAuthorized) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg text-center p-8">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Debug Info</h2>
          <p className="text-gray-600 mb-2">Your User ID: {user.id}</p>
          <p className="text-gray-600 mb-2">Authorized IDs: {JSON.stringify(AUTHORIZED_CREATORS)}</p>
          <p className="text-gray-600">Is Authorized: {isAuthorized.toString()}</p>
        </div>
      </div>
    );
  }

  // Show EventForm for authorized users
  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Create New Event</h1>
          <p className="text-gray-600 mt-2">Fill in the details to create your event</p>
        </div>
        <EventForm mode="create" />
      </div>
    </div>
  );
}