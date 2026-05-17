interface SkeletonProps {
  className?: string;
}

/** Single shimmering placeholder block. */
export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`skeleton ${className}`} />;
}

/** Pre-composed card skeleton for loading states. */
export function CardSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-lg" />
      ))}
    </div>
  );
}

/** Chart-shaped skeleton. */
export function ChartSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-5 w-2/5" />
      <div className="flex items-end gap-2 h-56 px-2">
        {[55, 80, 45, 92, 60, 78, 50, 88, 67, 95, 72, 84].map((h, i) => (
          <div
            key={i}
            className="skeleton flex-1 rounded-t-md"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}
