# The Tell-Tale Signs of a Vibecoded Frontend

A field guide to recognising AI-generated ("vibecoded") frontends — in the visual design,
in the language, in the interaction design, in the code, and in the repository around it.

**Last updated:** 2026-09-19. Compiled from published practitioner sources (listed at the
end), not from a single opinion.

---

## 0. How to use this document

The single most important framing, and the one nearly every source converges on:

> **No individual tell is damning. The tell is the _constellation_.**

Inter is a good typeface. Cards are a good primitive. A three-up feature grid is a
perfectly reasonable layout. Every item in this document appears in excellent,
deliberately designed products. What marks a frontend as vibecoded is **many defaults
co-occurring**, because each one is the un-chosen option — the thing that happens when
nobody made a decision. The fingerprint is the absence of choices, not the presence of
bad ones.

A second framing that is useful when auditing:

> **Vibecoded UI looks like everything, because it was trained on everything.**
> It has no point of view because the corpus it came from had no single point of view.

So the diagnostic question for any element is not *"is this ugly?"* but ***"could this
exact element be lifted into ten thousand other products without changing a pixel?"***
If yes, no decision was made there.

### The three-tier severity model used below

| Tier | Meaning | Ship-blocking? |
|---|---|---|
| **Cosmetic** | Signals "generated", costs credibility, harms nothing functionally | No, but compounds |
| **Structural** | The UX doesn't hold up: hierarchy, states, recovery, IA | Usually yes |
| **Substantive** | Correctness, accessibility, security, performance, data integrity | Always yes |

Most public commentary is stuck on Cosmetic. The tiers that actually cost money are the
other two. **A frontend can pass every visual test in Section 1 and still be catastrophically
vibecoded** — see Sections 3–7.

---

## 1. Visual tells (Cosmetic tier)

### 1.1 Colour

This is the loudest cluster, and the reason is well documented.

- **The indigo/violet → blue (or → cyan, or → fuchsia) gradient.** Described by multiple
  sources as *the single loudest AI tell of 2026*. It appears on hero backgrounds, on
  primary buttons, on gradient text, and on decorative blobs.
- **"VibeCode purple"** — a specific lavender-violet that leaks out of both code models
  and image models. Approximately Tailwind's `indigo-500` / `violet-500` band.
- **Gradient text on a large number or a hero word**, applied "for impact" and carrying no
  semantic weight.
- **Permanent dark mode** as an unexamined default, typically near-black with violet
  accents. The model learned "dark + glow = premium" from gaming, crypto and dev-tool
  landing pages.
- **Large coloured glows and coloured `box-shadow`s** — aurora/radial light blooms behind
  content that indicate nothing about state or interaction.
- **Neon-on-dark, high-saturation palettes with no hierarchy** — four or five saturated
  colours all competing, because neon-on-dark photographs well and is overrepresented in
  training data (screenshots on social media).
- **Monochrome mush** — a cyan icon inside a sky-blue box, inside a card of a third blue,
  with a semi-transparent mint border. Everything in the same hue family, so nothing
  separates from anything.
- **Colour used with no rule.** Four accent colours applied to four adjacent blocks with no
  logic. As one source puts it: *four competing accent colours don't add up to four
  highlights — they cancel each other out.*

**Why it happens:** Tailwind's palette made `indigo-500` trivially easy to reach for; a
very large share of the public web that models trained on is Tailwind; the model learned
"default web design means blue-purple." It's a self-reinforcing loop — Tailwind makes
purple easy → devs ship purple → models learn purple → models emit purple.

**Audit test:** Delete every colour from the design and render it greyscale. If the
hierarchy collapses entirely, colour was doing work that structure should have done.

### 1.2 Typography

- **Inter for everything.** Called *"the Helvetica of the LLM era."* Also Roboto, and the
  rotating cast of **Space Grotesk, Instrument Serif, Geist, Satoshi** — the "designer"
  fonts the model reaches for when asked to be less generic.
- **The serif-italic accent on exactly one hero word**, in an otherwise all-sans page. A
  very strong 2025–2026-era tell.
- **All-caps section labels and eyebrow text** everywhere, used as a substitute for an
  actual type scale.
- **Medium-grey body text on dark backgrounds** — see §6, this is also an accessibility
  failure.
- **No real type scale.** Sizes are ad hoc per section rather than drawn from a ramp;
  headings across sections don't agree on weight or size.
- **Weightless tracking/leading choices** — default line-height on long-form text, tight
  tracking on large display text never adjusted.

### 1.3 Layout and components

- **The centered hero**: badge/pill above an H1, an H1, a one-line subhead, one or two
  CTAs, floating in vertical space with no anchoring.
- **The decorative badge above the H1** ("✨ Now in beta", "Introducing…") serving no
  navigational or functional purpose.
- **Three (or six) identical rounded cards in a row**, each with a thin-line icon on top,
  a heading and two lines of text.
- **Coloured left or top borders on cards.** Repeatedly named as the *most specific
  single tell* — "almost as reliable a sign of AI-generated design as em-dashes are for
  text." Multicoloured vertical accent bars on consecutive blocks, with no colour logic,
  are the acute form.
- **Cards nested inside cards inside cards.** "Everything goes in a card. Then those cards
  go in a card." Three levels of border-radius and shadow with no hierarchy gained.
- **Uniformly excessive padding** on those cards, so density is identical everywhere and
  nothing reads as primary.
- **The numbered `1 / 2 / 3` step strip** for any process, regardless of whether the
  process is actually sequential.
- **The stat banner row** — "10,000+ users · 99.9% uptime · 24/7 support" — isolated from
  any narrative, often with invented numbers.
- **Glassmorphism panels with a neon rim**, applied to elements that don't overlay anything.
- **Emoji as the icon system**, especially in sidebars, nav, feature bullets and headings.
  A generated sidebar with 📊 📁 ⚙️ 👤 is near-conclusive.
- **A coloured box around an emoji or icon** anywhere a real illustration, screenshot,
  photo or chart belongs. This is the model's placeholder for "visual asset goes here,"
  and it's a strong tell precisely because a designer would have put content there.
- **Thin, interchangeable line icons** that could illustrate any product — picked for
  looking icon-like, not for meaning.
- **Symmetric everything.** Perfectly balanced grids, every section the same vertical
  rhythm, no asymmetry or intentional tension anywhere.

## 2. Language tells (Cosmetic → Structural tier)

The copy is often a *stronger* signal than the pixels, because it is the part of a
vibecoded product that gets regenerated least and edited least. A developer will fiddle
with a gradient for an hour and ship the headline the model wrote on the first pass.

The same rule applies as everywhere else: **density, not presence**. "Seamless" is a real
word. Twelve of these in one landing page is a fingerprint.

### 2.1 The vocabulary — single-word giveaways

These are the words that appear in AI output at rates far above natural human usage.
Grouped roughly by how strongly they indicate generation:

**Tier one (near-conclusive in marketing copy):**
`delve` · `tapestry` (almost always as "rich tapestry") · `realm` · `landscape` (as in
"the competitive landscape") · `testament` ("stands as a testament to") · `underscore`
(replacing "show" or "suggest") · `pivotal` · `multifaceted` · `intricate` · `meticulous`

**Tier two (very common, especially in product copy):**
`seamless` · `robust` · `holistic` · `leverage` · `harness` · `unlock` · `unleash` ·
`elevate` · `foster` · `navigate` (metaphorically) · `showcase` · `streamline` ·
`empower` · `curated` · `bespoke` · `intuitive` · `effortless` · `frictionless`

**Tier three (hype register):**
`cutting-edge` · `game-changer` · `transformative` · `revolutionary` · `next-generation` ·
`future-ready` · `state-of-the-art` · `paramount` · `cornerstone` · `beacon` ·
`world-class` · `best-in-class` · `unparalleled` · `synergy`

**Tier four (register mismatch — formal registers where plain words fit):**
`utilize` (for "use") · `facilitate` (for "help") · `commence` (for "start") ·
`embark` · `endeavour` · `myriad` · `plethora` · `crucial` · `vital` · `essential`

A practical threshold used by editors: **three or more tier-one words, or eight or more
across all tiers, on a single page** is a strong positive.

### 2.2 The phrase patterns

These are more diagnostic than individual words, because their shape is distinctive.

- **The clichéd opening hedge** — *"In today's fast-paced digital landscape…"*, *"In an
  era of rapid change…"*, *"In today's ever-evolving world…"* An About page or blog post
  that opens this way is close to conclusive.
- **Negative parallelism / the "not just" construction** — *"It's not just a music app —
  it's a practice partner."* *"This isn't about features. It's about outcomes."* This is
  the most recognisable single AI sentence shape in circulation.
- **Hedging preambles** — *"It's important to note that…"*, *"It's worth mentioning…"*,
  *"It should be noted…"*, *"It goes without saying…"*
- **Inflated significance** — *"plays a pivotal role in…"*, *"stands as a testament to…"*,
  *"serves as the cornerstone of…"*
- **The "from X to Y" comprehensiveness formula** — *"From beginners to professionals,
  from scales to sonatas."* Signals coverage without stating anything.
- **The "whether you're…" audience sweep** — *"Whether you're a complete beginner or a
  seasoned performer…"* Addresses everyone, so it addresses no one.
- **Structural signposting that a web page doesn't need** — *"In conclusion"*,
  *"In summary"*, *"Overall"*, *"In essence"*, *"To sum up"*, on a page with three
  paragraphs.
- **Transitional padding** — *"Let's dive in"*, *"Let's explore"*, *"Buckle up"*,
  *"Without further ado"*, *"Read on to discover"*, *"In this article, we will discuss"*.
- **Vague appeals to authority** — *"Experts say…"*, *"Studies show…"*, *"Industry
  observers have noted…"* with no study, expert or observer named.
- **Manufactured sass** — *"But here's the thing."* *"Hot take:"* *"Plot twist:"* Edge
  injected where a plain transition belonged.
- **Self-identification**, the absolute giveaway — *"As a large language model…"*,
  *"Certainly! Here's…"*, *"I hope this helps!"*, *"Feel free to customise this to your
  needs."* Left in production more often than you would believe.

### 2.3 The sentence-level rhythm

This is the hardest tell to fake and the most reliable when you can read a few paragraphs.

- **Uniform sentence length.** Every sentence 15–25 words. No fragments. No one-word
  sentences. No long winding sentence followed by a short hard stop. Human prose has
  texture; generated prose is *extruded rather than composed*.
- **The rule of three in every paragraph** — *"fast, secure, and scalable"*, *"learn,
  practise, perform"* — with near-synonyms filling the slots because the third item was
  needed for rhythm rather than meaning.
- **Em-dash density.** Three or more per paragraph, used where a comma, colon or
  parenthesis would be the natural mark. (Note the irony and the caveat: em-dashes are
  legitimate punctuation, heavily used by many good writers. It is the *rate* and the
  *substitution pattern* that signals.)
- **The treadmill effect.** The same idea restated and reframed across several paragraphs
  with no new information added. Word count grows, meaning doesn't.
- **Perfect grammar, zero voice.** No idiosyncrasy, no contraction pattern of its own, no
  mistakes, no opinions that could offend anyone.
- **No specifics.** No numbers, names, dates, prices, edge cases or trade-offs. The
  strongest general test for generated copy: **could a competitor paste this text onto
  their site with no edits?**

### 2.4 The formatting habits

- **Bold-term-colon-explanation lists** of three to five parallel items, everywhere.
- **Excessive bolding** inside paragraphs, emphasising phrases that need no emphasis.
- **Emoji-decorated headings** — 🚀 🎯 ✨ 💡 🔥 — especially one emoji per heading, one
  per bullet, applied uniformly.
- **Rigid section templates** — *Challenges / Benefits / Best Practices / Future Outlook*
  — imposed on content that doesn't have that shape.
- **Heading hierarchy that's decorative rather than structural** (see also §4.1).
- **Lists where prose belongs**, because listing is the model's default structure under
  uncertainty.

### 2.5 Landing-page and marketing copy tells

- **Weightless headline formula** — *"Build faster. Ship smarter."* *"Practice smarter,
  not harder."* Grammatically perfect, visually correct, says nothing specific.
- **Heading-shape repetition across sections** — *"Everything you need to…"*,
  *"Built for…"*, *"Designed for…"*, *"Powerful features for…"*, *"Simple, fast,
  reliable."* When every section uses the same sentence shape, the page reads as generated
  even if each individual line is fine.
- **Feature names that describe the mechanism, not the benefit** — "Real-time sync engine"
  instead of what the user actually gets.
- **Three-word tricolons as section subheads** — "Fast, secure, scalable."
- **Fabricated social proof** — testimonials attributed to *"Sarah J., Product Manager"*
  or *"Michael Chen, CTO"*, logo walls of companies that aren't customers, star ratings
  with no source, "Trusted by 10,000+ teams" with no 10,000 teams.
- **Invented statistics in the stat banner** — round, unsourced, suspiciously good:
  "99.9% uptime", "3x faster", "50% more efficient".
- **FAQ sections answering questions nobody asked**, in the model's own voice.
- **Lorem ipsum, or lorem-ipsum-adjacent filler**, surviving into production.
- **A footer with links to Privacy, Terms, Careers, Blog and Press** for a product with
  one developer and no blog. Generated site chrome that outruns the actual company.
- **Placeholder contact details** — `hello@yourcompany.com`, `123 Main Street`,
  `+1 (555) 123-4567`.

### 2.6 Microcopy and in-product language

This is where language stops being cosmetic and becomes a Structural failure. Microcopy is
the text at every point where a user hesitates — buttons, errors, empty states, tooltips,
confirmations — and generated microcopy is reliably generic exactly where specificity
matters most.

- **Generic button labels** — `Submit`, `OK`, `Click here`, `Learn more`, `Continue`.
  A good label names the outcome (`Save changes`, `Start the lesson`, `Delete 3 files`);
  a generated one names the mechanic.
- **Empty states that state the obvious** — *"No items."* *"Nothing here yet."* An empty
  state should say what this is, why it's empty, and what to do next.
- **Error messages that are either raw or useless** — `Error: undefined`,
  `Something went wrong`, `An unexpected error occurred`, a stack trace rendered to the
  user, or an HTTP status code shown bare. None of them tell the user what happened, what
  it means for their data, or what to do.
- **Placeholder text used as the label**, so the label disappears the moment the user
  types (also an accessibility failure — see §6).
- **Technical jargon leaking into the UI** — "Invalid payload", "Null reference",
  "Auth token expired", "Fetch failed", "Hydration error".
- **Inconsistent terminology for the same concept** across the product — *lesson* /
  *module* / *unit* / *exercise* used interchangeably because each screen was generated
  in a separate turn. This is one of the most reliable in-product tells, and a direct
  consequence of screen-at-a-time generation with no shared glossary.
- **Inconsistent voice** — one screen chummy ("Oops! Let's try that again 😅"), the next
  formal ("The operation could not be completed"), the next terse ("Failed").
- **Inconsistent capitalisation** — Title Case on one button, sentence case on the next.
- **Toasts and confirmations with no information** — "Success!" with no statement of what
  succeeded.
- **Destructive confirmations that don't say what will be destroyed** — *"Are you sure?"*
  rather than *"Delete 'Chopin Nocturne' and its 12 recordings? This can't be undone."*
- **Tooltips that restate the label.** A tooltip on a button called "Export" that reads
  "Export".
- **Loading text that lies or bores** — "Loading…" forever, or fake-cute rotating messages
  ("Brewing coffee…", "Herding cats…") that ship as the model's idea of delight.
- **Second-person/first-person drift** — "Your library" next to "My settings" in the same
  nav.
- **Unlocalised, untranslatable copy** — strings concatenated in code
  (`"You have " + n + " items"`), hard-coded English in components, no string catalogue.
- **Dates, numbers and currency hard-formatted** to one locale.

### 2.7 A quick language audit

1. **Ctrl-F the tier-one list** (§2.1) across all user-facing strings. Count.
2. **Read the headline aloud** and ask whether a competitor could use it verbatim.
3. **Grep for placeholder residue**: `yourcompany`, `example.com`, `lorem`, `555-`,
   `Sarah J`, `John Doe`, `Certainly!`, `I hope this helps`, `As an AI`, `Feel free to`.
4. **Build a glossary** of every noun the product uses for a domain concept. If the same
   concept has two names, that's the finding.
5. **Read every error string in the codebase in one sitting.** The voice inconsistency is
   invisible screen-by-screen and obvious in a list.
6. **Check the em-dash rate** and the sentence-length variance on any paragraph over
   80 words.

---

## 3. Interaction and UX tells (Structural tier)

These are the ones that actually lose users, and they're invisible in a screenshot.

- **Flat information hierarchy.** Every element carries equal visual weight, so users
  cannot read priority. Decision fatigue sets in within two or three interactions. This is
  the single most consequential structural failure.
- **Missing intermediate states.** The model generates the happy path. There is a "no
  data yet" state and a "data arrived" state but nothing between, and often no:
  - empty state (first-run, zero results, cleared filters)
  - loading state (or a skeleton that doesn't match the real layout, causing a jump)
  - partial / stale state
  - error state
  - offline state
  - "too much data" state (200 rows in a list designed for 5)
- **No error recovery path.** When something fails, the app stops. No message, no retry,
  no way back — a white screen. The interface assumes success.
- **Unmotivated micro-interactions.** Skeleton loaders, spring animations and hover
  transforms applied with no behavioural rationale — visual noise rather than orientation.
- **Status dots that mean nothing.** Coloured circles implying state, mapped to no actual
  state. A dot is only useful when the user knows what state it represents.
- **Onboarding that describes features, not outcomes.** Modals, tooltips and CTAs in the
  expected shapes, but it tells users what the product *does* and never what they will
  *accomplish*.
- **Buttons that don't do anything.** The most damning functional tell: the UI is complete,
  and a meaningful share of its affordances are inert, or are `setTimeout` fakes standing
  in for real work. Everything looks done; nothing works.
- **Hardcoded / in-browser mock data** presented as real — user lists, charts, counts,
  statuses generated client-side with no backend attached.
- **No destructive-action confirmation**, or conversely a confirm dialog on every trivial
  action.
- **No keyboard path.** Modals that don't trap focus, dropdowns that don't respond to
  arrow keys, custom controls with no keyboard equivalent at all.
- **Focus state removed.** `outline: none` with nothing put back — a near-universal
  generated-CSS habit.
- **No optimistic UI, and no reconciliation either** — the interface either lies about
  success or blocks for a full round-trip on every action.
- **Forms with no validation feedback**, or validation that only fires on submit, or error
  text that isn't associated with the field.
- **Nothing is undoable.** No undo, no draft preservation, no "are you sure you want to
  leave" on a half-filled form.
- **Navigation that doesn't survive a refresh.** State lives in React state, not the URL:
  no deep links, back button breaks the app, tabs and filters reset on reload.
- **Scroll position and list state lost** on every navigation.
- **No responsive thinking, only responsive classes.** `md:` / `lg:` prefixes are present
  everywhere but the mobile layout was never actually looked at: horizontal overflow,
  44px-minimum touch targets ignored, tables that don't collapse, fixed headers that eat
  half a phone screen, modals taller than the viewport with no internal scroll.
- **Viewport units used naively** (`100vh` on mobile, ignoring browser chrome).
- **No reduced-motion respect** — animations play regardless of
  `prefers-reduced-motion`.

---

## 4. Code-level tells (Substantive tier)

### 3.1 Markup

- **Div soup.** Deeply nested `<div>`s where `<header>`, `<nav>`, `<main>`, `<section>`,
  `<article>`, `<aside>`, `<footer>`, `<button>`, `<ul>` belong.
- **`<div onClick>` instead of `<button>`** — no keyboard, no role, no focus, no
  semantics. Extremely common.
- **Heading levels chosen for size, not structure** — multiple `<h1>`s, or `<h3>` used
  because it "looks right".
- **Images with no `alt`, or with `alt="image"`.** Decorative images not marked
  `alt=""`.
- **Landmark-free pages** — no skip link, no `<main>`, screen-reader navigation impossible.
- **ARIA misuse** — `aria-label` on things that don't need it, `role` attributes that
  contradict the element, `aria-hidden` on focusable content.

### 3.2 Styling

- **Massive inline utility class strings** on every element, with values repeated instead
  of tokenised. The same shadow/radius/spacing combination written out fifty times rather
  than extracted.
- **Magic numbers everywhere** — `mt-[17px]`, `w-[342px]`, `top-[-3px]`. Arbitrary-value
  escapes are the fingerprint of nudging a layout until it looked right rather than
  designing a system.
- **No design tokens.** No CSS custom properties, no theme file; colours as raw hex
  literals scattered across components.
- **Duplicated near-identical components** — `Card`, `CardNew`, `FeatureCard`,
  `ProductCard` that are 90% the same because each was generated in a separate turn.
- **Two or three styling systems fighting** in one codebase — Tailwind plus CSS modules
  plus inline `style={{}}` plus a component library's own CSS, with specificity conflicts
  patched by `!important`.
- **`z-index` arms race** — values like `z-[9999]`, `z-[10000]` applied reactively.
- **Fixed pixel heights** on containers holding variable content.

### 3.3 React / framework patterns

- **`useEffect` used for everything** — derived state computed in an effect instead of
  during render; data fetching in effects with no cleanup, no abort, no race guard.
- **Infinite re-render loops** from unstable dependency arrays (object/array literals or
  inline functions in deps).
- **Missing cleanup functions** → memory leaks, listeners never removed, intervals never
  cleared.
- **Stale closures** in event handlers capturing outdated state.
- **Reading state immediately after setting it** and expecting the new value.
- **Multiple `setState` calls in one effect** where a reducer belongs.
- **Prop drilling five levels deep**, or the opposite — everything dumped into one global
  context that re-renders the whole tree.
- **`key={index}` on every list**, breaking reconciliation on reorder/delete.
- **No error boundaries.** One component throws, the entire app unmounts to white.
- **No `Suspense` / no loading orchestration** — waterfalls of sequential fetches.
- **Hydration mismatches** in SSR frameworks from `Date.now()`, `Math.random()` or
  `window` access during render.
- **Everything is a client component** in an app-router project, `"use client"` at the top
  of every file including ones that need nothing client-side.

### 3.4 Comments, naming and structure

- **Uniform comments that explain the obvious** — `// Set the user state`,
  `// Step 1: Validate input`, `// Step 2: Process data`. Explanatory rather than
  contextual: they say *what*, never *why*.
- **Hyper-verbose docstrings** on trivial functions, with exhaustive parameter docs.
- **Emoji in code comments and console output.** Named specifically as one of the more
  reliable AI indicators, because emoji in source comments is not a habit most teams
  encourage.
- **Leftover `TODO:` placeholders in production** — `// TODO: Add error handling here`,
  `// TODO: Implement this`. These appear when the model lacked requirements and left a
  socket for you to fill.
- **Generic names** — `data`, `data2`, `result`, `resultFinal`, `handleClick2`, `temp`,
  `item`, `value`; and formulaic families like `userData` / `userInfo` / `userObject` in
  the same file.
- **The same problem solved several different ways in one repo** — three HTTP clients, two
  date libraries, two form approaches, two state managers.
- **Stylistic discontinuity.** Generated code written in isolation doesn't match its
  neighbours: different naming conventions, different error-handling shape, different
  logging format, different import ordering, in adjacent files. One of the clearest
  signals of all.
- **Uncanny formatting uniformity** *within* a block, next to that discontinuity between
  blocks.
- **Over-engineering for the trivial** — repository patterns, DI containers and
  abstraction layers wrapping a single fetch call.
- **Dead code from abandoned prompt iterations** — unreachable branches, unused exported
  functions, components imported nowhere.
- **Orphaned imports** from generation attempts that were rolled back.
- **Dependency sprawl** — dozens of packages for a small app; a charting library, an
  animation library and a date library all installed for one use each.
- **`console.log` left throughout**, often decorated with emoji.

---

## 5. Testing and quality tells

- **No tests at all**, which is the norm — AI tools generate features without safety nets,
  so every subsequent change lands with no guardrail.
- **Tests that assert nothing** — `expect(true).toBe(true)`, a render smoke test with no
  assertion, a mock asserted against itself.
- **Tests that mock the thing under test**, so they pass regardless of the implementation.
- **100% of tests green while the app visibly doesn't work** — the tests encode the happy
  path the model also generated.
- **No type safety in practice** — TypeScript present, but `any` liberally used,
  `@ts-ignore` / `@ts-expect-error` sprinkled, `strict` off in `tsconfig.json`.
- **No linter, or a linter with the failing rules disabled** rather than fixed.

---

## 6. Accessibility tells (Substantive tier)

Accessibility is the most reliably skipped category, because it is invisible in the demo
the model was optimising for.

- **Body text that fails WCAG AA contrast**, especially medium-grey on dark themes —
  generated dark modes routinely ship this.
- **Missing focus indicators** (see §3).
- **No keyboard operability** for custom controls, menus, modals, tabs, drag-and-drop.
- **No focus management** — focus not moved into an opened dialog, not restored on close.
- **Icon-only buttons with no accessible name.**
- **Colour as the only channel of meaning** — red/green status with no icon or label.
- **Form inputs with no associated `<label>`**, placeholder text used as the label.
- **No live regions** — async results, toasts and validation errors never announced.
- **Motion that ignores `prefers-reduced-motion`.**
- **Text that doesn't survive 200% zoom** or a `prefers-reduced-transparency` setting.

---

## 7. Performance and production tells (Substantive tier)

- **Unoptimised images** — full-resolution PNGs, no `srcset`, no modern formats, no
  dimensions set (layout shift).
- **Enormous bundles** from the dependency sprawl in §4.4; no code splitting, no lazy
  routes.
- **Everything fetched on mount, all at once**, or in a sequential waterfall.
- **Over-fetching** — the whole table pulled to render ten rows; no pagination, no
  virtualisation on long lists.
- **Fonts loaded from multiple sources**, no `font-display`, flash of invisible text.
- **Slow on mobile** — consistently the most-reported symptom of a vibecoded app in the
  wild, and usually a composite of the four items above.
- **Layout shift** on load from unsized media and late-arriving content.
- **No caching strategy**, no request deduplication, the same endpoint hit by three
  components independently.
- **Secrets in the client bundle** — API keys, service tokens and admin credentials in
  frontend code or `NEXT_PUBLIC_`-style env vars. Very commonly reported in vibecoded
  apps.
- **Client-side-only authorisation** — the UI hides the admin button but the endpoint is
  open.
- **`Access-Control-Allow-Origin: *`** and other over-broad CORS.
- **Direct database access from the browser** with permissive rules.

---

## 8. Repository and process tells

- **Git history of a few enormous commits**, often with generated messages, rather than
  incremental work.
- **Commit messages that describe the diff, not the intent**, uniformly formatted, often
  with emoji prefixes.
- **A `README` written before the code, describing features that don't exist.**
- **Documentation files proliferating at the repo root** — `IMPLEMENTATION_PLAN.md`,
  `SUMMARY.md`, `FIXES.md`, `PHASE_2.md` — artefacts of prompting sessions rather than
  documentation anyone reads.
- **No CI, no pre-commit hooks, no branch protection.**
- **`node_modules`, `.env` or build output committed.**
- **Lockfile churn** or a missing lockfile.
- **No issue tracker or design source** — nothing upstream of the code, because nothing
  was upstream of the code.

---

## 9. A rapid audit checklist

Run these nine checks in order. They take about twenty minutes and catch most of
the above.

1. **Greyscale it.** Screenshot, desaturate. Does hierarchy survive? (Catches §1.1, §3.)
2. **Resize to 375px wide.** Then to 320px. Look for horizontal scroll, clipped modals,
   uncollapsed tables. (Catches §3 responsive.)
3. **Unplug the keyboard's mouse.** Tab through the entire primary flow. Can you see where
   you are? Can you open, operate and close every control? (Catches §3, §6.)
4. **Kill the network mid-flow.** DevTools → offline, then act. Do you get a message, a
   retry and a way back, or a white screen? (Catches §3, §7.)
5. **Feed it hostile data.** Zero rows. Ten thousand rows. A 300-character name. An emoji.
   An apostrophe. (Catches §3 states.)
6. **Click everything.** Count the affordances that do nothing real. (Catches §3.)
7. **Read the copy, don't look at it.** Paste every user-facing string into one file and
   read it end to end. Count tier-one vocabulary, check voice consistency, build the
   glossary. (Catches §2 — see the full language audit at §2.7.)
8. **Grep the codebase** for: `TODO`, `console.log`, `any`, `@ts-ignore`, `!important`,
   `z-[`, `outline: none`, `key={index}`, `useEffect`, arbitrary-value classes `\[[0-9]+px\]`,
   and emoji in comments. Look at the *density*, not the presence. (Catches §4.)
9. **Read the git log and the dependency list.** Three commits and eighty dependencies is
   a diagnosis. (Catches §4.4, §8.)

---

## 10. What *doesn't* prove anything

For fairness, and because false positives are cheap to make:

- **Using Tailwind, React, shadcn/ui or Inter.** All are mainstream, deliberate choices for
  enormous numbers of hand-built products. shadcn/ui in particular is *recommended* as a
  way to make AI-assisted work more consistent, not less.
- **Cards, rounded corners and soft shadows.** These are the design language of the era.
- **Dark mode.** A choice, when it's a choice.
- **Clean, consistent formatting.** That's what formatters do.
- **Em-dashes on their own.** They are legitimate punctuation used heavily by good
  writers. Rate and substitution pattern are the signal, not presence.
- **Any of the vocabulary in §2.1 used once**, correctly, where it is the right word.
- **Any single item in this document.** See §0.

The distinguishing evidence is always **density and co-occurrence**, plus the Structural
and Substantive tiers — those are much harder to hit by coincidence than a purple
gradient is.

---

## 11. Remediation priorities

If you are auditing your own frontend and want the highest ratio of credibility recovered
to effort spent:

| Priority | Fix | Why first |
|---|---|---|
| 1 | Every async surface gets loading / empty / error / offline states, plus error boundaries | Highest user-visible failure rate |
| 2 | Keyboard operability + visible focus + contrast pass | Legal, ethical, and cheap |
| 3 | Establish tokens: one type scale, one spacing scale, one accent, one neutral ramp | Kills most of §1 in one pass |
| 4 | Move state into the URL; make refresh and back safe | Silent killer of trust |
| 5 | Rewrite the headline, every error message and every empty state; fix terminology to one glossary | Language is the cheapest credibility to recover |
| 6 | Replace the default palette and typeface with a chosen one | The loudest cosmetic tell, fixed in an afternoon |
| 7 | Remove nesting: one card level, one border treatment, no accent bars | Restores hierarchy |
| 8 | Semantic HTML pass — real `<button>`s, real landmarks, real headings | Fixes accessibility and SEO together |
| 9 | Delete dead code, dedupe components, prune dependencies | Makes everything after this cheaper |
| 10 | Write tests for the flows you actually care about | Guardrails for all the above |

---

## Sources

- [AI Design Slop: 16 Patterns That Out Your App as Vibe-Coded — Developers Digest](https://www.developersdigest.tech/blog/ai-design-slop-and-how-to-spot-it)
- [7 Signs a UI Has Been Vibe Coded (And How to Avoid Them) — The Fountain Institute](https://www.thefountaininstitute.com/blog/signs-vibe-coded-ui)
- [AI Slop Fonts and Gradients: The Tells That Give Away AI Design — 925 Studios](https://www.925studios.co/blog/ai-slop-design-tells)
- [Vibe Coded UI: Why AI Interfaces Fail — reloadux](https://reloadux.com/blog/vibe-coded-ui-why-ai-interfaces-fail/)
- [How to Identify Vibe Coded (AI-Generated) Code — Signs, Risks & Security — AquilaX](https://aquilax.ai/blog/how-to-identify-vibe-coded-ai-generated-code)
- [How to Identify If Code Is Written by AI — AquilaX](https://aquilax.ai/blog/detect-ai-written-code)
- [50 Most Common Errors in Vibe-Coded Apps and How to Fix Them — Vibe Coder Blog](https://blog.vibecoder.me/50-most-common-errors-vibe-coded-apps-fixes)
- [Why Every AI-Built Website Looks the Same (Blame Tailwind's Indigo-500) — DEV](https://dev.to/alanwest/why-every-ai-built-website-looks-the-same-blame-tailwinds-indigo-500-3h2p)
- [The Purple Gradient Problem: Why AI UI All Looks Alike — DEV](https://dev.to/james_anderson_h/the-purple-gradient-problem-why-ai-ui-all-looks-alike-and-how-to-fix-it-3j65)
- [Why Do AI-Generated Websites Always Favour Blue-Purple Gradients? — Kai Ni, Medium](https://medium.com/@kai.ni/design-observation-why-do-ai-generated-websites-always-favour-blue-purple-gradients-ea91bf038d4c)
- [Vibe Coding Problems: Why Your App Breaks in Production (2026) — Modall](https://modall.ca/blog/vibe-coded-app-breaks-production)
- [Why Is My Vibe-Coded App So Slow on Mobile? — AppInstitute](https://appinstitute.com/why-is-my-vibe-coded-app-so-slow-on-mobile/)
- [Is my vibe-coded app ready to launch? — AppInstitute](https://appinstitute.com/is-my-vibe-coded-app-ready/)
- [Excessive Emojis as an AI Indicator — Netcraft](https://www.netcraft.com/blog/excessive-emojis-as-an-ai-indicator)
- [How to Tell If Code Was Written by AI: 9 Tells (2026) — Justin McKelvey](https://justinmckelvey.com/blog/how-to-tell-if-code-was-written-by-ai)
- [Code Review Checklist for AI-Generated Code: 12 Things to Verify — Git AutoReview](https://gitautoreview.com/blog/code-review-checklist-ai-generated-code)
- [Stop Trusting AI Code Blindly: A React Code Refactoring Case Study — freeCodeCamp](https://www.freecodecamp.org/news/stop-trusting-ai-code-blindly-a-react-code-refactoring-case-study/)
- [Debloating The AI-Grown Codebase — DEV](https://dev.to/maximsaplin/debloating-the-ai-grown-codebase-2om)
- [How to Test a Vibe-Coded App Without Writing Test Code — BugBug](https://bugbug.io/blog/software-testing/how-to-test-a-vibe-coded-app/)
- [I keep finding vibe coded apps that leak user data — XDA Developers](https://www.xda-developers.com/keep-finding-vibe-coded-apps-leak-user-data/)
- [How to Make Your AI-Generated Web App Look Professionally Designed — Differ](https://blog.getdiffer.com/design-tips-vibe-coded-project)
- [How to Avoid Building Apps That Look Vibe Coded — VibeMole](https://vibemole.com/resources/avoid-vibecoded-app-design)

**On the language tells (Section 2):**

- [The Phrases That Give Away AI Writing — Ritner Digital](https://www.ritnerdigital.com/blog/the-phrases-that-give-away-ai-writing-and-how-to-edit-them-out-before-they-cost-you-trust)
- [How to spot when writing is AI: 6 elements of a robot's style — Hunting the Muse](https://huntingthemuse.net/library/how-to-tell-if-writing-is-ai)
- [List of 300+ AI Words, Phrases and Sentences to Avoid (2026) — Content Beta](https://www.contentbeta.com/blog/list-of-words-overused-by-ai/)
- [300+ AI Words and Phrases to Avoid in 2026 (The Complete List) — useaiwriter](https://www.useaiwriter.com/articles/ai-words-to-avoid-2026)
- [Signs of AI Writing — ETBI Digital Library](https://library.etbi.ie/sources2/aisigns)
- [7 Dead Giveaways of AI Writing — The Limitless Jess, Medium](https://medium.com/@jess_33150/7-dead-giveaways-of-ai-writing-df5145f13498)
- [A Comprehensive List of AI Words and Phrases to Avoid in 2026 — Grendesign](https://grendesign.com.au/how-to-write-human-content-in-the-age-of-ai-a-comprehensive-list-of-ai-words-and-phrases-to-avoid-in-2026/)
- [UX Microcopy: Examples, Formulas & Best Practices for SaaS (2026) — Kompassify](https://kompassify.com/blog/ux-microcopy-guide)
- [How to Write UX Copy and Microcopy That Guides Users Intuitively (2026) — River](https://rivereditor.com/guides/how-to-write-ux-copy-microcopy-2026)
- [Microcopy: Definition, UX Writing Tips & Examples — Jimo](https://jimo.ai/glossary/microcopy)
