
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ScholarshipCard from "../components/ScholarshipCard";
import {
  fetchScholarshipFilterOptions,
  fetchScholarships,
} from "../services/api";

const FEATURED_COUNT = 5;

function Home() {
  const navigate = useNavigate();
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("course");
  const [filterValue, setFilterValue] = useState("");
  const [filterOptions, setFilterOptions] = useState({
    categories: [],
    courses: [],
  });

  useEffect(() => {
    const controller = new AbortController();

    const fetchFeaturedScholarships = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await fetchScholarships(
          { page_size: 30, [filterType]: filterValue },
          { signal: controller.signal }
        );

        setScholarships(
          Array.isArray(data) ? data : data.results || []
        );
      } catch (err) {
        if (err?.name !== "AbortError") {
          setError(err.message || "Something went wrong.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchFeaturedScholarships();

    return () => controller.abort();
  }, [filterType, filterValue]);

  useEffect(() => {
    let active = true;

    fetchScholarshipFilterOptions()
      .then((data) => {
        if (active) {
          setFilterOptions({
            categories: data?.categories || [],
            courses: data?.courses || [],
          });
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  const optionsForType =
    filterType === "course" ? filterOptions.courses : filterOptions.categories;
  const searchTerm = search.trim().toLowerCase();

  const filteredScholarships = scholarships.filter((scholarship) => {
    return (
      !searchTerm ||
      scholarship.name?.toLowerCase().includes(searchTerm) ||
      scholarship.provider?.toLowerCase().includes(searchTerm)
    );
  });

  const featuredScholarships = filteredScholarships.slice(0, FEATURED_COUNT);

  return (
    <>
      <Navbar />

      <main>
        <section className="hero">
          <div className="hero-content">
            <span className="hero-tag">YOUR FUTURE STARTS HERE</span>

            <h1>
              Find the Right Scholarship.
              <span> Shape Your Future.</span>
            </h1>

            <p>
              Discover scholarship opportunities that match your goals.
              Check your eligibility and move closer to your dreams.
            </p>

            <div className="hero-search">
              <input
                type="text"
                placeholder="Search scholarships..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <button
                onClick={() =>
                  document.getElementById("scholarships")?.scrollIntoView({
                    behavior: "smooth",
                  })
                }
              >
                Explore Scholarships
              </button>
            </div>

            <div className="hero-note">
              <span>✓</span> Discover opportunities in one place
            </div>
          </div>

          <div className="hero-visual">
            <div className="visual-card">
              <div className="visual-icon">🎓</div>
              <h3>Your Education</h3>
              <p>Deserves Every Opportunity</p>
              <div className="visual-line"></div>
              <div className="visual-line short"></div>
              <span className="visual-badge">
                Explore. Apply. Achieve.
              </span>
            </div>
          </div>
        </section>

        <section className="scholarships-section" id="scholarships">
          <div className="section-heading">
            <span className="section-tag">OPPORTUNITIES FOR YOU</span>
            <h2>Featured Scholarships</h2>
            <p>
              Explore available scholarships and find the right opportunity.
            </p>
          </div>

          <div className="featured-filter">
            <select
              className="featured-filter-type"
              aria-label="Filter featured scholarships by"
              value={filterType}
              onChange={(event) => {
                setFilterType(event.target.value);
                setFilterValue("");
              }}
            >
              <option value="course">Course</option>
              <option value="category">Category</option>
            </select>

            <select
              className="featured-filter-value"
              aria-label={
                filterType === "course"
                  ? "Filter featured scholarships by course"
                  : "Filter featured scholarships by category"
              }
              value={filterValue}
              onChange={(event) => setFilterValue(event.target.value)}
            >
              <option value="">
                All {filterType === "course" ? "courses" : "categories"}
              </option>
              {optionsForType.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <p className="status-message">Loading scholarships...</p>
          ) : error ? (
            <p className="status-message error">{error}</p>
          ) : featuredScholarships.length === 0 ? (
            <p className="status-message">
              {search || filterValue
                ? "No scholarships match your search or filter."
                : "No scholarships available at the moment. Please check back later."}
            </p>
          ) : (
            <div className="scholarship-grid featured-grid">
              {featuredScholarships.map((scholarship) => (
                <ScholarshipCard
                  key={scholarship.id}
                  scholarship={scholarship}
                />
              ))}
            </div>
          )}
        </section>

        <section className="how-section" id="about">
          <div className="section-heading">
            <span className="section-tag">SIMPLE AND EASY</span>
            <h2>How Scholyx Works</h2>
            <p>
              Three simple steps to discover your scholarship opportunities.
            </p>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-icon">🔍</div>
              <span className="step-number">01</span>
              <h3>Explore Scholarships</h3>
              <p>Browse scholarship opportunities available on Scholyx.</p>
            </div>

            <div className="step-card">
              <div className="step-icon">👤</div>
              <span className="step-number">02</span>
              <h3>Create Your Profile</h3>
              <p>Add your academic and personal details to your profile.</p>
            </div>

            <div className="step-card">
              <div className="step-icon">✓</div>
              <span className="step-number">03</span>
              <h3>Check Eligibility</h3>
              <p>Find scholarships that match your eligibility criteria.</p>
            </div>
          </div>
        </section>

        <section className="cta-section">
          <h2>Ready to Find Your Opportunity?</h2>
          <p>Create your profile and start exploring scholarships today.</p>

          <button
            onClick={() => navigate("/register")}
            className="cta-button"
          >
            Get Started →
          </button>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default Home;
