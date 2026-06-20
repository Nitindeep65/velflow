export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

interface FetchOptions extends RequestInit {
  requireAuth?: boolean;
}

export async function fetchApi(endpoint: string, options: FetchOptions = {}) {
  const { requireAuth = true, headers = {}, ...customConfig } = options;

  const config: RequestInit = {
    ...customConfig,
    headers: {
      ...headers,
    },
  };

  // Automatically attach auth token if required
  if (requireAuth && typeof window !== "undefined") {
    const token = localStorage.getItem("velflow_access_token");
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
  }

  // Set default Content-Type to JSON if not uploading FormData
  if (!(options.body instanceof FormData)) {
    config.headers = {
      "Content-Type": "application/json",
      ...config.headers,
    };
  }

  const response = await fetch(`${API_URL}${endpoint}`, config);

  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("velflow_access_token");
      localStorage.removeItem("velflow_user");
      try {
        const { useAuthStore } = require("./store/useAuthStore");
        useAuthStore.getState().logout();
      } catch (e) {
        console.error("Error logging out in fetchApi:", e);
      }
    }
    let errorMessage = "An error occurred";
    try {
      const data = await response.json();
      errorMessage = data.detail || errorMessage;
    } catch (e) {
      errorMessage = response.statusText;
    }
    throw new ApiError(errorMessage, response.status);
  }

  return response.json();
}

export async function fetchFileBlob(endpoint: string, options: FetchOptions = {}): Promise<Blob> {
  const { requireAuth = true, headers = {}, ...customConfig } = options;

  const config: RequestInit = {
    ...customConfig,
    headers: { ...headers },
  };

  if (requireAuth && typeof window !== "undefined") {
    const token = localStorage.getItem("velflow_access_token");
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
  }

  const response = await fetch(`${API_URL}${endpoint}`, config);

  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("velflow_access_token");
      localStorage.removeItem("velflow_user");
      try {
        const { useAuthStore } = require("./store/useAuthStore");
        useAuthStore.getState().logout();
      } catch (e) {
        console.error("Error logging out in fetchFileBlob:", e);
      }
    }
    throw new ApiError("Failed to fetch file", response.status);
  }

  return response.blob();
}
