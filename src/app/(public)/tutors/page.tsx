// src/app/(public)/tutors/page.tsx
// Public browse page — lists all approved tutors.
// No auth required. Runs on the server — no 'use client'.

import Link from "next/link";
import { getApprovedTutors } from "@/features/tutors/queries";

export default async function TutorsPage() {
  const tutors = await getApprovedTutors();

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Find a Tutor</h1>
          <p className="mt-2 text-gray-500">
            Browse verified senior tutors from MJIIT UTM Kuala Lumpur.
          </p>
        </div>

        {/* Empty state */}
        {tutors.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-20 text-center">
            <p className="text-lg font-medium text-gray-700">
              No tutors available yet.
            </p>
            <p className="mt-1 text-sm text-gray-400">
              Check back soon — tutors are being verified.
            </p>
          </div>
        )}

        {/* Tutor list */}
        <div className="grid gap-4">
          {tutors.map((tutor) => (
            <Link
              key={tutor.id}
              href={`/tutors/${tutor.id}`}
              className="block rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              {/* Name and rate */}
              <div className="flex items-start justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  {tutor.full_name}
                </h2>
              </div>

              {/* Bio */}
              {tutor.bio && (
                <p className="mt-2 line-clamp-2 text-sm text-gray-500">
                  {tutor.bio}
                </p>
              )}

              {/* Subjects */}
              {tutor.subjects.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {tutor.subjects.map(
                    (subject: {
                      id: string;
                      code: string;
                      name: string;
                      price_per_hour: number;
                    }) => (
                      <span
                        key={subject.id}
                        className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700"
                      >
                        {subject.code} — {subject.name}
                      </span>
                    ),
                  )}
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
