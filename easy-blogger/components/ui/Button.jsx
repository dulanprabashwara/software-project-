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
    "w-full py-3 px-4 rounded-full text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md flex items-center justify-center gap-3";

  const variants = {
    primary: "bg-brand-primary text-white hover:bg-brand-primary-hover",
    outline:
      "bg-white border border-[#E5E7EB] text-brand-black hover:border-brand-primary hover:bg-[#F9FAFB]",
    dark: "bg-brand-black text-white hover:bg-brand-black-hover",
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
