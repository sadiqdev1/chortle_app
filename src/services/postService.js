import api from "../lib/api";

export async function getPosts(params = {}) {
  const response = await api.get("/posts", {
    params,
  });

  return response.data;
}

export async function getPost(slug) {
  const response = await api.get(`/posts/${slug}`);

  return response.data;
}

export async function createPost(data) {
  const response = await api.post("/posts", data);

  return response.data;
}

export async function updatePost(slug, data) {
  const response = await api.put(`/posts/${slug}`, data);

  return response.data;
}

export async function deletePost(slug) {
  const response = await api.delete(`/posts/${slug}`);

  return response.data;
}
