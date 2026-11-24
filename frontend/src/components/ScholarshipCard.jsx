
import { Link } from "react-router-dom";

function formatCourse(course) {
  if (Array.isArray(course)) {
    return course.length > 0 ? course.join(", ") : "";
  }
  return course || "";
}

function ScholarshipCard({ scholarship }) {
  const { id, name, provider, course, deadline } = scholarship;

  const details = [];
  const courseLabel = formatCourse(course);
  if (courseLabel) {
    details.push({ label: "Course", value: courseLabel });
  }
  if (deadline) {
    details.push({ label: "Deadline", value: deadline });
  }

  return (
    <div className="scholarship-card">
      <div className="card-top">
        <span className="card-icon">🎓</span>
        <span className="scholarship-status">Active</span>
      </div>

      <h3>{name}</h3>

      <p className="provider">
        {provider || "Scholarship Provider"}
      </p>

      {details.length > 0 && (
        <div className="card-details">
          {details.map(({ label, value }) => (
            <p key={label}>
              <strong>{label}:</strong>{" "}
              {value}
            </p>
          ))}
        </div>
      )}

      <Link
        to={`/scholarships/${id}`}
        className="details-btn"
      >
        View Details
      </Link>
    </div>
  );
}

export default ScholarshipCard;
