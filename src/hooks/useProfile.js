import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  checkUsername,
  getProfile,
  getSuggestedCreators,
  getUserByUsername,
  getUserMemes,
  searchUsers,
  toggleFollow,
  updateProfile,
} from "../services/userService";
import { useAuth } from "./useAuth";

export function useProfile() {
  return useQuery({ queryKey: ["profile"], queryFn: getProfile });
}

/**
 * Update profile AND sync fresh user into AuthContext (fixes stale header).
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { restoreSession } = useAuth();
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: async (data) => {
      queryClient.setQueryData(["profile"], data);
      await restoreSession();
    },
  });
}

export function useUserProfile(username) {
  return useQuery({
    queryKey: ["user", username],
    queryFn: () => getUserByUsername(username),
    enabled: Boolean(username),
  });
}

export function useUserMemes(username) {
  return useInfiniteQuery({
    queryKey: ["user-memes", username],
    queryFn: ({ pageParam }) =>
      getUserMemes(username, pageParam ? { cursor: pageParam } : {}),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage?.next_cursor ?? undefined,
    enabled: Boolean(username),
  });
}

export function useToggleFollow(username) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => toggleFollow(username),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", username] });
    },
  });
}

export function useSearchUsers(query) {
  return useQuery({
    queryKey: ["search-users", query],
    queryFn: () => searchUsers(query),
    enabled: Boolean(query) && query.length >= 2,
    staleTime: 30_000,
  });
}

export function useSuggestedCreators() {
  return useQuery({
    queryKey: ["suggested-creators"],
    queryFn: getSuggestedCreators,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Debounced username availability check.
 * enabled when username is at least 3 chars.
 */
export function useCheckUsername(username) {
  return useQuery({
    queryKey: ["check-username", username],
    queryFn: () => checkUsername(username),
    enabled: Boolean(username) && username.length >= 3,
    staleTime: 15_000,
    retry: false,
  });
}
