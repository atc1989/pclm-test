import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminContent } from "./admin-content";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/auth");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, first_name, last_name, email")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin", "internal_admin"].includes(profile.role)) {
    redirect("/admin/auth");
  }

  const adminName =
    [profile.first_name, profile.last_name].filter(Boolean).join(" ") ||
    profile.email;

  return <AdminContent adminName={adminName} />;
}
