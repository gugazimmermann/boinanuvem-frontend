import { redirect } from "react-router";
import { DashboardLayout } from "../components/dashboard";
import { ROUTES } from "../routes.config";

const CURRENT_USER_ID_KEY = "currentUserId";

export async function loader() {
  if (globalThis.window !== undefined) {
    const userId = localStorage.getItem(CURRENT_USER_ID_KEY);
    if (!userId) {
      throw redirect(ROUTES.LOGIN);
    }
  }

  return null;
}

export default function DashboardLayoutRoute() {
  return <DashboardLayout />;
}
