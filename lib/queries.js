import { unstable_cache } from "next/cache";
import { createPublicClient } from "./supabase/public";

export const PAGE_SIZE = 24;

// Fields LocationCard renders, limited to what the locations_with_stats view
// actually exposes. The view was created as `select l.*` before the `exposed`
// and `size` columns were added to locations, so it doesn't surface them yet —
// selecting them here errors. Recreate the view (see migrations) to light up
// the Exposed / size badges in the card grids.
const CARD_SELECT =
  "id, name, type, resource, planet, color, x, y, z, server_name, avg_score, rating_count";

/**
 * Server list for the browse filter dropdown. Tagged "servers" so the admin
 * server create/rename/delete actions can bust it with revalidateTag.
 */
export const getServers = unstable_cache(
  async () => {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("servers")
      .select("id, name")
      .order("name");
    return data ?? [];
  },
  ["servers-list"],
  { tags: ["servers"], revalidate: 3600 }
);

/**
 * Home page "Top rated" + "Recently added" cards. Tagged "locations" so any
 * location or rating write busts it on demand; the 1h revalidate is only a
 * backstop in case a tag is ever missed.
 */
export const getHomeListings = unstable_cache(
  async () => {
    const supabase = createPublicClient();
    const [{ data: recent }, { data: top }] = await Promise.all([
      supabase
        .from("locations_with_stats")
        .select(CARD_SELECT)
        .eq("is_hidden", false)
        .order("created_at", { ascending: false })
        .limit(6),
      supabase
        .from("locations_with_stats")
        .select(CARD_SELECT)
        .eq("is_hidden", false)
        .gt("rating_count", 0)
        .order("avg_score", { ascending: false })
        .order("rating_count", { ascending: false })
        .limit(6),
    ]);
    return { recent: recent ?? [], top: top ?? [] };
  },
  ["home-listings"],
  { tags: ["locations"], revalidate: 3600 }
);

/**
 * Browse results for a set of already-normalized filter params. Each distinct
 * filter/sort/page combination is cached under its own key (params are part of
 * the cache key) and all share the "locations" tag, so one
 * revalidateTag("locations") clears every variant at once.
 */
export const getBrowseLocations = unstable_cache(
  async (params) => {
    const supabase = createPublicClient();

    let query = supabase
      .from("locations_with_stats")
      .select(CARD_SELECT, { count: "exact" })
      .eq("is_hidden", false);

    // Strip PostgREST-significant characters before building the OR filter.
    const safeQ = params.q.replace(/[,()%*\\]/g, " ").trim();
    if (safeQ) {
      query = query.or(`name.ilike.%${safeQ}%,description.ilike.%${safeQ}%`);
    }
    if (params.server) query = query.eq("server_id", params.server);
    if (params.type) query = query.eq("type", params.type);
    if (params.resource.trim()) {
      query = query.ilike("resource", `%${params.resource.trim()}%`);
    }
    if (params.planet) query = query.eq("planet", params.planet);
    const minR = parseInt(params.minRating, 10);
    if (minR >= 1 && minR <= 5) query = query.gte("avg_score", minR);

    if (params.sort === "rating") {
      query = query
        .order("avg_score", { ascending: false })
        .order("rating_count", { ascending: false });
    } else if (params.sort === "name") {
      query = query.order("name", { ascending: true });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    const from = (params.page - 1) * PAGE_SIZE;
    query = query.range(from, from + PAGE_SIZE - 1);

    const { data, count, error } = await query;
    return {
      locations: data ?? [],
      count: count ?? 0,
      error: error?.message ?? null,
    };
  },
  ["browse-locations"],
  { tags: ["locations"], revalidate: 3600 }
);
