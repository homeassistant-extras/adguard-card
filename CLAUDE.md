# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> Cross-agent instructions live in [AGENTS.md](./AGENTS.md), with scoped `AGENTS.md` files under several `src/` and `test/` subdirectories. Read the nearest one before editing.

## Package Manager

Yarn project — use `yarn`, not `npm`.

## Commands

- `yarn build` — Parcel build, outputs `dist/adguard-card.js` (single bundled module entry from `src/index.ts`).
- `yarn watch` — Parcel watch mode.
- `yarn test` — Mocha + ts-node, picks up `test/**/*.spec.ts` via `.mocharc.json`.
- `yarn test:watch` — Mocha watch mode (re-runs on `src/` or `test/` changes).
- `yarn test:coverage` — NYC/Istanbul coverage over the test run.
- `yarn format` — Prettier write across the repo (uses `@trivago/prettier-plugin-sort-imports` + `prettier-plugin-organize-imports`).
- `yarn update` — `npm-check-updates -u` then `yarn install`.

Run a single test file:

```bash
TS_NODE_PROJECT='./tsconfig.test.json' npx mocha test/path/to/file.spec.ts
```

Tests must be invoked with `TS_NODE_PROJECT` pointing at `tsconfig.test.json` (the `yarn test` script does this) — without it, ts-node uses the build tsconfig and path aliases / decorators behave differently.

## Architecture

This is a **Home Assistant custom Lovelace card** for monitoring and controlling AdGuard Home instances. Built with **Lit 3** and bundled by **Parcel 2** into a single JS module that HA loads as a dashboard resource.

### Entry point and registration

`src/index.ts` registers two custom elements with the browser and pushes one entry into `window.customCards` so the HA card picker shows it:

- `adguard-card` → `AdGuardCard` from `@cards/card`
- `adguard-editor` → `AdGuardCardEditor` from `@cards/editor` (visual YAML editor)

The card type users reference in YAML is `custom:adguard`.

### Layered layout under `src/`

- `cards/` — Lit components: the main `card.ts`, the `editor.ts`, plus `components/` (sub-elements rendered by the card) and `mixins/` (shared Lit mixin classes).
- `delegates/` — Non-UI logic. `retrievers/` pull entities/devices/state out of HASS; `utils/` are pure helpers; `action-handler-delegate.ts` wires tap/hold/double-tap from HA's action system.
- `hass/` — Vendored/forked Home Assistant types and helpers (`types.ts`, `common/`, `components/`, `data/`, `panels/`, `ws/`). Treat as an HA-shaped API surface; don't grow it casually.
- `html/` — Lit `html`-template render functions used by the card.
- `config/` — Card configuration schema and defaults.
- `types/` — Shared TypeScript types (config shape, sensor shape, etc.).
- `common/` — Cross-layer utilities.
- `localize/` + `translations/` — i18n. Supported languages today: English, Spanish, Greek, Italian. See `TRANSLATIONS.md` before adding a language.
- `styles.ts` — Shared CSS at the card level.

### Data flow

1. HA passes a config object (single `device_id` or array) into the card.
2. `delegates/retrievers` walk the HA device/entity registries and current state to discover the AdGuard entities (sensors, switches, buttons, binary sensors, update entities) attached to those device(s). Discovery uses entity naming patterns and translation keys — see `README.md` "Auto-discovery".
3. The Lit card renders sections (header, statistics tiles, chart, sensors, switches, footer) from `html/` templates, applying optional `styles`, `exclude_sections`, `exclude_entities`, `entity_order`, `collapsed_sections`, etc.
4. Tap/hold/double-tap on configurable regions (`badge`, `stats`, `info`) goes through `action-handler-delegate.ts` into HA's standard action dispatch.

### Multi-AdGuard mode

When `device_id` is an array, the card aggregates switches across instances and shows a combined header status (Running / Partial / `N/M`). Statistics tiles still come from the **first** instance only — keep that limitation in mind when adding new aggregations. Actions fan out to every configured instance (see the README warning about more-info/navigation conflicts).

### TypeScript path aliases

Defined in `tsconfig.json` (and mirrored for tests via `tsconfig-paths/register` in `.mocharc.json`):

`@cards/*`, `@delegates/*`, `@hass/*`, `@html/*`, `@localize/*`, `@common/*`, `@config/*`, `@type/*`, `@util/*`, `@test/*`, `@/*` → `src/*`.

Prefer these aliases over relative paths in new code.

### Testing setup

- Mocha + Chai + Sinon, plus `@open-wc/testing` and `@testing-library/dom` for Lit component tests.
- `mocha.setup.ts` builds a JSDOM window, assigns it to `global.window`/`global.document`, shims `requestAnimationFrame` and `matchMedia` — required because Lit components touch DOM globals at module load.
- `proxyquire` is available for swapping module imports in isolation.
- Coverage config is wired through `@istanbuljs/nyc-config-typescript`.

### Build target

Parcel `targets.module` with `includeNodeModules: true` — every dependency (Lit, `@lit/task`, `fast-deep-equal`) is inlined into `dist/adguard-card.js`. Adding a runtime dep means it ships in the bundle that every user's browser downloads; weigh size before adding.

### Distribution

Released through HACS (see `hacs.json`) and as a manual `dist/adguard-card.js` drop into `www/community/adguard-card/`. SonarCloud is wired via `sonar-project.properties`.
