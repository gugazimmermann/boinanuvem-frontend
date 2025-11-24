import { useState, useCallback } from "react";

interface UseAuthFormOptions {
  initialEmail?: string;
  initialPassword?: string;
  onSubmit: (email: string, password: string) => Promise<void>;
}

export function useAuthForm({
  initialEmail = "",
  initialPassword = "",
  onSubmit,
}: UseAuthFormOptions) {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState(initialPassword);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailChange = useCallback(
    (value: string) => {
      setEmail(value);
      if (error) setError("");
    },
    [error]
  );

  const handlePasswordChange = useCallback(
    (value: string) => {
      setPassword(value);
      if (error) setError("");
    },
    [error]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError("");

      if (!email.trim()) {
        setError("emailRequired");
        return;
      }

      if (!password.trim()) {
        setError("passwordRequired");
        return;
      }

      setIsLoading(true);

      try {
        await onSubmit(email.trim(), password);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "unknownError";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [email, password, onSubmit]
  );

  const clearError = useCallback(() => {
    setError("");
  }, []);

  return {
    email,
    password,
    error,
    isLoading,
    setEmail: handleEmailChange,
    setPassword: handlePasswordChange,
    handleSubmit,
    clearError,
  };
}
