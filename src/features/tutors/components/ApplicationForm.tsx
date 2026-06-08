"use client";

import { useState } from "react";
import SubjectCard from "./SubjectCard";
import SelectedSubjectForm from "./SelectedSubjectForm";
import { submitTutorApplication } from "../actions";
import { TEACHING_MODES } from "../validations";
import type { SubjectOption } from "../queries";

type SelectedSubject = {
  subject: SubjectOption;
  grade: string;
  pricePerHour: string;
  file: File | null;
};

type Props = {
  subjects: SubjectOption[];
};

export default function ApplicationForm({ subjects }: Props) {
  const [selected, setSelected] = useState<SelectedSubject[]>([]);
  const [bio, setBio] = useState("");
  const [teachingMode, setTeachingMode] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Toggle a subject card on/off
  function handleToggle(id: string) {
    const alreadySelected = selected.find((s) => s.subject.id === id);
    if (alreadySelected) {
      setSelected(selected.filter((s) => s.subject.id !== id));
    } else {
      const subject = subjects.find((s) => s.id === id)!;
      setSelected([
        ...selected,
        { subject, grade: "", pricePerHour: "", file: null },
      ]);
    }
  }

  // Update grade for a selected subject by index
  function handleGradeChange(index: number, value: string) {
    const updated = [...selected];
    updated[index].grade = value;
    setSelected(updated);
  }

  // Update price for a selected subject by index
  function handlePriceChange(index: number, value: string) {
    const updated = [...selected];
    updated[index].pricePerHour = value;
    setSelected(updated);
  }

  // Update proof file for a selected subject by index
  function handleFileChange(index: number, file: File | null) {
    const updated = [...selected];
    updated[index].file = file;
    setSelected(updated);
  }

  // Remove a selected subject by index
  function handleRemove(index: number) {
    setSelected(selected.filter((_, i) => i !== index));
  }

  // Assemble FormData and call the server action
  async function handleSubmit() {
    setError(null);
    setLoading(true);

    const formData = new FormData();

    formData.append("bio", bio);
    formData.append("teaching_mode", teachingMode);
    formData.append("consent_given", String(consent));

    // Serialize subjects as JSON (no files yet)
    const subjectsPayload = selected.map((s) => ({
      subject_id: s.subject.id,
      grade: s.grade,
      price_per_hour: Number(s.pricePerHour),
    }));
    formData.append("subjects", JSON.stringify(subjectsPayload));

    // Append each proof file with an indexed key
    selected.forEach((s, i) => {
      if (s.file) formData.append(`proof_file_${i}`, s.file);
    });

    const result = await submitTutorApplication(formData);

    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setSuccess(true);
  }

  // Success screen
  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
          <svg
            className="h-7 w-7 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-800">
          Application Submitted
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Your application is under review. We'll notify you once it's approved.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        Apply to Become a Tutor
      </h1>
      <p className="text-sm text-gray-500 mb-8">
        Select the subjects you can teach and fill in your details.
      </p>

      {/* Two-panel subject selector */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mb-8">
        {/* Left panel — subject cards */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            Available Subjects ({subjects.length})
          </h2>
          <div className="grid grid-cols-1 gap-3 max-h-[480px] overflow-y-auto pr-1">
            {subjects.map((subject) => (
              <SubjectCard
                key={subject.id}
                id={subject.id}
                code={subject.code}
                name={subject.name}
                selected={selected.some((s) => s.subject.id === subject.id)}
                onToggle={handleToggle}
              />
            ))}
          </div>
        </div>

        {/* Right panel — selected subject forms */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            Selected Subjects ({selected.length})
          </h2>
          {selected.length === 0 ? (
            <div className="flex h-32 items-center justify-center rounded-xl border-2 border-dashed border-gray-200 text-sm text-gray-400">
              Select a subject from the left to configure it
            </div>
          ) : (
            <div className="flex flex-col gap-3 max-h-[480px] overflow-y-auto pr-1">
              {selected.map((s, i) => (
                <SelectedSubjectForm
                  key={s.subject.id}
                  index={i}
                  subjectCode={s.subject.code}
                  subjectName={s.subject.name}
                  grade={s.grade}
                  pricePerHour={s.pricePerHour}
                  onGradeChange={handleGradeChange}
                  onPriceChange={handlePriceChange}
                  onFileChange={handleFileChange}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bio */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Bio{" "}
          <span className="text-gray-400 font-normal">(min 50 characters)</span>
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          placeholder="Tell students about your teaching style, experience, and strengths..."
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 focus:border-blue-500 focus:outline-none resize-none"
        />
        <p className="mt-1 text-xs text-gray-400">
          {bio.length} / 1000 characters
        </p>
      </div>

      {/* Teaching Mode */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Teaching Mode
        </label>
        <select
          value={teachingMode}
          onChange={(e) => setTeachingMode(e.target.value)}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 focus:border-blue-500 focus:outline-none"
        >
          <option value="">Select a mode</option>
          {TEACHING_MODES.map((mode) => (
            <option key={mode} value={mode}>
              {mode === "online"
                ? "Online"
                : mode === "face_to_face"
                  ? "Face to Face"
                  : "Both"}
            </option>
          ))}
        </select>
      </div>

      {/* Consent */}
      <div className="mb-6 flex items-start gap-3">
        <input
          id="consent"
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-500"
        />
        <label htmlFor="consent" className="text-sm text-gray-600">
          I confirm that all information provided is accurate and I agree to
          AcadMate's tutor terms and conditions.
        </label>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        className="w-full rounded-xl bg-blue-500 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-50 transition-colors"
      >
        {loading ? "Submitting..." : "Submit Application"}
      </button>
    </div>
  );
}
