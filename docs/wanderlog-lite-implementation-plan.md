# Wanderlog Gap Closure Plan (Lightweight)

This document translates the Wanderlog comparison into an implementation-ready plan for DotVacay, optimized for a lightweight and easy-to-use product.

## Goals

1. Keep core planning simple and fast.
2. Add high-value features without introducing heavy operational complexity.
3. Preserve Clean Architecture boundaries already used in DotVacay.

---

## Phase 1 — High impact, low complexity (2–3 sprints)

### 1) Functional Map tab in Trip Detail

**User value**
- Users can switch from timeline to a visual map of all POIs for a trip/day.
- Faster orientation and daily planning.

**Scope**
- Add `Map` view toggle on trip detail page.
- Render trip POIs as markers.
- Add day filter (`All days` + per-day).
- Clicking marker highlights corresponding POI card.

**Backend**
- Reuse existing `GET /PointOfInterest/getAll/{tripId}`.
- No schema change required.

**Frontend**
- New standalone `trip-map-view` component.
- Input: trip + POIs + selected day.
- Keep existing daily itinerary unchanged.

**Acceptance criteria**
- Users can open Map view from trip detail.
- Markers render for all POIs with valid coordinates.
- Day filter updates visible markers.

---

### 2) Reorder POIs within a day (manual)

**User value**
- Improves daily plan quality quickly.

**Scope**
- Drag/drop POIs in a day list.
- Persist order using existing `TripDayIndex` updates.

**Backend**
- Reuse `PATCH /PointOfInterest/update/{id}/tripDayIndex`.
- Add batch endpoint only if needed after performance testing.

**Frontend**
- Use Angular CDK drag-drop in `trip-day` component.
- On drop, recalculate and persist indexes.

**Acceptance criteria**
- Drag/drop changes visual order instantly.
- Reload keeps order.
- Failed updates show non-blocking error toast and rollback.

---

### 3) Share UX improvements

**User value**
- Easier collaboration onboarding.

**Scope**
- Add “Invite” section in trip detail.
- Include join instructions and quick copy actions.
- Keep existing join endpoint and role model.

**Backend**
- Reuse `POST /Trip/join`.

**Frontend**
- Add small invite panel/modal.
- Provide default role selector (`Viewer`, `Editor`).

**Acceptance criteria**
- Existing member can copy invite guidance quickly.
- New member can join with clear flow and role selection.

---

## Phase 2 — Lean differentiators (2–3 sprints)

### 4) Lite budget tracking

**User value**
- Quickly estimate trip spend without complex accounting.

**Scope**
- Add optional cost fields to POI.
- Add optional trip budget cap.
- Show planned total and remaining budget.

**Data model proposal**
- `PointOfInterest`: `EstimatedCost`, `Currency`.
- `Trip`: `BudgetAmount`, `BudgetCurrency`.

**Acceptance criteria**
- Users can set optional costs and budget cap.
- Trip detail displays totals and remaining amount.

---

### 5) ICS export

**User value**
- Export itinerary to calendar apps.

**Scope**
- Add `GET /Trip/{id}/export.ics`.
- Include POIs with start/end dates.

**Acceptance criteria**
- Downloaded ICS imports correctly in Google/Apple Calendar.

---

### 6) Lightweight attachments (URL-first)

**User value**
- Keep booking references and tickets accessible.

**Scope**
- Start with URL attachments (no file storage yet).
- Attach links to trip or POI.

**Acceptance criteria**
- Users can add, edit, delete URL references.

---

## Phase 3 — Optional polish

### 7) Activity feed

- Track key events: POI added/updated/deleted, date changes, list changes.
- Show compact timeline in trip detail.

### 8) Trip templates

- Duplicate trip as template.
- Create new trip from template.

---

## Out-of-scope for now (to stay lightweight)

- Deep booking provider integrations.
- Expense splitting and settlements.
- Offline-first sync engine.
- Real-time collaborative cursors/chat.
- File upload pipeline (S3/Blob + scanning + retention policies).

---

## Recommended implementation order

1. Map tab
2. Reorder POIs
3. Invite UX
4. Lite budget
5. ICS export
6. URL attachments

This sequence maximizes user-visible value while minimizing migration and infrastructure risk.

---

## Technical guardrails

- Keep controllers thin and preserve service-layer orchestration.
- Use existing result pattern (`Success`, `Data`, `Errors`).
- Prefer additive schema changes with nullable fields.
- Keep first iterations backend-simple and UI-focused.
- Avoid touching deprecated `DotVacay.Web`; implement in `DotVacay.WebNg` and API layers.

---

## Definition of done (for each feature)

- API contract documented and version-safe.
- UI path is discoverable with no new onboarding needed.
- Basic telemetry/logging for failures.
- Happy path + at least one failure-path test (where test infrastructure exists).
- Feature included in release notes.
