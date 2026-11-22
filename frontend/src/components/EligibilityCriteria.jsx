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
    return "Not specified";
  }
  return values.join(", ");
}

function formatBoolean(value, positive, negative) {
  if (value === null || value === undefined) {
    return "Not specified";
  }
  return value ? positive : negative;
}

function EligibilityCriteria({ scholarship }) {
  const criteria = [
    {
      label: "Minimum academic percentage",
      value:
        scholarship.minimum_percentage != null
          ? `${scholarship.minimum_percentage}%`
          : "Not specified",
    },
    {
      label: "Minimum CGPA",
      value:
        scholarship.minimum_cgpa != null
          ? `${scholarship.minimum_cgpa} / 10`
          : "Not specified",
    },
    {
      label: "Maximum family income",
      value:
        scholarship.maximum_family_income != null
          ? `₹${Number(scholarship.maximum_family_income).toLocaleString("en-IN")} per year`
          : "Not specified",
    },
    {
      label: "Age limit",
      value:
        scholarship.minimum_age != null || scholarship.maximum_age != null
          ? `${scholarship.minimum_age ?? "No minimum"} – ${scholarship.maximum_age ?? "No maximum"} years`
          : "Not specified",
    },
    {
      label: "Gender",
      value:
        scholarship.gender && scholarship.gender !== "any"
          ? scholarship.gender.charAt(0).toUpperCase() +
            scholarship.gender.slice(1)
          : scholarship.gender === "any"
            ? "Any gender"
            : "Not specified",
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
        : "Not specified",
    },
    {
      label: "Students with disabilities",
      value: formatBoolean(scholarship.pwd, "Eligible", "Not required"),
    },
    {
      label: "Minority students",
      value: formatBoolean(scholarship.minority, "Eligible", "Not required"),
    },
  ];

  return (
    <section className="details-card" aria-labelledby="eligibility-title">
      <div className="details-section-heading">
        <span className="details-section-icon" aria-hidden="true">✓</span>
        <div>
          <h2 id="eligibility-title">Eligibility criteria</h2>
          <p>Review the requirements before you apply.</p>
        </div>
      </div>
      <dl className="criteria-grid">
        {criteria.map(({ label, value }) => (
          <div className="criteria-item" key={label}>
            <dt>{label}</dt>
            <dd className={value === "Not specified" ? "unspecified" : ""}>
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export default EligibilityCriteria;
