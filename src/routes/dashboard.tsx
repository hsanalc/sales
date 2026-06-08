import { createFileRoute, redirect } from "@tanstack/react-router";
import { DashboardPage } from "@/pages/DashboardPage";
import { useAuthStore } from "@/store/authStore";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: () => {
    if (!useAuthStore.getState().isAuthenticated) throw redirect({ to: "/login" });
  },
  head: () => ({
    meta: [
      { title: "Client Dashboard — Acquire Sales" },
      {
        name: "description",
        content: "Manage leads, send proposals, and track active client engagements.",
      },
      { property: "og:title", content: "Client Dashboard" },
      {
        property: "og:description",
        content: "Manage leads, send proposals, and track active engagements.",
      },
    ],
  }),
  component: DashboardPage,
});
