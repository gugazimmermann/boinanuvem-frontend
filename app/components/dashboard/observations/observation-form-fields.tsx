import { FileUpload } from "~/components/ui";

interface ObservationFormFieldsProps {
  readonly observation: string;
  readonly onObservationChange: (value: string) => void;
  readonly observationFiles: File[];
  readonly onObservationFilesChange: (files: File[]) => void;
  readonly isSubmitting: boolean;
  readonly observationLabel?: string;
  readonly observationPlaceholder?: string;
  readonly filesLabel?: string;
  readonly filesHelperText?: string;
}

export function ObservationFormFields({
  observation,
  onObservationChange,
  observationFiles,
  onObservationFilesChange,
  isSubmitting,
  observationLabel = "Observação",
  observationPlaceholder = "Adicione uma observação (opcional)",
  filesLabel = "Anexos",
  filesHelperText = "Você pode anexar múltiplos arquivos à observação",
}: ObservationFormFieldsProps) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {observationLabel}
        </label>
        <textarea
          value={observation}
          onChange={(e) => onObservationChange(e.target.value)}
          disabled={isSubmitting}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
          placeholder={observationPlaceholder}
        />
      </div>

      <FileUpload
        label={filesLabel}
        files={observationFiles}
        onChange={onObservationFilesChange}
        disabled={isSubmitting}
        multiple={true}
        helperText={filesHelperText}
      />
    </>
  );
}
