export const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:5000"

export interface FetchOptions extends RequestInit {
    body?: any
}

export async function apiFetch(endpoint: string, options: FetchOptions = {}) {
    const url = `${API_BASE_URL}${endpoint}`
    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    }

    const fetchOptions: RequestInit = {
        ...options,
        headers,
    }

    if (options.body && typeof options.body === "object") {
        fetchOptions.body = JSON.stringify(options.body)
    }

    try {
        const response = await fetch(url, fetchOptions)
        return response
    } catch (error) {
        console.error(`API request failed for ${endpoint}:`, error)
        throw new Error("Failed to connect to the backend server. Please check your network.")
    }
}
