import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  getCurrentUser,
  signIn,
  signUp,
  confirmSignUp,
  signOut,
  fetchUserAttributes,
} from 'aws-amplify/auth';

interface User {
  username: string;
  email?: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  confirmSignup: (email: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        const attributes = await fetchUserAttributes();
        setUser({ 
          username: currentUser.username, 
          email: attributes.email,
          name: attributes.name 
        });
      } catch {
        setUser(null);
      }
    };
    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    await signIn({ username: email, password });
    const currentUser = await getCurrentUser();
    const attributes = await fetchUserAttributes();
    setUser({ 
      username: currentUser.username, 
      email: attributes.email,
      name: attributes.name 
    });
  };

  const signup = async (name: string, email: string, password: string) => {
    await signUp({
      username: email,
      password,
      options: {
        userAttributes: { 
          email, 
          name,
          preferred_username: email.split('@')[0] // Use email prefix as username
        },
      },
    });
  };

  const confirmSignup = async (email: string, code: string) => {
    await confirmSignUp({ username: email, confirmationCode: code });
  };

  const logout = async () => {
    await signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        signup,
        confirmSignup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
