import Link from "next/link";
import LocationCard from "../components/LocationCard";
import Shot from "../components/marketing/Shot";
import GameGpsPanel from "../components/marketing/GameGpsPanel";
import NearbyShot from "../components/marketing/NearbyShot";
import CopyBackShot from "../components/marketing/CopyBackShot";
import SubmitShot from "../components/marketing/SubmitShot";
import { SAMPLE_ORIGIN } from "../components/marketing/samples";
import { getHomeListings } from "../lib/queries";

export const metadata = {
  title: "Space Engineers Ore & POI Registry — find the ore before you fly",
  description:
    "Paste your in-game GPS and get the closest charted ore deposits and points of interest on your world, ranked by distance, with the exact GPS string to paste back into Space Engineers.",
};

export default async function Home() {
  const { recent, top } = await getHomeListings();

  return (
    <main>
      <Hero />
      <Walkthrough />
      <Contribute />
      <Capabilities />
      <LiveRegistry top={top} recent={recent} />
      <ClosingCta />
    </main>
  );
}

/* ------------------------------------------------------------------ hero */

function Hero() {
  return (
    <section className="mx-auto max-w-3xl px-6 pt-16 pb-12 text-center sm:pt-24">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
        Space Engineers
      </p>
      <h1 className="mt-3 text-3xl font-bold leading-tight text-balance sm:text-5xl">
        The ore you need is already on someone else&apos;s GPS list.
      </h1>
      <p className="mx-auto mt-5 max-w-2xl text-base text-muted sm:text-lg">
        Tired of flying asteroid to asteroid hunting the one resource your
        build is short of? Paste the GPS from where you&apos;re standing, pick
        your world, and get the closest charted deposits — ranked by distance,
        each with the exact GPS string to paste straight back into the game.
      </p>

      <div className="mx-auto mt-8 max-w-xl">
        <p className="overflow-x-auto rounded-lg border border-border bg-[#0d1626] px-3 py-2 text-left font-mono text-xs whitespace-nowrap text-muted">
          {SAMPLE_ORIGIN.gps_raw}
        </p>
        <p className="mt-2 text-xs text-muted">The only input the site needs.</p>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/nearby" className="btn-primary">
          Find what&apos;s near you →
        </Link>
        <Link href="#steps" className="btn-ghost">
          See the three steps
        </Link>
      </div>

      <p className="mt-4 text-xs text-muted">
        Searching needs no account. Charting a spot needs a free one.
      </p>
    </section>
  );
}

/* ----------------------------------------------------------- walkthrough */

const STEPS = [
  {
    n: "01",
    eyebrow: "Step 1 — in game",
    title: "Copy where you are, out of the game",
    body: (
      <>
        Open any terminal&apos;s <Kbd>GPS</Kbd> tab, hit{" "}
        <Kbd>New from current pos.</Kbd>, then <Kbd>Copy to clipboard</Kbd>.
        That single line — name, X, Y, Z and marker colour — is everything the
        registry needs. It works from a cockpit, a station&apos;s control panel,
        or your own character&apos;s GPS list.
      </>
    ),
    visual: (
      <Shot
        label="Space Engineers — Terminal · GPS"
        chip="Replica, drawn in HTML"
        caption="The game's own GPS tab, redrawn in HTML — not a capture. ① New from current pos. makes a marker where your ship is. ② Copy to clipboard hands it over as text."
      >
        <GameGpsPanel highlight={["new-from-pos", "copy"]} />
      </Shot>
    ),
  },
  {
    n: "02",
    eyebrow: "Step 2 — on the site",
    title: "Paste it into Find nearest",
    body: (
      <>
        Choose the world you&apos;re playing on, and narrow it down to one ore
        or a radius if you like. Everything charted on that world is ranked by
        straight-line 3-D distance from where you&apos;re standing, closest
        first. Coordinates are only ever compared inside the server you picked —
        they mean nothing across saves.
      </>
    ),
    aside:
      "The search is a plain GET, so the whole result set lives in the URL. Paste it into your faction's Discord and it opens the same way for whoever clicks it.",
    visual: <NearbyShot />,
  },
  {
    n: "03",
    eyebrow: "Step 3 — back in game",
    title: "Copy the spot back into the game",
    body: (
      <>
        Open a result and press <Kbd>Copy GPS</Kbd>. You get the original string
        back exactly as the player who charted it pasted it — never
        re-serialised, never rounded — so the marker you get is the marker they
        got. Back in the same GPS tab, <Kbd>New from clipboard</Kbd> puts it in
        your list and on your HUD with the distance counting down.
      </>
    ),
    visual: <CopyBackShot />,
  },
];

function Walkthrough() {
  return (
    <section
      id="steps"
      className="scroll-mt-8 border-t border-border bg-surface/30 py-16"
    >
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="text-2xl font-bold sm:text-3xl">
          Out of the game, and back in again
        </h2>
        <p className="mt-2 max-w-2xl text-muted">
          The whole loop runs on the GPS string the game already gives you.
          Three steps, no tooling, no overlay, nothing to install.
        </p>

        <div className="mt-12 space-y-14">
          {STEPS.map((step) => (
            <div key={step.n}>
              <div className="flex gap-4">
                <span
                  aria-hidden
                  className="mt-1 font-mono text-sm text-accent"
                >
                  {step.n}
                </span>
                <div className="max-w-2xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                    {step.eyebrow}
                  </p>
                  <h3 className="mt-1 text-xl font-semibold">{step.title}</h3>
                  <p className="mt-2 text-muted">{step.body}</p>
                  {step.aside && (
                    <p className="mt-4 border-l-2 border-accent/40 pl-3 text-sm text-muted">
                      {step.aside}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-6">{step.visual}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Kbd({ children }) {
  return (
    <span className="rounded border border-border bg-bg px-1.5 py-0.5 font-mono text-[0.85em] text-text">
      {children}
    </span>
  );
}

/* ------------------------------------------------------------ contribute */

function Contribute() {
  return (
    <section className="border-t border-border py-16">
      <div className="mx-auto grid max-w-5xl items-center gap-6 px-6 lg:grid-cols-2 lg:gap-12">
        <div>
          <h2 className="text-2xl font-bold sm:text-3xl">
            Found something? Charting it is one paste.
          </h2>
          <p className="mt-3 text-muted">
            Paste the GPS and the form does the rest: it reads the marker name
            for the ore — <Kbd>Ag 2</Kbd> becomes Silver — and the capital
            letters you already use for surface deposits set the{" "}
            <span className="badge badge-exposed">Exposed</span>{" "}flag. Before it
            publishes, anything within 5 km on the same world is put in front of
            you, so one deposit doesn&apos;t get charted five times.
          </p>
          <p className="mt-3 text-muted">
            It goes live immediately — there is no review queue to wait on.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/submit" className="btn-primary">
              Submit a location
            </Link>
            <Link href="/submit/bulk" className="btn-ghost">
              Import a whole GPS list
            </Link>
          </div>
        </div>
        <SubmitShot />
      </div>
    </section>
  );
}

/* ---------------------------------------------------------- capabilities */

const CAPABILITIES = [
  {
    title: "Reads the game's own format",
    body: "Paste GPS:NAME:X:Y:Z:#AARRGGBB: exactly as Space Engineers exports it. Name and coordinates are parsed out; the original line is kept untouched so it pastes back perfectly.",
  },
  {
    title: "One world at a time",
    body: "Coordinates only mean something inside a save. Every location belongs to a server, and nearest-search never compares positions across worlds.",
  },
  {
    title: "Nearest by real distance",
    body: "Straight-line 3-D distance from your position, in metres under a kilometre and kilometres above it, with an optional radius cap.",
  },
  {
    title: "Knows your marker shorthand",
    body: "Ag 2, fe-3, ICE_9 — element symbols and plain names both resolve to the right ore. Capitalisation carries the surface-exposed signal, the way players already write it.",
  },
  {
    title: "Duplicate guard at 5 km",
    body: "Anything already charted within 5 km on the same world is shown before you publish, with the distance to each, so repeats get merged instead of stacked.",
  },
  {
    title: "Rated by people who flew there",
    body: "One star rating per player per spot, updatable. Averages and counts sit on every card, so the deposits worth the trip rise.",
  },
  {
    title: "Filters that match how you search",
    body: "Ore or point of interest, resource, planet or space, minimum rating — sorted by newest, highest rated, or name.",
  },
  {
    title: "Whole lists in one go",
    body: "Bulk import takes a full GPS export, one marker per line, parses every row, drops exact repeats, and lets you fix anything in a grid before publishing.",
  },
  {
    title: "Photos of the site",
    body: "Attach a shot of the deposit or structure so the next person knows what they are looking for when they arrive.",
  },
];

function Capabilities() {
  return (
    <section className="border-t border-border bg-surface/30 py-16">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="text-2xl font-bold sm:text-3xl">What the registry does</h2>
        <p className="mt-2 max-w-2xl text-muted">
          Everything here is working today.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CAPABILITIES.map((c) => (
            <div key={c.title} className="card">
              <h3 className="text-sm font-semibold">{c.title}</h3>
              <p className="mt-2 text-sm text-muted">{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------- live registry */

/**
 * Free-text search plus real rows from the database. On a fresh deploy there
 * are no rows, so the grids drop out and only the search box remains.
 */
function LiveRegistry({ top, recent }) {
  const hasTop = top?.length > 0;
  const hasRecent = recent?.length > 0;

  return (
    <section className="border-t border-border py-16">
      <div className="mx-auto max-w-5xl space-y-12 px-6">
        <div>
          <h2 className="text-2xl font-bold sm:text-3xl">
            Search what&apos;s already charted
          </h2>
          <form
            method="get"
            action="/locations"
            className="mt-4 flex max-w-xl gap-2"
          >
            <input
              className="input"
              name="q"
              placeholder="Search by name or description…"
              aria-label="Search locations"
            />
            <button type="submit" className="btn-primary shrink-0">
              Search
            </button>
          </form>
        </div>

        {hasTop && (
          <LocationSection
            title="Top rated"
            href="/locations?sort=rating"
            items={top}
          />
        )}
        {hasRecent && (
          <LocationSection
            title="Recently added"
            href="/locations"
            items={recent}
          />
        )}

        {!hasTop && !hasRecent && (
          <div className="card">
            <h3 className="font-semibold">Nothing charted yet</h3>
            <p className="mt-2 text-sm text-muted">
              The registry is empty. Paste the first GPS string and it&apos;s
              live immediately — no review queue, no waiting.
            </p>
            {/* Load-bearing: four screenshot-grade frames sit above this, and
                on a day-zero deploy they must not read as registry inventory. */}
            <p className="mt-3 text-xs text-muted">
              No locations in the database yet. The panels above are mock-ups of
              the interface, not of this world&apos;s contents.
            </p>
            <Link href="/submit" className="btn-primary mt-4">
              Submit the first location
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

function LocationSection({ title, href, items }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        <Link className="link text-sm" href={href}>
          See all →
        </Link>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((loc) => (
          <LocationCard key={loc.id} loc={loc} />
        ))}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------- closing cta */

function ClosingCta() {
  return (
    <section className="border-t border-border py-16">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-2xl font-bold sm:text-3xl">
          Next time you need cobalt, check before you fly.
        </h2>
        <p className="mt-3 text-muted">
          Search costs nothing and needs no account. If the spot you want
          isn&apos;t charted yet, chart it — the next person short of cobalt
          will be you.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/nearby" className="btn-primary">
            Find what&apos;s near you →
          </Link>
          <Link href="/signup" className="btn-ghost">
            Create an account
          </Link>
        </div>
      </div>
    </section>
  );
}
