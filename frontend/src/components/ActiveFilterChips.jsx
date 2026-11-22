const FILTER_DEFINITIONS = [
  { key: "category", label: "Category", optionKey: "categories" },
  { key: "state", label: "State", optionKey: "states" },
  { key: "course", label: "Course", optionKey: "courses" },
];

function labelFor(options, value) {
  const match = options.find((option) => option.value === value);
  return match ? match.label : value;
}

function formatAmount(value) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return `₹${value}`;
  }

  return `₹${amount.toLocaleString("en-IN")}`;
}

function ActiveFilterChips({
  filters,
  options = { categories: [], states: [], courses: [] },
  onRemove,
  onClearAll,
}) {
  const entries = FILTER_DEFINITIONS.map(({ key, label, optionKey }) => {
    const value = filters?.[key];

    if (value === "" || value === null || value === undefined) {
      return null;
    }

    return {
      key,
      label,
      text: labelFor(options[optionKey] || [], value),
    };
  }).filter(Boolean);

  const minAmount = filters?.min_amount;

  if (minAmount !== "" && minAmount !== null && minAmount !== undefined) {
    entries.push({
      key: "min_amount",
      label: "Min award",
      text: formatAmount(minAmount),
    });
  }

  if (entries.length === 0) {
    return null;
  }

  return (
    <div className="active-filters" aria-label="Active filters">
      {entries.map(({ key, label, text }) => (
        <span className="filter-chip" key={key}>
          <span>
            {label}: {text}
          </span>
          <button
            type="button"
            aria-label={`Remove ${label} filter`}
            onClick={() => onRemove(key)}
          >
            ×
          </button>
        </span>
      ))}

      {entries.length > 1 && (
        <button type="button" className="filter-chip clear-chip" onClick={onClearAll}>
          Clear all
        </button>
      )}
    </div>
  );
}

export default ActiveFilterChips;
