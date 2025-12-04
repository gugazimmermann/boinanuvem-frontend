import { Button, FileUpload } from "~/components/ui";

interface ObservationFormProps {
  readonly title: string;
  readonly observationText: string;
  readonly onObservationTextChange: (value: string) => void;
  readonly observationFiles: File[];
  readonly onObservationFilesChange: (files: File[]) => void;
  readonly isSubmitting: boolean;
  readonly onSubmit: (e: React.FormEvent) => void;
  readonly onCancel: () => void;
  readonly translationKeys: {
    readonly observation: string;
    readonly files: string;
    readonly filesHelper?: string;
    readonly observationPlaceholder?: string;
    readonly cancel: string;
    readonly save: string;
  };
}

export function ObservationForm({
  title,
  observationText,
  onObservationTextChange,
  observationFiles,
  onObservationFilesChange,
  isSubmitting,
  onSubmit,
  onCancel,
  translationKeys,
}: ObservationFormProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {translationKeys.observation} <span className="text-red-500">*</span>
          </label>
          <textarea
            value={observationText}
            onChange={(e) => onObservationTextChange(e.target.value)}
            disabled={isSubmitting}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200 resize-none"
            placeholder={translationKeys.observationPlaceholder || "Digite sua observação..."}
            required
          />
        </div>

        <FileUpload
          label={translationKeys.files}
          files={observationFiles}
          onChange={onObservationFilesChange}
          disabled={isSubmitting}
          multiple={true}
          helperText={translationKeys.filesHelper || "Você pode fazer upload de múltiplos arquivos"}
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            {translationKeys.cancel}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {translationKeys.save}
          </Button>
        </div>
      </form>
    </div>
  );
}
