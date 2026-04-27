interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={['animate-pulse rounded-md bg-gray-200', className].join(' ')} />
  );
}

export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={['space-y-2', className].join(' ')}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={i === lines - 1 && lines > 1 ? 'h-4 w-3/4' : 'h-4 w-full'}
        />
      ))}
    </div>
  );
}

export function SkeletonTableRows({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="border-b border-gray-100">
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} className="px-4 py-3">
              <Skeleton className={['h-4', j === 0 ? 'w-32' : j === cols - 1 ? 'w-16' : 'w-24'].join(' ')} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function SkeletonCardList({ cards = 4, className = '' }: { cards?: number; className?: string }) {
  return (
    <div className={['space-y-3', className].join(' ')}>
      {Array.from({ length: cards }).map((_, i) => (
        <div key={i} className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-start gap-3">
            <Skeleton className="h-5 w-5 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="flex gap-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16 rounded-full" />
              </div>
              <Skeleton className="h-3.5 w-48" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonPage({ className = '' }: { className?: string }) {
  return (
    <div className={['space-y-6 p-8', className].join(' ')}>
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-3.5 w-32" />
          </div>
        ))}
      </div>
    </div>
  );
}
