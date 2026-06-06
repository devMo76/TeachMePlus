"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { TablesUpdate } from "@/types/database.types";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const updates: TablesUpdate<"profiles"> = {
    full_name: formData.get("full_name") as string,
    updated_at: new Date().toISOString(),
  };

  const { error } = await (supabase.from("profiles") as any)
    .update(updates)
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/student/profile");
  return { success: true };
}
