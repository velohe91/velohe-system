/**
 * Mixed chronological feeds:
 * Live = BC + TX-VΣ## (newest first)
 * Archives = LOG-VΣ## · TX-001–008 · LOG-001–009 (newest first)
 */

import { systemBroadcasts } from "@/data/broadcasts";
import { transmissionArticles } from "@/data/transmissions";
import { systemLogs } from "@/data/system-logs";
import { filterByEra, sortFeedNewestFirst } from "@/lib/feed";
import type { FeedItem } from "@/lib/types";

const allItems: FeedItem[] = [
  ...systemBroadcasts,
  ...transmissionArticles,
  ...systemLogs,
];

/** Live channel — newest first (broadcasts and TX-VΣ). */
export const liveFeedItems: FeedItem[] = sortFeedNewestFirst(
  filterByEra(allItems, "live"),
);

/** Sealed archives — newest first (LOG-VΣ## · TX-001–008 · LOG-001–009). */
export const archiveFeedItems: FeedItem[] = sortFeedNewestFirst(
  filterByEra(allItems, "archive"),
);

/** Full corpus (both eras), newest first — tooling / future use. */
export const feedItems: FeedItem[] = sortFeedNewestFirst(allItems);
