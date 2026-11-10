# Brand Foundations v0

> **Status: Draft v0.** Written 2026-11-09; naming round 2 added the same day (section 3.7); naming round 3 added 2026-11-10 (section 3.8). Everything here is a hypothesis for the AMF/PMF phase. Items marked **TBD** are decisions for the product owner. Nothing here is a logo, a design system or a final name.
>
> Moved into the repo on 2026-11-09 (D26). This is a living doc: edit it here as brand decisions are made.
>
> Inputs: [working doc](../product/working-doc.md), [strategy.md](../product/strategy.md), [discovery-amf-pmf.md](../product/discovery-amf-pmf.md), `client/src/index.css`, and current notification and alert copy in the code.

## 0. Rules for this phase

- **Cheap and reversible.** Prefer copy, words and principles over assets. A rule we can change in a doc beats a logo we have to undo.
- **One brand test at a time.** The eDreams gathering tests the product, not the name.
- **Brand follows the product principles.** One source of truth, real-time by default, privacy first, AI as editable drafts. Where brand and principles conflict, the principles win.

---

## 1. Brand platform

### 1.1 Purpose (working)

**Help groups turn shared plans into time well spent together.**

Short version for the team: *we handle the logistics so the group can be present.*

What this means in practice:

- We serve the **group**, not only the organizer. The organizer is the buyer and the champion. The guests are the experience.
- "Intention" means the group chose to be there, together, for a reason. We support that. We do not add noise, pressure or upsell.

### 1.2 Audience hypotheses we are testing

| # | Audience | Who acts | Job to be done | Signal of AMF | First test |
|---|---|---|---|---|---|
| H1 | **Team offsites and company events** (model D) | Event or people-ops organizer at a company | Run a multi-day event without spreadsheets, chats and "where are we?" messages | Organizer would use it again; company would pay per event | **eDreams gathering** (24–25 Nov, to confirm) |
| H2 | **Friend and family group trips** (A, E) | One organizer, 4–12 people | Agree on plans and money without one person doing all the work | Invitees join and stay active; organizer reuses it | Dry-run groups; Alberto's own trips |
| H3 | **Retreat hosts, wellness-leaning** (C) | Small host or co-host team | Fill and run a retreat; give guests one clear place for schedule and updates | Hosts already pay for tools (Gather, Bookinglayer); want a guest-side experience | 5–8 host interviews after the gathering |
| H4 | **Clubs and communities** (G) | Club organiser | Run recurring meetups and trips for members | Monthly use without prompting | Not yet |
| H5 | **Curators and guides** (B) | Food, adventure or wellness curator | Package a trusted plan others can follow | Buyers pay for a guide | Not yet (overlaps Casa Catz) |

What all five share: **a host side that does the work once, and a guest side that just shows up.** The brand must work for both sides and for all five contexts. That is the main constraint on naming (section 3) and architecture (section 2).

### 1.3 Personality

| Trait | This | Not that |
|---|---|---|
| **Warm** | Human, generous, uses people's names | Cute, gushing, emoji-heavy |
| **Clear** | Plain words, one idea per line, says what happens next | Clever, punny, jargon ("sync", "itinerary items") |
| **Calm** | Unhurried, few interruptions, quiet confidence | Sleepy, passive, or hype and urgency ("Don't miss out!") |
| **Fair** | Everyone has a voice; shows votes and owes openly | Bossy, organizer-only, hides who decided what |
| **Intentional** | Respects why people are there; helps them be present | Preachy, wellness-speak, "curated journeys" |

### 1.4 Voice and tone rules

**Rules that always apply**

1. Short sentences. One action per message.
2. Use people's names, never emails. *(Today notifications use emails, e.g. `${user.email} joined the trip`. That is a voice issue and a privacy issue.)*
3. Say what happened, then what to do next.
4. Verbs on buttons: "Join", "Vote", "Publish agenda". Not "OK" or "Submit".
5. No exclamation marks, except one in a real celebration (everyone joined, the trip starts).
6. No emojis in system copy. People can use them in their own content.
7. No guilt, FOMO or fake urgency. Deadlines are fine if they are real.
8. AI output is always called a **draft** until a person publishes it.
9. Money copy is neutral and exact: amount, who, what for. No judgement words ("owes you!").
10. Errors: say what went wrong in plain words, then how to fix it. Never blame the user.

**Languages (EN, ES, PT)**

- Write in English first, but write so it translates: no idioms, no wordplay.
- Spanish: use *tú*. Portuguese: use *você*. The app ships pt-BR (spec 003, D28).
- Gender-neutral by construction: "Te damos la bienvenida" instead of "Bienvenido/a". "Boas-vindas" instead of "Bem-vindo/a".
- Keep strings short. Spanish and Portuguese run about 20–30% longer than English.

**Tone by moment**

| Moment | Tone | Example |
|---|---|---|
| Routine update | Quiet, factual | "Ana moved Dinner to 20:30." |
| Group decision | Fair, inviting | "Vote on Friday's dinner. 6 of 12 have voted." |
| Money | Neutral, exact | "Marta added Taxi to airport, €42, split 4 ways." |
| Location | Reassuring, explicit | "Your location is shared with this trip until you turn it off. We don't store it." |
| Error | Calm, helpful | "Couldn't send the invite. Check the email address and try again." |
| Celebration | Warm, brief | "Everyone's in. See you in Madrid!" |

**UI copy: do / don't** (the "don't" column is mostly current copy in the code)

| Don't | Do |
|---|---|
| "Link copied to clipboard!" | "Link copied" |
| "Error: Failed to send invite" | "Couldn't send the invite. Check the email address and try again." |
| "Error: Failed to generate itinerary" | "Couldn't create a draft right now. Try again in a minute." |
| "Passwords do not match" | "The passwords don't match." |
| "Generate itinerary" (writes straight in) | "Create a draft plan" → "Review draft" → "Publish" |
| "Submit" | "Add expense" |

**Notifications: do / don't**

| Don't | Do |
|---|---|
| "marta.lopez@company.com joined the trip" | "Marta joined Madrid Offsite." |
| "Stop updated: Museo del Prado" | "Ana changed the time for Museo del Prado to 11:00." |
| "Taxi — 42.00" | "Marta added Taxi to airport, €42." |
| A push for every comment | One summary: "3 new comments on Saturday's plan." |
| "Don't miss out! Vote now!" | "Voting on dinner closes at 18:00." |

**Onboarding: do / don't**

| Don't | Do |
|---|---|
| "Welcome to your AI-powered travel companion!" | "You're invited to Madrid Offsite. Join to see the agenda." |
| Account form before seeing anything | Show the event, then "Continue with Google" |
| "Tell us about yourself" (6 fields) | "What are you into? Pick a few, or skip." |
| Location permission on first screen | Ask for location only when someone opens the map, with the "we don't store it" line |
| "Enable notifications to get the most out of the app" | "Get organizer announcements? You can mute them anytime." |

---

## 2. Brand architecture

### 2.1 Options

| | **A. Umbrella brand + plain descriptors** | **B. Separate product brands** | **C. Endorsed brands** (hybrid) |
|---|---|---|---|
| Example | *[Name]* for trips, *[Name]* for teams, *[Name]* Hosts | One name for friend trips, another for retreats, another for offsites | *Retreat Brand*, by *[Name]* |
| Fits the strategy | **Yes.** Mirrors "one shared core, thin layer per model" | Fights it. One codebase, many brands | Partly |
| Cost now | Lowest: one name, one domain, one clearance | Highest: N names, N clearances, N audiences | Medium |
| Reversible | **Yes.** Descriptors are just copy | Hard. Brands build separate equity | Medium |
| Guest experience | Guests see one brand, whatever the host's use case | Guests may meet different brands for the same app | Mixed |
| Risk | The umbrella must be broad enough for trips, retreats, offsites, clubs | Spreads thin attention before any fit | Adds complexity early |
| When it makes sense | Before AMF; when products share a core | When audiences clash (e.g. corporate vs wellness) and each has traction | When a sub-product earns its own following |

### 2.2 Decision

**Decided 2026-11-09 (B1, D14 in the working doc): Option A, one umbrella brand with plain descriptors.**

- Descriptors are words, not names: "for teams", "for hosts", "guides". No sub-brand names until one model shows AMF.
- The umbrella name must be **non-literal and not travel-specific**, so it can hold offsites, retreats and clubs.
- Revisit after AMF. If, say, retreats take off and corporate buyers need a different tone, move to C (endorsed) for that line.

### 2.3 For the eDreams gathering

Lead with the **event**, not the product. The screen title is the event name ("Madrid Offsite 2026"). The product name appears small, as a working name.

Why: it keeps the test about the product, not the name, and a plain working name is easy to change. To get a signal on names, test 2–3 finalists informally with attendees (working doc, section 6). **TBD:** see decision B2 in section 7.

---

## 3. Naming

### 3.1 Brief

- Non-literal. No "trip", "travel", "wellness", "plan" in the name.
- Easy to say and spell in English, Spanish and Portuguese.
- Works for trips, retreats, offsites, clubs and guides.
- Not close to big travel brands or eDreams ODIGEO brands (eDreams, Opodo, GO Voyages, Travellink, Liligo [29]; Prime as a product).
- Not corny. No puns, no "-ly", no "Wander-".

### 3.2 Themes

| Theme | Idea | Why it fits "groups sharing experiences with intention" |
|---|---|---|
| **1. The circle** | People gathered around one thing | Group-first, everyone has a seat |
| **2. Fire and warmth** | The fire a group sits around | Warmth, presence, evening talk; strong for retreats |
| **3. Shared direction** | A path or bearing, not a destination | Moving together; risk: drifts literal (travel) |
| **4. Base and shelter** | A home base for the group | Safety, privacy, one place |
| **5. Between and together** | What connects people | The tie, not the trip; widest umbrella |

### 3.3 Long list (36)

✅ = advanced to shortlist. ✗ = cut, with the main reason. Starting candidates are in **bold**.

| # | Name | Theme | Meaning | Quick screen |
|---|---|---|---|---|
| 1 | **Corro** | Circle | ES: a circle of people | ✅ Short, non-literal |
| 2 | Ronda | Circle | ES/PT: round | ✗ Spanish city; common EN first name |
| 3 | Coro | Circle | ES/PT: choir | ✗ Sounds like COROS sports watches [4] |
| 4 | Roda | Circle | PT: circle (roda de samba) | ✗ Weak meaning in ES ("it rolls") |
| 5 | Mesa | Circle | ES/PT: table | ✗ Too generic to own |
| 6 | **Convivio** | Circle | ES/PT/IT: a convivial gathering | ✅ Strong meaning; long |
| 7 | Tertulia | Circle | ES: social talk gathering | ✗ Hard in EN, 4 syllables |
| 8 | Rueda | Circle | ES: wheel | ✗ Hard in EN; wine region |
| 9 | **Lumbre** | Fire | ES: fire, the fire you gather around | ✅ Distinctive, warm |
| 10 | **Hearth** | Fire | EN: fireplace, home | ✗ "th" is hard in ES/PT; crowded (fintech, family display) [28] |
| 11 | Brasa | Fire | ES/PT: ember | ✗ Common grill-restaurant name |
| 12 | Lume | Fire | PT: fire/light | ✗ Weak in ES; EN reads "loom" |
| 13 | Ascua | Fire | ES: ember | ✗ Hard to say in EN |
| 14 | Ember | Fire | EN: ember | ✗ English only; known smart-mug brand |
| 15 | Fogo | Fire | PT: fire | ✗ Fogo de Chão restaurants |
| 16 | **Sendero** | Direction | ES: trail, footpath | ✅ (starting candidate); literal |
| 17 | **Vela** | Direction | ES/PT: sail, candle | ✅ (starting candidate) |
| 18 | Rumbo | Direction | ES: heading | ✗ **Existing Spanish OTA brand** (lastminute.com Group) [30] |
| 19 | Norte | Direction | ES/PT: north | ✗ Generic |
| 20 | Vereda | Direction | ES/PT: path | ✗ Hard in EN |
| 21 | Senda | Direction | ES/PT: path | ✗ Literal; reads "sender" in EN |
| 22 | Rota | Direction | PT: route | ✗ Literal; "rota" means work schedule in UK English |
| 23 | **Nido** | Base | ES/IT: nest | ✗ **Nestlé's global milk brand**, registered marks [27] |
| 24 | Patio | Base | Courtyard | ✗ Generic EN word |
| 25 | Abrigo | Base | PT: shelter; ES: coat | ✗ Means "coat" in Spanish |
| 26 | Refugio | Base | ES: refuge | ✗ Long; refugee connotation |
| 27 | Porche | Base | ES: porch | ✗ Sounds like Porsche |
| 28 | Alpendre | Base | PT: porch | ✗ Hard in EN/ES |
| 29 | **Entre** | Together | ES/PT: between, among | ✅ (starting candidate) |
| 30 | Lazo | Together | ES: tie, bond (PT *laço*) | ✅ Short, non-literal |
| 31 | Junto | Together | ES/PT: together; Franklin's 1727 club | ✅ Great story; crowded |
| 32 | Hilo | Together | ES: thread | ✗ Hawaii city; EN reads "high-low" |
| 33 | Nudo | Together | ES: knot | ✗ EN reads "nude-o" |
| 34 | Trama | Together | ES/PT: weave, plot | ✗ EN hears "trauma" |
| 35 | Teia | Together | PT: web | ✗ Unclear in ES and EN |
| 36 | Cerca | Together | ES: near; PT: about | ✗ Ambiguous across languages |

Two starting candidates did not make the shortlist: **Nido** (Nestlé conflict) and **Hearth** (fails the ES/PT test and the space is crowded).

### 3.4 Shortlist scoring

Scale: 3 = good, 2 = some issues, 1 = weak. Total out of 18.

- **Short:** syllables and letters.
- **Say it:** one obvious pronunciation in EN, ES and PT.
- **Non-literal:** does not describe travel or a feature.
- **No overlap:** distance from big travel brands, eDreams ODIGEO brands, and apps in our category.
- **Domains:** **estimate, not checked.** Assume the exact .com is taken for every dictionary word. The score reflects how well the name works with a modifier (get-, join-) or .app/.club.
- **TM risk:** from the web search in 3.5. 3 = nothing found in software/social/event classes; 1 = a live mark or app in our space.

| Name | Short | Say it | Non-literal | No overlap | Domains | TM risk | **Total** |
|---|---|---|---|---|---|---|---|
| **Lazo** | 3 | 3 | 3 | 3 | 2 | 2 | **16** |
| **Corro** | 3 | 2 | 3 | 3 | 2 | 1 | **14** |
| **Lumbre** | 2 | 1 | 3 | 3 | 2 | 3 | **14** |
| **Entre** | 3 | 2 | 3 | 3 | 1 | 2 | **14** |
| **Convivio** | 1 | 3 | 2 | 3 | 1 | 2 | **12** |
| **Junto** | 3 | 2 | 2 | 3 | 1 | 1 | **12** |
| **Vela** | 3 | 3 | 2 | 1 | 1 | 1 | **11** |
| **Sendero** | 1 | 2 | 1 | 2 | 1 | 2 | **9** |

Scores are a rough sort, not a verdict. Fit with the umbrella matters as much as the total (see 3.6).

### 3.5 What the web search found

> **This is not a legal trademark check.** It is a web search of public pages, app stores and third-party mirrors of US (USPTO) records. We did not search EUIPO, OEPM (Spain), INPI (Portugal or Brazil) or WIPO. Before using any name in public, get a proper clearance search in the relevant classes (likely 9, 35, 39, 41, 42, 43) and markets.

| Name | Pronunciation and meaning notes | Found online | Read |
|---|---|---|---|
| **Corro** | ES: circle of people (a USPTO record translates it as "ring, circle" [3]). PT: "I run". EN speakers will say "KOR-oh"; the Spanish *rr* is lost, which is fine | **Pending US filings for CORRO by Corro Limited in classes 9, 38 and 42** (software, telecoms), filed 2025 [1]. A registered CORRO in class 35 (Equestrian Labs) [2]. Many CORRO- marks in coatings and corrosion. COROS sports watches sound similar [4] | Best fit, but the pending software filings are a **real risk**. Clear this first |
| **Convivio** | Means a convivial gathering in ES, PT (*convívio*) and IT. Four syllables | An early-stage Milan concept, "the first social network for events" [5]. A restaurant digital-menu app [6]. A registered US mark in classes 35 and 41 (events, entertainment) [7]. An Italian food alliance [8] | Meaning is right; the space is busy and it's long |
| **Lumbre** | ES: fire, the fire of a home. PT uses *lume*. **EN speakers may read "lumber"** | Pending US mark for agave spirits (class 33) [9]; LUMBRE LLC in tobacco and clothing [10]; Casa Lumbre, a large Mexican drinks group [11]. Nothing found in software | Cleanest in our classes; pronunciation in English is the problem |
| **Vela** | Sail and candle in ES and PT. Easy everywhere | **A social, collaborative travel-planning app called Vela** launched in 2025 [12]. Many live VELA marks in class 9 software (Exegy, Vela Trading Systems, Vela Games) [13] | Direct category overlap. Not recommended |
| **Entre** | Between/among in ES and PT. EN readers may think "entrée" | **Entre, a professional social network with "Communities"**, on iOS and Android [14]. Its US class 9 application is dead; American Express holds a live ENTRE mark in class 35 [15]. A common word, so hard to search and own | Adjacent community app; weak searchability |
| **Sendero** | ES: trail. Literal for hiking and travel | Sendero Maps, a trail app [16]. A hackathon project using Sendero for agentic travel ops [17]. Sendero Group (accessible GPS) closed in 2018 [18]. Live US SENDERO marks in energy and healthcare [19] | Literal and travel-coded. Not recommended |
| **Lazo** | ES: tie, bond, also bow and lasso. PT *laço*. Spain says "LA-tho", Latin America "LA-so"; both fine | **A social gifting app by a Spanish company (Lazo e-commerce SL)** [20]. A viral app called Lazo that runs "loyalty tests" on partners [21]. LAZO Fintech holds registered marks in classes 35, 36, 45 [22]; Lazo, LLC's class 9 app filing is dead [23] | Scores highest, but carries a negative association and a Spanish social app |
| **Junto** | ES/PT: together. Pronunciation splits: EN "JUN-toe", ES "HOON-to", PT "ZHOON-too" | **Junto, a group dating app by a Spanish company** [24]. **Junto, a community platform for coaches and wellbeing group leaders** [25]. A registered US JUNTO in class 9 for apps that **schedule recreational activities and events** [26] | Crowded, directly in our space. Not recommended |

### 3.6 Recommendation

1. **Send three finalists to a proper clearance search:** **Corro**, **Lazo**, **Lumbre**.
   - **Corro** is the best fit for the umbrella: a circle of people works for trips, retreats, offsites and clubs. Its risk is specific and checkable (the 2025 Corro Limited filings).
   - **Lazo** is the safest all-rounder on the scorecard. Check how strong the gifting app and the "loyalty test" app are in Spain and Latin America.
   - **Lumbre** is the most distinctive mood and the cleanest in software classes. Test the English pronunciation with 5–10 English speakers before investing.
2. **Drop** Vela, Junto and Sendero (overlap in our category). Keep Convivio and Entre as reserves.
3. **Do not pick the final name before the gathering.** Use the working name there (section 2.3). Decide after the retro, when the clearance results are back.
4. **Optional, cheap:** register one or two domain variants per finalist (for example .app or a get- prefix). This is a small, reversible cost; check availability with a registrar first.

*Updated by round 2 (3.7): the product owner's favourite is Lazo, and the finalists are now Lazo, Fogata and Corro.*

### 3.7 Round 2: Lazo, ARRIVAL, and five more names

Added 2026-11-09. The product owner likes how **Lazo** looks and sounds, and likes the name **ARRIVAL**. This round takes both apart, pulls out the principles, and applies them to five new names.

#### Why Lazo works

| Layer | What it does |
|---|---|
| **Shape** | 4 letters, 2 open syllables, stress on the first: LA-zo. Ends in a vowel. Same rhythm in EN, ES and PT. |
| **Look** | One tall letter, then three short ones. The *z* adds an edge. Works in lower case and in caps (LAZO). |
| **Meaning** | ES: tie, bond, bow. PT *laço*, as in *laços de família* (family ties). It names the **result** of time together, the bond, not the trip. |
| **Story** | In Mexican and other Hispanic weddings, *el lazo* is a cord placed around the couple as a symbol of their union [31]. That is a ready-made answer to "why are you called that?" |
| **Breadth** | Nothing about travel. It holds trips, offsites, retreats and clubs. |

**Watch-outs**

- English readers may say "LAY-zo", close to "lazy". Test it.
- English hears "lasso". In Spanish, *echar el lazo* means to rope someone in. A slight "catch" undertone.
- Existing users of the name (3.5): a social gifting app by a Spanish company, a "loyalty test" app, and LAZO Fintech. Clearance should start with Spain.

#### Why ARRIVAL resonates

What it is: ARRIVAL is a curated small-group travel brand launched by the social media duo The Inspired Unemployed [32]. It started because one founder was always the friend organising trips [32]. It targets millennials and Gen Z, with a focus on social connection [32].

Why the name works:

1. **A real, everyday word.** Nobody needs it explained.
2. **It names the payoff moment.** The planning is over and the good part starts. It names the result, not the work.
3. **It carries emotion.** Relief, anticipation, and "you've arrived" (belonging).
4. **It stands alone with confidence.** One word, in capitals, no descriptor.
5. **It fits what they sell.** They sell the trip itself, so a name about getting there fits.

What it costs them:

- A common word is hard to own. They sell through a country domain, arrival.com.au [32].
- The name has baggage: Arrival was also a UK electric-van maker that went bankrupt in 2024 [33].
- It is English-only and literal travel. Both break our brief (3.1).

#### Principles to borrow

| # | Principle | Lazo | ARRIVAL |
|---|---|---|---|
| 1 | A real word people already know | Yes (ES, PT) | Yes (EN) |
| 2 | Name the outcome or the moment, not the tool | The bond | The moment you get there |
| 3 | Warm and human, not techy | Yes | Yes |
| 4 | Short and easy to say aloud | 2 syllables | 3 syllables |
| 5 | Confident as one word | Yes | Yes |
| 6 | Our own rule: not literal travel; works in EN, ES and PT | Yes | No |

For a tool like ours, principle 2 is the key move: name what the group gets (a bond, a fire, a hug), not what the app does (plan, sync, split).

#### Five new candidates

| Name | Meaning | Principle it follows | Notes |
|---|---|---|---|
| **Fogata** | ES: bonfire, campfire | The moment: the group around the fire at night | Lumbre's warmth, but easy in English: fo-GAH-ta. PT says *fogueira*, so it reads as Spanish there. |
| **Abrazo** | ES: hug (PT *abraço*) | The outcome: the hug when you meet | The warmest option. May feel sentimental for corporate buyers. Spain says "a-BRA-tho". |
| **Rito** | ES/PT: rite, ritual | Lazo's shape (4 letters, 2 syllables), plus intention | Groups have rituals: the first dinner, the morning swim. Can feel solemn. EN may say "REE-toe" or "RYE-toe". |
| **Presente** | ES/PT: "here!" at roll call; present. PT: also "gift" | The outcome: being present, showing up | The closest link to "intention". Long. In the US it is tied to Latinx political advocacy (see below). |
| **Verbena** | ES: a summer night street party. EN, ES, PT: a calming herb | The moment (the party), with a wellness tone | The same word in all three languages. The party meaning is mostly Spain; elsewhere it reads as a plant or soap scent. |

Screened out this round:

- **Alba** (dawn): crowded. An event group-chat social app [34], a "pack together in real time" travel app [35], and a UK application for *alba* in software classes 9 and 42 [36].
- **Brindis** (a toast): a bar-subscription app in Spain [37] and an event-organising tool in Latin America [38].
- **Convite** (invitation): Apple's Invites app is called *Convites* in Portuguese [39].
- **Gozo** (joy): also Malta's island, with its own events app [40].

#### Scores (same scorecard as 3.4)

| Name | Short | Say it | Non-literal | No overlap | Domains | TM risk | **Total** |
|---|---|---|---|---|---|---|---|
| *Lazo (reference)* | 3 | 3 | 3 | 3 | 2 | 2 | *16* |
| **Fogata** | 2 | 2 | 3 | 3 | 2 | 3 | **15** |
| **Verbena** | 2 | 3 | 3 | 3 | 1 | 3 | **15** |
| **Abrazo** | 2 | 2 | 3 | 3 | 2 | 2 | **14** |
| **Rito** | 3 | 2 | 3 | 3 | 2 | 1 | **14** |
| **Presente** | 1 | 3 | 3 | 2 | 1 | 2 | **12** |

Domains are still an estimate, not checked.

#### What the web search found

> **Not a legal trademark check.** Same method and limits as 3.5. "Nothing found" means a shallow search found nothing, not that the name is clear.

| Name | Found online | Read |
|---|---|---|
| **Fogata** | A registered US FOGATA mark for tobacco products, owned by Oettinger Davidoff [41]. Nothing found in software or events | Cleanest in our classes. Clear Spain and the EU next |
| **Verbena** | A dead US VERBENA mark for soaps [42]. A pending VERBENAS mark for footwear by a Spanish company [43]. Nothing found in software | Clean in our classes; a crowded word elsewhere |
| **Abrazo** | Abrazo Health, a large hospital network in Arizona [44]. A US ABRAZO mark, filed 2006, for software that manages communication between mobile devices and enterprise servers (Tango Networks) [45]. No group or travel app found | Medium. Different fields, but a known US user |
| **Rito** | A registered US RITO mark in class 9 (RITO LLC, 2023) [46]. Rito Mints [47]. A habit tracker called Ritus [48] | **Check the class 9 goods first.** It may block us |
| **Presente** | Presentie, an app to discover events and meet attendees [49]. Presente.org, a large US Latinx online advocacy organisation [50]. ¡LATINA, PRESENTE!, pending in class 41 [51] | Strong political association in the US |

#### Recommendation (round 2)

- **Keep Lazo as the lead.** It fits the principles best and has the best total.
- **Best new alternative: Fogata.** Same idea as Lumbre (the fire the group gathers around), easier in English, and the cleanest search in our classes. Fits retreats and offsites. Risk: "campfire" may feel too outdoorsy for corporate buyers.
- **Second tier:** Abrazo (warmest, but a US hospital brand and a sentimental tone) and Rito (Lazo's shape, but a live class 9 mark).
- **Reserve:** Verbena and Presente.
- **Updated finalists for clearance (B3): Lazo, Fogata, Corro.** Corro stays as the strongest "circle of people" idea. Lumbre drops, because Fogata carries the same idea with easier English.
- **Quick test, 5–10 people per language:** read the name once, then say it aloud; say what it means to you; "would you join a ___ for your team offsite?"

---

### 3.8 Round 3: the GitHub handle, and four more embers

Added 2026-11-10. The product owner is happy to use **Fogata**, but the plain `fogata` handle is already taken on GitHub. This round checks what that actually means, and adds four more candidates in the same "fire the group gathers around" vein, in case Fogata does not clear.

#### The GitHub handle is not a brand problem

`fogata` is taken on GitHub by an old open-source group-chat clone, unrelated to us [52]. A few other round-2 names are taken too: `brasa` is a small programming-language project and a crypto-staking docs site [53]; `chispa` is widely used as a repo and package name [54].

This is a code-hosting namespace collision, not a trademark or consumer brand conflict. Nobody outside engineering sees a GitHub org name, and it is cheap to route around:

- Keep the brand name as-is in the product, marketing and app stores.
- Use a suffixed handle for the GitHub org or repo when one is needed: for example `fogata-app`, `usefogata`, `fogatahq` or `get-fogata`. This is a one-line, reversible engineering choice, not a naming decision.
- The repo already lives at `barry-dempsey/trip-planner` (CLAUDE.md). Nothing here needs to change before the gathering; it only matters if and when the team wants the org name to match the brand.

This is engineering's call to make when it's actually needed (tracked as B7 in section 7), not a reason to drop a name candidate.

#### Four more candidates, same principle as Fogata

Fogata works by naming the object the group gathers around, not the trip. These follow the same move:

| Name | Meaning | Notes |
|---|---|---|
| **Ascua** | ES/PT: a single glowing ember | The one piece of the fire that's left, kept warm. Shorter and rarer than Fogata; less obviously "fire" to someone who doesn't know the word. |
| **Brasas** | ES/PT: live coals, embers (plural) | Reads as "the group" rather than one object — closer to Fogata's warmth, plural instead of singular. `brasa` (singular) is the one already in 3.7's screened list; `Brasas` is a different word, not just a respelling. |
| **Brasero** | ES: a fire pit or brazier — the object Spanish terraces gather a group around for exactly this kind of evening | Most literal and most "us" of the four, but 3 syllables and harder for English speakers (bra-SEH-ro). Also the name of an old GNOME CD-burning app [55] — mild SEO clutter, not a brand conflict. |
| **Rescoldo** | ES: the embers and warmth that remain after a fire has died down | Best match for "the bond outlasts the trip," but the hardest of the four to say in English and Portuguese. |

**Screened out this round:**

- **Candela** (flame, candle): a real, actively sold product — *Candela Obscura* is a trademarked tabletop role-playing game line from Darrington Press, Critical Role's publishing arm [56]. Also a generic word used by many unrelated engines and libraries. Drop it.
- **Chispa** (spark): **Chispa is Match Group's dating app for Latino singles**, launched with Univision, with 6M+ downloads [54]. A direct, well-known commercial conflict — do not use.
- **Tizón** (ember, firebrand): carries an unrelated slang meaning in some Spanish dialects that is best avoided regardless of naming fit.

#### Scores (same scorecard as 3.4 and 3.7)

| Name | Short | Say it | Non-literal | No overlap | Domains | TM risk | **Total** |
|---|---|---|---|---|---|---|---|
| *Fogata (reference)* | 2 | 2 | 3 | 3 | 2 | 3 | *15* |
| **Ascua** | 3 | 2 | 3 | 3 | 2 | 3 | **16** |
| **Brasas** | 2 | 2 | 3 | 3 | 2 | 3 | **15** |
| **Brasero** | 1 | 1 | 3 | 2 | 2 | 3 | **12** |
| **Rescoldo** | 1 | 1 | 3 | 3 | 2 | 3 | **13** |

Domains and TM risk are still estimates from a web search only, not a legal check (see 3.5).

#### Recommendation (round 3)

- **If Fogata doesn't clear, try Ascua first.** Same shape and warmth, shortest of the four, no conflicts turned up in this search.
- **Brasas is the next-best backup** — easy to say, reads as "the group around the fire" rather than one ember.
- **Brasero and Rescoldo are reserves**, kept for their imagery but weaker on pronounceability in English and Portuguese.
- **The GitHub handle itself changes nothing in section 3.6's finalists** (Lazo, Fogata, Corro). Route around it with a suffixed handle (above) rather than swapping the name.

---

## 4. Visual direction (words only)

**Where we are today** (`client/src/index.css`): a cool grey-blue background, indigo primary (`#5b5bd6`), an indigo-to-violet gradient, the system font stack, 16px radius, soft shadows, light and dark modes. It is clean but reads as generic SaaS. It says "tool", not "people together".

**Recommendation for the gathering:** no restyle. Visual work is not in the four-feature scope. Mock up the directions below after the gathering.

### A. "Sobremesa": the long table

- **Feeling:** the slow hour after a shared meal. Warm, social, Mediterranean.
- **Palette idea:** terracotta and clay, olive green, warm cream background, deep brown text. One soft accent (saffron) for actions.
- **Type feel:** a warm serif with character for headings; a friendly, rounded sans for UI.
- **Imagery:** hands, tables, shared food, people seen from a distance or from behind (no faces needed, which fits privacy-first). Natural light, a little grain.
- **Shapes and motion:** generous radius, paper-like surfaces, slow fades.
- **References (for mood, not to copy):** Mediterranean hospitality, independent food magazines, hand-made ceramics.
- **Best for:** friend trips (H2), retreats (H3), clubs (H4). **Risk:** may feel too casual for corporate buyers (H1). Pairs well with **Corro** or **Convivio**.

### B. "Dusk": around the fire

- **Feeling:** the evening part of a retreat or offsite. Calm, intimate, focused.
- **Palette idea:** deep night blue or charcoal, ember orange as the accent, warm off-white text. Dark mode is the hero, light mode secondary.
- **Type feel:** a soft, humanist grotesk throughout; a light weight for large numbers (times, dates).
- **Imagery:** low sun, firelight, silhouettes, landscapes at blue hour. Few people, lots of space.
- **Shapes and motion:** soft glows instead of shadows, gentle pulses for live states (live location, voting open).
- **References:** outdoor and slow-living brands, retreat venues, night photography.
- **Best for:** retreats (H3), offsites (H1). **Risk:** can look moody or "wellness-y"; contrast needs care. Pairs well with **Lumbre**.

### C. "Field notes": clear and light

- **Feeling:** a well-made printed program for an event. Organised, friendly, trustworthy.
- **Palette idea:** off-white paper, ink navy text, one bright accent (sun yellow or coral), plus pale tints to colour-code days or groups.
- **Type feel:** a clean grotesk; tabular figures or a mono for times and amounts.
- **Imagery:** simple line illustrations, map fragments, stamps, hand-drawn route lines. Photos are optional.
- **Shapes and motion:** smaller radius, thin rules, cards like tickets; quick, crisp transitions.
- **References:** transit maps, Swiss-style posters, festival programs, pocket notebooks.
- **Best for:** offsites (H1), clubs (H4), guides (H5). **Risk:** can feel cool or generic if the accent is timid. Cheapest evolution from today's tokens. Pairs well with **Lazo** or **Entre**.

| | A. Sobremesa | B. Dusk | C. Field notes |
|---|---|---|---|
| Warmth | High | Medium-high | Medium |
| Clarity for logistics | Medium | Medium | High |
| Corporate-friendly | Low-medium | Medium | High |
| Retreat-friendly | High | High | Medium |
| Effort from today | High | High | Low |

**TBD after the gathering:** which one or two to mock up. If H1 (offsites) wins, start with C; if H3 (retreats) wins, start with A or B.

---

## 5. UX/UI principles

These guide the gathering build now and the design system later. Each has a test an engineer or designer can apply.

| # | Principle | What it means | Test | In the gathering build |
|---|---|---|---|---|
| 1 | **Group-first** | Every screen answers "what does this mean for us?" | Can you see who is in, who voted, who paid, by name? | Names, not emails, in lists and notifications. Vote counts visible |
| 2 | **Calm over busy** | Fewer, better interruptions. Silence is a feature | Would an attendee mute this? Then batch it or drop it | Organizer announcements with mute. No push per comment |
| 3 | **Drafts, not decisions** | AI and imports create drafts; a person publishes | Can anything AI-made reach guests without a human "Publish"? It must not | Agenda import → review → publish |
| 4 | **One place, live** | One source of truth, updated for everyone without a refresh | Change it on one phone; does every other phone show it in seconds? | Real-time for polls and comments |
| 5 | **Hosts do the work once, guests just show up** | Host tools stay out of the guest's way | Can a guest join and see what's next in two taps? | Invite link + SSO; interests step is skippable; organizer tools hidden from attendees |
| 6 | **Private by default, visible by choice** | Ask at the moment of use; say who sees it and for how long | Does every share say who sees it? Is location ever stored? It must not be | Location opt-in at the map; short privacy note in onboarding; analytics without location data |
| 7 | **Be a glance, then step back** | During the event, the app should take seconds, not minutes | Does the schedule answer "what's next, and where?" at a glance? | Use as a review check on existing screens. **Do not** add new screens for it |

---

## 6. Decide now vs after audience-market fit

| Decide now (cheap, reversible) | Why now | Decide after AMF | Why wait |
|---|---|---|---|
| Brand architecture (umbrella + descriptors) | It sets the naming brief | Final name and trademark filing | Name should fit the audience that wins |
| How the product appears at the gathering | The build starts Thu 12 Nov | Logo and wordmark | Expensive to redo |
| Voice and tone rules | The gathering spec needs copy | Visual direction (pick 1 of 3) | Depends on H1 vs H3 |
| UX principles 1–7 | They are the bar for the spec | Design system and tokens | Built on the chosen direction |
| 2–3 name finalists to clear | Clearance takes 1–2 weeks | Taglines and campaign lines | Need a real audience and promise |
| Optional: cheap domain variants | Small, reversible cost | Descriptor names per product line | Only for models that show traction |
| | | Sub-brands or endorsed brands | Only if audiences clash |

---

## 7. Open decisions

| # | Decision | Options | Recommendation | Status |
|---|---|---|---|---|
| B1 | Brand architecture (D14 in the working doc) | A umbrella / B separate / C endorsed | A, with plain descriptors | **Decided 2026-11-09: A** |
| B2 | How the product appears at the eDreams gathering (D12) | (a) Event name leads, "Trip Planner" as small working name; (b) soft-launch a candidate name, e.g. Lazo; (c) fully white-label as the event | (a): reversible, and it tests the product, not the name | TBD |
| B3 | Name finalists for clearance | Any 2–3 from 3.4 and 3.7 | Lazo, Fogata, Corro (updated after round 2) | TBD |
| B4 | Adopt voice rules (1.4) and UX principles (5) for the gathering spec | Adopt / edit / defer | Adopt as the default for spec 002 | Proposed |
| B5 | PT-BR or PT-PT first | — | pt-BR shipped in spec 003 (2026-11-09); keep it for the pilot | Default: pt-BR (D28) |
| B6 | Visual direction to mock up | A / B / C | After the retro, based on H1 vs H3 | Later |
| B7 | GitHub org/repo handle if it needs to match the brand name | Suffix the handle (e.g. `fogata-app`) vs. wait | Suffix it, only when actually needed | Engineering (not blocking) |

---

## Sources

Web search on 2026-11-09. Trademark data comes from third-party mirrors of USPTO records and may be out of date. Not a legal check.

1. CORRO, Corro Limited, pending, classes 9/38/42: [markinton.com](https://markinton.com/trademark/corro-79444051), [second filing](https://markinton.com/trademark/corro-79433299)
2. CORRO, Equestrian Labs, registered, class 35: [markinton.com](https://markinton.com/trademark/corro-88300527)
3. CORRO FINK record, translation of "corro": [Justia](https://trademark.justia.com/880/22/corro-88022186.html)
4. COROS app: [coros.com](https://coros.com/es/stories/press-release/c/coros-announces-july-2025-software-update)
5. Convivio events social network (Milan, concept stage): [Gust](https://gust.com/companies/convivio)
6. Convivio Digital Menu app: [App Store](https://apps.apple.com/us/app/id1634565545)
7. CONVIVIO, US registered, classes 35/41: [markinton.com](https://markinton.com/trademark/convivio-86112333)
8. Convivio Group (Italian food alliance): [Smith Lumen](https://www.smithlumen.com/project/convivio-corporate-identity/)
9. LUMBRE, agave spirits, pending: [markinton.com](https://markinton.com/trademark/lumbre-99021151)
10. LUMBRE LLC, class 34: [markinton.com](https://markinton.com/trademark/lumbre-99533172)
11. Casa Lumbre: [Runa case study](https://runahr.com/ar/clientes/casalumbre/)
12. Vela social travel app: [Product Hunt](https://www.producthunt.com/products/vela-2), [Goodspeed case study](https://goodspeed.studio/casestudy/vela)
13. VELA class 9 marks: [Exegy](https://markinton.com/trademark/vela-88589772), [Vela Trading Systems](https://trademarkdir.com/owner/vela-trading-systems-llc), [Vela Games](https://markinton.com/trademark/vela-games-97589072)
14. Entre professional network and Communities: [Business Wire](https://www.businesswire.com/news/home/20230427005381/en/Entre-Launches-Communities-a-new-Slack-and-Discord-alternative), [App Store](https://apps.apple.com/us/app/entre-for-entrepreneurs/id1486408018)
15. ENTRE marks: [Entre Corp (dead)](https://markinton.com/trademark/entre-88648521), [American Express (live, class 35)](https://markinton.com/trademark/entre-78675401)
16. Sendero Maps: [sendero-maps.pages.dev](https://sendero-maps.pages.dev/)
17. Sendero agentic travel ops (hackathon): [lablab.ai](https://lablab.ai/ai-hackathons/nano-payments-arc/sendero)
18. Sendero Group (closed 2018): [senderogroup.com](https://senderogroup.com/)
19. SENDERO marks: [Sendero Energy](https://markinton.com/trademark/sendero-78455765), [Travis County Healthcare District](https://trademarkdir.com/trademark/sendero-98562213)
20. Lazo gifting app (Lazo e-commerce SL): [App Store](https://apps.apple.com/vg/app/lazo-app/id6471985850)
21. Lazo "loyalty test" app: [Screen Shot](https://screenshot-media.com/?p=63473)
22. LAZO Fintech, registered: [markinton.com](https://markinton.com/trademark/lazo-97654737)
23. LAZO, Lazo LLC, class 9 app filing (dead): [markinton.com](https://markinton.com/trademark/lazo-90907228)
24. Junto group dating (L-ESTEL CONNECT SL): [App Store](https://apps.apple.com/app/6756019367), [MWM](https://mwm.ai/apps/junto-group-dating/6756019367)
25. Junto community training platform: [App Store](https://apps.apple.com/in/app/junto/id6748998659)
26. JUNTO, registered, apps to schedule recreational activities and events: [Justia](https://trademarks.justia.com/870/91/junto-87091104.html)
27. Nido (Nestlé): [Wikipedia](https://en.wikipedia.org/wiki/Nido_(brand)), [NIDO US registration](https://markinton.com/trademark/nido-97001822)
28. Hearth: [Hearth fintech](https://builtin.com/company/hearth), [Hearth Display](https://techcrunch.com/2022/07/12/hearth-display-replaces-your-whiteboard-with-a-27-inch-display-for-family-task-management)
29. eDreams ODIGEO brands: [edreams.net](https://www.edreams.net/our-brand/)
30. Rumbo (lastminute.com Group): [Lastminute.com Group overview](https://bafybeiemxf5abjwjbikoz4mc3a3dla6ual3jsgpdr4cjr3oz3evfyavhwq.ipfs.4everland.io/wiki/Lastminute.com_Group.html), [Rumbo profile](https://startups.one.gob.es/companies/rumbo)

Round 2 (3.7):

31. The lazo wedding ceremony: [Little Chapel](https://www.littlechapel.com/wedding-blog/?p=12211), [Remitly](https://www.remitly.com/blog/lifestyle-culture/wedding-traditions-in-mexico/)
32. ARRIVAL by The Inspired Unemployed: [KarryOn](https://karryon.com.au/?p=3121406)
33. Arrival (EV maker) bankruptcy: [TechCrunch](https://techcrunch.com/?p=2661123), [The EV Report](https://theevreport.com/arrival-announces-bankruptcy-filing)
34. Alba social app with event group chats: [App Store](https://apps.apple.com/ca/app/alba/id6759857131)
35. Alba: Travel Packing List: [AppGoblin](https://appgoblin.info/apps/6785776633)
36. *alba*, UK application, classes 9 and 42: [UK IPO Trade Mark Journal](https://www.ipo.gov.uk/t-tmj.htm/t-tmj/tm-journals/2026-022/UK00004352353.html)
37. Brindis bar-subscription app (Spain): [El Grupo Informático](https://www.elgrupoinformatico.com/articulos/brindis-app-que-quiere-ser-netflix-los-bares-con-tarifa-plana-consumiciones/)
38. Brindis event tool (Latin America): [LinkedIn post](https://uy.linkedin.com/in/gzerbino)
39. Apple Invites ("Convites"): [Apple Newsroom Brazil](https://www.apple.com/br/newsroom/2025/02/introducing-apple-invites-a-new-app-that-brings-people-together)
40. Events in Gozo app: [App Store](https://apps.apple.com/app/id6466782863)
41. FOGATA, Oettinger Davidoff, class 34: [markinton.com](https://markinton.com/trademark/fogata-79194719)
42. VERBENA, class 3 (dead): [markinton.com](https://markinton.com/trademark/verbena-78016991)
43. VERBENAS, CIMA Footwear, pending: [markinton.com](https://markinton.com/trademark/verbenas-79425573)
44. Abrazo Health: [Wikipedia](https://en.wikipedia.org/wiki/Abrazo_Community_Health_Network)
45. ABRAZO, Tango Networks, software: [Justia](https://trademark.justia.com/category/trademark/2006/october/18/15.html), [markinton.com](https://markinton.com/trademark/abrazo-77024233)
46. RITO, RITO LLC, class 9, registered: [markinton.com](https://markinton.com/trademark/rito-97278161)
47. RITO, Rito Mints: [markinton.com](https://markinton.com/trademark/rito-98529566)
48. Ritus habit tracker: [Product Hunt](https://www.producthunt.com/posts/ritus)
49. Presentie events app: [Product Hunt](https://www.producthunt.com/products/presentie-together-for-experiences/makers)
50. Presente.org: [presente.org](https://presente.org/?p=53), [Wikipedia](https://en.wikipedia.org/wiki/Presente.org)
51. ¡LATINA, PRESENTE!, pending, classes 18/25/41: [trademarkregistration.app](https://trademarkregistration.app/Trademark/Details/98630122)

Round 3 (3.8):

52. Fogata GitHub repo, open-source group chat (Campfire clone), unrelated project: [github-redirect.dependabot.com](https://github-redirect.dependabot.com/patriciomacadden/fogata)
53. Brasa as a GitHub handle: a small programming-language project (`brasa-lang`) and a liquid-staking docs site (`brasa-finance`): [github.com/brasa-lang](https://github.com/brasa-lang), [gh.r-mj.com/Firstset/brasa-docs](https://gh.r-mj.com/Firstset/brasa-docs)
54. Chispa dating app for Latino singles, Match Group and Univision, 6M+ downloads: [hiplatina.com](https://hiplatina.com/chispa-dating-app/), [apptopia.com](https://apptopia.com/unified/app/8101711498/about)
55. Brasero, GNOME CD/DVD-burning application (unrelated legacy software, not a brand conflict): [pkgs.alpinelinux.org](https://pkgs.alpinelinux.org/package/v3.22/community/x86_64/brasero)
56. Candela Obscura, trademarked tabletop RPG by Darrington Press (Critical Role): [Wikipedia](https://en.wikipedia.org/wiki/Darrington_Press)
