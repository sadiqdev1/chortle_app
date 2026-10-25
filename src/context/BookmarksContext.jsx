import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { getBookmarks } from "../services/bookmarkService";
import { toggleBookmarkApi, toggleLikeApi } from "../services/postService";

const BookmarksContext = createContext(null);

export function BookmarksProvider({ children }) {
  // bookmarkMap: { [postId]: postObject | true }
  // Storing the full post object so the Saved tab can render without an API call.
  const [bookmarkMap, setBookmarkMap] = useState({});

  // reactionMap: { [postId]: { active: reactionId | null, counts: { [reactionId]: number } } }
  const [reactionMap, setReactionMap] = useState({});

  // Prevent double-tapping from firing concurrent API calls for the same post
  const bookmarkInFlight = useRef({});

  // ── Seed bookmarks from API on mount ────────────────────
  useEffect(() => {
    let cursor = undefined;
    let active = true;

    async function fetchAll() {
      try {
        // Fetch up to first 3 pages (45 bookmarks) on mount — enough for the Saved tab
        for (let i = 0; i < 3; i++) {
          const data = await getBookmarks(cursor ? { cursor } : {});
          if (!active) return;

          const memes = data?.data ?? [];
          if (!Array.isArray(memes) || memes.length === 0) break;

          setBookmarkMap((prev) => {
            const seeded = { ...prev };
            memes.forEach((meme) => {
              if (meme?.id && !seeded[meme.id]) {
                seeded[meme.id] = meme;
              }
            });
            return seeded;
          });

          cursor = data?.next_cursor;
          if (!cursor) break;
        }
      } catch {
        // Unauthenticated or network error — silent fail
      }
    }

    fetchAll();
    return () => { active = false; };
  }, []);

  // Prevent double-tapping from firing concurrent API calls for the same post
  const reactionInFlight = useRef({});

  // ── Bookmarks ────────────────────────────────────────────

  /**
   * Optimistically toggles a bookmark locally then persists to the API.
   * Rolls back on failure. Accepts a full post object or just an id.
   */
  const toggleBookmark = useCallback((post) => {
    const rawId = typeof post === "object" ? post.id : post;
    const id   = String(rawId);  // always string key
    const slug = typeof post === "object" ? (post.slug ?? rawId) : post;
    const obj  = typeof post === "object" ? post : null;

    if (bookmarkInFlight.current[id]) return;
    bookmarkInFlight.current[id] = true;

    let previous;
    setBookmarkMap((prev) => {
      previous = prev;
      if (prev[id]) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: obj ?? true };
    });

    toggleBookmarkApi(slug)
      .catch(() => { setBookmarkMap(previous); })
      .finally(() => { delete bookmarkInFlight.current[id]; });
  }, []);

  const isBookmarked = useCallback(
    // Coerce to string — API returns numeric ids, JS object keys are strings
    (id) => Boolean(bookmarkMap[String(id)]),
    [bookmarkMap]
  );

  const savedPosts = useMemo(
    () => Object.values(bookmarkMap).filter((v) => v && typeof v === "object"),
    [bookmarkMap]
  );

  const bookmarks = useMemo(
    () => Object.fromEntries(Object.keys(bookmarkMap).map((id) => [id, true])),
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
      return {
        active: local.active ?? null,
        counts: { ...baseCounts, ...local.counts },
      };
    },
    [reactionMap]
  );

  /**
   * Optimistically toggles a reaction locally then persists to the API.
   * Single-select: tapping the same reaction again un-reacts.
   * Rolls back on failure.
   */
  const toggleReaction = useCallback((post, reactionId) => {
    const id = post?.id;
    if (!id) return;

    // Debounce concurrent taps on the same post
    if (reactionInFlight.current[id]) return;
    reactionInFlight.current[id] = true;

    let previous;

    setReactionMap((prev) => {
      previous = prev;

      const current = prev[id] ?? { active: null, counts: {} };
      const baseCounts = post?.reactions ?? {};
      const merged = { ...baseCounts, ...current.counts };

      const wasActive = current.active === reactionId;
      const newActive = wasActive ? null : reactionId;

      const newCounts = { ...merged };
      if (wasActive) {
        newCounts[reactionId] = Math.max(0, (newCounts[reactionId] ?? 0) - 1);
      } else {
        if (current.active) {
          newCounts[current.active] = Math.max(
            0,
            (newCounts[current.active] ?? 0) - 1
          );
        }
        newCounts[reactionId] = (newCounts[reactionId] ?? 0) + 1;
      }

      return {
        ...prev,
        [id]: { active: newActive, counts: newCounts },
      };
    });

    // Persist to API — backend uses the meme's numeric id for /memes/{meme}/like
    toggleLikeApi(id, reactionId)
      .catch(() => {
        // Rollback on failure
        setReactionMap(previous);
      })
      .finally(() => {
        delete reactionInFlight.current[id];
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
