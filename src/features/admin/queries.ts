import { createClient } from "@/lib/supabase/server";

// ── Applications ──────────────────────────────────────────────

export async function getAdminApplications(): Promise<any[]> {
  const supabase = await createClient();

  const { data, error } = await (supabase as any)
    .from("tutor_applications")
    .select(
      `
      id,
      status,
      current_state,
      created_at,
      profiles(full_name, email)
    `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getAdminApplications error:", error);
    return [];
  }

  return data ?? [];
}

export async function getAdminApplicationById(id: string): Promise<any> {
  const supabase = await createClient();

  const { data: application, error: appError } = await (supabase as any)
    .from("tutor_applications")
    .select(
      `
      id,
      user_id,
      status,
      current_state,
      bio,
      teaching_mode,
      created_at,
      profiles(full_name, email)
    `,
    )
    .eq("id", id)
    .single();

  if (appError) {
    console.error("getAdminApplicationById error:", appError);
    return null;
  }

  const { data: subjects, error: subjectsError } = await (supabase as any)
    .from("tutor_subjects")
    .select(
      `
      price_per_hour,
      proof_file_url,
      subjects(name, code)
    `,
    )
    .eq("tutor_id", application.user_id);

  if (subjectsError) {
    console.error("getAdminApplicationById subjects error:", subjectsError);
  }

  return {
    ...application,
    tutor_subjects: subjects ?? [],
  };
}

// ── Users ─────────────────────────────────────────────────────

export async function getAdminUsers(): Promise<any[]> {
  const supabase = await createClient();

  const { data, error } = await (supabase as any)
    .from("profiles")
    .select(
      `
      id,
      full_name,
      email,
      is_admin,
      created_at,
      universities(name),
      programmes(name)
    `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getAdminUsers error:", error);
    return [];
  }

  return data ?? [];
}

// ── Subjects ──────────────────────────────────────────────────

export async function getAdminSubjects(): Promise<any[]> {
  const supabase = await createClient();

  const { data, error } = await (supabase as any)
    .from("subjects")
    .select(
      `
      id,
      name,
      code,
      universities(name),
      programmes(name)
    `,
    )
    .order("code", { ascending: true });

  if (error) {
    console.error("getAdminSubjects error:", error);
    return [];
  }

  return data ?? [];
}

// ── Bookings ──────────────────────────────────────────────────

export async function getAdminBookings(): Promise<any[]> {
  const supabase = await createClient();

  const { data, error } = await (supabase as any)
    .from("bookings")
    .select(
      `
      id,
      status,
      scheduled_at,
      duration_minutes,
      total_price,
      teaching_mode,
      student:profiles!bookings_student_id_fkey(full_name, email),
      tutor_subjects(
        subjects(name, code),
        tutor_applications(
          profiles(full_name, email)
        )
      )
    `,
    )
    .order("scheduled_at", { ascending: false });

  if (error) {
    console.error("getAdminBookings error:", error);
    return [];
  }

  return data ?? [];
}

// ── Reports ───────────────────────────────────────────────────

export async function getAdminReports(): Promise<any[]> {
  const supabase = await createClient();

  const { data, error } = await (supabase as any)
    .from("reports")
    .select(
      `
      id,
      reason,
      details,
      status,
      created_at,
      reporter:profiles!reports_reporter_id_fkey(full_name, email)
    `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getAdminReports error:", error);
    return [];
  }

  return data ?? [];
}

// ── Packages ──────────────────────────────────────────────────

export async function getAdminPackages(): Promise<any[]> {
  const supabase = await createClient();

  const { data, error } = await (supabase as any)
    .from("packages")
    .select(
      `
      id,
      title,
      description,
      price,
      status,
      created_at,
      tutor_applications(
        profiles(full_name, email)
      )
    `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getAdminPackages error:", error);
    return [];
  }

  return data ?? [];
}
