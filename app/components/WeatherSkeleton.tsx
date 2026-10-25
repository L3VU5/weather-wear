export default function WeatherSkeleton() {
  return (
    <div role="status" aria-label="Loading the weather" className="card animate-pulse p-6 sm:p-8">
      <div className="flex items-start justify-between">
        <div className="space-y-4">
          <div className="h-5 w-40 rounded-full bg-white/15" />
          <div className="h-16 w-56 rounded-2xl bg-white/15" />
        </div>
        <div className="h-24 w-24 rounded-3xl bg-white/15" />
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="h-16 rounded-2xl bg-white/10" />
        ))}
      </div>
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="h-36 rounded-2xl bg-white/10" />
        ))}
      </div>
    </div>
  );
}
