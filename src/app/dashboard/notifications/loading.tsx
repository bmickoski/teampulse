export default function Loading() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-48 rounded bg-gray-200" />
        <div className="h-4 w-32 rounded bg-gray-100" />
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="flex items-start gap-3 border-b border-gray-100 px-4 py-3 last:border-b-0"
          >
            <div className="h-8 w-8 shrink-0 rounded-full bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded bg-gray-200" />
              <div className="h-3 w-20 rounded bg-gray-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
