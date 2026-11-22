
import { clearTokens, readTokens, writeTokens } from "./authStorage.js";

const configuredBaseUrl = import.meta.env?.VITE_API_BASE_URL;

export const API_BASE_URL = (
  configuredBaseUrl || "http://127.0.0.1:8000/api"
).replace(/\/+$/, "");

export class ApiError extends Error {
  constructor(message, { status = 0, data = null } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export async function apiRequest(
  path,
  { method = "GET", body, signal, headers: extraHeaders } = {},
) {
  const url = `${API_BASE_URL}/${String(path).replace(/^\/+/, "")}`;
  const headers = { Accept: "application/json", ...extraHeaders };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  let response;

  try {
    const timeoutSignal = AbortSignal.timeout?.(15000);
    const requestSignal =
      signal && timeoutSignal
        ? AbortSignal.any([signal, timeoutSignal])
        : signal || timeoutSignal;

    response = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: requestSignal,
    });
  } catch (error) {
    if (error?.name === "AbortError") {
      throw error;
    }
    throw new ApiError("Unable to reach the server.", { status: 0 });
  }

  const data =
    response.status === 204 ? null : await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(`Request failed with status ${response.status}.`, {
      status: response.status,
      data,
    });
  }

  return data;
}

export function registerStudent(
  { fullName, username, email, password },
  { signal } = {},
) {
  return apiRequest("auth/register/", {
    method: "POST",
    signal,
    body: {
      full_name: typeof fullName === "string" ? fullName.trim() : "",
      username: typeof username === "string" ? username.trim() : "",
      email: typeof email === "string" ? email.trim() : "",
      password,
    },
  });
}

let refreshPromise = null;

function refreshAccessToken() {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const tokens = readTokens();

    if (!tokens?.refresh) {
      clearTokens();
      throw new ApiError("Your session has expired. Please log in again.", {
        status: 401,
      });
    }

    let data;

    try {
      data = await apiRequest("auth/refresh/", {
        method: "POST",
        body: { refresh: tokens.refresh },
      });
    } catch (error) {
      if (error instanceof ApiError && [401, 403].includes(error.status)) {
        clearTokens();
        throw new ApiError("Your session has expired. Please log in again.", {
          status: error.status,
        });
      }
      throw error;
    }

    if (typeof data?.access !== "string" || !data.access) {
      clearTokens();
      throw new ApiError("Your session has expired. Please log in again.", {
        status: 401,
      });
    }

    writeTokens({
      access: data.access,
      refresh:
        typeof data.refresh === "string" && data.refresh
          ? data.refresh
          : tokens.refresh,
    });

    return data.access;
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

export async function authRequest(path, { signal, ...options } = {}) {
  const tokens = readTokens();

  if (!tokens?.access) {
    throw new ApiError("Please log in to continue.", { status: 401 });
  }

  try {
    return await apiRequest(path, {
      ...options,
      signal,
      headers: { Authorization: `Bearer ${tokens.access}` },
    });
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) {
      throw error;
    }

    const access = await refreshAccessToken();

    return apiRequest(path, {
      ...options,
      signal,
      headers: { Authorization: `Bearer ${access}` },
    });
  }
}

export async function loginStudent(
  { username, password } = {},
  { signal } = {},
) {
  const data = await apiRequest("auth/login/", {
    method: "POST",
    signal,
    body: {
      username: typeof username === "string" ? username.trim() : "",
      password,
    },
  });

  if (
    typeof data?.access !== "string" ||
    !data.access ||
    typeof data?.refresh !== "string" ||
    !data.refresh
  ) {
    throw new ApiError("Login failed. Please try again.", { status: 500 });
  }

  writeTokens({ access: data.access, refresh: data.refresh });

  return { access: data.access, refresh: data.refresh };
}

export function fetchProfile({ signal } = {}) {
  return authRequest("profile/me/", { signal });
}

export async function logoutStudent({ signal } = {}) {
  const tokens = readTokens();

  if (!tokens?.refresh) {
    return;
  }

  await authRequest("auth/logout/", {
    method: "POST",
    signal,
    body: { refresh: tokens.refresh },
  });
}

function toMessage(value) {
  if (Array.isArray(value)) {
    return value.map(toMessage).filter(Boolean).join(" ");
  }
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === "object") {
    if (typeof value.message === "string") {
      return value.message;
    }
    if (typeof value.detail === "string") {
      return value.detail;
    }
    return Object.values(value).map(toMessage).filter(Boolean).join(" ");
  }
  return String(value);
}

function readField(data, key) {
  if (!data || typeof data !== "object" || !(key in data)) {
    return "";
  }
  return toMessage(data[key]);
}

export function parseApiErrors(error) {
  const data = error?.data;
  const fieldErrors = {};
  const fieldMap = {
    full_name: "fullName",
    username: "username",
    email: "email",
    password: "password",
  };

  Object.entries(fieldMap).forEach(([apiKey, field]) => {
    const message = readField(data, apiKey);
    if (message) {
      fieldErrors[field] = message;
    }
  });

  let message =
    readField(data, "non_field_errors") || readField(data, "detail");

  if (!message) {
    if (error?.status === 0) {
      message =
        "We couldn't reach the server. Please check your connection and try again.";
    } else if (error?.status >= 500) {
      message = "Something went wrong on our side. Please try again in a moment.";
    } else if (Object.keys(fieldErrors).length > 0) {
      message = "Please fix the highlighted fields and try again.";
    } else {
      message = "Registration failed. Please try again.";
    }
  }

  return { fieldErrors, message };
}

export function parseLoginError(error) {
  if (!error) {
    return "Login failed. Please try again.";
  }

  if (error.status === 0) {
    return "Unable to reach the server. Check your connection and try again.";
  }

  if (error.status === 401) {
    return "Incorrect username or password.";
  }

  if (error.status === 403) {
    return "You do not have permission to log in.";
  }

  if (error.status >= 500) {
    return "The server ran into a problem. Please try again.";
  }

  const message = readField(error.data, "detail");

  return message || "Login failed. Please try again.";
}

// PUBLIC SCHOLARSHIP LISTING API
export function fetchScholarships(filters = {}) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      params.append(key, value);
    }
  });

  const queryString = params.toString();
  const endpoint = queryString
    ? `scholarships/?${queryString}`
    : "scholarships/";

  return apiRequest(endpoint);
}

// PUBLIC SCHOLARSHIP DETAIL API
export function fetchScholarshipDetails(id, { signal } = {}) {
  return apiRequest(`scholarships/${encodeURIComponent(id)}/`, { signal });
}

// PUBLIC SCHOLARSHIP FILTER OPTIONS API
export function fetchScholarshipFilterOptions({ signal } = {}) {
  return apiRequest("scholarships/filter-options/", { signal });
}
