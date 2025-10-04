import type { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger" | "success" | "warning";
  size?: "sm" | "md" | "lg";
  className?: string;
  type?: "button" | "submit" | "reset";
  title?: string;
}

const variantClasses = {
  primary: "bg-blue-600 hover:bg-blue-700 text-white",
  secondary: "bg-gray-600 hover:bg-gray-700 text-white",
  danger: "bg-red-600 hover:bg-red-700 text-white",
  success: "bg-green-600 hover:bg-green-700 text-white",
  warning: "bg-yellow-600 hover:bg-yellow-700 text-white",
};

const sizeClasses = {
  sm: "px-2 py-1 text-sm",
  md: "px-4 py-2",
  lg: "px-6 py-3 text-lg",
};

export default function Button({
  children,
  onClick,
  disabled = false,
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  title,
}: ButtonProps) {
  const baseClasses =
    "rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";
  const variantClass = variantClasses[variant];
  const sizeClass = sizeClasses[size];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`${baseClasses} ${variantClass} ${sizeClass} ${disabledClasses} ${className}`}
    >
      {children}
    </button>
  );
}
