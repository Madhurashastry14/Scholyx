const AMOUNT_PRESETS = [
  { label: "Any", value: "" },
  { label: "₹10k+", value: "10000" },
  { label: "₹50k+", value: "50000" },
  { label: "₹1L+", value: "100000" },
];

const ICONS = {
  category: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M20.6 13.4 12 22l-9-9V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z" />
      <circle cx="7.5" cy="7.5" r="1.4" />
    </svg>
  ),
  state: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.4" />
    </svg>
  ),
  course: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5Z" />
      <path d="M4 5.5v16" />
    </svg>
  ),
  amount: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 4h12M6 8h12M15.5 8c0 3.2-2.4 5-6 5H6l8 7" />
    </svg>
  ),
};

function FilterLabel({ htmlFor, icon, children }) {
  return (
    <label htmlFor={htmlFor}>
      <span className="filter-label-icon" aria-hidden="true">
        {ICONS[icon]}
      </span>
      {children}
    </label>
  );
}

function SelectField({
  id,
  name,
  label,
  icon,
  placeholder,
  options,
  value,
  onChange,
  status,
  allLabel,
}) {
  if (status === "failed") {
    return (
      <div className="filter-group">
        <FilterLabel htmlFor={id} icon={icon}>
          {label}
        </FilterLabel>
        <input
          id={id}
          name={name}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
      </div>
    );
  }

  return (
    <div className="filter-group">
      <FilterLabel htmlFor={id} icon={icon}>
        {label}
      </FilterLabel>
      <div className="filter-select-wrap">
        <select
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          disabled={status === "loading"}
        >
          <option value="">
            {status === "loading" ? "Loading options…" : allLabel}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function ScholarshipFilters({
  filters,
  setFilters,
  options = { categories: [], states: [], courses: [] },
  optionsStatus = "loading",
  activeCount,
  onApply,
  onClear,
}) {
  const amountValue =
    filters.min_amount === "" ? null : Number(filters.min_amount);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFilters((previousFilters) => ({
      ...previousFilters,
      [name]: value,
    }));
  };

  const setMinAmount = (value) => {
    setFilters((previousFilters) => ({
      ...previousFilters,
      min_amount: value,
    }));
  };

  return (
    <aside className="scholarship-filters">
      <div className="filter-heading">
        <div className="filter-heading-title">
          <h2>Filters</h2>
          {activeCount > 0 && (
            <span className="filter-count" aria-label={`${activeCount} filters applied`}>
              {activeCount}
            </span>
          )}
        </div>
        <button type="button" className="clear-all-btn" onClick={onClear}>
          Clear all
        </button>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          onApply();
        }}
      >
        <SelectField
          id="category"
          name="category"
          label="Category"
          icon="category"
          placeholder="Enter category"
          options={options.categories || []}
          value={filters.category}
          onChange={handleChange}
          status={optionsStatus}
          allLabel="All categories"
        />

        <SelectField
          id="state"
          name="state"
          label="State"
          icon="state"
          placeholder="Enter state"
          options={options.states || []}
          value={filters.state}
          onChange={handleChange}
          status={optionsStatus}
          allLabel="All states"
        />

        <SelectField
          id="course"
          name="course"
          label="Course"
          icon="course"
          placeholder="Enter course"
          options={options.courses || []}
          value={filters.course}
          onChange={handleChange}
          status={optionsStatus}
          allLabel="All courses"
        />

        <div className="filter-group">
          <FilterLabel htmlFor="min_amount" icon="amount">
            Minimum award
          </FilterLabel>
          <div className="amount-input">
            <span className="amount-prefix" aria-hidden="true">
              ₹
            </span>
            <input
              id="min_amount"
              name="min_amount"
              type="number"
              min="0"
              inputMode="numeric"
              placeholder="e.g. 50000"
              value={filters.min_amount}
              onChange={handleChange}
            />
          </div>
          <div className="amount-presets" role="group" aria-label="Minimum award presets">
            {AMOUNT_PRESETS.map((preset) => {
              const isActive =
                preset.value === ""
                  ? amountValue === null || amountValue === 0
                  : Number.isFinite(amountValue) &&
                    amountValue === Number(preset.value);

              return (
                <button
                  key={preset.label}
                  type="button"
                  className={`preset-btn${isActive ? " active" : ""}`}
                  aria-pressed={isActive}
                  onClick={() => setMinAmount(preset.value)}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        <button type="submit" className="apply-filters-btn">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            aria-hidden="true"
          >
            <path d="M4 5h16l-6.2 7.4V19l-3.6 2v-8.6L4 5Z" />
          </svg>
          Apply Filters
        </button>
      </form>
    </aside>
  );
}

export default ScholarshipFilters;
