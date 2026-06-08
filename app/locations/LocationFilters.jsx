import Link from "next/link";
import { LOCATION_TYPES, ENVIRONMENTS, ORE_RESOURCES, SORTS } from "../../lib/constants";

/**
 * Filter/search controls for the browse page. A plain GET form so results live
 * in the URL — shareable, bookmarkable, and crawlable (SSR).
 */
export default function LocationFilters({ servers, params }) {
  return (
    <form method="get" className="card grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <div className="sm:col-span-2 lg:col-span-3">
        <label className="label" htmlFor="q">
          Search
        </label>
        <input
          className="input"
          id="q"
          name="q"
          defaultValue={params.q}
          placeholder="Name or description…"
        />
      </div>

      <div>
        <label className="label" htmlFor="server">
          Server
        </label>
        <select
          className="select"
          id="server"
          name="server"
          defaultValue={params.server}
        >
          <option value="">All servers</option>
          {servers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label" htmlFor="type">
          Type
        </label>
        <select className="select" id="type" name="type" defaultValue={params.type}>
          <option value="">All types</option>
          {LOCATION_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label" htmlFor="resource">
          Resource
        </label>
        <input
          className="input"
          id="resource"
          name="resource"
          list="filter-resources"
          defaultValue={params.resource}
          placeholder="Any"
        />
        <datalist id="filter-resources">
          {ORE_RESOURCES.map((r) => (
            <option key={r} value={r} />
          ))}
        </datalist>
      </div>

      <div>
        <label className="label" htmlFor="planet">
          Environment
        </label>
        <select
          className="select"
          id="planet"
          name="planet"
          defaultValue={params.planet}
        >
          <option value="">All</option>
          {ENVIRONMENTS.map((env) => (
            <option key={env} value={env}>
              {env}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label" htmlFor="minRating">
          Min rating
        </label>
        <select
          className="select"
          id="minRating"
          name="minRating"
          defaultValue={params.minRating}
        >
          <option value="">Any</option>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n}★ &amp; up
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label" htmlFor="sort">
          Sort
        </label>
        <select className="select" id="sort" name="sort" defaultValue={params.sort}>
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-end gap-2">
        <button type="submit" className="btn-primary">
          Apply
        </button>
        <Link className="btn-ghost" href="/locations">
          Clear
        </Link>
      </div>
    </form>
  );
}
