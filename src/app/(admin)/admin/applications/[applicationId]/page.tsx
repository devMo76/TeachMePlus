import { notFound } from "next/navigation";
import { getAdminApplicationById } from "@/features/admin/queries";
import {
  approveApplication,
  rejectApplication,
} from "@/features/admin/actions";

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] ?? "bg-gray-100 text-gray-800"}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ applicationId: string }>;
}) {
  const { applicationId } = await params;
  const application = await getAdminApplicationById(applicationId);

  if (!application) notFound();

  const isPending = application.status === "pending";

  const approveWithId = approveApplication.bind(null, applicationId);
  const rejectWithId = rejectApplication.bind(null, applicationId);

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Application Detail</h1>
        <StatusBadge status={application.status} />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Applicant
        </h2>
        <p className="font-medium text-gray-900">
          {application.profiles?.full_name ?? "—"}
        </p>
        <p className="text-gray-600 text-sm">
          {application.profiles?.email ?? "—"}
        </p>
        <p className="text-gray-600 text-sm mt-1 capitalize">
          {application.current_state === "student"
            ? "Current Student"
            : "Graduate"}
        </p>
      </div>

      {application.bio && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Bio
          </h2>
          <p className="text-gray-700 text-sm leading-relaxed">
            {application.bio}
          </p>
        </div>
      )}

      {application.tutor_subjects?.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Subjects
          </h2>
          <div className="space-y-3">
            {application.tutor_subjects.map((ts: any, i: number) => (
              <div
                key={i}
                className="text-sm border-b border-gray-100 pb-3 last:border-0 last:pb-0"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">
                    {ts.subjects?.code} — {ts.subjects?.name}
                  </span>
                  <span className="text-gray-600">
                    RM {ts.price_per_hour}/hr
                  </span>
                </div>
                {ts.proof_file_url && (
                  <p className="text-gray-500 mt-1 font-mono text-xs">
                    {ts.proof_file_url}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {isPending && (
        <div className="flex gap-3">
          <form action={approveWithId}>
            <button
              type="submit"
              className="px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-700 transition-colors"
            >
              Approve
            </button>
          </form>
          <form action={rejectWithId}>
            <button
              type="submit"
              className="px-5 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
            >
              Reject
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
