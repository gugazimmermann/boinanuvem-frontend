interface UserInfoProps {
  name: string;
  email: string;
  initial?: string;
}

export function UserInfo({ name, email, initial = "U" }: UserInfoProps) {
  return (
    <a
      href="#"
      className="flex items-center px-4 py-2 text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300 transform hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
    >
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-500 dark:bg-blue-600 flex items-center justify-center text-white font-semibold text-xs">
        {initial}
      </div>
      <div className="ml-2">
        <h1 className="text-xs font-semibold text-gray-700 dark:text-gray-200">{name}</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">{email}</p>
      </div>
    </a>
  );
}

