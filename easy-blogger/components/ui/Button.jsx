// Base button component for consistent UI actions
export default function Button({
  children,
  variant = "primary",
  className = "",
  onClick,
  type = "button",
  ...props
}) {
  const baseStyles =
    "w-full py-3 px-4 rounded-full text-sm font-medium transition-colors flex items-center justify-center gap-3";

  const variants = {
    primary: "bg-[#1ABC9C] text-white hover:bg-[#16a085]",
    outline:
      "bg-white border border-[#E5E7EB] text-[#111827] hover:border-[#1ABC9C] hover:bg-[#F9FAFB]",
    dark: "bg-[#111827] text-white hover:bg-[#1f2937]",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
