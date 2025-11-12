import { useState, useEffect } from "react";
import { Input, Button } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { maskPhone } from "~/components/site/utils/masks";
import { DASHBOARD_COLORS } from "../utils/colors";
import type { UserFormData } from "~/types";

export type { UserFormData };

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormData) => Promise<void>;
  initialData?: UserFormData | null;
  isEditing?: boolean;
}

export function UserFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isEditing = false,
}: UserFormModalProps) {
  const t = useTranslation();
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    phone: "",
    role: "user",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [changePassword, setChangePassword] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          name: initialData.name || "",
          email: initialData.email || "",
          phone: initialData.phone || "",
          role: initialData.role || "user",
          password: "",
          confirmPassword: "",
        });
        setChangePassword(false);
      } else {
        setFormData({
          name: "",
          email: "",
          phone: "",
          role: "user",
          password: "",
          confirmPassword: "",
        });
        setChangePassword(true);
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  const handleChange = (field: keyof UserFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    const fields = t.team.addModal.fields;

    if (!formData.name?.trim()) {
      newErrors.name = t.profile.errors.required(fields.name);
    }
    if (!formData.email?.trim()) {
      newErrors.email = t.profile.errors.required(fields.email);
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t.profile.errors.invalid(fields.email);
    }
    if (!formData.phone?.trim()) {
      newErrors.phone = t.profile.errors.required(fields.phone);
    }
    if ((!isEditing || changePassword) && !formData.password?.trim()) {
      newErrors.password = t.profile.errors.required(fields.password);
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = t.team.new.passwordMinLength;
    }
    if ((!isEditing || changePassword) && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t.team.new.passwordMismatch;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const submitData = { ...formData };
      if (isEditing && !changePassword) {
        delete submitData.password;
        delete submitData.confirmPassword;
      }
      await onSubmit(submitData);
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-4 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-opacity-50 cursor-pointer"
          onClick={onClose}
        />

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border border-gray-200 dark:border-gray-700">
          <div className="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold leading-6 text-gray-900 dark:text-gray-100">
              {isEditing ? t.team.editModal.title : t.team.addModal.title}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {isEditing ? t.team.editModal.description : t.team.addModal.description}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="px-6 py-5 max-h-[calc(100vh-250px)] overflow-y-auto">
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Input
                    label={t.team.addModal.fields.name}
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    error={errors.name}
                    disabled={isSubmitting}
                    className="md:col-span-2"
                  />

                  <Input
                    label={t.team.addModal.fields.email}
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    error={errors.email}
                    disabled={isSubmitting}
                  />

                  <Input
                    label={t.team.addModal.fields.phone}
                    value={maskPhone(formData.phone)}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    error={errors.phone}
                    disabled={isSubmitting}
                    placeholder="(00) 00000-0000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.team.addModal.fields.role}
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleChange("role", e.target.value)}
                    disabled={isSubmitting}
                    className="block w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <option value="user">{t.team.roles.user}</option>
                    <option value="manager">{t.team.roles.manager}</option>
                    <option value="admin">{t.team.roles.admin}</option>
                  </select>
                  {errors.role && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.role}</p>
                  )}
                </div>

                {isEditing && (
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="changePassword"
                        checked={changePassword}
                        onChange={(e) => {
                          setChangePassword(e.target.checked);
                          if (!e.target.checked) {
                            setFormData((prev) => ({
                              ...prev,
                              password: "",
                              confirmPassword: "",
                            }));
                            setErrors((prev) => {
                              const newErrors = { ...prev };
                              delete newErrors.password;
                              delete newErrors.confirmPassword;
                              return newErrors;
                            });
                          }
                        }}
                        disabled={isSubmitting}
                        className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:bg-gray-700 disabled:opacity-50"
                        style={{
                          accentColor: DASHBOARD_COLORS.primary,
                        }}
                      />
                      <label
                        htmlFor="changePassword"
                        className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                      >
                        {t.team.editModal.changePassword}
                      </label>
                    </div>
                  </div>
                )}

                {(!isEditing || changePassword) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <Input
                      label={t.team.addModal.fields.password}
                      type="password"
                      value={formData.password || ""}
                      onChange={(e) => handleChange("password", e.target.value)}
                      error={errors.password}
                      disabled={isSubmitting}
                    />

                    <Input
                      label={t.team.addModal.fields.confirmPassword}
                      type="password"
                      value={formData.confirmPassword || ""}
                      onChange={(e) => handleChange("confirmPassword", e.target.value)}
                      error={errors.confirmPassword}
                      disabled={isSubmitting}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 sm:flex sm:flex-row-reverse gap-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting
                  ? t.common.loading
                  : isEditing
                    ? t.team.editModal.save
                    : t.team.addModal.add}
              </Button>
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                {isEditing ? t.team.editModal.cancel : t.team.addModal.cancel}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
