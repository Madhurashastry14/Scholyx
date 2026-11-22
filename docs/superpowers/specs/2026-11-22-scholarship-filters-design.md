# Scholarship Filters — Design

Date: 2026-11-22
Status: Awaiting approval

## Intent

The scholarship listing page's filter sidebar looks plain (four stacked
text boxes, a text-link "Clear All", one button) and is easy to get
wrong: category, state, and course are free-text fields, but the backend
only accepts an exact option code or name. A typo returns HTTP 400 and
the page shows a generic "Unable to load scholarships" message.

Goal: make the filters look finished and make them impossible to
misuse, without changing the rest of the listing page.

## Goals

- Replace category, state, and course text inputs with dropdowns whose
  options come from the backend, limited to values used by active
  scholarships.
- Show applied filters as removable chips above the results.
- Make the sidebar visually consistent with the rest of Scholyx: clear
  hierarchy, labeled groups, currency affordance, proper button states.
- Keep the current page layout (sidebar + card grid), mobile toggle, and
  existing filter semantics.

## Non-goals

- No new filters for branch, district, gender, or year of study, even
  though the API supports them.
- No max-amount filter or amount range slider; minimum award only.
- No URL/query-string persistence, no filter counts on options, no
  changes to the scholarship cards or search behavior.

## Constraints

- Backend matches options by `code` or `name`, case-insensitively
  (`backend/scholarships/views.py:52-58`). Dropdown values should be the
  option `code` when present, otherwise `name`.
- The listing serializer does not include category/state/course, so
  options cannot be derived from the loaded page.
- Existing design tokens in `frontend/src/styles/global.css` (navy,
  teal, border, etc.) are the visual source of truth.
- The project runs Django + DRF with MySQL; tests use DRF `APITestCase`.

## Approaches considered

1. **CSS-only polish** — keep free-text inputs, restyle them. Fast, but
   leaves the exact-match typing trap in place. Rejected.
2. **Dropdown sidebar + active-filter chips** — add one read-only
   options endpoint, swap three inputs for selects, keep the sidebar,
   add removable chips. Fixes correctness and appearance with a
   contained diff. **Chosen.**
3. **Horizontal filter bar** — remove the sidebar and move filters into
   a toolbar above a 3-column grid. Most dramatic, but rewrites the page
   layout and was more change than the complaint calls for. Rejected.

## Chosen design

### Backend

- New `GET /api/scholarships/filter-options/`, public (`AllowAny`).
- Response:
  ```json
  {
    "categories": [{ "value": "OBC", "label": "Other Backward Class" }],
    "states":     [{ "value": "KA",  "label": "Karnataka" }],
    "courses":    [{ "value": "BE_BTECH", "label": "Engineering" }]
  }
  ```
- Only options attached to at least one `status=active` scholarship are
  returned, so every choice can produce results.
- `value` is `code` when set, else `name`; `label` is `name`. Results are
  ordered by label and de-duplicated by value.
- Implemented as a small `APIView` in `scholarships/views.py`, wired in
  `scholarships/urls.py`.
- Tests: public access, only active-scholarship options, `code` used as
  value when present, name fallback when code is null.

### Frontend data flow

- `api.js` gains `fetchScholarshipFilterOptions()`.
- `Scholarships.jsx` loads options once on mount and passes them to the
  filters. Failure is non-fatal: the list still renders.
- If options fail to load, the three dropdowns fall back to the existing
  text inputs so the page remains usable.
- Filter state shape is unchanged (`category`, `state`, `course`,
  `min_amount`), so applying, clearing, and pagination keep working.

### Filter panel

- Header: "Filters" with a count badge of currently applied filters, and
  a pill-styled "Clear all".
- Groups: Category, State, Course as native `<select>` elements with
  custom chevron styling; an "All …" default option.
- Minimum award: number input with a ₹ prefix inside the field plus
  quick presets (Any, ₹10k+, ₹50k+, ₹1L+) that set the value.
- Apply button full width with a filter icon; hover and focus-visible
  states.
- Sidebar becomes `position: sticky` on desktop below the navbar.
- Mobile toggle and panel open/close behavior stay as they are.

### Active-filter chips

- Rendered above the results grid, below the search form, whenever at
  least one filter is applied.
- Each chip shows a human label ("Category: OBC") and removes only that
  filter, resetting to page 1.
- A "Clear all" chip is shown when more than one filter is active.
- Chips are keyboard accessible and use the existing teal/navy palette.

### Files touched

- `backend/scholarships/views.py`, `urls.py`, `tests.py`
- `frontend/src/services/api.js`
- `frontend/src/pages/Scholarships.jsx`
- `frontend/src/components/ScholarshipFilters.jsx`
- `frontend/src/styles/scholarships.css`

## Left to the builder

- Exact chip labels and preset amounts.
- Whether the result count ("Showing X of Y") is included; if included,
  reuse the `count` already returned by the listing API.
- Icon choice (inline SVG vs. no icons) where it affects file size.
