# Design lenses

> **Living reference.** Updated when a lens changes. Written 2026-11-11.
>
> The standard every new spec is checked against, so a feature is designed to a premium bar on the first pass instead of in a second design round. This file owns **what a spec has to have thought about**. It does not repeat the lifecycle ([docs/README.md](../README.md)) or the quality bar for merging ([ways-of-working.md](ways-of-working.md) §1).

## 1. How to use it

The lenses are applied twice:

- **Stage 2 (Define)** — as questions. Each one you cannot answer is either an option to put in front of the product owner, or a thing you have not designed yet.
- **Stage 4 (Spec)** — as answers. The spec carries a `## Design lenses` section with **one line per lens**, in order.

Rules:

1. **"n/a" is a valid answer**, written down. "L8 notifications — n/a, nothing notifies" takes four seconds and tells the next reader you thought about it. A blank line does not.
2. **A lens never answers a product decision.** If a lens turns up a choice that is the owner's, it becomes an open decision with options and a recommendation (D27 open questions never block).
3. **The lint checks that you answered, not that you answered well.** `scripts/spec-lint.sh` refuses a spec at `approved`, `building` or `shipped` with no lens section. Judgment stays with the reviewer (`/pr`).
4. **The lenses are not the UX tests.** The seven tests in [brand-foundations.md](../brand/brand-foundations.md) §5 ask whether the thing is *good*. The lenses ask whether it is *complete*. Both apply; neither replaces the other. The four product principles in [CLAUDE.md](../../CLAUDE.md) sit above both.

They apply to every spec from 005 on. Shipped specs are never retrofitted — a gap in a shipped feature is a row in [spec-backlog.md](../product/spec-backlog.md) or a finding for `/audit`.

## 2. The fourteen lenses

| # | Lens | What it means | Test |
|---|---|---|---|
| L1 | **Localization** | Every string comes from the locale files; dates, times, numbers and currency follow the locale, and times follow the **trip's** time zone | Switch to `es` and `pt`: any English left? Any sentence glued from two keys? Does a 19:00 session still read 19:00 to a phone set to another zone? |
| L2 | **Roles and access** | Who may see, create, edit and delete each object the feature adds, across all eight roles | Fill one row per action in the permissions table ([working-doc.md](../product/working-doc.md) §4.2) for org owner, admin, member, host, co-host, guest, prospective traveller, signed-out visitor. A new column is a spec decision. Org membership alone never grants trip access (D19 trip roles gate access) |
| L3 | **Money** | Free, paid or limited; which tier; and if undecided, one switch to flip later | Name the tier (free personal, Trip Pass, Organization) **or** the single place the entitlement is checked. More than one place is not a seam. If it calls an AI provider, say what one trip costs and what caps it |
| L4 | **Privacy and data** | What personal data it creates, who reads it, how long we keep it, whether it leaves to an AI provider, whether it touches location | One line per new field: basis, who reads it, when it is deleted. Anything a guest submits about diet, health, religion or access needs explicit consent and a deletion date, or we do not collect it (§3). Location is opt-in and never stored |
| L5 | **Real-time** | Which socket events it emits, and which client listens | Name the event and the file holding the listener. **An emit with no named listener does not ship** |
| L6 | **Measurability** | Which analytics events make the epic's leading measure readable | Name the event, and write the count in one sentence. No content, no coordinates, pseudonymous ids |
| L7 | **States and degradation** | Empty, first run, loading, error, no signal, and a third party down | Six lines or six frames. What does a guest on one bar of signal see? What does the screen do when maps, the AI provider or push fails? |
| L8 | **Notifications** | Whether it notifies, under which mute category, and quiet by default | Name the category in notification preferences; if none fits, this spec adds one. Would an attendee mute it? Then batch it or drop it |
| L9 | **Accessibility** | Contrast, target size, focus order, labels, dynamic type | Keyboard only, top to bottom; every control has a name; 4.5:1 on text; 44px targets; text at 200% does not clip. A product standard, not a legal gate today (§3) |
| L10 | **Reversibility** | Whether a host can undo it, and whether anything can reach travellers without a person pressing publish | Name the undo, or say why there is none. Anything AI-made or imported stays a draft until a human publishes (principle 4) |
| L11 | **Migration** | What happens to the trips, members and data that already exist | Say what an existing trip looks like the moment the code lands with no migration run. If it needs a script, the script is a build-order row |
| L12 | **Enforcement** | Every role check enforced on the server, not only hidden in the UI | Per new endpoint: what happens when a guest, a signed-out visitor, or a valid token for another trip calls it directly. Name the middleware |
| L13 | **Scale** | The numbers it has to work at: a hosted event, not eight friends | Say what the screen and the query do at the hosted-event numbers in [working-doc.md](../product/working-doc.md) §4.2 — hundreds of members. Any list with no limit and no page is a finding |
| L14 | **Lifecycle** | Which part of a trip's life it serves — before, during, after — and what it does in the other two | Say what it shows on day 2 of the event, and a week after it ends. "Nothing" is a valid answer, written down |

L13 and L14 were added on 2026-11-11 (lens-D1, lens-D2). L13 exists because premium hosts are the lead segment (D33 premium hosts lead) and every screen we have was designed around a friend trip. L14 exists because spec 004 trip IA already organises the product around a lifecycle, and a feature that only works *before* looks broken during the event.

## 3. Two legal notes

Neither is legal advice. Both are written here so a lens test can be concrete.

**Dietary and access requirements are special-category data.** A dietary or access requirement reveals health, and a halal or kosher diet reveals religion. That needs a lawful basis under Article 6 **and** a separate condition under Article 9; for a guest form, that condition is explicit consent (Article 9(2)(a)). The UK regulator says exactly this in its own event privacy notice, and Article 9 is worded the same in the EU GDPR. So L4's test is: explicit consent, a deletion date, and only collected when there is food or access to plan. Sources: [ICO event privacy notice](https://ico.org.uk/global/privacy-notice/attend-an-event-seminar-or-workshop), [ICO on special category data](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/a-guide-to-lawful-basis/special-category-data).

**The European Accessibility Act does not bind us today.** Microenterprises *providing services* are outside it: fewer than 10 people, and turnover or balance-sheet total no more than €2m. Two people clears that. The Act has applied since 28 June 2025 and e-commerce is a covered service, so the only thing keeping us out is our size — the exemption ends at the tenth hire or at €2m. Two caveats: it covers services and not products, and each member state transposes the directive itself, so Spain and Portugal may draw the exemption tighter than Ireland's regulator does. **L9 accessibility stays in the list as a product standard**: corporate buyers ask for it, and guests need it. Sources: [CCPC guidance for microenterprises](https://www.ccpc.ie/business/enforcement/accessibility/european-accessibility-act-guidelines-for-microenterprises/), [Taylor Wessing on the EAA exemptions](https://www.taylorwessing.com/en/interface/2025/accessibility/key-eu-accessibility-act-exemptions-and-the-challenges-they-pose).

## 4. One note on localization mechanics

L1 says "ICU" nowhere on purpose. `i18next` uses its own JSON v4 suffix keys — `_one`, `_other` — resolved through `Intl.PluralRules`. ICU MessageFormat needs the separate `i18next-icu` module, and English, Spanish and Portuguese need only `one` and `other`, so it would buy a dependency and nothing else. `client/src/locales/en.json` already does this correctly. Source: [i18next plurals](https://www.i18next.com/translation-function/plurals).

The code ships `pt`, not `pt-BR` (`SUPPORTED_LANGUAGES = ['en', 'pt', 'es']`, `load: 'languageOnly'`). L1 is written against `pt`, which is what shipped. Whether we ever split `pt-BR` from `pt-PT` is **lens-D3**.

## 5. What the lenses deliberately leave out

| Left out | Why | When to revisit |
|---|---|---|
| Performance budgets, load testing | No traffic yet. L13 scale catches the screen that collapses at 150 members, which is the version of this that bites us | M1 Phase 1 gate |
| Threat modelling, rate limiting, pen testing | `npm audit` in CI and the privacy check in [ways-of-working.md](ways-of-working.md) §6 are proportionate. L12 enforcement covers the one failure that actually bites us | M1 Phase 1 gate |
| Browser and device matrices | One iPhone and one Android in the dry run is the whole test two people can afford | After the pilot |
| Design tokens, component inventory | [brand-foundations.md](../brand/brand-foundations.md) §4 is words-only. There is no system to check a spec against yet | When the design system exists (B-decisions) |
| Per-feature legal review | L4 asks the data question and §3 answers the two that recur. A lawyer per spec is not a two-person process | Before taking payments, or on the first enterprise contract |
| Copy review as its own lens | The seven UX tests and the voice in [brand-foundations.md](../brand/brand-foundations.md) §1 already carry it. A fifteenth row would not be read | — |
| Effort and estimates | Already a standing no ([README.md](README.md), "What we deliberately do not do") | — |

## 6. Open decisions

| # | Decision | Owner | Status |
|---|---|---|---|
| lens-D1 | The fourteen lenses and their tests, applied at stages 2 and 4 | Product owner | **Decided 2026-11-11.** Options were: the twelve from the brief; the twelve plus scale; or all fourteen. Recommended and taken: all fourteen |
| lens-D2 | Whether **L14 lifecycle** stays, or is folded into stage 2 as a prompt | Product owner | **Decided 2026-11-11: it stays.** It is the first row to drop if the list proves too long in practice. Review after the first two specs that use it |
| lens-D3 | Do we split `pt-BR` from `pt-PT`, or keep one `pt`? | Product owner | **TBD.** Options: keep one `pt` (today's behaviour, one file to maintain, reads slightly European to a Brazilian); add `pt-BR` as a separate resource (correct for the larger market, two files to keep in step); decide when a Brazilian host actually asks. Recommendation: keep one `pt` until a real user asks, and spend the effort on EN/ES/PT coverage instead |
