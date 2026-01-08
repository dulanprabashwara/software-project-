// Base input component for forms and search
export default function Input({
  type = "text",
  placeholder,
  value,
  onChange,
  className = "",
  ...props
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-3 border border-[#E5E7EB] rounded-full text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#1ABC9C] transition-colors ${className}`}
      {...props}
    />
  );
}
