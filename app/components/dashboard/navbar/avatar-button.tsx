import { DASHBOARD_COLORS } from "../utils/colors";

interface AvatarButtonProps {
  onClick: () => void;
  isOpen: boolean;
  initial?: string;
}

export function AvatarButton({ onClick, isOpen, initial = "U" }: AvatarButtonProps) {
  return (
    <button
      onClick={onClick}
      className="relative z-10 flex items-center p-1.5 text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-transparent dark:border-gray-700 rounded-md focus:ring-opacity-40 focus:ring focus:outline-none hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
      style={{
        "--focus-border": DASHBOARD_COLORS.primary,
        "--focus-ring": DASHBOARD_COLORS.primaryLight,
      } as React.CSSProperties & { "--focus-border"?: string; "--focus-ring"?: string }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = DASHBOARD_COLORS.primary;
        e.currentTarget.style.boxShadow = `0 0 0 3px ${DASHBOARD_COLORS.primaryLight}40`;
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = "";
        e.currentTarget.style.boxShadow = "";
      }}
    >
      <div 
        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm"
        style={{ backgroundColor: DASHBOARD_COLORS.primary }}
      >
        {initial}
      </div>
      <svg
        className={`w-4 h-4 ml-1 transition-transform ${isOpen ? "rotate-180" : ""}`}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 15.713L18.01 9.70299L16.597 8.28799L12 12.888L7.40399 8.28799L5.98999 9.70199L12 15.713Z"
          fill="currentColor"
        />
      </svg>
    </button>
  );
}

