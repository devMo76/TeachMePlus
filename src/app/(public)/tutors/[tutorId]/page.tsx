// src/app/(public)/tutors/[tutorId]/page.tsx
// Public tutor profile page — shows one tutor's full details.
// No auth required. Runs on the server — no 'use client'.

import { notFound } from "next/navigation";
import Link from "next/link";
import { getTutorById } from "@/features/tutors/queries";

type Props = {
  params: Promise<{ tutorId: string }>;
};

export default async function TutorProfilePage({ params }: Props) {
  const { tutorId } = await params;
  const tutor = await getTutorById(tutorId);

  if (!tutor) notFound();

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-2xl">
        {/* Back link */}
        <Link
          href="/tutors"
          className="mb-8 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
        >
          ← Back to tutors
        </Link>

        {/* Profile card */}
        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          {/* Name */}
          <h1 className="text-2xl font-bold text-gray-900">
            {tutor.full_name}
          </h1>

          {/* Bio */}
          {tutor.bio ? (
            <p className="mt-3 text-gray-600">{tutor.bio}</p>
          ) : (
            <p className="mt-3 text-sm text-gray-400 italic">
              No bio provided.
            </p>
          )}

          {/* Divider */}
          <hr className="my-6 border-gray-100" />

          {/* Subjects */}
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
            Subjects
          </h2>

          {tutor.subjects.length === 0 ? (
            <p className="mt-3 text-sm text-gray-400">
              No subjects listed yet.
            </p>
          ) : (
            <div className="mt-3 flex flex-col gap-3">
              {tutor.subjects.map(
                (subject: {
                  id: string;
                  code: string;
                  name: string;
                  price_per_hour: number;
                }) => (
                  <div
                    key={subject.id}
                    className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3"
                  >
                    <div>
                      <span className="text-sm font-semibold text-gray-800">
                        {subject.code}
                      </span>
                      <span className="ml-2 text-sm text-gray-500">
                        {subject.name}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-indigo-600">
                      RM {subject.price_per_hour} / hr
                    </span>
                  </div>
                ),
              )}
            </div>
          )}

          {/* Divider */}
          <hr className="my-6 border-gray-100" />

          {/* Book button — placeholder for Phase 5 */}
          <button
            disabled
            className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white opacity-50 cursor-not-allowed"
          >
            Book a Session — Coming Soon
          </button>
        </div>
      </div>
    </main>
  );
}
