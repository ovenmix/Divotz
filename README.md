# Divotz

Divotz is the platform. The club is the experience.

A golfer who bookmarks `gleniffer-golf.divotz.ca` should feel like they're using
their club's website — not a generic SaaS product with their club's name on it.
Everything in this codebase follows from that.

```
npm install
npm run dev     # http://localhost:3000
npm run check   # typecheck + tests + production build
```

Sign in with any seeded email (`cj@example.com`, `sarah@example.com`,
`dave@example.com`, `mia@example.com`). No auth provider is connected yet, so
the sign-in screen is an explicit account picker and says so on the page.

## How to reach a club

Clubs are addressed by host. In production that's `<slug>.divotz.ca`, resolved
by `src/proxy.ts`, which rewrites to the internal `/club/<slug>/...` tree
without changing the address bar.

Three forms work, all rendering the same pages:

| Form | Example | When |
| --- | --- | --- |
| Subdomain | `gleniffer-golf.divotz.ca/tournaments` | Production. Canonical. |
| Local subdomain | `gleniffer-golf.localhost:3000/tournaments` | Development. |
| Path | `localhost:3000/club/gleniffer-golf/tournaments` | Fallback, and anywhere without wildcard DNS. |

Every link inside the club goes through `joinClubPath(basePath, path)`, so the
same component emits the right URL in all three.

## The two areas

**The platform dashboard** (`/dashboard`) is deliberately small. It answers
"what Divotz things do I own or belong to?" and holds what sits *above* a club:
creating one, standalone tournaments, ownership transfer, deletion, the Pro
subscription, the account.

**The club is the application.** Settings, members, staff, events, branding,
integrations and payments all live at the club's own address, in an admin layer
that opens *beside* the club rather than replacing it. Nothing sends a club
admin back out to the platform to administer their club.

## Architecture

```
src/
  proxy.ts               host -> club resolution (Next 16 "proxy", ex-middleware)
  app/
    page.tsx             divotz.ca itself
    dashboard/           platform: clubs, standalone tournaments, ownership, Pro
    club/[slug]/         the club experience (what a club host serves)
      admin/             second sidebar layer
        tournaments/[t]/ third sidebar layer
  lib/
    color.ts             club colour -> computed foreground. The contrast engine.
    copy.ts              the golf voice: errors, empty states, loading
    navigation.ts        nav generated from permissions + enabled features
    club-path.ts         URL joining, shared by server and client
    domain/
      types.ts           the model. User != Member. null != "same as club".
      settings.ts        club default -> event inherit -> event override
      config.ts          fees, Pro pricing and limits. Every number a knob.
      membership.ts      membership status, expiry, CSV import matching
      permissions.ts     who can see what
      repository.ts      data access. Swap the store, nothing above changes.
```

### Club default → event inherit → event override

Almost every event setting is *resolved*, never read raw. An event storing
`null` inherits and will follow the club if the club changes its mind; an event
storing a value overrides and will not. `resolveEventSettings()` returns both
the effective value and where it came from, which is what lets the UI explain
why one event behaves differently from the rest of the club.

A club feature that's switched off overrules any event-level value — an event
cannot opt back into something the club doesn't do.

### If disabled, hide it

A club says once how it operates. Turning off online payments removes payment
from event creation, from registration, from the event sidebar and from the
admin nav — not as disabled buttons, but gone. Compare Gleniffer Golf (payments,
leagues, tee sheets) with Mountain View Golf (none of them) in the seed data;
the second club's interface is visibly smaller.

### Colour awareness

Pro clubs pick their own colours, so nothing may assume a brand colour's
luminance. `clubThemeTokens()` emits every `--club-*` colour together with a
foreground **computed** from its contrast against Divotz ink and paper. A
near-black brand gets light text; a pale yellow gets dark text. `tests/color.test.ts`
asserts WCAG AA across the full range.

Club brand colours never overwrite semantic ones — a club whose brand is red
does not get red success states. There is no dark mode.

### Users are not members

A user is an account. A member is a club's record of somebody's membership,
which exists before they ever sign up and persists after. They're linked when
emails match, never merged on name. Members-only registration checks
*membership*, not whether someone managed to create an account.

### Free vs Pro

Logos are free for every club, on every plan, and there is no Pro badge near
them. Pro adds colours, typography, photography, email templates and custom
domains — and it is sold in exactly one place, `Admin → Pro`, so a free club's
everyday screens carry no locks or upgrade prompts.

## Notes and known limits

- **Data is in-memory.** `src/lib/domain/repository.ts` is the seam: every
  accessor is async and returns plain domain objects, so the store behind it can
  be replaced without any page changing. Writes mutate seeded arrays and reset
  on restart.
- **No route-level `loading.tsx`.** A route loading file wraps its subtree in
  Suspense, which makes Next flush a `200` before the page has decided anything
  — a page that then calls `notFound()` or `redirect()` can no longer set the
  right status. A missing club has to be a real 404. Loading copy lives in
  `src/components/ui/loading.tsx` for client pending states and for Suspense
  boundaries placed *below* anything that can 404.
- **Tee sheet integrations are not implemented and not faked.**
  `Admin → Integrations → Tee sheets` describes the intended push and names the
  sync states a real integration must handle. A button that pretends to reach a
  live tee sheet is worse than no button.
- **Permission denials render a 200 page**, not a 403. The App Router can't set
  a status without `notFound()`, and a helpful explanation beats a blank error.
  Server actions re-check permission independently — hidden UI is not a guard.
- **Images are placeholders.** See `public/images/README.md`. Nothing references
  a remote image host.
- **Payments are modelled, not processed.** No payment provider is wired up. The
  fee maths, refund fields and permission split are real; the charge is not.
