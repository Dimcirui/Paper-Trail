"use client";

import React from "react";
import { UserProvider } from "@/lib/UserContext";

// Wrapper component to provide client-side context providers
export function ClientProviders({ children }: { children: React.ReactNode }) {
    return <UserProvider>{children}</UserProvider>;
}