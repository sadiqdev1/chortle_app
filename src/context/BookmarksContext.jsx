import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from "react";

const BookmarksContext = createContext(null);

export function BookmarksProvider({ children }) {
  // bookmarkMap: { [postId]: postObject | true }
  // We store the full post object so the Saved tab can render without an API call.
  const [bookmarkMap, setBookmarkMap] = useState({});

  // reactionMap: { [postId]: { active: reactionId | null, counts: { [reactionId]: number } } }
  const [reactionMap, setReactionMap] = useState({});

  // ── Bookmarks ────────────────────────────────────────────

  const toggleBookmark = useCallback((post) => {
    const id = typeof post === "object" ? post.id : post;
    const obj = typeof post === "object" ? post : null;
    setBookmarkMap((prev) => {
      if (prev[id]) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: obj ?? true };
    });
  }, []);

  const isBookmarked = useCallback(
    (id) => Boolean(bookmarkMap[id]),
    [bookmarkMap]
  );

  const savedPosts = useMemo(
    () => Object.values(bookmarkMap).filter((v) => v && typeof v === "object"),
    [bookmarkMap]
  );

  const bookmarks = useMemo(
    () =>
      Object.fromEntries(Object.keys(bookmarkMap).map((id) => [id, true])),
    [bookmarkMap]
  );

  // ── Reactions ────────────────────────────────────────────

  /**
   * Returns { active: string|null, counts: { [id]: number } } for a post.
   * Falls back to the post's own reaction counts when no local override exists.
   */
  const getReactionState = useCallback(
    (post) => {
      const id = post?.id;
      const local = reactionMap[id];
      const baseCounts = post?.reactions ?? {};
      if (!local) {
        return { active: null, counts: { ...baseCounts } };
      }
      return { active: local.active ?? null, counts: { ...baseCounts, ...local.counts } };
    },
    [reactionMap]
  );

  /**
   * Toggles a reaction for a post (single-select: picking the same one un-reacts).
   */
  const toggleReaction = useCallback((post, reactionId) => {
    const id = post?.id;
    if (!id) return;

    setReactionMap((prev) => {
      const current = prev[id] ?? { active: null, counts: {} };
      const baseCounts = post?.reactions ?? {};
      const merged = { ...baseCounts, ...current.counts };

      const wasActive = current.active === reactionId;
      const newActive = wasActive ? null : reactionId;

      // Adjust counts
      const newCounts = { ...merged };
      if (wasActive) {
        newCounts[reactionId] = Math.max(0, (newCounts[reactionId] ?? 0) - 1);
      } else {
        // Remove vote from previous reaction if any
        if (current.active) {
          newCounts[current.active] = Math.max(0, (newCounts[current.active] ?? 0) - 1);
        }
        newCounts[reactionId] = (newCounts[reactionId] ?? 0) + 1;
      }

      return {
        ...prev,
        [id]: { active: newActive, counts: newCounts },
      };
    });
  }, []);

  const value = useMemo(
    () => ({
      bookmarks,
      bookmarkMap,
      toggleBookmark,
      isBookmarked,
      savedPosts,
      getReactionState,
      toggleReaction,
    }),
    [
      bookmarks,
      bookmarkMap,
      toggleBookmark,
      isBookmarked,
      savedPosts,
      getReactionState,
      toggleReaction,
    ]
  );

  return (
    <BookmarksContext.Provider value={value}>
      {children}
    </BookmarksContext.Provider>
  );
}

export function useBookmarks() {
  const ctx = useContext(BookmarksContext);
  if (!ctx)
    throw new Error("useBookmarks must be used within a BookmarksProvider");
  return ctx;
}
