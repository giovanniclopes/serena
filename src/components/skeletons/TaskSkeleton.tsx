import { Skeleton } from "../ui/Skeleton";

export function TaskSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-3 p-4 bg-white rounded-xl border border-gray-100">
        <Skeleton className="w-5 h-5 rounded" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <div className="flex items-center space-x-2">
            <Skeleton className="w-16 h-5 rounded-full" />
            <Skeleton className="w-12 h-5 rounded-full" />
          </div>
        </div>
        <Skeleton className="w-6 h-6 rounded" />
      </div>
    </div>
  );
}

export function TaskListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <TaskSkeleton key={index} />
      ))}
    </div>
  );
}

export function TaskCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
      <div className="flex items-start space-x-3">
        <Skeleton className="w-5 h-5 rounded mt-1" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-3 w-2/3" />
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-2">
              <Skeleton className="w-16 h-5 rounded-full" />
              <Skeleton className="w-12 h-5 rounded-full" />
            </div>
            <Skeleton className="w-6 h-6 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function TaskGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <TaskCardSkeleton key={index} />
      ))}
    </div>
  );
}
