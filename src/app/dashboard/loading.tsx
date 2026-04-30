export default function Loading() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-56 rounded bg-gray-200" />
        <div className="h-4 w-72 rounded bg-gray-100" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            className="rounded-xl border border-gray-200 p-4 space-y-3"
          >
            <div className="h-3 w-24 rounded bg-gray-200" />
            <div className="h-8 w-12 rounded bg-gray-200" />
          </div>
        ))}
      </div>

      {[...Array(3)].map((_, index) => (
        <div
          key={index}
          className="h-56 rounded-xl border border-gray-200 bg-gray-100"
        />
      ))}

      <div className="rounded-xl border border-gray-200 p-4 space-y-4">
        <div className="h-4 w-32 rounded bg-gray-200" />
        {[...Array(4)].map((_, index) => (
          <div key={index} className="space-y-2">
            <div className="h-4 w-3/4 rounded bg-gray-100" />
            <div className="h-3 w-24 rounded bg-gray-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
