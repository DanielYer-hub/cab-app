import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first: "",
    last: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await register({
        name: {
          first: form.first,
          last: form.last,
        },
        email: form.email,
        password: form.password,
      });

      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      alert("Registration failed");
    }
  };

  return (
    <div className="container py-5">
      <h1>Register</h1>
      <form onSubmit={handleSubmit} className="mt-4">
        <input
          className="form-control mb-3"
          name="first"
          placeholder="First name"
          value={form.first}
          onChange={handleChange}
        />
        <input
          className="form-control mb-3"
          name="last"
          placeholder="Last name"
          value={form.last}
          onChange={handleChange}
        />
        <input
          className="form-control mb-3"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />
        <input
          className="form-control mb-3"
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
        />
        <button className="btn btn-dark" type="submit">
          Register
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;