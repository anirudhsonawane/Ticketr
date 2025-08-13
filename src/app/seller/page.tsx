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
  // Also update in seller page.tsx
];

export default function SellerPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/");
      return;
    }

    if (isLoaded && user && AUTHORIZED_CREATORS.includes(user.id)) {
      router.push("/seller/new-event");
    }
  }, [isLoaded, user, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isAuthorized = AUTHORIZED_CREATORS.includes(user.id);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto p-6">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-red-600 to-red-800 px-6 py-6 text-white">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6" />
                <div>
                  <h2 className="text-xl font-bold">Access Restricted</h2>
                  <p className="text-red-100 text-sm mt-1">
                    Seller access requires approval
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Authorization Required
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Contact developers for seller access.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-center gap-2 text-gray-700 text-sm">
                  <Mail className="w-4 h-4" />
                  <span>support@ticketr.com</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  User ID: {user.id}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null; // Will redirect to new-event page
}