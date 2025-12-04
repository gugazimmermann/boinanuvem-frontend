import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTeamForm } from "../use-team-form";
import * as useBaseFormHook from "../use-base-form";
import * as useTranslationHook from "~/i18n/use-translation";
import * as masks from "~/components/site/utils/masks";
import * as cepLookup from "~/components/site/hooks/use-cep-lookup";
import * as cepUtils from "~/components/site/utils/cep-utils";
import * as emailValidation from "~/utils/email-validation";

vi.mock("../use-base-form");
vi.mock("~/i18n/use-translation");
vi.mock("~/components/site/utils/masks");
vi.mock("~/components/site/hooks/use-cep-lookup");
vi.mock("~/components/site/utils/cep-utils");
vi.mock("~/utils/email-validation");

describe("useTeamForm", () => {
  const mockOnSubmit = vi.fn();
  const _mockOnSuccess = vi.fn();
  const mockSetFormData = vi.fn();
  const mockHandleChange = vi.fn();
  const mockHandleSubmit = vi.fn();
  const mockShowAlert = vi.fn();

  const mockBaseForm = {
    formData: {
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
    },
    setFormData: mockSetFormData,
    errors: {},
    isSubmitting: false,
    alertMessage: null,
    handleChange: mockHandleChange,
    handleSubmit: mockHandleSubmit,
    showAlert: mockShowAlert,
  };

  const mockTranslation = {
    team: {
      addModal: {
        fields: {
          name: "Name",
          email: "Email",
          phone: "Phone",
          password: "Password",
        },
      },
      new: {
        fields: {
          street: "Street",
          neighborhood: "Neighborhood",
          city: "City",
          state: "State",
          cep: "CEP",
        },
        passwordMinLength: "Password must be at least 6 characters",
        passwordMismatch: "Passwords do not match",
      },
    },
    profile: {
      errors: {
        required: (label: string) => `${label} is required`,
        invalid: (label: string) => `${label} is invalid`,
      },
    },
  };

  const defaultOptions = {
    onSubmit: mockOnSubmit,
    successMessage: "Team member saved successfully",
    errorMessage: "Error saving team member",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useBaseFormHook.useBaseForm).mockReturnValue(mockBaseForm);
    vi.mocked(useTranslationHook.useTranslation).mockReturnValue(
      mockTranslation as ReturnType<typeof import("~/i18n").useTranslation>
    );
    vi.mocked(masks.maskPhone).mockImplementation((value: string) => value);
    vi.mocked(masks.maskCPF).mockImplementation((value: string) => value);
    vi.mocked(masks.maskCEP).mockImplementation((value: string) => value);
    vi.mocked(masks.unmaskCPF).mockImplementation((value: string) => value.replaceAll(/\D/g, ""));
    vi.mocked(masks.unmaskCEP).mockImplementation((value: string) => value.replaceAll(/\D/g, ""));
    vi.mocked(emailValidation.isValidEmail).mockReturnValue(true);
    vi.mocked(cepLookup.useCEPLookup).mockReturnValue({
      data: null,
      loading: false,
      error: null,
      fetchCEP: vi.fn(),
    });
    vi.mocked(cepUtils.mapCEPDataToAddressForm).mockImplementation(
      (data: Record<string, unknown>, existing?: Record<string, unknown>) => ({
        street: data.street || existing?.street || "",
        neighborhood: data.neighborhood || existing?.neighborhood || "",
        city: data.city || existing?.city || "",
        state: data.state || existing?.state || "",
        number: existing?.number || "",
        complement: existing?.complement || "",
      })
    );
  });

  it("should initialize with default values", () => {
    const { result } = renderHook(() => useTeamForm(defaultOptions));

    expect(result.current.formData).toEqual(mockBaseForm.formData);
    expect(result.current.errors).toEqual({});
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.changePassword).toBe(false);
    expect(result.current.zipCodeLoading).toBe(false);
    expect(result.current.zipCodeError).toBe(null);
  });

  it("should initialize with initial data", () => {
    const initialData = {
      name: "John Doe",
      email: "john@example.com",
      cpf: "12345678901",
      phone: "1234567890",
    };

    renderHook(() =>
      useTeamForm({
        ...defaultOptions,
        initialData,
      })
    );

    expect(useBaseFormHook.useBaseForm).toHaveBeenCalledWith(
      expect.objectContaining({
        initialData: expect.objectContaining({
          name: "John Doe",
          email: "john@example.com",
          cpf: "12345678901",
          phone: "1234567890",
        }),
      })
    );
  });

  it("should update changePassword", () => {
    const { result } = renderHook(() => useTeamForm(defaultOptions));

    act(() => {
      result.current.setChangePassword(true);
    });

    expect(result.current.changePassword).toBe(true);
  });

  it("should mask phone when handleChange is called", () => {
    const { result } = renderHook(() => useTeamForm(defaultOptions));

    act(() => {
      result.current.handleChange("phone", "1234567890");
    });

    expect(masks.maskPhone).toHaveBeenCalledWith("1234567890");
    expect(mockHandleChange).toHaveBeenCalled();
  });

  it("should mask CPF when handleChange is called", () => {
    const { result } = renderHook(() => useTeamForm(defaultOptions));

    act(() => {
      result.current.handleChange("cpf", "12345678901");
    });

    expect(masks.maskCPF).toHaveBeenCalledWith("12345678901");
    expect(mockHandleChange).toHaveBeenCalled();
  });

  it("should mask CEP when handleChange is called", () => {
    const { result } = renderHook(() => useTeamForm(defaultOptions));

    act(() => {
      result.current.handleChange("zipCode", "12345678");
    });

    expect(masks.maskCEP).toHaveBeenCalledWith("12345678");
    expect(mockHandleChange).toHaveBeenCalled();
  });

  it("should not mask other fields", () => {
    const { result } = renderHook(() => useTeamForm(defaultOptions));

    act(() => {
      result.current.handleChange("name", "John Doe");
    });

    expect(masks.maskPhone).not.toHaveBeenCalled();
    expect(masks.maskCPF).not.toHaveBeenCalled();
    expect(masks.maskCEP).not.toHaveBeenCalled();
    expect(mockHandleChange).toHaveBeenCalledWith("name", "John Doe");
  });

  it("should validate required fields", () => {
    renderHook(() => useTeamForm(defaultOptions));

    const callArgs = vi.mocked(useBaseFormHook.useBaseForm).mock.calls[0][0];
    const validate = callArgs.validate!;

    const result = validate({
      name: "",
      cpf: "",
      email: "",
      phone: "",
      street: "",
      neighborhood: "",
      city: "",
      state: "",
      zipCode: "",
      password: "",
      confirmPassword: "",
    });

    expect(result).not.toBe(true);
    expect(typeof result).toBe("object");
  });

  it("should validate CPF length", () => {
    renderHook(() => useTeamForm(defaultOptions));

    const callArgs = vi.mocked(useBaseFormHook.useBaseForm).mock.calls[0][0];
    const validate = callArgs.validate!;

    vi.mocked(masks.unmaskCPF).mockReturnValue("1234567890"); // 10 digits

    const result = validate({
      name: "John Doe",
      cpf: "123.456.789-01",
      email: "john@example.com",
      phone: "1234567890",
      street: "Street",
      neighborhood: "Neighborhood",
      city: "City",
      state: "State",
      zipCode: "12345-678",
      password: "password123",
      confirmPassword: "password123",
    });

    expect(result).not.toBe(true);
    expect(typeof result).toBe("object");
  });

  it("should validate email format", () => {
    renderHook(() => useTeamForm(defaultOptions));

    const callArgs = vi.mocked(useBaseFormHook.useBaseForm).mock.calls[0][0];
    const validate = callArgs.validate!;

    vi.mocked(emailValidation.isValidEmail).mockReturnValue(false);

    const result = validate({
      name: "John Doe",
      cpf: "12345678901",
      email: "invalid-email",
      phone: "1234567890",
      street: "Street",
      neighborhood: "Neighborhood",
      city: "City",
      state: "State",
      zipCode: "12345-678",
      password: "password123",
      confirmPassword: "password123",
    });

    expect(result).not.toBe(true);
    expect(typeof result).toBe("object");
  });

  it("should validate password when not in edit mode", () => {
    renderHook(() => useTeamForm(defaultOptions));

    const callArgs = vi.mocked(useBaseFormHook.useBaseForm).mock.calls[0][0];
    const validate = callArgs.validate!;

    const result = validate({
      name: "John Doe",
      cpf: "12345678901",
      email: "john@example.com",
      phone: "1234567890",
      street: "Street",
      neighborhood: "Neighborhood",
      city: "City",
      state: "State",
      zipCode: "12345-678",
      password: "",
      confirmPassword: "",
    });

    expect(result).not.toBe(true);
    expect(typeof result).toBe("object");
  });

  it("should validate password minimum length", () => {
    renderHook(() => useTeamForm(defaultOptions));

    const callArgs = vi.mocked(useBaseFormHook.useBaseForm).mock.calls[0][0];
    const validate = callArgs.validate!;

    const result = validate({
      name: "John Doe",
      cpf: "12345678901",
      email: "john@example.com",
      phone: "1234567890",
      street: "Street",
      neighborhood: "Neighborhood",
      city: "City",
      state: "State",
      zipCode: "12345-678",
      password: "12345", // Less than 6 characters
      confirmPassword: "12345",
    });

    expect(result).not.toBe(true);
    expect(typeof result).toBe("object");
  });

  it("should validate password match", () => {
    renderHook(() => useTeamForm(defaultOptions));

    const callArgs = vi.mocked(useBaseFormHook.useBaseForm).mock.calls[0][0];
    const validate = callArgs.validate!;

    const result = validate({
      name: "John Doe",
      cpf: "12345678901",
      email: "john@example.com",
      phone: "1234567890",
      street: "Street",
      neighborhood: "Neighborhood",
      city: "City",
      state: "State",
      zipCode: "12345-678",
      password: "password123",
      confirmPassword: "password456",
    });

    expect(result).not.toBe(true);
    expect(typeof result).toBe("object");
  });

  it("should not validate password in edit mode when changePassword is false", () => {
    renderHook(() =>
      useTeamForm({
        ...defaultOptions,
        isEdit: true,
      })
    );

    const callArgs = vi.mocked(useBaseFormHook.useBaseForm).mock.calls[0][0];
    const validate = callArgs.validate!;

    const result = validate({
      name: "John Doe",
      cpf: "12345678901",
      email: "john@example.com",
      phone: "1234567890",
      street: "Street",
      neighborhood: "Neighborhood",
      city: "City",
      state: "State",
      zipCode: "12345-678",
      password: "",
      confirmPassword: "",
    });

    // Should pass validation since password is not required when not changing password
    expect(result).toBe(true);
  });

  it("should unmask CPF in onSubmit", () => {
    renderHook(() => useTeamForm(defaultOptions));

    const callArgs = vi.mocked(useBaseFormHook.useBaseForm).mock.calls[0][0];
    const onSubmit = callArgs.onSubmit!;

    onSubmit({
      name: "John Doe",
      cpf: "123.456.789-01",
      email: "john@example.com",
      phone: "1234567890",
      street: "Street",
      neighborhood: "Neighborhood",
      city: "City",
      state: "State",
      zipCode: "12345-678",
      password: "password123",
      confirmPassword: "password123",
    } as Record<string, unknown>);

    expect(masks.unmaskCPF).toHaveBeenCalled();
    expect(mockOnSubmit).toHaveBeenCalled();
  });

  it("should remove password fields in edit mode when changePassword is false", () => {
    renderHook(() =>
      useTeamForm({
        ...defaultOptions,
        isEdit: true,
      })
    );

    const callArgs = vi.mocked(useBaseFormHook.useBaseForm).mock.calls[0][0];
    const onSubmit = callArgs.onSubmit!;

    const formData = {
      name: "John Doe",
      cpf: "12345678901",
      email: "john@example.com",
      phone: "1234567890",
      street: "Street",
      neighborhood: "Neighborhood",
      city: "City",
      state: "State",
      zipCode: "12345-678",
      password: "password123",
      confirmPassword: "password123",
    };

    onSubmit(formData as Record<string, unknown>);

    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.not.objectContaining({
        password: expect.anything(),
        confirmPassword: expect.anything(),
      })
    );
  });

  it("should call useCEPLookup with unmasked zipCode", () => {
    vi.mocked(useBaseFormHook.useBaseForm).mockReturnValue({
      ...mockBaseForm,
      formData: {
        ...mockBaseForm.formData,
        zipCode: "12345-678",
      },
    });

    renderHook(() => useTeamForm(defaultOptions));

    expect(masks.unmaskCEP).toHaveBeenCalledWith("12345-678");
    expect(cepLookup.useCEPLookup).toHaveBeenCalled();
  });

  it("should return zipCodeLoading from useCEPLookup", () => {
    vi.mocked(cepLookup.useCEPLookup).mockReturnValue({
      data: null,
      loading: true,
      error: null,
      fetchCEP: vi.fn(),
    });

    const { result } = renderHook(() => useTeamForm(defaultOptions));

    expect(result.current.zipCodeLoading).toBe(true);
  });

  it("should return zipCodeError from useCEPLookup", () => {
    const errorMessage = "CEP not found";
    vi.mocked(cepLookup.useCEPLookup).mockReturnValue({
      data: null,
      loading: false,
      error: errorMessage,
      fetchCEP: vi.fn(),
    });

    const { result } = renderHook(() => useTeamForm(defaultOptions));

    expect(result.current.zipCodeError).toBe(errorMessage);
  });

  it("should validate form", () => {
    vi.mocked(useBaseFormHook.useBaseForm).mockReturnValue({
      ...mockBaseForm,
      errors: {},
    });

    const { result } = renderHook(() => useTeamForm(defaultOptions));

    expect(result.current.validate()).toBe(true);
  });

  it("should return false from validate when there are errors", () => {
    vi.mocked(useBaseFormHook.useBaseForm).mockReturnValue({
      ...mockBaseForm,
      errors: { name: "Name is required" },
    });

    const { result } = renderHook(() => useTeamForm(defaultOptions));

    expect(result.current.validate()).toBe(false);
  });

  it("should return handleSubmit from baseForm", () => {
    const { result } = renderHook(() => useTeamForm(defaultOptions));

    expect(result.current.handleSubmit).toBe(mockHandleSubmit);
  });
});
