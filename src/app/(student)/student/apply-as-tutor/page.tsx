import { getSubjectsForApplication } from "@/features/tutors/queries";
import ApplicationForm from "@/features/tutors/components/ApplicationForm";
import Link from "next/link";

export default async function ApplyAsTutorPage() {
  const result = await getSubjectsForApplication();

  // Student hasn't completed their profile yet
  if (result.missingProfile) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-yellow-100 mx-auto">
            <svg
              className="h-7 w-7 text-yellow-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-800">
            Complete Your Profile First
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            You need to set your university and programme before applying as a
            tutor.
          </p>
          <Link
            href="/student/profile"
            className="mt-5 inline-block rounded-xl bg-blue-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-600 transition-colors"
          >
            Go to Profile
          </Link>
        </div>
      </main>
    );
  }

  // Profile is complete — show the form
  return (
    <main>
      <ApplicationForm subjects={result.subjects} />
    </main>
  );
}
