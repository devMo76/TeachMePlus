"use server";

import { createClient } from "@/lib/supabase/server";
import { TutorApplicationSchema } from "./validations";

export type ApplicationActionResult =
  | { success: true }
  | { success: false; error: string };

export async function submitTutorApplication(
  formData: FormData,
): Promise<ApplicationActionResult> {
  const supabase = await createClient();

  // Step 1 — Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be logged in to apply." };
  }

  // Step 2 — Parse raw form data
  const bio = formData.get("bio") as string;
  const teaching_mode = formData.get("teaching_mode") as string;
  const consent_given = formData.get("consent_given") === "true";
  const subjectsRaw = formData.get("subjects") as string;

  let subjectsParsed: unknown[];
  try {
    subjectsParsed = JSON.parse(subjectsRaw);
  } catch {
    return { success: false, error: "Invalid subject data." };
  }

  // Step 3 — Validate with Zod
  const result = TutorApplicationSchema.safeParse({
    bio,
    teaching_mode,
    consent_given,
    subjects: subjectsParsed,
  });

  if (!result.success) {
    const firstError = result.error.errors[0]?.message ?? "Invalid form data.";
    return { success: false, error: firstError };
  }

  const { subjects } = result.data;

  // Step 4 — Upload proof files and collect paths
  const subjectFiles = subjects.map(
    (_, i) => formData.get(`proof_file_${i}`) as File | null,
  );

  const proofUrls: (string | null)[] = [];

  for (let i = 0; i < subjects.length; i++) {
    const file = subjectFiles[i];

    if (!file || file.size === 0) {
      proofUrls.push(null);
      continue;
    }

    if (file.type !== "application/pdf") {
      return {
        success: false,
        error: `Proof file for subject ${i + 1} must be a PDF.`,
      };
    }

    const filePath = `${user.id}/${subjects[i].subject_id}_${Date.now()}.pdf`;

    const { error: uploadError } = await supabase.storage
      .from("tutor-proofs")
      .upload(filePath, file, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadError) {
      return {
        success: false,
        error: `File upload failed: ${uploadError.message}`,
      };
    }

    proofUrls.push(filePath);
  }

  // Step 5 — Insert tutor application
  const { data: application, error: appError } = await (supabase as any)
    .from("tutor_applications")
    .insert({
      user_id: user.id,
      bio: result.data.bio,
      teaching_mode: result.data.teaching_mode,
      consent_given: true,
      status: "pending",
    })
    .select("id")
    .single();

  if (appError) {
    return { success: false, error: `Application failed: ${appError.message}` };
  }

  // Step 6 — Insert tutor subjects
  const tutorSubjects = subjects.map((s, i) => ({
    tutor_id: user.id,
    subject_id: s.subject_id,
    grade: s.grade,
    price_per_hour: s.price_per_hour,
    proof_file_url: proofUrls[i],
  }));

  const { error: subjectsError } = await (supabase as any)
    .from("tutor_subjects")
    .insert(tutorSubjects);

  if (subjectsError) {
    return {
      success: false,
      error: `Subject insert failed: ${subjectsError.message}`,
    };
  }

  return { success: true };
}
