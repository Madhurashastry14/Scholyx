
import "../styles/scholarships.css";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ScholarshipCard from "../components/ScholarshipCard";
import ScholarshipFilters from "../components/ScholarshipFilters";
import ActiveFilterChips from "../components/ActiveFilterChips";
import { fetchScholarshipFilterOptions, fetchScholarships } from "../services/api";

function Scholarships() {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  const [filtersOpen, setFiltersOpen] = useState(false);

  const [filters, setFilters] = useState({
    category: "",
    state: "",
    course: "",
    min_amount: "",
  });

  const [filterOptions, setFilterOptions] = useState({
    categories: [],
    states: [],
    courses: [],
  });
  const [optionsStatus, setOptionsStatus] = useState("loading");

  const [appliedFilters, setAppliedFilters] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const loadFilterOptions = async () => {
      try {
        const data = await fetchScholarshipFilterOptions({
          signal: controller.signal,
        });

        setFilterOptions({
          categories: data?.categories || [],
          states: data?.states || [],
          courses: data?.courses || [],
        });
        setOptionsStatus("ready");
      } catch (optionsError) {
        if (optionsError?.name !== "AbortError") {
          setFilterOptions({
            categories: [],
            states: [],
            courses: [],
          });
          setOptionsStatus("failed");
        }
      }
    };

    loadFilterOptions();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    let ignore = false;

    const loadScholarships = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await fetchScholarships({
          search: appliedSearch,
          ...appliedFilters,
          page,
        });

        if (ignore) {
          return;
        }

        setScholarships(data.results || []);
        setTotalCount(data.count || 0);
        setTotalPages(
          Math.max(1, Math.ceil(data.count / 9))
        );
      } catch {
        if (!ignore) {
          setError("Unable to load scholarships. Please try again.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadScholarships();

    return () => {
      ignore = true;
    };
  }, [appliedSearch, appliedFilters, page]);

  const applyFilters = () => {
    setAppliedFilters({ ...filters });
    setPage(1);
  };

  const removeFilter = (key) => {
    setFilters((previousFilters) => ({
      ...previousFilters,
      [key]: "",
    }));
    setAppliedFilters((previousFilters) => ({
      ...previousFilters,
      [key]: "",
    }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      category: "",
      state: "",
      course: "",
      min_amount: "",
    });

    setAppliedFilters({});
    setSearchInput("");
    setAppliedSearch("");
    setPage(1);
  };

  const activeFilterCount = Object.values(appliedFilters).filter(
    (value) => value !== "" && value !== null && value !== undefined,
  ).length;

  const handleSearch = (event) => {
    event.preventDefault();
    setAppliedSearch(searchInput.trim());
    setPage(1);
  };

  return (
    <>
      <Navbar />

      <main className="scholarships-page">
        <section className="scholarships-header">
          <h1>Explore Scholarships</h1>
          <p>
            Discover opportunities to support your education.
          </p>
        </section>

        <section className="scholarships-layout">
          <button
            type="button"
            className="mobile-filter-toggle"
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            {filtersOpen ? "Hide Filters" : "Show Filters"}
          </button>

          <div className={`filter-panel ${filtersOpen ? "open" : ""}`}>
            <ScholarshipFilters
              filters={filters}
              setFilters={setFilters}
              options={filterOptions}
              optionsStatus={optionsStatus}
              activeCount={activeFilterCount}
              onApply={() => {
                applyFilters();
                setFiltersOpen(false);
              }}
              onClear={() => {
                clearFilters();
                setFiltersOpen(false);
              }}
            />
          </div>

          <div className="scholarships-main">
            <form
              className="scholarship-search"
              onSubmit={handleSearch}
            >
              <input
                type="search"
                placeholder="Search by scholarship name or provider..."
                value={searchInput}
                onChange={(event) =>
                  setSearchInput(event.target.value)
                }
              />

              <button type="submit">Search</button>
            </form>

            <ActiveFilterChips
              filters={appliedFilters}
              options={filterOptions}
              onRemove={removeFilter}
              onClearAll={clearFilters}
            />

            {!loading && !error && totalCount > 0 && (
              <p className="results-summary">
                Showing {scholarships.length} of {totalCount} scholarships
              </p>
            )}

            {loading && (
              <p className="status-message">
                Loading scholarships...
              </p>
            )}

            {error && (
              <p className="error-message">{error}</p>
            )}

            {!loading && !error && scholarships.length === 0 && (
              <div className="empty-state">
                <h2>No scholarships found</h2>
                <p>
                  Try changing your search or filters.
                </p>
              </div>
            )}

            {!loading && !error && scholarships.length > 0 && (
              <>
                <div className="scholarship-grid">
                  {scholarships.map((scholarship) => (
                    <ScholarshipCard
                      key={scholarship.id}
                      scholarship={scholarship}
                    />
                  ))}
                </div>

                <div className="pagination">
                  <button
                    type="button"
                    disabled={page === 1}
                    onClick={() =>
                      setPage((previous) => previous - 1)
                    }
                  >
                    Previous
                  </button>

                  <span>
                    Page {page} of {totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() =>
                      setPage((previous) => previous + 1)
                    }
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default Scholarships;
