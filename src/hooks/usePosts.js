import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
} from "../services/postService";

export function usePosts(params = {}) {
  return useQuery({
    queryKey: ["posts", params],
    queryFn: () => getPosts(params),
  });
}

export function usePost(slug) {
  return useQuery({
    queryKey: ["posts", slug],
    queryFn: () => getPost(slug),
    enabled: Boolean(slug),
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPost,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["posts"],
      });
    },
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slug, data }) =>
      updatePost(slug, data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["posts"],
      });

      queryClient.invalidateQueries({
        queryKey: ["posts", variables.slug],
      });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePost,

    onSuccess: (_, slug) => {
      queryClient.invalidateQueries({
        queryKey: ["posts"],
      });

      queryClient.removeQueries({
        queryKey: ["posts", slug],
      });
    },
  });
}
