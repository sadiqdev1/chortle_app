import api from "../lib/api";

export async function getProfile() {
  const response = await api.get("/profile");

  return response.data;
}

export async function updateProfile(data) {
  const response = await api.put("/profile", data);

  return response.data;
}

export async function getUserById(id) {
  const response = await api.get(`/users/${id}`);

  return response.data;
}
