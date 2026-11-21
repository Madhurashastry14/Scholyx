import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/auth.js";

function Dashboard() {
  const { user } = useAuth();
  const firstName = user?.full_name?.trim().split(/\s+/)[0];

  return (
    <div className="dashboard-page">
      <Navbar />
      <main className="dashboard-main">
        <section className="dashboard-card">
          <span className="dashboard-eyebrow">STUDENT DASHBOARD</span>
          <h1>You are logged in.</h1>
          <p>
            {firstName ? `Welcome back, ${firstName}. ` : "Welcome back. "}
            Your dashboard will be built in a future update.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default Dashboard;
