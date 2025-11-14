import { useId, useRef, type ChangeEvent } from "react";

interface FileUploadProps {
  label?: string;
  helperText?: string;
  error?: string;
  className?: string;
  multiple?: boolean;
  accept?: string;
  disabled?: boolean;
  files?: File[];
  onChange?: (files: File[]) => void;
  onRemove?: (index: number) => void;
}

export function FileUpload({
  label,
  helperText,
  error,
  className = "",
  multiple = true,
  accept,
  disabled = false,
  files = [],
  onChange,
  onRemove,
}: FileUploadProps) {
  const generatedId = useId();
  const inputId = `file-upload-${generatedId}`;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasError = Boolean(error);
  const displayText = error || helperText;
  const helperId = displayText ? `${inputId}-helper` : undefined;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (onChange) {
      onChange(multiple ? [...files, ...selectedFiles] : selectedFiles);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemove = (index: number) => {
    if (onRemove) {
      onRemove(index);
    } else if (onChange) {
      const newFiles = files.filter((_, i) => i !== index);
      onChange(newFiles);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          {label}
        </label>
      )}

      <div className="space-y-3">
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
            hasError
              ? "border-red-400 dark:border-red-500"
              : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
          } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            id={inputId}
            type="file"
            multiple={multiple}
            accept={accept}
            disabled={disabled}
            onChange={handleFileChange}
            className="hidden"
            aria-invalid={hasError}
            aria-describedby={helperId}
          />
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="mt-4 flex text-sm leading-6 text-gray-600 dark:text-gray-400">
              <span className="relative cursor-pointer rounded-md font-semibold text-blue-600 dark:text-blue-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2">
                {multiple ? "Upload files" : "Upload a file"}
              </span>
              <p className="pl-1">or drag and drop</p>
            </div>
            {accept && (
              <p className="text-xs leading-5 text-gray-600 dark:text-gray-400 mt-2">
                Accepted: {accept}
              </p>
            )}
          </div>
        </div>

        {files.length > 0 && (
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <svg
                    className="h-5 w-5 text-gray-400 dark:text-gray-500 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                {!disabled && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(index);
                    }}
                    className="ml-3 flex-shrink-0 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 focus:outline-none"
                    aria-label={`Remove ${file.name}`}
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {displayText && (
        <p
          id={helperId}
          className={`mt-2 text-sm ${hasError ? "text-red-500" : "text-gray-500 dark:text-gray-400"}`}
        >
          {displayText}
        </p>
      )}
    </div>
  );
}
