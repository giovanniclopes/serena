import { Skeleton } from "../ui/Skeleton";

export function HomeSkeleton() {
  return (
    <div className="space-y-6">
      <div className="bg-white shadow-sm border-b border-gray-100 px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>

      <div className="px-4">
        <div className="grid grid-cols-2 gap-3 mb-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
            >
              <div className="flex items-center space-x-3">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-6 w-8 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Skeleton className="w-1 h-6 rounded-full" />
              <Skeleton className="h-5 w-32" />
            </div>
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                >
                  <div className="flex items-center space-x-3">
                    <Skeleton className="w-5 h-5 rounded" />
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
              
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Skeleton className="w-1 h-6 rounded-full" />
              <Skeleton className="h-5 w-36" />
            </div>
            <div className="space-y-2">
              {Array.from({ length: 2 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                >
                  <div className="flex items-center space-x-3">
                    <Skeleton className="w-5 h-5 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-4/5" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                    <Skeleton className="w-6 h-6 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
