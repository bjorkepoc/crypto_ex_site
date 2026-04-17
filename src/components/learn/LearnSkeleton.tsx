"use client";

function Bone({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-th-muted ${className ?? ""}`} />;
}

/** Skeleton for the main /learn page (learning path) */
export function LearnPageSkeleton() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Bone className="h-7 w-48 mb-2" />
      <Bone className="h-4 w-64 mb-6" />

      {/* Stats card */}
      <div className="rounded-lg border border-th-border bg-th-card p-4 mb-6 space-y-3">
        <div className="flex items-center gap-3">
          <Bone className="h-4 w-20" />
          <Bone className="h-2 flex-1" />
          <Bone className="h-4 w-14" />
        </div>
        <Bone className="h-3 w-32" />
      </div>

      {/* Lecture nodes */}
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-th-border bg-th-card p-4">
            <div className="flex items-start gap-3">
              <Bone className="h-8 w-8 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Bone className="h-4 w-40" />
                <Bone className="h-3 w-24" />
              </div>
              <Bone className="h-4 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Skeleton for the lecture hub page */
export function LectureHubSkeleton() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Bone className="h-4 w-16 mb-4" />
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-2">
          <Bone className="h-3 w-16" />
          <Bone className="h-6 w-48" />
        </div>
        <Bone className="h-5 w-16" />
      </div>
      <Bone className="h-6 w-full mb-6" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-th-border bg-th-card p-4">
            <div className="space-y-2">
              <Bone className="h-4 w-24" />
              <Bone className="h-3 w-48" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
