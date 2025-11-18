import { redirect } from "react-router";
import { DashboardLayout } from "../components/dashboard";
import { ROUTES } from "../routes.config";

const CURRENT_USER_ID_KEY = "currentUserId";

export async function loader() {
  // Check if we're in a browser environment
  if (typeof window !== "undefined") {
    const userId = localStorage.getItem(CURRENT_USER_ID_KEY);
    if (!userId) {
      throw redirect(ROUTES.LOGIN);
    }
  }
  // On server-side, allow the route to render
  // Client-side auth context will handle redirect if needed
  return null;
}

export default function DashboardLayoutRoute() {
  return <DashboardLayout />;
}
