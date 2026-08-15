export default function CreateArticleTypeModal({
  isOpen,
  onClose,
  onUseAi,
  onRegular,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-3 text-2xl text-gray-400 hover:text-brand-muted"
        >
          ×
        </button>

        <h2 className="mb-8 text-center text-3xl font-serif font-bold text-brand-black">
          Create Your Article
        </h2>

        <div className="space-y-5">
          <button
            type="button"
            onClick={onUseAi}
            className="w-full rounded-full bg-brand-primary py-3 font-semibold text-white shadow-md hover:bg-brand-primary-hover"
          >
            Using AI
          </button>

          <button
            type="button"
            onClick={onRegular}
            className="w-full rounded-full bg-black py-3 font-semibold text-white shadow-md hover:opacity-90"
          >
            As a Regular Article
          </button>
        </div>
      </div>
    </div>
  );
}