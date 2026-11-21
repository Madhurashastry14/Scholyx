export const PASSWORD_MIN_LENGTH = 8;

export const FIELD_ORDER = [
  "fullName",
  "username",
  "email",
  "password",
  "confirmPassword",
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_PATTERN = /^[\p{L}\p{N}_.@+-]+$/u;

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function isTooSimilar(password, username, email) {
  if (password.length < 4) {
    return false;
  }

  const lowered = password.toLowerCase();
  const localPart = text(email).toLowerCase().split("@")[0];
  const candidates = [
    text(username).toLowerCase(),
    text(email).toLowerCase(),
    localPart,
  ].filter((candidate) => candidate.length >= 4);

  return candidates.some(
    (candidate) =>
      lowered.includes(candidate) || candidate.includes(lowered),
  );
}

export function validateField(name, values) {
  const fullName = text(values.fullName);
  const username = text(values.username);
  const email = text(values.email);
  const password = values.password ?? "";
  const confirmPassword = values.confirmPassword ?? "";

  switch (name) {
    case "fullName":
      if (!fullName) return "Please enter your full name.";
      if (fullName.length < 2) {
        return "Full name must be at least 2 characters.";
      }
      if (fullName.length > 150) {
        return "Full name must be 150 characters or fewer.";
      }
      return "";

    case "username":
      if (!username) return "Please choose a username.";
      if (username.length > 150) {
        return "Username must be 150 characters or fewer.";
      }
      if (username.length < 3) {
        return "Username must be at least 3 characters.";
      }
      if (!USERNAME_PATTERN.test(username)) {
        return "Use only letters, numbers, and @ . + - _";
      }
      return "";

    case "email":
      if (!email) return "Please enter your email address.";
      if (!EMAIL_PATTERN.test(email)) return "Enter a valid email address.";
      return "";

    case "password":
      if (!password) return "Please create a password.";
      if (password.length < PASSWORD_MIN_LENGTH) {
        return `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
      }
      if (/^\d+$/.test(password)) {
        return "Password can't be entirely numeric.";
      }
      if (isTooSimilar(password, username, email)) {
        return "Password is too similar to your username or email.";
      }
      return "";

    case "confirmPassword":
      if (!confirmPassword) return "Please confirm your password.";
      if (confirmPassword !== password) return "Passwords do not match.";
      return "";

    default:
      return "";
  }
}

export function validateRegistration(values) {
  return FIELD_ORDER.reduce((errors, name) => {
    const message = validateField(name, values);
    if (message) {
      errors[name] = message;
    }
    return errors;
  }, {});
}

export function getPasswordChecks(values) {
  const password = values.password ?? "";
  const hasPassword = password.length > 0;

  return [
    {
      id: "length",
      label: `At least ${PASSWORD_MIN_LENGTH} characters`,
      status: password.length >= PASSWORD_MIN_LENGTH ? "met" : "unmet",
    },
    {
      id: "numeric",
      label: "Not entirely numeric",
      status: hasPassword && !/^\d+$/.test(password) ? "met" : "unmet",
    },
    {
      id: "similarity",
      label: "Different from your username and email",
      status:
        hasPassword &&
        !isTooSimilar(password, values.username, values.email)
          ? "met"
          : "unmet",
    },
    {
      id: "common",
      label: "Not a commonly used password",
      status: "pending",
    },
  ];
}
