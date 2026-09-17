import api from "../lib/api";

export async function getBookmarks(params = {}) {
  const response = await api.get("/bookmarks", {
    params,
  });

  return response.data;
}

export async function bookmarkPost(postId) {
  const response = await api.post(`/posts/${postId}/bookmark`);

  return response.data;
}

export async function removeBookmark(postId) {
  const response = await api.delete(`/posts/${postId}/bookmark`);

  return response.data;
}
