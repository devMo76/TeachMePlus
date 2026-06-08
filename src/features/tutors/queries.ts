// src/features/tutors/queries.ts
// READ-ONLY queries for tutor data.
// Used by public pages — no auth required.
// Runs with the anon key; RLS ensures only approved tutors are returned.

import { createClient } from "@/lib/supabase/server";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ApprovedTutor = {
  id: string;
  full_name: string;
  bio: string | null;
  subjects: {
    id: string;
    code: string;
    name: string;
    price_per_hour: number;
  }[];
};

export type TutorProfile = ApprovedTutor;

// ─── Queries ──────────────────────────────────────────────────────────────────

// Fetches all approved tutors for the browse page.
// Two-step: RPC to bypass RLS recursion, then profile + subject fetch.
export async function getApprovedTutors(): Promise<ApprovedTutor[]> {
  const supabase = await createClient();

  // Step 1 — get approved tutor IDs and bios via security definer function
  const { data: approvedTutors, error: approvedError } = await (
    supabase as any
  ).rpc("get_approved_tutor_ids");

  if (approvedError) {
    console.error("getApprovedTutors (rpc) error:", approvedError.message);
    return [];
  }

  if (!approvedTutors || approvedTutors.length === 0) return [];

  const approvedUserIds: string[] = approvedTutors.map((t: any) => t.user_id);
  const bioMap: Record<string, string | null> = {};
  for (const t of approvedTutors) {
    bioMap[t.user_id] = t.bio ?? null;
  }

  // Step 2 — fetch profiles + subjects for those IDs
  const result = await (supabase as any)
    .from("profiles")
    .select(
      `
      id,
      full_name,
      tutor_subjects (
        price_per_hour,
        subject:subjects (
          id,
          code,
          name
        )
      )
    `,
    )
    .in("id", approvedUserIds);

  const error = result.error;
  const data: any[] = result.data ?? [];

  if (error) {
    console.error("getApprovedTutors (profiles) error:", error.message);
    return [];
  }

  return data.map((row: any) => {
    const subjects = (row.tutor_subjects ?? [])
      .filter((ts: any) => ts.subject)
      .map((ts: any) => ({
        id: ts.subject.id,
        code: ts.subject.code,
        name: ts.subject.name,
        price_per_hour: ts.price_per_hour,
      }));

    return {
      id: row.id,
      full_name: row.full_name,
      bio: bioMap[row.id] ?? null,
      subjects,
    };
  });
}

// Fetches a single tutor's full profile by their profile ID.
// Returns null if the tutor doesn't exist or isn't approved.
export async function getTutorById(id: string): Promise<TutorProfile | null> {
  const supabase = await createClient();

  const result = await (supabase as any)
    .from("profiles")
    .select(
      `
      id,
      full_name,
      tutor_applications!inner (
        bio,
        status
      ),
      tutor_subjects (
        price_per_hour,
        subject:subjects (
          id,
          code,
          name
        )
      )
    `,
    )
    .eq("tutor_applications.status", "approved")
    .eq("id", id)
    .single();

  const error = result.error;
  const data: any = result.data;

  if (error) {
    console.error("getTutorById error:", error.message);
    return null;
  }

  if (!data) return null;

  const subjects = (data.tutor_subjects ?? [])
    .filter((ts: any) => ts.subject)
    .map((ts: any) => ({
      id: ts.subject.id,
      code: ts.subject.code,
      name: ts.subject.name,
      price_per_hour: ts.price_per_hour,
    }));

  return {
    id: data.id,
    full_name: data.full_name,
    bio: data.tutor_applications?.[0]?.bio ?? null,
    subjects,
  };
}

// Kept for future use — subjects already included in getTutorById via join.
export async function getTutorSubjects(tutorId: string) {
  const supabase = await createClient();

  const result = await (supabase as any)
    .from("tutor_subjects")
    .select(
      `
      price_per_hour,
      subject:subjects (
        id,
        code,
        name
      )
    `,
    )
    .eq("tutor_id", tutorId);

  const error = result.error;
  const data: any[] = result.data ?? [];

  if (error) {
    console.error("getTutorSubjects error:", error.message);
    return [];
  }

  return data
    .filter((ts: any) => ts.subject)
    .map((ts: any) => ({
      ...ts.subject,
      price_per_hour: ts.price_per_hour,
    }));
}

export type SubjectOption = {
  id: string;
  code: string;
  name: string;
};

export type SubjectsForApplicationResult =
  | { missingProfile: true }
  | { missingProfile: false; subjects: SubjectOption[] };

export async function getSubjectsForApplication(): Promise<SubjectsForApplicationResult> {
  const supabase = await createClient();

  // Step 1 — get the logged-in user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { missingProfile: true };

  // Step 2 — get their programme_id from profiles
  const { data: profile, error: profileError } = await (supabase as any)
    .from("profiles")
    .select("programme_id")
    .eq("id", user.id)
    .single();

  if (profileError || !profile?.programme_id) {
    return { missingProfile: true };
  }

  // Step 3 — fetch subjects scoped to their programme
  const { data: subjects, error: subjectsError } = await supabase
    .from("subjects")
    .select("id, code, name")
    .eq("programme_id", profile.programme_id)
    .eq("is_active", true)
    .order("code", { ascending: true });

  if (subjectsError) throw new Error(subjectsError.message);

  return { missingProfile: false, subjects: subjects ?? [] };
}
