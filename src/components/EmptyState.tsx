import { useApp } from "../context/AppContext";

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  iconEmoji?: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export default function EmptyState({
  icon: Icon,
  iconEmoji,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}: EmptyStateProps) {
  const { state } = useApp();

  return (
    <div
      className="text-center py-12 px-4 rounded-xl"
      style={{ backgroundColor: state.currentTheme.colors.surface }}
    >
      <div className="flex flex-col items-center max-w-md mx-auto">
        {(Icon || iconEmoji) && (
          <div
            className="w-16 h-16 mb-4 rounded-full flex items-center justify-center text-3xl"
            style={{
              backgroundColor: state.currentTheme.colors.primary + "15",
            }}
          >
            {iconEmoji ? (
              <span>{iconEmoji}</span>
            ) : Icon ? (
              <Icon
                className="w-8 h-8"
                style={{ color: state.currentTheme.colors.primary }}
              />
            ) : null}
          </div>
        )}

        <h3
          className="text-xl font-semibold mb-2"
          style={{ color: state.currentTheme.colors.text }}
        >
          {title}
        </h3>

        <p
          className="text-sm mb-6"
          style={{ color: state.currentTheme.colors.textSecondary }}
        >
          {description}
        </p>

        {(onAction || onSecondaryAction) && (
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {onAction && actionLabel && (
              <button
                onClick={onAction}
                className="px-6 py-3 rounded-lg font-medium transition-all hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: state.currentTheme.colors.primary,
                  color: "white",
                }}
              >
                {actionLabel}
              </button>
            )}

            {onSecondaryAction && secondaryActionLabel && (
              <button
                onClick={onSecondaryAction}
                className="px-6 py-3 rounded-lg font-medium transition-all hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: state.currentTheme.colors.surface,
                  color: state.currentTheme.colors.text,
                  border: `1px solid ${state.currentTheme.colors.border}`,
                }}
              >
                {secondaryActionLabel}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

