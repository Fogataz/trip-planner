# Current Features

This page describes what the product does today, based on the server code in `server/`. It is a reference for product and design discussions, not a specification.

## Accounts

- Sign up and log in with email and password (`POST /api/auth/signup`, `POST /api/auth/login`)
- Sessions use a token that expires after 7 days
- Token check endpoint (`POST /api/auth/verify`)

## Trips

- Create, list, view, update and delete trips
- Each trip has a name, destination, origin, start and end dates, and accommodation
- Only active members can view a trip, and only the organizer can change or delete it (see `server/routes/trips.js`)

## Members and invitations

- Invite people to a trip by email. Invitations can be resent or cancelled
- Accept an invitation with its token
- Change a member's role, or remove members

## Itinerary

- Add, edit and delete itinerary items (stop, time, transport, notes)
- Generate an itinerary suggestion with AI from the trip's details (`POST /api/trips/:groupId/itinerary/generate`)
- Live presence shows who is viewing or editing an item

## Polls

- Create polls, vote, close a poll, and delete it

## Expenses

- Add, list and delete shared expenses per trip

## Comments

- Post and read comments on a trip

## Live features

- **Presence:** see who is currently viewing a trip
- **Live location:** opt in to share your location with trip members. It is not saved, and it expires after 5 minutes without an update

## Notifications

- Register and unregister a device for push notifications

## Activity log

- The server records trip activity through `server/services/activityLogger.js`

**Note:** the README lists `websocket/` and `services/` as "coming later". Both exist now. Keep the README in sync when it changes.
