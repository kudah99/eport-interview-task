import { redirect } from "next/navigation";

export default function Page() {
  // Sign-up is no longer available - users are created by admins
  redirect("/auth/login");
}
