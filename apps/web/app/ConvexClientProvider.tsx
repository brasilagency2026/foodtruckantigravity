"use client";

import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth } from "@clerk/nextjs";
import { ReactNode } from "react";
import { NativeBridge } from "../lib/NativeBridge";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

if (typeof window !== "undefined") {
  NativeBridge.initPush((token) => {
    console.log("Device push token:", token);
  });
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth as any}>
      {children}
    </ConvexProviderWithClerk>
  );
}



