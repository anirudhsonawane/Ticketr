'use client';

import { useClientAuth, ProtectedRoute, LoginForm } from '@/components/ClientSideAuth';

// Example page showing how to use the client-side authentication
// This is an alternative to middleware-based authentication for static exports

export default function ClientAuthExample() {
  const { user, isSignedIn, signOut } = useClientAuth();

  // If not signed in, show login form
  if (!isSignedIn) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Client-Side Authentication Example</h1>
        <p className="mb-4">
          This is an example of client-side authentication that works with static exports.
          Use this approach when deploying to Firebase static hosting.
        </p>
        <div className="max-w-md">
          <LoginForm />
        </div>
      </div>
    );
  }

  // If signed in, show protected content
  return (
    <ProtectedRoute>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Protected Page</h1>
        <p className="mb-4">Welcome, {user?.name || 'User'}!</p>
        <p className="mb-4">This content is only visible to authenticated users.</p>
        <button
          onClick={signOut}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
        >
          Sign Out
        </button>
      </div>
    </ProtectedRoute>
  );
}