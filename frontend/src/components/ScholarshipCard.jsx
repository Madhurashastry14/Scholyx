
import { Link } from "react-router-dom";

function formatCourse(course) {
  if (Array.isArray(course)) {
    return course.length > 0 ? course.join(", ") : "Not specified";
  }
  return course || "Not specified";
}

function ScholarshipCard({ scholarship }) {
  const { id, name, provider, course, deadline } = scholarship;

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

      <div className="card-details">
        <p>
          <strong>Course:</strong>{" "}
          {formatCourse(course)}
        </p>

        <p>
          <strong>Deadline:</strong>{" "}
          {deadline || "Not specified"}
        </p>
      </div>

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
