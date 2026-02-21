import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

// Base input component for forms and search
export default function Input({
  type = "text",
  placeholder,
  value,
  onChange,
  className = "",
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordInput = type === "password";
  const currentType = isPasswordInput && showPassword ? "text" : type;

  return (
    <div className="relative w-full">
      <input
        type={currentType}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-3 border border-[#E5E7EB] rounded-full text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#1ABC9C] transition-colors ${
          isPasswordInput ? "pr-12" : ""
        } ${className}`}
        {...props}
      />
      {isPasswordInput && (
        <button
          type="button"
          tabIndex="-1"
          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280] focus:outline-none transition-colors"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      )}
    </div>
  );
}
