interface UserInfoProps {
  name: string;
  email: string;
  initial?: string;
}

export function UserInfo({ name, email, initial = "U" }: UserInfoProps) {
  return (
    <a
      href="#"
      className="flex items-center p-2 -mt-2 text-sm text-gray-600 transition-colors duration-300 transform hover:bg-gray-100 cursor-pointer"
    >
      <div className="flex-shrink-0 mx-1 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm">
        {initial}
      </div>
      <div className="mx-1">
        <h1 className="text-xs font-semibold text-gray-700">{name}</h1>
        <p className="text-xs text-gray-500">{email}</p>
      </div>
    </a>
  );
}

