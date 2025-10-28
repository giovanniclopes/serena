import { Skeleton } from "../ui/Skeleton";

export function HabitSkeleton() {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
      <div className="flex items-center space-x-3 mb-4">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <div className="flex-1">
          <Skeleton className="h-5 w-3/4 mb-1" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="w-16 h-6 rounded-full" />
      </div>

      <div className="grid grid-cols-7 gap-1 mb-3">
        {Array.from({ length: 35 }).map((_, index) => (
          <Skeleton
            key={index}
            className="w-6 h-6 rounded-sm"
            style={{
              opacity: Math.random() * 0.6 + 0.2,
            }}
          />
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Skeleton className="w-4 h-4 rounded" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="w-8 h-8 rounded-lg" />
      </div>
    </div>
  );
}

export function HabitListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <HabitSkeleton key={index} />
      ))}
    </div>
  );
}

export function HabitGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <HabitSkeleton key={index} />
      ))}
    </div>
  );
}
