import { redirect } from "react-router";
import { DashboardLayout } from "../components/dashboard";
import { ROUTES } from "../routes.config";

export async function loader() {
  if (globalThis.window !== undefined) {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      throw redirect(ROUTES.LOGIN);
    }
  }

  return null;
}

export default function DashboardLayoutRoute() {
  return <DashboardLayout />;
}
