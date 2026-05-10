import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getSectionById } from "../api/sectionService";
import type { Section } from "../types/section";
import { createField, deleteField, getFieldsBySection } from "../api/fieldService";
import type { FieldTemplate, FieldType } from "../types/field";


const SectionPage = () => {
  const { id } = useParams();
  const [section, setSection] = useState<Section | null>(null);
  const [fields, setFields] = useState<FieldTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [label, setLabel] = useState("");
  const [type, setType] = useState<FieldType>("text");
  const [required, setRequired] = useState(false);
  const [order, setOrder] = useState(0);

const fetchSectionData = async () => {
    try {
      if (!id) return;

      const [sectionData, fieldsData] = await Promise.all([
        getSectionById(id),
        getFieldsBySection(id),
      ]);

      setSection(sectionData);
      setFields(fieldsData);
    } catch (error) {
      console.error("SECTION PAGE ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSectionData();
  }, [id]);

  const handleCreateField = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) return;

    try {
      const newField = await createField(id, {
        label,
        type,
        required,
        order,
      });

      setFields((prev) => [...prev, newField].sort((a, b) => a.order - b.order));
      setLabel("");
      setType("text");
      setRequired(false);
      setOrder(0);
    } catch (error: any) {
      console.error("CREATE FIELD ERROR:", error);
      console.error("CREATE FIELD RESPONSE:", error?.response?.data);
      alert(error?.response?.data?.message || "Failed to create field");
    }
  };

  const handleDeleteField = async (fieldId: string) => {
    try {
      await deleteField(fieldId);
      setFields((prev) => prev.filter((field) => field._id !== fieldId));
    } catch (error: any) {
      console.error("DELETE FIELD ERROR:", error);
      alert(error?.response?.data?.message || "Failed to delete field");
    }
  };

  if (loading) {
    return <div className="container py-5">Loading...</div>;
  }

  if (!section) {
    return <div className="container py-5">Section not found</div>;
  }

return (
    <div className="container py-5">
      <div className="mb-4">
        <h1>{section.title}</h1>
        <p className="text-muted mb-0">
          {section.description || "No description"}
        </p>
      </div>

      <div className="card p-4 mb-4">
        <h3 className="mb-3">Create Field</h3>

        <form onSubmit={handleCreateField}>
          <div className="mb-3">
            <label className="form-label">Field label</label>
            <input
              type="text"
              className="form-control"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Example: Client Name"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Field type</label>
            <select
              className="form-select"
              value={type}
              onChange={(e) => setType(e.target.value as FieldType)}
            >
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="date">Date</option>
              <option value="phone">Phone</option>
              <option value="textarea">Textarea</option>
              <option value="image">Image</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Order</label>
            <input
              type="number"
              className="form-control"
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
            />
          </div>

          <div className="form-check mb-3">
            <input
              id="required"
              type="checkbox"
              className="form-check-input"
              checked={required}
              onChange={(e) => setRequired(e.target.checked)}
            />
            <label htmlFor="required" className="form-check-label">
              Required field
            </label>
          </div>

          <button className="btn btn-dark" type="submit">
            Add Field
          </button>
        </form>
      </div>

      <div className="card p-4">
        <h3 className="mb-3">Section Fields</h3>

        {fields.length === 0 ? (
          <p className="mb-0">No fields yet</p>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>Label</th>
                  <th>Key</th>
                  <th>Type</th>
                  <th>Required</th>
                  <th>Order</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {fields.map((field) => (
                  <tr key={field._id}>
                    <td>{field.label}</td>
                    <td>{field.key}</td>
                    <td>{field.type}</td>
                    <td>{field.required ? "Yes" : "No"}</td>
                    <td>{field.order}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDeleteField(field._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SectionPage;