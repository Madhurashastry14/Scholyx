
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/about.css";

const features = [
  {
    icon: "🔎",
    title: "Scholarship Discovery",
    description:
      "Explore available scholarship opportunities from different providers in one convenient place.",
  },
  {
    icon: "⚙️",
    title: "Search and Filters",
    description:
      "Find relevant scholarships using filters based on your academic and personal details.",
  },
  {
    icon: "✓",
    title: "Eligibility Checking",
    description:
      "Check whether you meet scholarship requirements using your student profile information.",
  },
  {
    icon: "📋",
    title: "Application Tracking",
    description:
      "Keep track of your scholarship applications and monitor their progress.",
  },
  {
    icon: "🎓",
    title: "Student Profiles",
    description:
      "Maintain your academic and personal information for a more convenient eligibility check.",
  },
];

const steps = [
  {
    number: "01",
    icon: "🔍",
    title: "Explore Scholarships",
    description: "Browse available scholarships and discover opportunities that interest you.",
  },
  {
    number: "02",
    icon: "👤",
    title: "Create Your Profile",
    description: "Register and complete your student profile with the required information.",
  },
  {
    number: "03",
    icon: "✓",
    title: "Check Eligibility",
    description: "Find out which scholarships match your profile and their eligibility requirements.",
  },
  {
    number: "04",
    icon: "📝",
    title: "Apply Officially",
    description: "Visit the official scholarship website and follow its application process.",
  },
  {
    number: "05",
    icon: "📊",
    title: "Track Progress",
    description: "Keep track of your applications and their current status on Scholyx.",
  },
];

function About() {
  return (
    <div className="about-page">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="about-hero">
          <div className="about-hero-content">
            <span className="about-tag">ABOUT SCHOLYX</span>

            <h1>
              Making Scholarship Discovery
              <span> Simple for Every Student.</span>
            </h1>

            <p>
              Scholyx is a Scholarship Information and Eligibility Checker
              platform designed to help students discover opportunities,
              understand scholarship requirements, and take the next step
              towards their educational goals.
            </p>

            <Link to="/scholarships" className="about-primary-btn">
              Explore Scholarships →
            </Link>
          </div>

          <div className="about-hero-visual">
            <div className="about-visual-card">
              <div className="about-visual-icon">🎓</div>
              <h3>Your Future, Your Opportunity</h3>
              <p>Discover scholarships that match your goals.</p>
              <div className="about-visual-line" />
              <div className="about-visual-line short" />
              <span className="about-visual-badge">
                Find your opportunity
              </span>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="about-intro">
          <div className="about-section-heading">
            <span className="about-tag">WHY SCHOLYX?</span>
            <h2>Bridging the Gap Between Students and Opportunities</h2>
          </div>

          <p>
            Many students miss valuable scholarship opportunities because
            information is scattered across different websites and eligibility
            requirements can be difficult to understand. Finding the right
            scholarship often takes time and effort.
          </p>

          <p>
            Scholyx brings scholarship discovery and eligibility checking
            together in one platform. Students can explore opportunities,
            filter scholarships based on relevant criteria, maintain their
            profiles, and understand which opportunities they may qualify for.
          </p>
        </section>

        {/* Mission Section */}
        <section className="about-mission">
          <div className="about-mission-content">
            <span className="about-tag">OUR MISSION</span>
            <h2>Every Student Deserves the Opportunity to Succeed.</h2>
            <p>
              Our mission is to make scholarship information accessible,
              understandable, and easier to explore. We aim to help students
              identify relevant financial support opportunities and make
              informed decisions about their education.
            </p>
          </div>

          <div className="about-mission-mark">🎯</div>
        </section>

        {/* Features Section */}
        <section className="about-features">
          <div className="about-section-heading">
            <span className="about-tag">WHAT SCHOLYX OFFERS</span>
            <h2>Everything You Need in One Place</h2>
            <p>
              Simple tools to help you discover and manage scholarship
              opportunities.
            </p>
          </div>

          <div className="about-feature-grid">
            {features.map((feature) => (
              <article className="about-feature-card" key={feature.title}>
                <div className="about-feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="about-how">
          <div className="about-section-heading">
            <span className="about-tag">HOW SCHOLYX WORKS</span>
            <h2>Your Scholarship Journey, Made Simpler</h2>
            <p>Follow these simple steps to get started.</p>
          </div>

          <div className="about-steps-grid">
            {steps.map((step) => (
              <article className="about-step-card" key={step.number}>
                <span className="about-step-number">{step.number}</span>
                <div className="about-step-icon">{step.icon}</div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="about-cta">
          <span className="about-tag">TAKE THE NEXT STEP</span>
          <h2>Your Next Opportunity Could Be One Click Away.</h2>
          <p>
            Start exploring scholarships and discover opportunities that
            support your educational journey.
          </p>

          <div className="about-cta-buttons">
            <Link to="/scholarships" className="about-primary-btn">
              Explore Scholarships
            </Link>

            <Link to="/register" className="about-secondary-btn">
              Get Started
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default About;
