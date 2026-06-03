export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"

let isRefreshing = false
let refreshSubscribers: ((error: any) => void)[] = []

function onRefreshed(error: any) {
	refreshSubscribers.forEach((cb) => cb(error))
	refreshSubscribers = []
}

function addRefreshSubscriber(cb: (error: any) => void) {
	refreshSubscribers.push(cb)
}

// Base fetch wrapper to include credentials for cookies
async function fetchApi(endpoint: string, options: RequestInit = {}): Promise<any> {
	const url = `${API_URL}${endpoint}`
	const response = await fetch(url, {
		...options,
		headers: {
			"Content-Type": "application/json",
			...options.headers
		},
		credentials: "include" // Important for passing httpOnly cookies
	})

	if (!response.ok) {
		// Auto-refresh token logic for 401 Unauthorized
		if (response.status === 401 && endpoint !== "/auth/refresh" && endpoint !== "/auth/signin") {
			if (!isRefreshing) {
				isRefreshing = true
				try {
					const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
						method: "POST",
						credentials: "include"
					})

					if (!refreshRes.ok) {
						throw new Error("Session expired")
					}

					isRefreshing = false
					onRefreshed(null)

					// Retry the original request
					return fetchApi(endpoint, options)
				} catch (err) {
					isRefreshing = false
					onRefreshed(err)
					throw err
				}
			} else {
				// Wait for the ongoing refresh to finish, then retry
				return new Promise((resolve, reject) => {
					addRefreshSubscriber((error) => {
						if (error) {
							reject(error)
						} else {
							resolve(fetchApi(endpoint, options))
						}
					})
				})
			}
		}

		let errorMessage = "An error occurred"
		try {
			const errorData = await response.json()
			errorMessage = errorData.message || errorMessage
		} catch {
			try {
				errorMessage = await response.text()
			} catch {
				// ignore
			}
		}
		throw new Error(errorMessage)
	}

	// Handle empty responses
	const text = await response.text()
	if (!text) return null

	try {
		return JSON.parse(text)
	} catch {
		return text // Return as string if it's not JSON
	}
}

// ----------------------
// Auth Endpoints
// ----------------------
export const authApi = {
	signup: (data: any) => fetchApi("/auth/signup", { method: "POST", body: JSON.stringify(data) }),
	update: (data: any) => fetchApi("/auth/update", { method: "PATCH", body: JSON.stringify(data) }),
	signin: (data: any) => fetchApi("/auth/signin", { method: "POST", body: JSON.stringify(data) }),
	signout: () => fetchApi("/auth/signout", { method: "POST" }),
	getMe: () => fetchApi("/auth/me", { method: "GET" }),
	refresh: () => fetchApi("/auth/refresh", { method: "POST" })
}

// ----------------------
// Post Endpoints
// ----------------------
export const postApi = {
	getFeed: () => fetchApi("/posts", { method: "GET" }),
	create: (data: any) => fetchApi("/posts", { method: "POST", body: JSON.stringify(data) }),
	createReply: (id: string, data: any) =>
		fetchApi("/posts", {
			method: "POST",
			body: JSON.stringify({ ...data, parentPostId: id })
		}),
	getById: (id: string) => fetchApi(`/posts/${id}`, { method: "GET" }),
	getReplies: (id: string) => fetchApi(`/posts/${id}/replies`, { method: "GET" }),
	like: (id: string) => fetchApi(`/posts/${id}/like`, { method: "POST" }),
	unlike: (id: string) => fetchApi(`/posts/${id}/like`, { method: "DELETE" }),
	delete: (id: string) => fetchApi(`/posts/${id}`, { method: "DELETE" }),
	search: (query: string) => fetchApi(`/posts/search?q=${encodeURIComponent(query)}`, { method: "GET" })
}

// ----------------------
// User Endpoints
// ----------------------
export const userApi = {
	getProfile: (username: string) => fetchApi(`/users/${username}`, { method: "GET" }),
	follow: (id: string) => fetchApi(`/users/${id}/follow`, { method: "POST" }),
	unfollow: (id: string) => fetchApi(`/users/${id}/follow`, { method: "DELETE" }),
	search: (query: string) => fetchApi(`/users/search?q=${encodeURIComponent(query)}`, { method: "GET" })
}
