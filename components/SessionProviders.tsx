"use client";
import React from "react";
import { SessionProvider } from "next-auth/react";

export default function SessionProviders({
  children,
  session,
}: {
  children: React.ReactNode;
  session?: any; // optionnel
}) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
