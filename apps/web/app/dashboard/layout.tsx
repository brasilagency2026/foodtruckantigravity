"use client";

import WebOnlyRoute from "../../components/WebOnlyRoute";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WebOnlyRoute>{children}</WebOnlyRoute>;
}
