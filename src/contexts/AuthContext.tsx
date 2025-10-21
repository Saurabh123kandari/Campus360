/**
 * AuthContext for Padmai Demo
 * 
 * This is a demo-only authentication system that uses static JSON data.
 * All authentication is handled in-memory and does not persist to the filesystem.
 * Data resets on app reload for demo purposes.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Role, AuthContextType, RegisterPayload } from '../types/auth';
import { useData } from '../providers/DataProvider';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { users, addUser } = useData();

  useEffect(() => {
    // Simulate loading stored auth state
    const loadAuthState = async () => {
      try {
        // In a real app, you'd check AsyncStorage or secure storage
        // For demo purposes, we start with no authenticated user
        console.debug('🔐 Auth state loaded - no persistent user');
      } catch (error) {
        console.error('❌ Error loading auth state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthState();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.debug('🔐 Attempting login for:', email);
      console.debug('📊 Available users:', users.length);
      console.debug('📊 Users data:', users);
      
      // Find user in static data
      const foundUser = users.find(u => u.email === email);
      
      if (!foundUser) {
        console.debug('❌ User not found:', email);
        console.debug('❌ Available emails:', users.map(u => u.email));
        return { success: false, error: 'Invalid email or password' };
      }

      console.debug('✅ User found:', foundUser);

      // Check password (in real app, this would be hashed)
      if (foundUser.password !== password) {
        console.debug('❌ Invalid password for:', email);
        console.debug('❌ Expected:', foundUser.password, 'Got:', password);
        return { success: false, error: 'Invalid email or password' };
      }

      // Create user object without password
      const { password: _, ...userWithoutPassword } = foundUser;
      console.debug('✅ Setting user:', userWithoutPassword);
      setUser(userWithoutPassword as User);
      
      console.debug('✅ Login successful for:', email, 'Role:', foundUser.role);
      return { success: true };
    } catch (error) {
      console.error('❌ Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const register = async (userData: RegisterPayload): Promise<{ success: boolean; error?: string }> => {
    try {
      console.debug('📝 Attempting registration for:', userData.email);
      
      // Check if user already exists
      const existingUser = users.find(u => u.email === userData.email);
      if (existingUser) {
        return { success: false, error: 'User with this email already exists' };
      }

      // Validate passwords match
      if (userData.password !== userData.confirmPassword) {
        return { success: false, error: 'Passwords do not match' };
      }

      // Create new user
      const newUser: User = {
        id: `user-${Date.now()}`,
        fullName: userData.fullName,
        email: userData.email,
        role: userData.role,
        childId: userData.childId,
        createdAt: new Date().toISOString(),
      };

      // Add to in-memory users list
      addUser(newUser);
      
      // Set as current user (auto-login after registration)
      setUser(newUser);
      
      console.debug('✅ Registration successful for:', userData.email, 'Role:', userData.role);
      return { success: true };
    } catch (error) {
      console.error('❌ Registration error:', error);
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  };

  const logout = () => {
    console.debug('🚪 Logging out user:', user?.email);
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};