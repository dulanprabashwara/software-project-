//easy-blogger\components\article\EditorSharedLayout.jsx
export function EditorHeader({
  title,
  subtitle,
  statusText = "",
  rightContent = null,
}) {
  return (
    <div className="sticky top-0 z-30 border-b border-[#E5E7EB] bg-white px-6 py-1">
      <div className="mx-auto grid max-w-6xl grid-cols-3 items-center gap-2">
        <div className="text-sm text-brand-muted">{statusText}</div>

        <div className="text-center">
          <h1 className="font-serif text-3xl font-bold text-brand-black">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-0 text-sm text-brand-muted">{subtitle}</p>
          ) : null}
        </div>

        <div className="flex items-center justify-end gap-3">
          {rightContent}
        </div>
      </div>
    </div>
  );
}

export function EditorBottomActions({ actions }) {
  return (
    <div className="sticky bottom-0 z-40 border-t border-gray-200 bg-white px-6 py-2">
      <div className="mx-auto flex max-w-5xl items-center justify-center gap-15">
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            data-keep-edit-backup={action.keepEditBackup ? "true" : undefined}
            onClick={action.onClick}
            disabled={action.disabled}
            className={`h-10 min-w-[100px] rounded-full px-5 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              action.variant === "primary"
                ? "bg-brand-primary hover:bg-brand-primary-hover"
                : "bg-brand-black hover:bg-brand-black-hover"
            }`}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}