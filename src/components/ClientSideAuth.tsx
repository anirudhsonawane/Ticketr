import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// This is a simplified client-side authentication component
// to be used as an alternative when deploying to static hosting
// where middleware is not supported

type User = {
  id: string;
  email?: string;
  name?: string;
  // Add other user properties as needed
};

export const useClientAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for user in localStorage (or other client storage)
    const storedUser = localStorage.getItem('user');
    
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored user data');
        localStorage.removeItem('user');
      }
    }
    
    setIsLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    // Implement your client-side authentication logic here
    // This is a placeholder implementation
    try {
      // Make API call to your authentication endpoint
      // const response = await fetch('/api/auth/signin', {...});
      // const data = await response.json();
      
      // For demo purposes only - replace with actual implementation
      const mockUser = { id: '123', email, name: 'Demo User' };
      
      // Store user in localStorage
      localStorage.setItem('user', JSON.stringify(mockUser));
      setUser(mockUser);
      return true;
    } catch (error) {
      console.error('Sign in failed:', error);
      return false;
    }
  };

  const signOut = () => {
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
  };

  return {
    user,
    isLoading,
    isSignedIn: !!user,
    signIn,
    signOut
  };
};

// Example protected route component
export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useClientAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      // Redirect to login page if not authenticated
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return user ? <>{children}</> : null;
};

// Example login form component
export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn } = useClientAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await signIn(email, password);
    if (success) {
      router.push('/dashboard');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <button type="submit">Sign In</button>
    </form>
  );
};