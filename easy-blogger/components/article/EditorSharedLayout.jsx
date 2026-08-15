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
        <div className="text-sm text-[#6B7280]">{statusText}</div>

        <div className="text-center">
          <h1 className="font-serif text-3xl font-bold text-[#111827]">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-0 text-sm text-[#6B7280]">{subtitle}</p>
          ) : null}
        </div>

        <div className="flex items-center justify-end gap-2">
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
                ? "bg-[#1ABC9C] hover:bg-[#17a589]"
                : "bg-[#111827] hover:bg-[#1f2937]"
            }`}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}