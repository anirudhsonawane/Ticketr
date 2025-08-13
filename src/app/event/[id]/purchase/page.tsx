"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { ArrowLeft, Plus, Minus, Tag, Check } from "lucide-react";
import Spinner from "@/components/Spinner";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PurchasePage() {
  const { user } = useUser();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  
  const eventId = params.id as Id<"events">;
  const passId = searchParams.get("passId") as Id<"passes">;

  const event = useQuery(api.events.getById, { eventId });
  const pass = useQuery(api.passes.getEventPasses, { eventId });
  
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const selectedPass = pass?.find(p => p._id === passId);
  const totalAmount = selectedPass ? selectedPass.price * quantity : 0;
  const availableQuantity = selectedPass ? selectedPass.totalQuantity - selectedPass.soldQuantity : 0;

  if (!event || !pass || !selectedPass) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    const maxAllowed = Math.min(availableQuantity, 10);
    if (newQuantity >= 1 && newQuantity <= maxAllowed) {
      setQuantity(newQuantity);
    }
  };

  const handlePurchase = async () => {
    if (!user || !event || !selectedPass) return;

    try {
      setIsLoading(true);
      
      if (typeof window.Razorpay === 'undefined') {
        alert('Payment system not loaded. Please refresh the page.');
        return;
      }
      
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: totalAmount,
          eventId: eventId,
          userId: user.id,
          quantity: quantity,
          passId: passId,
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }
      
      const order = await response.json();
      
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "T-System",
        description: `${quantity} ${selectedPass.name} for ${event.name}`,
        order_id: order.orderId,
        handler: function (response: { razorpay_payment_id: string }) {
          localStorage.setItem('lastEventId', eventId);
          localStorage.setItem('lastUserId', user.id);
          localStorage.setItem('lastQuantity', quantity.toString());
          localStorage.setItem('lastAmount', totalAmount.toString());
          localStorage.setItem('lastPassId', passId);
          router.push(`/tickets/purchase-success?payment_id=${response.razorpay_payment_id}`);
        },
        prefill: {
          name: user.fullName || "",
          email: user.emailAddresses[0]?.emailAddress || "",
        },
        theme: {
          color: "#f59e0b",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Error creating payment:", error);
      alert('Payment failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Passes
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Complete Your Purchase
          </h1>
          <p className="text-gray-600">
            {event.name}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Selected Pass Info */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Tag className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {selectedPass.name}
                </h3>
                <p className="text-gray-600 mb-3">
                  {selectedPass.description}
                </p>
                <div className="text-2xl font-bold text-gray-900">
                  ₹{selectedPass.price.toFixed(2)} per ticket
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {selectedPass.totalQuantity} / {availableQuantity} available
                </div>
              </div>
            </div>

            {/* Benefits */}
            {selectedPass.benefits.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold text-gray-900 mb-3">
                  What's included:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedPass.benefits.map((benefit, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 text-sm text-gray-600"
                    >
                      <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quantity Selector */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Quantity</h4>
                <p className="text-sm text-gray-600">
                  Select number of tickets
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="w-10 h-10 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-semibold text-lg">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= Math.min(availableQuantity, 10)}
                  className="w-10 h-10 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Total & Purchase */}
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <span className="text-lg font-semibold text-gray-900">
                Total Amount:
              </span>
              <span className="text-2xl font-bold text-gray-900">
                ₹{totalAmount.toFixed(2)}
              </span>
            </div>

            <Button
              onClick={handlePurchase}
              disabled={isLoading || !user || availableQuantity === 0}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-semibold py-4 rounded-lg text-lg transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isLoading
                ? "Processing Payment..."
                : !user
                ? "Sign in to Purchase"
                : availableQuantity === 0
                ? "Sold Out"
                : `Pay ₹${totalAmount.toFixed(2)} with UPI/Card`}
            </Button>

            {user && (
              <p className="text-xs text-gray-500 text-center mt-3">
                Secure payment powered by Razorpay
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}