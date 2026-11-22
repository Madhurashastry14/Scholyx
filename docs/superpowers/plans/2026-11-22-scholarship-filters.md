# Scholarship Filters Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the scholarship page's free-text category/state/course filters with API-backed dropdowns, restyle the filter sidebar, and show applied filters as removable chips.

**Architecture:** A new read-only DRF endpoint lists option values used by active scholarships. The React page loads those options once, passes them into the filter sidebar, and keeps the existing `filters`/`appliedFilters` state shape so search, pagination, and clearing continue to work.

**Tech Stack:** Django 5 + Django REST Framework, MySQL; React 19 + Vite; plain CSS with the tokens in `frontend/src/styles/global.css`.

**Spec:** `docs/superpowers/specs/2026-11-22-scholarship-filters-design.md`

## Global Constraints

- Filter values are matched by the backend against `code` or `name`, case-insensitively. Dropdown `value` is `code` when present, otherwise `name`.
- Only options attached to at least one `status=active` scholarship may be returned.
- No new npm or Python dependencies.
- Keep the existing filter state keys exactly: `category`, `state`, `course`, `min_amount`.
- Keep the existing mobile toggle behavior: below 650px the panel is hidden until "Show Filters" is pressed, and closes after Apply or Clear.
- Use the existing CSS variables: `--navy`, `--teal`, `--dark-teal`, `--background`, `--white`, `--text`, `--secondary`, `--border`, `--gold`.
- Backend commands run from `backend/` with `.\venv\Scripts\python.exe`. Frontend commands run from `frontend/`.

## Review Focus

- Filter-options request fails or times out: the listing must still render and the three filters must remain usable as text inputs.
- User picks a dropdown value, then presses Clear all: all selects return to "All …" and the listing reloads unfiltered.
- User removes one chip: only that filter is cleared; search, other filters, and the current results stay intact.
- Amount preset clicked after typing an amount: the preset value replaces the typed value and the active preset highlights correctly.
- Chip labels show the human option name (e.g. "Karnataka"), never the raw code ("KA").
- Changing or removing a filter always resets to page 1.

---

### Task 1: Repair paginated listing test assertions

The last commit enabled pagination on the listing endpoint but left the older tests indexing `response.data` as a list, so the suite currently has 3 failures and 19 errors. Fix the assertions before adding anything.

**Files:**
- Modify: `backend/scholarships/tests.py`

**Interfaces:**
- Consumes: nothing.
- Produces: a green `manage.py test scholarships` baseline for later tasks.

- [ ] **Step 1: Run the suite and record the baseline**

Run: `.\venv\Scripts\python.exe manage.py test scholarships -v 1`
Expected: FAILED (failures=3, errors=19), all from `response.data` being a pagination dict.

- [ ] **Step 2: Update listing assertions to read the `results` key**

In `ScholarshipAPITests` and `ScholarshipSearchAPITests`, every place that treats `response.data` as a list becomes `response.data["results"]`. Concretely:
- `test_listing_returns_only_active_scholarships`: assert `len(response.data["results"]) == 1` and `response.data["results"][0]["name"]`.
- `test_empty_listing_returns_empty_list`: assert `response.data["results"] == []`.
- `test_search_matches_name_provider_and_description`: iterate `response.data["results"]` and compare `len(...) == 3`.
- `test_amount_deadline_and_active_filters`: compare id lists from `response.data["results"]` and assert `len(response.data["results"]) == 2`.
- `test_eligibility_filters_match_option_codes_and_values`: compare id lists from `response.data["results"]`.
- `test_combined_filters_and_empty_results`: compare id lists from `response.data["results"]` and assert `response.data["results"] == []`.

- [ ] **Step 3: Run the suite to verify it is green**

Run: `.\venv\Scripts\python.exe manage.py test scholarships -v 1`
Expected: `OK` (15 tests).

- [ ] **Step 4: Commit**

```bash
git add backend/scholarships/tests.py
git commit -m "test: assert against paginated scholarship responses"
```

---

### Task 2: Add the filter-options endpoint

**Files:**
- Modify: `backend/scholarships/views.py`
- Modify: `backend/scholarships/urls.py`
- Test: `backend/scholarships/tests.py`

**Interfaces:**
- Produces: `GET /api/scholarships/filter-options/` → `{"categories": [{"value": str, "label": str}], "states": [...], "courses": [...]}`. URL name: `scholarship-filter-options`.

- [ ] **Step 1: Write the failing tests**

Append a new class to `backend/scholarships/tests.py`:

```python
class ScholarshipFilterOptionsTests(APITestCase):
    def setUp(self):
        self.url = reverse("scholarship-filter-options")

    def create_scholarship(self, name, status=Scholarship.Status.ACTIVE):
        return Scholarship.objects.create(
            name=name,
            provider="Provider",
            description="Description",
            amount=Decimal("1000.00"),
            deadline="2027-06-30",
            status=status,
        )

    def test_endpoint_is_public(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data,
            {"categories": [], "states": [], "courses": []},
        )

    def test_returns_only_options_used_by_active_scholarships(self):
        active = self.create_scholarship("Active")
        self.create_scholarship("Draft", status=Scholarship.Status.DRAFT)
        active.category.add(Category.objects.create(code="OBC", name="OBC"))
        active.state.add(State.objects.create(code="KA", name="Karnataka"))
        active.course.add(Course.objects.create(code="BE_BTECH", name="Engineering"))
        Category.objects.create(code="SC", name="Scheduled Caste")

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data["categories"],
            [{"value": "OBC", "label": "OBC"}],
        )
        self.assertEqual(
            response.data["states"],
            [{"value": "KA", "label": "Karnataka"}],
        )
        self.assertEqual(
            response.data["courses"],
            [{"value": "BE_BTECH", "label": "Engineering"}],
        )

    def test_uses_name_as_value_when_code_is_missing(self):
        active = self.create_scholarship("Active")
        active.category.add(Category.objects.create(name="General"))

        response = self.client.get(self.url)

        self.assertEqual(
            response.data["categories"],
            [{"value": "General", "label": "General"}],
        )

    def test_options_are_ordered_by_label_and_deduplicated(self):
        active = self.create_scholarship("Active")
        active.state.add(State.objects.create(code="WB", name="West Bengal"))
        active.state.add(State.objects.create(code="AP", name="Andhra Pradesh"))
        active.state.add(State.objects.create(code=None, name="Andhra Pradesh"))

        response = self.client.get(self.url)

        self.assertEqual(
            response.data["states"],
            [
                {"value": "AP", "label": "Andhra Pradesh"},
                {"value": "WB", "label": "West Bengal"},
            ],
        )
```

- [ ] **Step 2: Run the new tests to verify they fail**

Run: `.\venv\Scripts\python.exe manage.py test scholarships.tests.ScholarshipFilterOptionsTests -v 1`
Expected: ERROR/FAIL because `scholarship-filter-options` is not a valid URL name.

- [ ] **Step 3: Implement the view and URL**

In `backend/scholarships/views.py`, add imports for `APIView`, `Response`, and the option models, then add:

```python
OPTION_MODELS = {
    "categories": Category,
    "states": State,
    "courses": Course,
}


def serialize_options(model):
    options = []
    seen = set()
    queryset = (
        model.objects.filter(scholarships__status=Scholarship.Status.ACTIVE)
        .distinct()
        .order_by("name")
    )
    for option in queryset:
        value = option.code or option.name
        if value in seen:
            continue
        seen.add(value)
        options.append({"value": value, "label": option.name})
    return options


class ScholarshipFilterOptionsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response(
            {
                key: serialize_options(model)
                for key, model in OPTION_MODELS.items()
            }
        )
```

In `backend/scholarships/urls.py`, import `ScholarshipFilterOptionsView` and add before the detail route:

```python
path(
    "scholarships/filter-options/",
    ScholarshipFilterOptionsView.as_view(),
    name="scholarship-filter-options",
),
```

- [ ] **Step 4: Run the new tests to verify they pass**

Run: `.\venv\Scripts\python.exe manage.py test scholarships.tests.ScholarshipFilterOptionsTests -v 1`
Expected: `OK` (4 tests).

- [ ] **Step 5: Run the full scholarship suite**

Run: `.\venv\Scripts\python.exe manage.py test scholarships -v 1`
Expected: `OK` (19 tests).

- [ ] **Step 6: Commit**

```bash
git add backend/scholarships/views.py backend/scholarships/urls.py backend/scholarships/tests.py
git commit -m "feat: expose scholarship filter options"
```

---

### Task 3: Load filter options and wire chips state into the page

**Files:**
- Modify: `frontend/src/services/api.js`
- Modify: `frontend/src/pages/Scholarships.jsx`

**Interfaces:**
- Consumes: `GET /api/scholarships/filter-options/` from Task 2.
- Produces: `fetchScholarshipFilterOptions({ signal } = {})` returning the options object; `filterOptions` state passed to `ScholarshipFilters` as `options`; `removeFilter(key)` callback for Task 5's chips.

- [ ] **Step 1: Add the API helper**

Append to `frontend/src/services/api.js`:

```js
// PUBLIC SCHOLARSHIP FILTER OPTIONS API
export function fetchScholarshipFilterOptions({ signal } = {}) {
  return apiRequest("scholarships/filter-options/", { signal });
}
```

- [ ] **Step 2: Load options and track the result count in the page**

In `frontend/src/pages/Scholarships.jsx`:
- Import `fetchScholarshipFilterOptions`.
- Add `const [filterOptions, setFilterOptions] = useState({ categories: [], states: [], courses: [] });`.
- Add a mount-only effect that fetches options with an `AbortController`, ignores `AbortError`, and leaves the empty defaults on any other failure.
- Compute `activeCount` from `appliedFilters` values that are not `""`, `null`, or `undefined`.
- Pass `options={filterOptions}` and `activeCount={activeCount}` to `ScholarshipFilters`.

- [ ] **Step 3: Verify the frontend still builds**

Run: `npm run lint` and `npm run build` from `frontend/`.
Expected: both exit 0.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/services/api.js frontend/src/pages/Scholarships.jsx
git commit -m "feat: load scholarship filter options"
```

---

### Task 4: Rebuild the filter sidebar

**Files:**
- Modify: `frontend/src/components/ScholarshipFilters.jsx`
- Modify: `frontend/src/styles/scholarships.css`

**Interfaces:**
- Consumes: `options` prop `{ categories, states, courses }`, each an array of `{ value, label }`; `activeCount` number.
- Produces: the same `filters` shape via `setFilters`; calls `onApply` and `onClear`.

- [ ] **Step 1: Implement the redesigned panel**

In `frontend/src/components/ScholarshipFilters.jsx`:
- Accept `{ filters, setFilters, options, activeCount, onApply, onClear }`.
- Keep the `handleChange` handler and the `<form onSubmit>` wrapper.
- Header: `<h2>Filters</h2>`, a count badge `<span className="filter-count">{activeCount}</span>` rendered only when `activeCount > 0`, and a pill button `.clear-all-btn` calling `onClear`.
- For each of category/state/course, render a select when its options array has at least one entry, otherwise the existing text input. Use a shared `SelectFilter`/`TextField` local component or repeat the JSX; the select must have an "All {label}" option with `value=""`.
- Wrap each select in `.filter-select-wrap` for the chevron.
- Minimum award: `.amount-input` wrapper with `<span className="amount-prefix">₹</span>`, `type="number"`, `min="0"`, `inputMode="numeric"`, label "Minimum award".
- Presets under the amount field: `[{ label: "Any", value: "" }, { label: "₹10k+", value: "10000" }, { label: "₹50k+", value: "50000" }, { label: "₹1L+", value: "100000" }]`. Clicking sets `min_amount`; the active class compares `String(filters.min_amount) === String(value)` (treat `""` and `"0"` as Any).
- Apply button text "Apply Filters" with a small inline filter SVG.

- [ ] **Step 2: Style the panel**

In `frontend/src/styles/scholarships.css`:
- Make `.scholarship-filters` sticky on desktop: `position: sticky; top: 96px;` and reset to `static` inside the `max-width: 650px` block.
- Add `.filter-heading` alignment for the count badge; `.filter-count` small teal pill; `.clear-all-btn` bordered pill with hover.
- Add `.filter-select-wrap` with a CSS chevron (`::after` using a rotated border), and `.filter-select-wrap select` matching `.filter-group input` with `appearance: none`, `padding-right: 36px`, and `cursor: pointer`.
- Add `.amount-input` relative wrapper, `.amount-prefix` absolutely positioned muted ₹, and left padding on the amount input.
- Add `.amount-presets` flex-wrap row and `.preset-btn` / `.preset-btn.active` pill styles.
- Make `.apply-filters-btn` a flex row with centered icon and gap; add `:focus-visible` outlines for selects, inputs, presets, and buttons.

- [ ] **Step 3: Verify lint and build**

Run: `npm run lint` and `npm run build` from `frontend/`.
Expected: both exit 0.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/ScholarshipFilters.jsx frontend/src/styles/scholarships.css
git commit -m "feat: redesign scholarship filter sidebar"
```

---

### Task 5: Add active-filter chips

**Files:**
- Create: `frontend/src/components/ActiveFilterChips.jsx`
- Modify: `frontend/src/pages/Scholarships.jsx`
- Modify: `frontend/src/styles/scholarships.css`

**Interfaces:**
- Consumes: `filters` (applied filters object), `options` (`{ categories, states, courses }`), `onRemove(key)`, `onClearAll()`.
- Produces: default-exported `ActiveFilterChips` component used by `Scholarships.jsx`.

- [ ] **Step 1: Implement the component**

Create `frontend/src/components/ActiveFilterChips.jsx`:
- Build a `labelFor(list, value)` helper that returns the matching option label, falling back to the raw value.
- Build entries from `filters`:
  - `category` → `{ key: "category", label: "Category", text: labelFor(options.categories, value) }`
  - `state` → `{ key: "state", label: "State", text: labelFor(options.states, value) }`
  - `course` → `{ key: "course", label: "Course", text: labelFor(options.courses, value) }`
  - `min_amount` → `{ key: "min_amount", label: "Min award", text: "₹" + Number(value).toLocaleString("en-IN") }`
- Skip empty/null/undefined values. Return `null` when there are no entries.
- Render `.active-filters` with one `.filter-chip` per entry: `<span>{label}: {text}</span>` and a `<button type="button" aria-label={`Remove ${label} filter`} onClick={() => onRemove(key)}>×</button>`.
- When `entries.length > 1`, render a trailing `.filter-chip.clear-chip` button "Clear all" calling `onClearAll`.

- [ ] **Step 2: Render the chips on the page**

In `frontend/src/pages/Scholarships.jsx`:
- Add `removeFilter(key)` that sets both `filters[key]` and `appliedFilters[key]` to `""` and resets `page` to 1.
- Import `ActiveFilterChips` and render it directly below the search form, before the loading block:

```jsx
<ActiveFilterChips
  filters={appliedFilters}
  options={filterOptions}
  onRemove={removeFilter}
  onClearAll={clearFilters}
/>
```

- [ ] **Step 3: Style the chips**

In `frontend/src/styles/scholarships.css`, add `.active-filters`, `.filter-chip`, `.filter-chip button`, `.filter-chip:hover`, and `.clear-chip` styles using the existing palette. Chips wrap on narrow screens and keep a 32px minimum tap height.

- [ ] **Step 4: Verify lint and build**

Run: `npm run lint` and `npm run build` from `frontend/`.
Expected: both exit 0.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/ActiveFilterChips.jsx frontend/src/pages/Scholarships.jsx frontend/src/styles/scholarships.css
git commit -m "feat: add removable active filter chips"
```

---

### Task 6: Result summary, responsive checks, and full verification

**Files:**
- Modify: `frontend/src/pages/Scholarships.jsx`
- Modify: `frontend/src/styles/scholarships.css`

**Interfaces:**
- Consumes: `totalCount` and `scholarships.length` from Task 3.
- Produces: no new interfaces.

- [ ] **Step 1: Show the result count**

In `Scholarships.jsx`, add `const [totalCount, setTotalCount] = useState(0);`, set `setTotalCount(data.count || 0)` inside the existing load effect after `setScholarships`, and when `!loading && !error && totalCount > 0`, render `<p className="results-summary">Showing {scholarships.length} of {totalCount} scholarships</p>` between the chips and the grid. Add `.results-summary` styles (muted, 13px, margin-bottom 14px).

- [ ] **Step 2: Check the narrow layout**

Confirm in `scholarships.css` that at `max-width: 650px`:
- `.scholarship-filters` is `position: static`,
- the panel is still hidden unless `.filter-panel.open`,
- `.active-filters` wraps and chips remain tappable,
- `.amount-presets` wraps.

- [ ] **Step 3: Run backend and frontend verification**

Run from `backend/`: `.\venv\Scripts\python.exe manage.py test scholarships -v 1`
Expected: `OK` (19 tests).

Run from `frontend/`: `npm run lint` then `npm run build`.
Expected: both exit 0.

- [ ] **Step 4: Smoke test manually**

Start `python manage.py runserver` and `npm run dev`. On `/scholarships`:
- Dropdowns list real values; choosing one and applying filters the grid.
- The chip appears with the readable label; removing it restores results and leaves any other active filters and the search text untouched.
- Type an amount, then click a preset: the preset replaces the value and highlights; "Any" clears it.
- Clear all resets selects, amount, chips, search, and page 1.
- A filter with no matches shows the empty state.
- In devtools, block `scholarships/filter-options/` and reload: the listing still loads and the three filters render as text inputs.
- At a narrow viewport, "Show Filters" opens the panel and Apply closes it; chips wrap without horizontal scrolling.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/Scholarships.jsx frontend/src/styles/scholarships.css
git commit -m "feat: polish scholarship results and responsive filters"
```
