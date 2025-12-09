import { describe, it, expect, vi } from "vitest";
import {
  maskCNPJ,
  unmaskCNPJ,
  maskPhone,
  unmaskPhone,
  maskCEP,
  unmaskCEP,
  maskCPF,
  unmaskCPF,
  maskDate,
  unmaskDate,
  dateToISO,
  isoToDate,
  createMaskHandler,
} from "../masks";

describe("maskCNPJ", () => {
  it("should mask CNPJ correctly", () => {
    expect(maskCNPJ("12345678000190")).toBe("12.345.678/0001-90");
  });

  it("should handle partial CNPJ", () => {
    expect(maskCNPJ("12")).toBe("12");
    expect(maskCNPJ("123")).toBe("12.3");
    expect(maskCNPJ("12345")).toBe("12.345");
    expect(maskCNPJ("12345678")).toBe("12.345.678");
    expect(maskCNPJ("123456780001")).toBe("12.345.678/0001");
  });

  it("should handle empty string", () => {
    expect(maskCNPJ("")).toBe("");
  });

  it("should remove non-digits before masking", () => {
    expect(maskCNPJ("12.345.678/0001-90")).toBe("12.345.678/0001-90");
  });
});

describe("unmaskCNPJ", () => {
  it("should remove all non-digits", () => {
    expect(unmaskCNPJ("12.345.678/0001-90")).toBe("12345678000190");
  });

  it("should handle already unmasked CNPJ", () => {
    expect(unmaskCNPJ("12345678000190")).toBe("12345678000190");
  });
});

describe("maskPhone", () => {
  it("should mask phone correctly", () => {
    expect(maskPhone("11987654321")).toBe("(11) 98765-4321");
  });

  it("should handle partial phone", () => {
    expect(maskPhone("1")).toBe("(1");
    expect(maskPhone("11")).toBe("(11");
    expect(maskPhone("119")).toBe("(11) 9");
    expect(maskPhone("1198765")).toBe("(11) 9876-5");
    expect(maskPhone("1198765432")).toBe("(11) 9876-5432");
  });

  it("should handle empty string", () => {
    expect(maskPhone("")).toBe("");
  });
});

describe("unmaskPhone", () => {
  it("should remove all non-digits", () => {
    expect(unmaskPhone("(11) 98765-4321")).toBe("11987654321");
  });
});

describe("maskCEP", () => {
  it("should mask CEP correctly", () => {
    expect(maskCEP("12345678")).toBe("12.345-678");
  });

  it("should handle partial CEP", () => {
    expect(maskCEP("1")).toBe("1");
    expect(maskCEP("12")).toBe("12");
    expect(maskCEP("123")).toBe("12.3");
    expect(maskCEP("12345")).toBe("12.345");
  });

  it("should handle empty string", () => {
    expect(maskCEP("")).toBe("");
  });
});

describe("unmaskCEP", () => {
  it("should remove all non-digits", () => {
    expect(unmaskCEP("12.345-678")).toBe("12345678");
  });
});

describe("maskCPF", () => {
  it("should mask CPF correctly", () => {
    expect(maskCPF("12345678901")).toBe("123.456.789-01");
  });

  it("should handle partial CPF", () => {
    expect(maskCPF("1")).toBe("1");
    expect(maskCPF("123")).toBe("123");
    expect(maskCPF("1234")).toBe("123.4");
    expect(maskCPF("123456")).toBe("123.456");
    expect(maskCPF("1234567")).toBe("123.456.7");
    expect(maskCPF("123456789")).toBe("123.456.789");
  });

  it("should handle empty string", () => {
    expect(maskCPF("")).toBe("");
  });
});

describe("unmaskCPF", () => {
  it("should remove all non-digits", () => {
    expect(unmaskCPF("123.456.789-01")).toBe("12345678901");
  });
});

describe("maskDate", () => {
  it("should mask date correctly", () => {
    expect(maskDate("01012024")).toBe("01/01/2024");
  });

  it("should handle partial date", () => {
    expect(maskDate("01")).toBe("01");
    expect(maskDate("0101")).toBe("01/01");
  });

  it("should handle empty string", () => {
    expect(maskDate("")).toBe("");
  });
});

describe("unmaskDate", () => {
  it("should remove all non-digits", () => {
    expect(unmaskDate("01/01/2024")).toBe("01012024");
  });
});

describe("dateToISO", () => {
  it("should convert date to ISO format", () => {
    expect(dateToISO("01/01/2024")).toBe("2024-01-01");
  });

  it("should return empty string for invalid length", () => {
    expect(dateToISO("0101202")).toBe("");
  });

  it("should return empty string for invalid day", () => {
    expect(dateToISO("32/01/2024")).toBe("");
  });

  it("should return empty string for invalid month", () => {
    expect(dateToISO("01/13/2024")).toBe("");
  });

  it("should handle empty string", () => {
    expect(dateToISO("")).toBe("");
  });
});

describe("isoToDate", () => {
  it("should convert ISO to date format", () => {
    expect(isoToDate("2024-01-01")).toBe("01/01/2024");
  });

  it("should return empty string for invalid format", () => {
    expect(isoToDate("20240101")).toBe("");
    expect(isoToDate("2024-1-1")).toBe("");
    expect(isoToDate("")).toBe("");
  });

  it("should return empty string for invalid length", () => {
    expect(isoToDate("2024-01")).toBe("");
  });

  it("should handle missing parts", () => {
    expect(isoToDate("2024-01-")).toBe("");
  });
});

describe("createMaskHandler", () => {
  it("should create handler that applies mask and calls onChange", () => {
    const onChange = vi.fn();
    const handler = createMaskHandler(maskCEP, onChange);

    const event = {
      target: { value: "12345678" },
    } as React.ChangeEvent<HTMLInputElement>;

    handler(event);

    expect(onChange).toHaveBeenCalledWith("12.345-678");
  });

  it("should handle empty value", () => {
    const onChange = vi.fn();
    const handler = createMaskHandler(maskCEP, onChange);

    const event = {
      target: { value: "" },
    } as React.ChangeEvent<HTMLInputElement>;

    handler(event);

    expect(onChange).toHaveBeenCalledWith("");
  });
});
