import { isPasswordStrong, getPasswordValidationErrors } from "../../validation/password";

describe("isPasswordStrong", () => {
  it("debe retornar true para una contraseña fuerte", () => {
    expect(isPasswordStrong("Abcd1234!")) // 10 chars, mayúsc., minúsc., número y especial
      .toBe(true);
  });

  it.each([
    ["contraseña demasiado corta", "A1!a"],
    ["sin mayúscula", "abcd1234!"],
    ["sin minúscula", "ABCD1234!"],
    ["sin número", "Abcd!!!!"],
    ["sin carácter especial", "Abcd1234"],
  ])("debe retornar false cuando %s", (_descripcion, pwd) => {
    expect(isPasswordStrong(pwd)).toBe(false);
  });

  it("debe aceptar longitud mínima exacta de 8 caracteres cuando cumple las reglas", () => {
    expect(isPasswordStrong("A1!abcde")).toBe(true);
  });
});

describe("getPasswordValidationErrors", () => {
  it("debe retornar un arreglo vacío para una contraseña fuerte", () => {
    expect(getPasswordValidationErrors("Abcd1234!")).toHaveLength(0);
  });

  it("debe retornar todos los errores aplicables para una contraseña muy débil", () => {
    const pwd = "abcd"; // solo minúsculas y 4 caracteres
    const errors = getPasswordValidationErrors(pwd);
    const expectedErrors = [
      "Debe tener al menos 8 caracteres.",
      "Debe incluir una letra mayúscula.",
      "Debe incluir un número.",
      "Debe incluir un carácter especial.",
    ];

    expect(errors).toEqual(expect.arrayContaining(expectedErrors));
    expect(errors).toHaveLength(expectedErrors.length);
  });

  it("debe reportar correctamente la ausencia de mayúsculas", () => {
    const errors = getPasswordValidationErrors("abcd1234!");
    expect(errors).toContain("Debe incluir una letra mayúscula.");
  });

  it("debe reportar correctamente la ausencia de minúsculas", () => {
    const errors = getPasswordValidationErrors("ABCD1234!");
    expect(errors).toContain("Debe incluir una letra minúscula.");
  });

  it("debe reportar correctamente la ausencia de números", () => {
    const errors = getPasswordValidationErrors("Abcd!!!!");
    expect(errors).toContain("Debe incluir un número.");
  });

  it("debe reportar correctamente la ausencia de caracteres especiales", () => {
    const errors = getPasswordValidationErrors("Abcd1234");
    expect(errors).toContain("Debe incluir un carácter especial.");
  });
});
