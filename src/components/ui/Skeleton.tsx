import { cn } from "../../lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gray-200 dark:bg-gray-700",
        className
      )}
      {...props}
    />
  );
}

export function SkeletonText({
  lines = 1,
  className = "",
  lineHeight = "h-4",
}: {
  lines?: number;
  className?: string;
  lineHeight?: string;
}) {
  return (
    <div className={className}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={`${lineHeight} mb-2 ${
            index === lines - 1 ? "w-3/4" : "w-full"
          }`}
        />
      ))}
    </div>
  );
}

export function SkeletonAvatar({
  size = "w-10 h-10",
  className = "",
}: {
  size?: string;
  className?: string;
}) {
  return <Skeleton className={`${size} rounded-full ${className}`} />;
}

export function SkeletonButton({
  width = "w-20",
  height = "h-8",
  className = "",
}: {
  width?: string;
  height?: string;
  className?: string;
}) {
  return <Skeleton className={`${width} ${height} rounded-lg ${className}`} />;
}

export function SkeletonCard({
  className = "",
  showAvatar = false,
  showButton = false,
}: {
  className?: string;
  showAvatar?: boolean;
  showButton?: boolean;
}) {
  return (
    <div className={`p-4 border rounded-lg ${className}`}>
      <div className="flex items-start space-x-3">
        {showAvatar && <SkeletonAvatar size="w-12 h-12" />}
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          {showButton && (
            <div className="flex space-x-2 pt-2">
              <SkeletonButton width="w-16" height="h-6" />
              <SkeletonButton width="w-20" height="h-6" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
