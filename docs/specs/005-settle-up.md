# Spec 005: Settle up (record a payment)

Status: draft
Owner: Alberto (product)   Shipped: —   PR: —
Roadmap: R2 "Expense settlement" in [product/roadmap.md](../product/roadmap.md). Slot reserved by [spec 004](004-trip-ia-redesign.md) §7.3 and §18.5.

> **Seed draft (2026-11-10).** Written at the end of the spec 004 build so this work does not start from scratch. Stages 1–3 (benchmark, define, wireframes) are **not done**. What follows is a starting point and a recommendation, not a decision. Open decisions carry recommendations that act as working defaults (D27).

## 1. The problem in one line

The app tells you "You owe Ana €42.00" but gives you no way to say "I paid her", so balances never reach zero and the debt badge never clears.

## 2. What exists today

| Piece | Where |
|---|---|
| Balances per member (positive = owed, negative = owes) | `computeBalances` in `server/routes/expenses.js` |
| Suggested transfers (who pays whom, minimum number of payments) | `computeSettlements` in the same file, returned with every expense list |
| Balance-first Money screen, "You owe … / Pay Ana €42.00", settled state | `client/src/components/Expenses.tsx` (spec 004 F12, PR #11) |
| Money badge = 1 while your balance is not zero | `client/src/trip/badges.ts` (spec 004 §7.6, PR #13) |
| Wrap Overview leads with your balance and a "Settle up" link to Money | `client/src/trip/destinations/Overview.tsx` (PR #13) |
| Expense model: `amountCents`, `currency`, `paidBy`, `splitAmong[]` | `server/models/Expense.js` |

Missing: any way to record that money changed hands.

## 3. Where it lives

Money is the home (spec 004 §7.3, "settle-up as the primary action"). No new destination and no new tab.

- **Money, balance card:** a primary "Record payment" (or "Mark as paid") button beside each "Pay Ana €42.00" line.
- **Wrap Overview:** the balance block's button opens the same flow.
- **Trips list, Past cards:** the wireframe's "You owe €42 · Settle up" pill (spec 004 wireframe 1, deferred). It needs a per-trip balance in `GET /api/trips` or a light summary endpoint.
- **Ledger:** payments appear as their own row type ("You paid Ana €42.00"), visually distinct from expenses.

## 4. Recommended direction

**Store a payment as a special expense**, not a new model:

- An expense with `kind: 'payment'`, `paidBy = payer`, `splitAmong = [payee]`, amount = what was paid.
- `computeBalances` already nets it correctly: the payer's balance goes up, the payee's goes down. Settlements recompute for free.
- Delete or undo works like deleting an expense.
- Only the payer or the payee can record it. The other side gets a push (once spec 002's notification categories exist, under "expenses").

Why: one ledger, one balance function, no migration, and no second source of truth (principle 1).

**Not in this spec:** moving real money. Payments between members are back in scope (working doc, 2026-11-09) but need a provider, KYC and fees. This spec only *records* that a payment happened outside the app.

## 5. Benchmark leads (stage 1 to confirm)

| Product | Look at |
|---|---|
| Splitwise | "Record a payment" flow, partial payments, "settled up" celebration, reminders |
| Tricount | Reimbursement suggestions, mark as reimbursed, the balances screen |
| Settle Up (app) | Payment deep links (PayPal, Revolut), multi-currency |
| Revolut / Bizum | Whether a deep link with amount and note is possible in Spain and Portugal |

## 6. Open decisions

| # | Decision | Options | Recommendation |
|---|---|---|---|
| S1 | Data model | Payment as a special expense / separate Payment model | **Special expense** (`kind: 'payment'`). Reuses balances and settlements unchanged |
| S2 | Who can record | Payer only / payer or payee / anyone in the trip | **Payer or payee.** Either side can close the loop; nobody else can rewrite someone's debt |
| S3 | Confirmation | Recorded at once / the other side confirms | **At once, with an undo and a push to the other side.** Confirmation adds a pending state for little gain among friends |
| S4 | Partial payments | Full amount only / any amount | **Any amount, prefilled with the suggested one** |
| S5 | Payment links | None / deep links to Bizum, Revolut, PayPal | **None in v1.** Revisit with the payments work |
| S6 | Past-trip pill on the trips list | Now / later | **Now**, if a cheap balance summary is available per trip; it is the reason people reopen a finished trip (spec 004 wireframe 1) |

## 7. Starting points for the build

- `server/models/Expense.js`: add `kind: { type: String, enum: ['expense', 'payment'], default: 'expense' }`.
- `server/routes/expenses.js`: `POST /trip/:groupId/payments` (validates payer or payee, amount ≤ what is owed unless S4 says otherwise), reuse `summary(trip)` and `broadcast(trip)`.
- `client/src/components/Expenses.tsx`: button per settlement line, payment rows in the ledger.
- Activity log: add a `payment_recorded` action so it shows in "since you were away" (see [spec 008](008-activity-and-read-state.md)).
- Tests: extend the client tests; add server tests for `computeBalances` with payments if a server test runner lands.

## 8. Next step

Stage 1 benchmark (the table above), then lo-fi frames for the balance card, the record-payment sheet and the ledger row, then this spec moves from seed to a full draft for approval.
