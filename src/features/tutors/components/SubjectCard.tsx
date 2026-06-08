"use client";

type Props = {
  id: string;
  code: string;
  name: string;
  selected: boolean;
  onToggle: (id: string) => void;
};

export default function SubjectCard({
  id,
  code,
  name,
  selected,
  onToggle,
}: Props) {
  return (
    <button
      type="button"
      onClick={() => onToggle(id)}
      className={`
        relative w-full text-left rounded-xl border-2 p-4 transition-all duration-200
        ${
          selected
            ? "border-blue-500 bg-blue-50 shadow-md"
            : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
        }
      `}
    >
      {selected && (
        <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500">
          <svg
            className="h-3 w-3 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </span>
      )}
      <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">
        {code}
      </p>
      <p className="mt-1 text-sm font-medium text-gray-800 leading-snug">
        {name}
      </p>
    </button>
  );
}
