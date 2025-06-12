import { getProfileValidationErrors, isProfileValid,} from "../../validation/profile";

describe("getProfileValidationErrors", () => {
  const baseData = {
    full_name: "Juan Pérez",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  };

  it("debe retornar un objeto vacío cuando el formulario es válido y no hay cambio de contraseña", () => {
    expect(getProfileValidationErrors({ full_name: "Juan Pérez" })).toEqual({});
  });

  it.each([
    ["nombre vacío", { ...baseData, full_name: "" }],
    ["nombre con números", { ...baseData, full_name: "Juan123" }],
  ])("debe validar el campo full_name: %s", (_desc, data) => {
    const errors = getProfileValidationErrors(data);
    expect(errors).toHaveProperty("full_name");
  });

  it("debe requerir currentPassword cuando se intenta cambiar la contraseña", () => {
    const errors = getProfileValidationErrors({
      ...baseData,
      newPassword: "Abcd1234!",
      confirmPassword: "Abcd1234!",
    });
    expect(errors).toHaveProperty("currentPassword");
  });

  it("debe requerir newPassword cuando se provee currentPassword", () => {
    const errors = getProfileValidationErrors({
      ...baseData,
      currentPassword: "Actual123!",
      confirmPassword: "",
    });
    expect(errors).toHaveProperty("newPassword");
  });

  it("debe reportar contraseñas que no coinciden", () => {
    const errors = getProfileValidationErrors({
      ...baseData,
      currentPassword: "Actual123!",
      newPassword: "Abcd1234!",
      confirmPassword: "Diferente123!",
    });
    expect(errors).toHaveProperty("confirmPassword", "Las contraseñas no coinciden.");
  });

  it("debe validar la fortaleza de la nueva contraseña", () => {
    const errors = getProfileValidationErrors({
      ...baseData,
      currentPassword: "Actual123!",
      newPassword: "abcd1234", // débil, sin mayúscula ni carácter especial
      confirmPassword: "abcd1234",
    });
    expect(errors.newPassword).toMatch(/Debe incluir una letra mayúscula\./);
    expect(errors.newPassword).toMatch(/Debe incluir un carácter especial\./);
  });

  it("debe permitir cambio de contraseña válido", () => {
    const errors = getProfileValidationErrors({
      ...baseData,
      currentPassword: "Actual123!",
      newPassword: "Nueva1234!",
      confirmPassword: "Nueva1234!",
    });
    expect(errors).toEqual({});
  });
});

describe("isProfileValid", () => {
  it("debe retornar true cuando el formulario es válido", () => {
    const data = { full_name: "Juan Pérez" };
    expect(isProfileValid(data)).toBe(true);
  });

  it("debe retornar false cuando hay errores de validación", () => {
    const data = { full_name: "" };
    expect(isProfileValid(data)).toBe(false);
  });
});
