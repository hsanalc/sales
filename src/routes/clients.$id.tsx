import { createFileRoute, redirect } from "@tanstack/react-router";
import { ProfilePage } from "@/pages/ProfilePage";
import { useAuthStore } from "@/store/authStore";

export const Route = createFileRoute("/clients/$id")({
  beforeLoad: () => {
    if (!useAuthStore.getState().isAuthenticated) throw redirect({ to: "/login" });
  },
  head: () => ({
    meta: [
      { title: "Client Profile — Acquire Sales" },
      {
        name: "description",
        content: "Client overview with engagements, contacts, intake, and follow-up calls.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: ClientProfileRoute,
});

function ClientProfileRoute() {
  const { id } = Route.useParams();
  return <ProfilePage id={id} />;
}
