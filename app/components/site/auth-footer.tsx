interface AuthFooterProps {
  question: string;
  linkText: string;
  linkRoute: string;
}

export function AuthFooter({ question, linkText, linkRoute }: AuthFooterProps) {
  return (
    <div className="flex items-center justify-center py-4 text-center bg-gray-50 dark:bg-gray-900">
      <span className="text-sm text-gray-600 dark:text-gray-400">{question} </span>
      <a
        href={linkRoute}
        className="mx-2 text-sm font-bold text-blue-500 dark:text-blue-400 hover:underline transition-colors cursor-pointer"
      >
        {linkText}
      </a>
    </div>
  );
}
