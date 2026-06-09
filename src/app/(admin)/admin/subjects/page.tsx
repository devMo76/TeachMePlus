import { getAdminSubjects } from "@/features/admin/queries";
import { addSubject } from "@/features/admin/actions";

export default async function SubjectsPage() {
  const subjects = await getAdminSubjects();

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Subjects</h1>

      {/* Add Subject Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Add New Subject
        </h2>
        <form action={addSubject} className="grid grid-cols-2 gap-3">
          <input
            name="code"
            placeholder="Subject code (e.g. SECJ3104)"
            required
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
          <input
            name="name"
            placeholder="Subject name"
            required
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
          <input
            name="university_id"
            placeholder="University ID (UUID)"
            required
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
          <input
            name="programme_id"
            placeholder="Programme ID (UUID)"
            required
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
          <button
            type="submit"
            className="col-span-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-700 transition-colors"
          >
            Add Subject
          </button>
        </form>
      </div>

      {/* Subjects Table */}
      {subjects.length === 0 ? (
        <p className="text-gray-500">No subjects found.</p>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Code
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Name
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  University
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Programme
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {subjects.map((subject) => (
                <tr key={subject.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-gray-900">
                    {subject.code}
                  </td>
                  <td className="px-4 py-3 text-gray-900">{subject.name}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {subject.universities?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {subject.programmes?.name ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
