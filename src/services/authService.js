import api from "../lib/api";

export async function login(credentials) {
  const response = await api.post("/login", credentials);
  return response.data;
}

export async function register(data) {
  const response = await api.post("/register", data);
  return response.data;
}

export async function logout() {
  const response = await api.post("/logout");
  return response.data;
}

export async function getUser() {
  const response = await api.get("/user");
  return response.data;
}

export async function forgotPassword(email) {
  const response = await api.post("/forgot-password", { email });
  return response.data;
}

export async function resetPassword(data) {
  const response = await api.post("/reset-password", data);
  return response.data;
}

export async function resendPasswordReset(email) {
  const response = await api.post("/forgot-password", { email });
  return response.data;
}

export async function verifyEmail(data) {
  // data: { email, code }
  const response = await api.post("auth/verify-email", data);
  return response.data;
}

export async function resendVerification(email) {
  const response = await api.post("auth/resend-verification", { email });
  return response.data;
}
