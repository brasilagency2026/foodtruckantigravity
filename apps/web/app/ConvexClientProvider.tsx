"use client";

import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth } from "@clerk/nextjs";
import { useEffect, ReactNode } from "react";
import { NativeBridge } from "../lib/NativeBridge";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    NativeBridge.initPushNotifications((token) => {
      console.log("Device push token:", token);
    });
  }, []);

  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth as any}>
      {children}
    </ConvexProviderWithClerk>
  );
}



