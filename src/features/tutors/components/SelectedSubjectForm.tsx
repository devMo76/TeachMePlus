"use client";

import { GRADES, TEACHING_MODES } from "../validations";

type Props = {
  index: number;
  subjectCode: string;
  subjectName: string;
  grade: string;
  pricePerHour: string;
  onGradeChange: (index: number, value: string) => void;
  onPriceChange: (index: number, value: string) => void;
  onFileChange: (index: number, file: File | null) => void;
  onRemove: (index: number) => void;
};

export default function SelectedSubjectForm({
  index,
  subjectCode,
  subjectName,
  grade,
  pricePerHour,
  onGradeChange,
  onPriceChange,
  onFileChange,
  onRemove,
}: Props) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">
            {subjectCode}
          </p>
          <p className="text-sm font-medium text-gray-800">{subjectName}</p>
        </div>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="text-gray-400 hover:text-red-500 transition-colors text-lg leading-none"
          aria-label="Remove subject"
        >
          ×
        </button>
      </div>

      {/* Grade */}
      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Your Grade
        </label>
        <select
          value={grade}
          onChange={(e) => onGradeChange(index, e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none"
        >
          <option value="">Select grade</option>
          {GRADES.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>

      {/* Price */}
      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Price per Hour (RM)
        </label>
        <input
          type="number"
          min={1}
          max={500}
          value={pricePerHour}
          onChange={(e) => onPriceChange(index, e.target.value)}
          placeholder="e.g. 30"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* Proof Upload */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Proof of Grade (PDF only)
        </label>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => onFileChange(index, e.target.files?.[0] ?? null)}
          className="w-full text-xs text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-blue-600 hover:file:bg-blue-100"
        />
      </div>
    </div>
  );
}
