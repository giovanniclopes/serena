interface InlineLoadingSpinnerProps {
  size?: number;
  className?: string;
}

export default function InlineLoadingSpinner({
  size = 16,
  className = "",
}: InlineLoadingSpinnerProps) {
  return (
    <div
      className={`animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
