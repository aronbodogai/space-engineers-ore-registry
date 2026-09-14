/**
 * A replica of the Space Engineers terminal GPS tab, drawn in HTML.
 *
 * This is step one of the landing-page walkthrough: the player makes a marker
 * with "New from current pos.", then "Copy to clipboard" — the two controls the
 * `highlight` prop can ring in red. It is a static illustration, not a
 * screenshot, so it stays sharp on any display and follows the site's theme.
 */

const TABS = [
  "Inventory",
  "Control Panel",
  "Production",
  "Info",
  "Factions",
  "Comms",
  "GPS",
];

export default function GameGpsPanel({ highlight = [] }) {
  const pin = (key) => highlight.indexOf(key) + 1; // 0 when not highlighted
  const ringed = (key) =>
    pin(key) ? "ring-2 ring-red-500 ring-offset-2 ring-offset-[#1b2836]" : "";

  return (
    <div
      // Below roughly 560px the panel keeps its width and the frame scrolls it
      // sideways, the way a real screenshot would, rather than crushing a
      // seven-tab strip into unreadable slivers.
      className="min-w-[34rem] overflow-hidden rounded-xl border border-border bg-[linear-gradient(160deg,#22303f,#151f2b_55%,#1b2a38)] p-2 sm:p-3"
    >
      <div className="rounded-lg bg-[#1b2836]/95 p-3 text-[11px] leading-tight text-[#c6d3df] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] sm:p-4 sm:text-xs">
        {/* Title row */}
        <div className="flex items-center gap-2">
          <GameButton>Remote Access</GameButton>
          <div className="hidden min-w-0 flex-1 items-center gap-2 rounded border border-[#3a4b5d] bg-[#223041] px-2 py-1 sm:flex">
            <MonitorGlyph />
            <span className="truncate">recskabajnok</span>
            <span className="ml-auto text-[#7d909f]">▾</span>
          </div>
          <span className="mx-auto font-semibold tracking-wide sm:mx-0">
            Terminal
          </span>
          {/* max-sm:hidden, not `hidden sm:inline-flex` — GameButton bakes
              `inline-flex` into every instance, and an unprefixed `hidden`
              loses to it on cascade order. */}
          <GameButton className="ml-auto max-sm:hidden">
            Block Transfers
          </GameButton>
          <span className="text-[#7d909f]">✕</span>
        </div>

        {/* Tabs */}
        <div className="mt-2 flex gap-px overflow-x-auto">
          {TABS.map((tab) => (
            <span
              key={tab}
              className={`shrink-0 border-t px-2 py-1.5 text-center sm:px-3 ${
                tab === "GPS"
                  ? "border-[#7fa8c9] bg-[#31424f] text-white"
                  : "border-transparent bg-[#243342] text-[#9fb0c0]"
              }`}
            >
              {tab}
            </span>
          ))}
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,11rem)_minmax(0,1fr)] sm:gap-4">
          {/* GPS list */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between border border-[#3a4b5d] bg-[#223041] px-2 py-1 text-[#7d909f]">
              <span>Search</span>
              <span>✕</span>
            </div>
            <div className="border border-[#3a4b5d] bg-[#1f2d3b]">
              <p className="border-b border-[#3a4b5d] px-2 py-1 text-[#9fb0c0]">
                GPS list:
              </p>
              <p className="border-l-2 border-[#7fa8c9] bg-[#2e4257] px-2 py-1 text-white">
                Space station 1
              </p>
              <p className="px-2 py-1 text-amber-300/90">Unidentified Signal</p>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <GameButton>New</GameButton>
              <GameButton className={ringed("new-from-pos")} pin={pin("new-from-pos")}>
                New from current pos.
              </GameButton>
              <GameButton>Delete</GameButton>
              <GameButton>New from clipboard</GameButton>
            </div>
          </div>

          {/* Marker detail */}
          <div className="space-y-2">
            <Field label="Name:" value="Space station 1" />
            <div>
              <p className="text-[#9fb0c0]">Description:</p>
              <div className="mt-1 h-14 border border-[#3a4b5d] bg-[#223041] px-2 py-1 sm:h-20">
                Current position
              </div>
            </div>

            <div>
              <p className="text-[#9fb0c0]">Color:</p>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-2">
                <Slider
                  axis="H"
                  knob="62%"
                  className="min-w-28 flex-[2] bg-[linear-gradient(90deg,#e2e2e2,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)]"
                />
                <Slider axis="S" knob="55%" className="min-w-16 flex-1" />
                <Slider axis="V" knob="88%" className="min-w-16 flex-1" />
                <span className="ml-auto flex items-center gap-1">
                  <span className="text-[#9fb0c0]">Hex</span>
                  <span className="border border-[#3a4b5d] bg-[#223041] px-2 py-0.5 font-mono">
                    #75C9F1
                  </span>
                </span>
              </div>
            </div>

            <div>
              <p className="text-[#9fb0c0]">Coordinates:</p>
              <div className="mt-1 grid grid-cols-3 gap-1 font-mono">
                <Axis axis="X" value="8086.18" />
                <Axis axis="Y" value="134400.13" />
                <Axis axis="Z" value="-100323.22" />
              </div>
            </div>

            <div className="flex items-end justify-between gap-3 pt-1">
              <div className="space-y-1">
                <Checkbox label="Show on HUD" />
                <Checkbox label="Always Visible" />
              </div>
              <GameButton className={`px-3 py-1.5 ${ringed("copy")}`} pin={pin("copy")}>
                Copy to clipboard
              </GameButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * A button face from the game's UI. `pin` draws the red numbered marker that
 * calls out the two controls the walkthrough asks the reader to press; the
 * figcaption spells out what each number means, so the callout never rests on
 * colour alone.
 */
function GameButton({ children, className = "", pin = 0 }) {
  return (
    <span
      className={`relative inline-flex items-center justify-center border border-[#4a5c6e] bg-[#2d3f50] px-2 py-1 text-center text-[#d5e1ec] ${className}`}
    >
      {pin > 0 && (
        <span
          aria-hidden
          className="absolute -left-2 -top-2 inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white"
        >
          {pin}
        </span>
      )}
      {children}
    </span>
  );
}

/** One of the game's H / S / V colour bars, with its draggable handle. */
function Slider({ axis, knob, className = "" }) {
  return (
    <span className="flex flex-1 items-center gap-1.5">
      <span className="text-[#9fb0c0]">{axis}</span>
      <span
        className={`relative h-3 rounded-sm bg-[#3a4b5d] ${className}`}
      >
        <span
          className="absolute top-[-2px] h-[16px] w-[6px] -translate-x-1/2 rounded-sm bg-[#d5e1ec]"
          style={{ left: knob }}
        />
      </span>
    </span>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <p className="text-[#9fb0c0]">{label}</p>
      <div className="mt-1 border border-[#3a4b5d] bg-[#223041] px-2 py-1">
        {value}
      </div>
    </div>
  );
}

function Axis({ axis, value }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-[#9fb0c0]">{axis}</span>
      <span className="min-w-0 flex-1 truncate border border-[#3a4b5d] bg-[#223041] px-1.5 py-1">
        {value}
      </span>
    </div>
  );
}

function Checkbox({ label }) {
  return (
    <p className="flex items-center gap-2">
      <span className="inline-block h-3 w-3 border border-[#4a5c6e] bg-[#223041]" />
      {label}
    </p>
  );
}

function MonitorGlyph() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1.5" y="2.5" width="13" height="9" rx="1" />
      <path d="M6 13.5h4" />
    </svg>
  );
}
