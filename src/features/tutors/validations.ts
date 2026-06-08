import { z } from "zod";

export const TEACHING_MODES = ["online", "face_to_face", "both"] as const;
export const GRADES = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C"] as const;

export const SubjectSelectionSchema = z.object({
  subject_id: z.string().uuid("Invalid subject"),
  grade: z.enum(GRADES, { errorMap: () => ({ message: "Select a grade" }) }),
  price_per_hour: z
    .number({ invalid_type_error: "Enter a price" })
    .min(1, "Price must be at least RM 1")
    .max(500, "Price cannot exceed RM 500"),
});

export const TutorApplicationSchema = z.object({
  bio: z
    .string()
    .min(50, "Bio must be at least 50 characters")
    .max(1000, "Bio cannot exceed 1000 characters"),
  teaching_mode: z.enum(TEACHING_MODES, {
    errorMap: () => ({ message: "Select a teaching mode" }),
  }),
  subjects: z
    .array(SubjectSelectionSchema)
    .min(1, "Select at least one subject"),
  consent_given: z.literal(true, {
    errorMap: () => ({ message: "You must consent to proceed" }),
  }),
});

export type SubjectSelection = z.infer<typeof SubjectSelectionSchema>;
export type TutorApplicationFormData = z.infer<typeof TutorApplicationSchema>;
