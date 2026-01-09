# Frontend Layout and Navigation

This document summarizes the current DotVacay WebNg UI layout, screens, and how users move between screens and modals.

## Routes and Screens

- `/` (Home)
  - Top header with logo (links to `/`) and auth buttons.
  - Hero section with headline, short description, and "Start planning" CTA.
  - Links:
    - "Log in" -> `/login`
    - "Sign up" -> `/register`
    - "Start planning" -> `/login`

- `/login` (Login)
  - Centered form (max-width 400px).
  - Fields: email, password.
  - Submit button with loading state.
  - Footer link: "Register" -> `/register`.
  - On success: redirect to `/trips`.

- `/register` (Register)
  - Centered card with form.
  - Fields: first name, last name, email, password, confirm password.
  - Submit button with loading state.
  - Footer link: "Log in" -> `/login`.
  - On success: redirect to `/trips`.

- `/trips` (Trips List, auth required)
  - App header (logo -> `/trips`, profile dropdown).
  - Page header with title and "Plan new trip" button.
  - Grid of trip cards (2-3 columns responsive).
  - Empty state alert if no trips.
  - Modal: "Plan New Trip" (EditTripModal).

- `/trip/:id` (Trip Detail, auth required)
  - App header (logo -> `/trips`, profile dropdown).
  - Trip hero banner with overlay image.
  - Trip summary card: title, dates, description, and owner actions (delete or leave).
  - Daily Itinerary list:
    - Repeated "Trip Day" cards.
    - Each day card shows optional weather, action buttons, and POI list.
  - Modal: "Edit/Add Point of Interest" (EditPoiModal).

- `/profile` (Profile, auth required)
  - App header (logo -> `/trips`, profile dropdown).
  - Centered profile card with avatar, name, and email.

## Shared UI Components

- App header (`app-header`)
  - Logo -> `/trips`.
  - Profile dropdown:
    - "My Profile" -> `/profile`
    - "Logout" -> `/` (also clears auth).

- Trip list item (`trip-list-item`)
  - Clickable card linking to `/trip/:id`.
  - Shows banner image, title, description, date range.
  - Owner-only delete button on the card image (does not navigate).

- Trip day (`trip-day`)
  - Day header with date and optional weather summary.
  - Actions:
    - "AI Suggestions" (triggers suggestion request for that day).
    - "Add Point of Interest" (opens edit/add POI modal).
  - Body:
    - Empty state message when no POIs.
    - List of POI cards, each using `poi-list-item`.

- POI list item (`poi-list-item`)
  - Icon based on POI type.
  - Title, optional timing, description.
  - "View on Map" external link if coordinates exist.
  - Actions:
    - Edit (opens edit/add POI modal via parent).
    - Delete (confirmation dialog, then refresh).

## Modals

- EditTripModal (used on `/trips`)
  - Trigger: "Plan new trip" button.
  - Fields: location (search), description, start date, end date.
  - Hidden fields: latitude, longitude.
  - On save: closes modal and refreshes trip list.

- EditPoiModal (used on `/trip/:id`)
  - Trigger:
    - "Add Point of Interest" in a day card.
    - Edit action in a POI list item.
  - Fields: location (search), description, type, start time, end time.
  - Hidden fields: latitude, longitude.
  - On save: closes modal and refreshes trip details.

## Screen-to-Screen Connections

- Home -> Login/Register (header buttons and CTA).
- Login/Register -> Trips (success redirect).
- App header logo -> Trips (global).
- App header "My Profile" -> Profile.
- App header "Logout" -> Home.
- Trips list item -> Trip detail.

## Screen-to-Modal Connections

- Trips list -> EditTripModal.
- Trip detail -> EditPoiModal.
- Trip day -> EditPoiModal (add).
- POI list item -> EditPoiModal (edit).
