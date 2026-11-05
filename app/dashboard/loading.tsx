export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-[1500px] p-5 sm:p-8" aria-busy="true" aria-label="Chargement">
      <div className="mb-7 space-y-3">
        <div className="h-4 w-40 animate-pulse rounded bg-track" />
        <div className="h-8 w-72 animate-pulse rounded bg-track" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="panel h-36 animate-pulse" />
        ))}
      </div>
      <div className="panel mt-5 h-80 animate-pulse" />
    </div>
  );
}
