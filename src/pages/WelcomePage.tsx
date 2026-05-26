import { Link } from "react-router-dom";

const WelcomePage = () => {
  return (
    <div className="container py-5 mt-5">
      <div className="text-center mt-5">
        <h1 className="mb-3">Welcome to ClientBase</h1>
        <p className="mb-4">
          Simple client management for service businesses
        </p>

        <div className="d-flex justify-content-center gap-3">
          <Link to="/register" className="btn btn-dark">
            Register
          </Link>
          <Link to="/login" className="btn btn-outline-dark">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;