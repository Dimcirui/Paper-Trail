"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface User {
    id: number;
    userName: string;
    email: string;
    role: string;
}

interface UserContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    isLoading: boolean;
    isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider component
export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    

    useEffect(() => {
        // Demo, assume reading from localStorage or cookie
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const isAuthenticated = user !== null;

    return (
        <UserContext.Provider value={{ user, setUser, isLoading, isAuthenticated }}>
            {children}
        </UserContext.Provider>
    );
}

// Hook for easy use
export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}