"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function assertAdmin() {
  const supabase = await createClient();
  const { data: isAdmin } = await (supabase as any).rpc("is_admin");
  if (!isAdmin) throw new Error("Unauthorized");
  return supabase;
}

export async function approveApplication(id: string): Promise<void> {
  const supabase = await assertAdmin();

  await (supabase as any)
    .from("tutor_applications")
    .update({ status: "approved" })
    .eq("id", id);

  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${id}`);
}

export async function rejectApplication(id: string): Promise<void> {
  const supabase = await assertAdmin();

  await (supabase as any)
    .from("tutor_applications")
    .update({ status: "rejected" })
    .eq("id", id);

  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${id}`);
}

export async function resolveReport(id: string): Promise<void> {
  const supabase = await assertAdmin();

  await (supabase as any)
    .from("reports")
    .update({ status: "resolved" })
    .eq("id", id);

  revalidatePath("/admin/reports");
}

export async function approvePackage(id: string): Promise<void> {
  const supabase = await assertAdmin();

  await (supabase as any)
    .from("packages")
    .update({ status: "approved" })
    .eq("id", id);

  revalidatePath("/admin/packages");
}

export async function rejectPackage(id: string): Promise<void> {
  const supabase = await assertAdmin();

  await (supabase as any)
    .from("packages")
    .update({ status: "rejected" })
    .eq("id", id);

  revalidatePath("/admin/packages");
}

export async function addSubject(formData: FormData): Promise<void> {
  const supabase = await assertAdmin();

  const name = formData.get("name") as string;
  const code = formData.get("code") as string;
  const university_id = formData.get("university_id") as string;
  const programme_id = formData.get("programme_id") as string;

  if (!name || !code || !university_id || !programme_id) return;

  await (supabase as any)
    .from("subjects")
    .insert({ name, code, university_id, programme_id });

  revalidatePath("/admin/subjects");
}
