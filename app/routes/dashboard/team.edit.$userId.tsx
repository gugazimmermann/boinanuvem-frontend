import { useState, useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { Input, Button, Alert } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { maskPhone, maskCPF, unmaskCPF, maskCEP, unmaskCEP } from "~/components/site/utils/masks";
import { useCEPLookup, type CEPData } from "~/components/site/hooks";
import { mapCEPDataToAddressForm } from "~/components/site/utils";
import { ROUTES } from "~/routes.config";
import { getUserById, updateUser } from "~/mocks/users";
import type { UserFormData } from "~/components/dashboard/team/user-form-modal";

export function meta() {
  return [
    { title: "Editar Membro - Boi na Nuvem" },
    {
      name: "description",
      content: "Editar membro da equipe",
    },
  ];
}

export default function EditTeamMember() {
  const t = useTranslation();
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const user = getUserById(userId);

  const [formData, setFormData] = useState<
    UserFormData & { password: string; confirmPassword: string }
  >({
    name: "",
    cpf: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    zipCode: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [changePassword, setChangePassword] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{
    title: string;
    variant: "success" | "error" | "warning" | "info";
  } | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        cpf: user.cpf ? maskCPF(user.cpf) : "",
        email: user.email || "",
        phone: user.phone ? maskPhone(user.phone) : "",
        password: "",
        confirmPassword: "",
        street: user.street || "",
        number: user.number || "",
        complement: user.complement || "",
        neighborhood: user.neighborhood || "",
        city: user.city || "",
        state: user.state || "",
        zipCode: user.zipCode ? maskCEP(user.zipCode) : "",
      });
    }
  }, [user]);

  const handleZipCodeSuccess = useCallback((data: CEPData) => {
    setFormData((prev) => {
      const mappedData = mapCEPDataToAddressForm(data, prev);
      return { ...prev, ...mappedData, zipCode: prev.zipCode };
    });
  }, []);

  const { loading: zipCodeLoading, error: zipCodeError } = useCEPLookup(
    unmaskCEP(formData.zipCode || ""),
    {
      debounceMs: 800,
      onSuccess: handleZipCodeSuccess,
    }
  );

  const showAlert = (
    title: string,
    variant: "success" | "error" | "warning" | "info" = "success"
  ) => {
    setAlertMessage({ title, variant });
    setTimeout(() => {
      setAlertMessage(null);
    }, 3000);
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    if (field === "phone") {
      setFormData((prev) => ({ ...prev, [field]: maskPhone(value) }));
    } else if (field === "cpf") {
      setFormData((prev) => ({ ...prev, [field]: maskCPF(value) }));
    } else if (field === "zipCode") {
      setFormData((prev) => ({ ...prev, [field]: maskCEP(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
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
    if (!formData.cpf?.trim()) {
      newErrors.cpf = t.profile.errors.required("CPF");
    } else if (unmaskCPF(formData.cpf).length !== 11) {
      newErrors.cpf = t.profile.errors.invalid("CPF");
    }
    if (!formData.email?.trim()) {
      newErrors.email = t.profile.errors.required(fields.email);
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t.profile.errors.invalid(fields.email);
    }
    if (!formData.phone?.trim()) {
      newErrors.phone = t.profile.errors.required(fields.phone);
    }
    if (!formData.street?.trim()) {
      newErrors.street = t.profile.errors.required(t.team.new.fields.street);
    }
    if (!formData.neighborhood?.trim()) {
      newErrors.neighborhood = t.profile.errors.required(t.team.new.fields.neighborhood);
    }
    if (!formData.city?.trim()) {
      newErrors.city = t.profile.errors.required(t.team.new.fields.city);
    }
    if (!formData.state?.trim()) {
      newErrors.state = t.profile.errors.required(t.team.new.fields.state);
    }
    if (!formData.zipCode?.trim()) {
      newErrors.zipCode = t.profile.errors.required(t.team.new.fields.cep);
    }
    if (changePassword) {
      if (!formData.password?.trim()) {
        newErrors.password = t.profile.errors.required(fields.password);
      } else if (formData.password.length < 6) {
        newErrors.password = t.team.new.passwordMinLength;
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = t.team.new.passwordMismatch;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !userId) return;

    setIsSubmitting(true);
    try {
      const updateData: UserFormData = {
        ...formData,
        cpf: unmaskCPF(formData.cpf || ""),
      };

      if (!changePassword) {
        delete updateData.password;
        delete updateData.confirmPassword;
      }

      updateUser(userId, updateData);
      showAlert(t.team.success.updated, "success");
      setTimeout(() => {
        navigate(ROUTES.TEAM);
      }, 1500);
    } catch (error) {
      console.error("Error updating user:", error);
      showAlert(t.team.errors.updateFailed, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="space-y-6">
        {alertMessage && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top-5">
            <Alert title={alertMessage.title} variant={alertMessage.variant} />
          </div>
        )}
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-gray-500 dark:text-gray-400">{t.common.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {alertMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top-5">
          <Alert title={alertMessage.title} variant={alertMessage.variant} />
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t.team.editModal.title}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t.team.editModal.description}
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate(ROUTES.TEAM)} disabled={isSubmitting}>
          {t.team.new.back}
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={t.team.addModal.fields.name}
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                error={errors.name}
                disabled={isSubmitting}
              />
              <Input
                label={t.team.new.fields.cpf}
                value={formData.cpf}
                onChange={(e) => handleChange("cpf", e.target.value)}
                error={errors.cpf}
                disabled={isSubmitting}
                placeholder="000.000.000-00"
                maxLength={14}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                error={errors.phone}
                disabled={isSubmitting}
                placeholder="(00) 00000-0000"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Input
                  label={t.team.new.fields.cep}
                  value={formData.zipCode}
                  onChange={(e) => handleChange("zipCode", e.target.value)}
                  error={errors.zipCode || zipCodeError || undefined}
                  disabled={isSubmitting || zipCodeLoading}
                  placeholder="00000-000"
                  maxLength={10}
                />
                {zipCodeLoading && (
                  <p className="mt-1 text-xs text-blue-500 dark:text-blue-400">
                    {t.team.new.searchingAddress}
                  </p>
                )}
              </div>
              <Input
                label={t.team.new.fields.street}
                value={formData.street}
                onChange={(e) => handleChange("street", e.target.value)}
                error={errors.street}
                disabled={isSubmitting || zipCodeLoading}
                className="md:col-span-2"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label={t.profile.company.fields.number}
                value={formData.number}
                onChange={(e) => handleChange("number", e.target.value)}
                error={errors.number}
                disabled={isSubmitting}
              />
              <Input
                label={t.team.new.fields.complement}
                value={formData.complement}
                onChange={(e) => handleChange("complement", e.target.value)}
                error={errors.complement}
                disabled={isSubmitting}
                className="md:col-span-2"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label={t.team.new.fields.neighborhood}
                value={formData.neighborhood}
                onChange={(e) => handleChange("neighborhood", e.target.value)}
                error={errors.neighborhood}
                disabled={isSubmitting || zipCodeLoading}
              />
              <Input
                label={t.team.new.fields.city}
                value={formData.city}
                onChange={(e) => handleChange("city", e.target.value)}
                error={errors.city}
                disabled={isSubmitting || zipCodeLoading}
              />
              <Input
                label={t.team.new.fields.state}
                value={formData.state}
                onChange={(e) => handleChange("state", e.target.value)}
                error={errors.state}
                disabled={isSubmitting || zipCodeLoading}
              />
            </div>

            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-4">
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
                />
                <label
                  htmlFor="changePassword"
                  className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                >
                  {t.team.editModal.changePassword}
                </label>
              </div>
            </div>

            {changePassword && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label={t.team.addModal.fields.password}
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  error={errors.password}
                  disabled={isSubmitting}
                  showPasswordToggle
                />
                <Input
                  label={t.team.addModal.fields.confirmPassword}
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange("confirmPassword", e.target.value)}
                  error={errors.confirmPassword}
                  disabled={isSubmitting}
                  showPasswordToggle
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(ROUTES.TEAM)}
              disabled={isSubmitting}
            >
              {t.team.addModal.cancel}
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? t.common.loading : t.team.editModal.save}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
