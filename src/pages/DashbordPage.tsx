import { useEffect, useState } from "react";
import {
  createSection,
  deleteSection,
  getSections,
} from "../api/sectionService";
import type { Section } from "../types/section";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const [sections, setSections] = useState<Section[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchSections = async () => {
    try {
      const data = await getSections();
      setSections(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const newSection = await createSection({ title, description });
      setSections((prev) => [newSection, ...prev]);
      setTitle("");
      setDescription("");
    } catch (error) {
      console.error(error);
      alert("Failed to create section");
    }
  };

const handleDeleteSection = async (id: string) => {
  const confirmed = window.confirm("Delete this section?");

  if (!confirmed) return;

  try {
    await deleteSection(id);
    setSections((prev) => prev.filter((section) => section._id !== id));
  } catch (error) {
    console.error(error);
    alert("Failed to delete section");
  }
};

  return (
    <div className="container py-5 ">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>Dashboard</h1>
          <p className="mb-0">
            Welcome, {user?.name.first} {user?.name.last}
          </p>
        </div>
        <button className="btn btn-outline-dark" onClick={logout}>
          Logout
        </button>
      </div>

      <div className="card p-4 mb-4">
        <h3>Create Section</h3>
        <form onSubmit={handleCreateSection}>
          <input
            className="form-control mb-3"
            placeholder="Section title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="form-control mb-3"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button className="btn btn-dark" type="submit">
            Add Section
          </button>
        </form>
      </div>

      <div>
        <h3>Your Sections</h3>

        {loading ? (
          <p>Loading...</p>
        ) : sections.length === 0 ? (
          <p>No sections yet</p>
        ) : (
          <div className="row g-3 mt-1">
            {sections.map((section) => (
              <div className="col-md-6 col-lg-4" key={section._id}>
                <div className="card h-100 p-3">
                  <h5>{section.title}</h5>
                  <p>{section.description || "No description"}</p>

                  <div className="d-flex gap-2 mt-auto">
                    <Link
                      to={`/sections/${section._id}`}
                      className="btn btn-dark btn-sm"
                    >
                      Open
                    </Link>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleDeleteSection(section._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;