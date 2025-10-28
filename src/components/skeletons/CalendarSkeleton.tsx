import { Skeleton } from "../ui/Skeleton";

export function CalendarSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <div className="flex space-x-2">
          <Skeleton className="w-8 h-8 rounded" />
          <Skeleton className="w-8 h-8 rounded" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="grid grid-cols-7 gap-1 p-2 border-b border-gray-100">
          {Array.from({ length: 7 }).map((_, index) => (
            <Skeleton key={index} className="h-8 w-full rounded" />
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 p-2">
          {Array.from({ length: 35 }).map((_, index) => (
            <div key={index} className="aspect-square p-1">
              <div className="h-full w-full rounded-lg border border-gray-100 p-2 space-y-1">
                <Skeleton className="h-4 w-4 rounded" />
                {Math.random() > 0.7 && (
                  <div className="space-y-1">
                    <Skeleton className="h-2 w-full rounded" />
                    {Math.random() > 0.5 && (
                      <Skeleton className="h-2 w-3/4 rounded" />
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Skeleton className="h-6 w-32" />
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
          >
            <div className="flex items-center space-x-3">
              <Skeleton className="w-3 h-3 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="w-6 h-6 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
