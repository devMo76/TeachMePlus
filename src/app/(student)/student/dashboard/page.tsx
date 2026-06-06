import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/auth/queries";
import { getCurrentProfile } from "@/features/profiles/queries";

export default async function StudentDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const profile = await getCurrentProfile();

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {profile?.full_name ?? user.email} 👋
        </h1>
        <p className="mt-2 text-gray-500">
          This is your student dashboard. More features coming soon.
        </p>

        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Your Account
          </h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Email</dt>
              <dd className="text-gray-900 font-medium">{user.email}</dd>
            </div>

            <div className="flex justify-between">
              <dt className="text-gray-500">Role</dt>
              <dd className="text-gray-900 font-medium capitalize">
                {profile?.is_admin ? "Admin" : "Student"}{" "}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </main>
  );
}
