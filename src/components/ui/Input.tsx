import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = "", ...props }, ref) => {
    const baseClasses =
      "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500";
    const errorClasses = error
      ? "border-red-300 focus:ring-red-500"
      : "border-gray-300";
    const inputClasses = `${baseClasses} ${errorClasses} ${className}`;

    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <input ref={ref} className={inputClasses} {...props} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        {helperText && !error && (
          <p className="text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
