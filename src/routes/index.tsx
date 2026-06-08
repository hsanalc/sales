import { createFileRoute, redirect } from "@tanstack/react-router";
import { CalculatorPage } from "@/pages/CalculatorPage";
import { useAuthStore } from "@/store/authStore";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (!useAuthStore.getState().isAuthenticated) throw redirect({ to: "/login" });
  },
  validateSearch: (search: Record<string, unknown>) => ({
    clientName: typeof search.clientName === "string" ? search.clientName : undefined,
    taxYears: typeof search.taxYears === "string" ? search.taxYears : undefined,
    latestCalculation:
      typeof search.latestCalculation === "string" ? search.latestCalculation : undefined,
    hasExistingCalculation:
      typeof search.hasExistingCalculation === "boolean" ? search.hasExistingCalculation : false,
  }),
  head: () => ({
    meta: [
      { title: "R&D Billing Calculator — Acquire Sales" },
      {
        name: "description",
        content: "Enterprise R&D tax credit and billing calculator for multi-entity clients.",
      },
      { property: "og:title", content: "R&D Billing Calculator" },
      { property: "og:description", content: "Enterprise R&D tax credit and billing calculator." },
    ],
  }),
  component: CalculatorPage,
});
