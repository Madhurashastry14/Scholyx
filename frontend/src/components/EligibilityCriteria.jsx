const YEAR_LABELS = {
  any: "Any year",
  "1": "First year",
  "2": "Second year",
  "3": "Third year",
  "4": "Fourth year",
  "5": "Fifth year",
  "6": "Sixth year",
  postgraduate: "Postgraduate",
};

function formatList(values) {
  if (!Array.isArray(values) || values.length === 0) {
    return "";
  }
  return values.join(", ");
}

function formatBoolean(value, positive, negative) {
  if (value === null || value === undefined) {
    return "";
  }
  return value ? positive : negative;
}

function formatAcademicScore(scholarship) {
  if (scholarship.minimum_percentage != null) {
    return `${scholarship.minimum_percentage}%`;
  }
  if (scholarship.minimum_cgpa != null) {
    return `${scholarship.minimum_cgpa} / 10 CGPA`;
  }
  return "";
}

function EligibilityCriteria({ scholarship }) {
  const criteria = [
    {
      label: "Minimum academic score",
      value: formatAcademicScore(scholarship),
    },
    {
      label: "Maximum family income",
      value:
        scholarship.maximum_family_income != null
          ? `₹${Number(scholarship.maximum_family_income).toLocaleString("en-IN")} per year`
          : "",
    },
    {
      label: "Age limit",
      value:
        scholarship.minimum_age != null || scholarship.maximum_age != null
          ? `${scholarship.minimum_age ?? "No minimum"} – ${scholarship.maximum_age ?? "No maximum"} years`
          : "",
    },
    {
      label: "Gender",
      value:
        scholarship.gender && scholarship.gender !== "any"
          ? scholarship.gender.charAt(0).toUpperCase() +
            scholarship.gender.slice(1)
          : scholarship.gender === "any"
            ? "Any gender"
            : "",
    },
    { label: "Category", value: formatList(scholarship.category) },
    { label: "State", value: formatList(scholarship.state) },
    { label: "District", value: formatList(scholarship.district) },
    { label: "Course", value: formatList(scholarship.course) },
    { label: "Branch", value: formatList(scholarship.branch) },
    {
      label: "Year of study",
      value: scholarship.year_of_study
        ? YEAR_LABELS[scholarship.year_of_study] ||
          scholarship.year_of_study
        : "",
    },
    {
      label: "Students with disabilities",
      value: formatBoolean(scholarship.pwd, "Eligible", "Not required"),
    },
    {
      label: "Minority students",
      value: formatBoolean(scholarship.minority, "Eligible", "Not required"),
    },
  ].filter(({ value }) => value);

  return (
    <section className="details-card" aria-labelledby="eligibility-title">
      <div className="details-section-heading">
        <span className="details-section-icon" aria-hidden="true">✓</span>
        <div>
          <h2 id="eligibility-title">Eligibility criteria</h2>
          <p>Review the requirements before you apply.</p>
        </div>
      </div>
      {criteria.length > 0 ? (
        <dl className="criteria-grid">
          {criteria.map(({ label, value }) => (
            <div className="criteria-item" key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="criteria-empty">
          No specific eligibility criteria are listed for this scholarship.
        </p>
      )}
    </section>
  );
}

export default EligibilityCriteria;
