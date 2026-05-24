import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <div className="empty-card" style={{ marginTop: "4rem" }}>
      <p className="h2">404</p>
      <p className="title">Page not found</p>
      <p className="muted">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn btn-outline" style={{ marginTop: "1rem" }}>
        Back to home
      </Link>
    </div>
  );
}
