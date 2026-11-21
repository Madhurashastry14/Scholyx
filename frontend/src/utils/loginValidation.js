export const LOGIN_FIELDS = ["username", "password"];

export function validateLoginField(name, values) {
  const value = values?.[name];

  if (name === "username") {
    return typeof value === "string" && value.trim()
      ? ""
      : "Please enter your username.";
  }

  if (name === "password") {
    return typeof value === "string" && value.length > 0
      ? ""
      : "Please enter your password.";
  }

  return "";
}

export function validateLogin(values) {
  const errors = {};

  LOGIN_FIELDS.forEach((field) => {
    const message = validateLoginField(field, values);
    if (message) {
      errors[field] = message;
    }
  });

  return errors;
}
