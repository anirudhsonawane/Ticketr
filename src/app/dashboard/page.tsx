'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useClientAuth } from '@/components/ClientSideAuth';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, isLoading, isSignedIn, signOut } = useClientAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isSignedIn) {
      router.push('/login');
    }
  }, [isLoading, isSignedIn, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Client-side authenticated page example
              </p>
            </div>
            <button
              onClick={signOut}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Sign Out
            </button>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900">Welcome, {user?.name || 'User'}!</h2>
              <p className="mt-1 text-sm text-gray-500">
                This is a protected dashboard page that requires authentication.
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-md font-medium text-gray-900">Static Export Information</h3>
              <p className="mt-1 text-sm text-gray-500">
                This page demonstrates client-side authentication that works with static exports.
                When deploying to Firebase static hosting, you can use this approach instead of middleware.
              </p>
            </div>
            
            <div className="mt-6">
              <Link 
                href="/"
                className="text-indigo-600 hover:text-indigo-500"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}