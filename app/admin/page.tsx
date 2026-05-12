import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminIndexPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/auth");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin", "internal_admin"].includes(profile.role)) {
    redirect("/admin/auth");
  }

  redirect("/admin/dashboard");
}
