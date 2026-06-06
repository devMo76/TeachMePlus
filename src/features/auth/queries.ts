import { createClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getProfile(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) return null;
  return data;
}

export async function isAdmin(userId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", userId)
    .single();
  const profile = data as { is_admin: boolean } | null;
  return profile?.is_admin === true;
}

export async function isApprovedTutor(userId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("tutor_applications")
    .select("status")
    .eq("user_id", userId)
    .single();

  const application = data as { status: string } | null;
  return application?.status === "approved";
}
