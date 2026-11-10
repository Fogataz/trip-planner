#!/usr/bin/env bash
# Seed the Fogataz/trip-planner issue tracker from docs/process/tracker.md.
# One-off. Delete this file once it has run.
#
#   bash docs/process/seed-board.sh            # create everything
#   DRY_RUN=1 bash docs/process/seed-board.sh  # print what it would create
#
# Uses raw `gh api` for issue type and sub-issue links on purpose: the
# `gh issue create --type/--parent` flags need gh 2.94+, the REST calls work on
# any version. The sub-issue endpoint takes the issue's database id, not its
# number, which is the usual reason it answers "the provided sub-issue does not
# exist". Written for bash 3.2, so no associative arrays (macOS ships 3.2).

set -euo pipefail

REPO="${REPO:-Fogataz/trip-planner}"
ORG="${REPO%%/*}"
DRY_RUN="${DRY_RUN:-}"
KEYMAP="$(mktemp)"
trap 'rm -f "$KEYMAP"' EXIT

command -v gh >/dev/null || { echo "gh not installed. brew install gh"; exit 1; }
gh auth status >/dev/null 2>&1 || { echo "gh not authenticated. gh auth login"; exit 1; }
gh repo view "$REPO" >/dev/null 2>&1 || { echo "Cannot see $REPO. Has Barry transferred it yet?"; exit 1; }

echo "Issue types available in $ORG:"
gh api "orgs/$ORG/issue-types" --jq '.[].name' | sed 's/^/  - /'

if [ -z "$DRY_RUN" ] && gh issue list --repo "$REPO" --search "Run the hosted event pilot in:title" --json number --jq 'length' | grep -qv '^0$'; then
  echo "Looks seeded already. Aborting so nothing is duplicated."; exit 1
fi

put_key() { echo "$1 $2" >> "$KEYMAP"; }
get_key() { awk -v k="$1" '$1==k {print $2; exit}' "$KEYMAP"; }

# TYPE|KEY|PARENT_KEY|TITLE|BODY
RECORDS='
Initiative|i1||Run the hosted event pilot (24-25 Nov)|Outcome: the Madrid gathering runs on Trip Planner and we get the signals in docs/specs/002-hosted-event-pilot.md section 11. Build 12-19 Nov, cut-line check 17 Nov, dry run 20 Nov, event 24-25 Nov.
Epic|e1|i1|[002] Organizations, trip roles and TripMember migration|Spec 002 section 12 part 1 (Must). Requirements F1-F7, acceptance criteria 1-4.
Story|s1a|e1|Create an Organization and add admins|Spec 002 F1, F2. AC 1.
Story|s1b|e1|Trip roles host, co-host and guest behind one capability helper|Spec 002 F3, F4, F5. AC 2.
Story|s1c|e1|Guest permissions differ for hosted and personal trips|Spec 002 F6. AC 3.
Task|s1d|e1|Migrate Trip.members to TripMember, idempotent, backup first|Spec 002 F7, section 7.2. AC 4.
Epic|e2|i1|[002] Google sign-in|Spec 002 section 12 part 2 (Must). Requirements F8-F10, acceptance criteria 5, 7, 8.
Story|s2a|e2|Continue with Google from the join page|Spec 002 F8, F9. AC 5, 7.
Task|s2b|e2|POST /api/auth/firebase verifies the ID token and returns our JWT|Spec 002 section 7.2.
Story|s2c|e2|Email and password keep working for existing accounts|Spec 002 F10. AC 8.
Epic|e3|i1|[002] Invite link, requests and approval|Spec 002 section 12 part 3 (Must). Requirements F11-F17, acceptance criteria 9-14.
Story|s3a|e3|Host creates, copies and revokes one active invite link|Spec 002 F11. AC 9, 13.
Story|s3b|e3|The join page shows only name, dates, host and cover|Spec 002 F12. AC 9.
Story|s3c|e3|A signed-in visitor sends a join request|Spec 002 F13. AC 10.
Story|s3d|e3|Host approves or declines, including Approve all|Spec 002 F14, F16. AC 12.
Story|s3e|e3|A requester sees nothing and gets no socket events until approved|Spec 002 F15. AC 11.
Story|s3f|e3|People invited by email skip approval|Spec 002 F17. AC 14.
Epic|e4|i1|[002] Pilot localization: event time zone and new strings|Spec 002 section 12 part 4 (Must). Requirements F33, F35, acceptance criteria 26, 28. Builds on spec 003.
Story|s4a|e4|Every new screen ships with en, es and pt strings|Spec 002 F33.
Story|s4b|e4|Times show in the event time zone, labelled|Spec 002 F35. AC 28.
Story|s4c|e4|The join page works logged out in the visitor language|Spec 002 section 5.5. AC 26.
Epic|e5|i1|[002] Analytics events and CSV export|Spec 002 section 12 part 5 (Must). Requirements F30-F32, acceptance criterion 25.
Story|s5a|e5|Record the 17 pilot events with pseudonymous ids and no content|Spec 002 F30, F31, N3. AC 25.
Task|s5b|e5|CSV export of a trip analytics events for the retro|Spec 002 F32.
Epic|e6|i1|[002] Agenda import as a reviewable draft|Spec 002 section 12 part 6 (Must). Requirements F18-F23, F37, acceptance criteria 15-20.
Story|s6a|e6|Import an agenda by paste or file upload|Spec 002 F18. AC 20.
Story|s6b|e6|AI returns a draft with confidence flags on uncertain items|Spec 002 F19, F20. AC 15, 17.
Story|s6c|e6|Host reviews, edits and publishes or discards the draft|Spec 002 F21, F22. AC 16, 18.
Story|s6d|e6|Drafts keep the source language and are never translated|Spec 002 F37.
Epic|e7|i1|[002] Announcements with pin and unread|Spec 002 section 12 part 7 (Must). Requirements F25, F26, acceptance criteria 21, 23.
Story|s7a|e7|Host posts, pins, unpins and deletes announcements|Spec 002 F25. AC 23.
Story|s7b|e7|Announcements appear live with unread state per member|Spec 002 F26. AC 21.
Epic|e8|i1|[002] Notification categories|Spec 002 section 12 part 8 (Should, falls back to one mute switch). F27-F29. AC 22, 24.
Epic|e9|i1|[002] Email-link sign-in|Spec 002 section 12 part 9 (Should, falls back to email and password). F8. AC 6.
Epic|e10|i1|[002] Language saved to the account and localized push|Spec 002 section 12 part 10 (Should). F34, F36. AC 27, 29, 31.
Epic|e11|i1|[002] Generate itinerary as draft, Q&A context, web manifest|Spec 002 section 12 part 11 (Should). F23, F24, section 7.2. AC 19.
Task|t1a|i1|Lo-fi wireframes for the 13 frames|Spec 002 section 6. Save in wireframes/002-hosted-event-pilot/ and link from the spec.
Task|t1b|i1|Dry run on Fri 20 Nov with 3 to 5 people|Spec 002 section 12 step 4. Personal Google account, work mailbox email link, iPhone, Android, all three languages.
Initiative|i2||Prove the offsites model and decide D3|Outcome: D3 is decided on pilot evidence and a second event runs without hand-holding. Target 19 Dec. See working-doc.md section 3 and revenue-models-analysis.md.
Spike|s8a|i2|Pilot retro against the section 11 signals, and the D3 call|Spec 002 section 11 thresholds. Export analytics, run the survey, write the retro, then decide D3.
Epic|e12|i2|RSVP, capacity, check-in and guest forms|working-doc.md section 4.1 item 9. Phase 1. No spec yet.
Epic|e13|i2|Organization home: trips, members and settings|working-doc.md section 4.1 item 10. Phase 1. No spec yet.
Epic|e14|i2|Public share page|working-doc.md section 4.1 item 11. Phase 1-2. No spec yet.
Initiative|i3||Close the gaps in what is already built|Outcome: features.md matches the code and the known defects are gone. Target 5 Dec. See roadmap.md next priorities.
Task|s9a|i3|Confirm expense settlement is complete and update features.md|roadmap.md next priority 1. computeSettlements exists in server/routes/expenses.js and the client shows Settle up.
Story|s9b|i3|Real-time gaps: emit Q&A events, listen for accommodation changes|working-doc.md section 4.1 item 7.
Epic|e15|i3|Activity feed: read endpoint, UI, log polls and expenses|working-doc.md section 4.1 item 8. Found while building spec 001.
Task|s9c|i3|Remove duplicate Mongoose index definitions|roadmap.md next priority 5.
Task|s9d|i3|Fix the Redis URL configuration|roadmap.md next priority 5.
Initiative|i4||Transport awareness|Outcome: members are alerted to delays that affect the schedule. Phase 5, not started. No target date: blocked on provider and budget (TBD).
Spike|s10a|i4|Choose a transport data provider, coverage and budget|roadmap.md next priority 2. Blocks the alert flow.
Epic|e16|i4|Transport delay alerts|roadmap.md phase 5. No spec yet.
'

echo "$RECORDS" | grep -v '^[[:space:]]*$' | while IFS='|' read -r TYPE KEY PARENT TITLE BODY; do
  if [ -n "$DRY_RUN" ]; then
    printf '%-10s %-5s parent=%-4s %s\n' "$TYPE" "$KEY" "${PARENT:--}" "$TITLE"
    continue
  fi

  URL=$(gh issue create --repo "$REPO" --title "$TITLE" --body "$BODY")
  NUM="${URL##*/}"
  put_key "$KEY" "$NUM"

  gh api --method PATCH "repos/$REPO/issues/$NUM" -f "type=$TYPE" >/dev/null \
    || echo "  ! could not set type $TYPE on #$NUM"

  if [ -n "$PARENT" ]; then
    PNUM=$(get_key "$PARENT")
    CID=$(gh api "repos/$REPO/issues/$NUM" --jq '.id')
    gh api --method POST "repos/$REPO/issues/$PNUM/sub_issues" -F "sub_issue_id=$CID" >/dev/null \
      || echo "  ! could not link #$NUM under #$PNUM"
  fi

  echo "  #$NUM $TYPE  $TITLE"
done

echo
echo "Done. Still to do by hand on the board, on epics only:"
echo "  Layer, Phase and Revenue Model  (see the tables in docs/process/tracker.md)"
echo "  Start date and Target date on the four initiatives"
