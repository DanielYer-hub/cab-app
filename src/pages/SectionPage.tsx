import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getSectionById } from "../api/sectionService";
import {
  createField,
  deleteField,
  getFieldsBySection,
} from "../api/fieldService";
import {
  createRecord,
  deleteRecord,
  getRecordsBySection,
} from "../api/recordService";
import type { Section } from "../types/section";
import type { FieldTemplate, FieldType } from "../types/field";
import type { RecordItem } from "../types/record";

const SectionPage = () => {
  const { id } = useParams();

  const [section, setSection] = useState<Section | null>(null);
  const [fields, setFields] = useState<FieldTemplate[]>([]);
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [fieldLabel, setFieldLabel] = useState("");
  const [fieldType, setFieldType] = useState<FieldType>("text");
  const [fieldRequired, setFieldRequired] = useState(false);

  const [recordForm, setRecordForm] = useState<Record<string, any>>({});

  const sortedFields = useMemo(
    () => [...fields].sort((a, b) => a.order - b.order),
    [fields]
  );

  const fetchSectionData = async () => {
    try {
      if (!id) return;

      const [sectionData, fieldsData, recordsData] = await Promise.all([
        getSectionById(id),
        getFieldsBySection(id),
        getRecordsBySection(id),
      ]);

      setSection(sectionData);
      setFields(fieldsData);
      setRecords(recordsData);
    } catch (error) {
      console.error("SECTION PAGE ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSectionData();
  }, [id]);

  useEffect(() => {
    const initialForm: Record<string, any> = {};

    sortedFields.forEach((field) => {
      initialForm[field.key] = "";
    });

    setRecordForm(initialForm);
  }, [fields]);

  const handleCreateField = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) return;

    try {
      const newField = await createField(id, {
        label: fieldLabel,
        type: fieldType,
        required: fieldRequired,
        order: fields.length + 1,
      });

      setFields((prev) =>
        [...prev, newField].sort((a, b) => a.order - b.order)
      );

      setFieldLabel("");
      setFieldType("text");
      setFieldRequired(false);
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

  const handleRecordChange = (
    key: string,
    value: string | number | boolean
  ) => {
    setRecordForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) return;

    try {
      const newRecord = await createRecord(id, {
        values: recordForm,
      });

      setRecords((prev) => [newRecord, ...prev]);

      const resetForm: Record<string, any> = {};
      sortedFields.forEach((field) => {
        resetForm[field.key] = "";
      });
      setRecordForm(resetForm);
    } catch (error: any) {
      console.error("CREATE RECORD ERROR:", error);
      console.error("CREATE RECORD RESPONSE:", error?.response?.data);
      alert(error?.response?.data?.message || "Failed to create record");
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    try {
      await deleteRecord(recordId);
      setRecords((prev) => prev.filter((record) => record._id !== recordId));
    } catch (error: any) {
      console.error("DELETE RECORD ERROR:", error);
      alert(error?.response?.data?.message || "Failed to delete record");
    }
  };

  const renderInputByFieldType = (field: FieldTemplate) => {
    const value = recordForm[field.key] ?? "";

    switch (field.type) {
      case "number":
        return (
          <input
            type="number"
            className="form-control"
            value={value}
            onChange={(e) =>
              handleRecordChange(
                field.key,
                e.target.value === "" ? "" : Number(e.target.value)
              )
            }
          />
        );

      case "date":
        return (
          <input
            type="date"
            className="form-control"
            value={value}
            onChange={(e) => handleRecordChange(field.key, e.target.value)}
          />
        );

      case "textarea":
        return (
          <textarea
            className="form-control"
            value={value}
            onChange={(e) => handleRecordChange(field.key, e.target.value)}
          />
        );

      case "phone":
        return (
          <input
            type="text"
            className="form-control"
            value={value}
            onChange={(e) => handleRecordChange(field.key, e.target.value)}
            placeholder="Phone number"
          />
        );

      case "image":
        return (
          <input
            type="text"
            className="form-control"
            value={value}
            onChange={(e) => handleRecordChange(field.key, e.target.value)}
            placeholder="Image URL"
          />
        );

      case "text":
      default:
        return (
          <input
            type="text"
            className="form-control"
            value={value}
            onChange={(e) => handleRecordChange(field.key, e.target.value)}
          />
        );
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
              value={fieldLabel}
              onChange={(e) => setFieldLabel(e.target.value)}
              placeholder="Example: Client Name"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Field type</label>
            <select
              className="form-select"
              value={fieldType}
              onChange={(e) => setFieldType(e.target.value as FieldType)}
            >
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="date">Date</option>
              <option value="phone">Phone</option>
              <option value="textarea">Textarea</option>
              <option value="image">Image</option>
            </select>
          </div>

          <div className="form-check mb-3">
            <input
              id="required"
              type="checkbox"
              className="form-check-input"
              checked={fieldRequired}
              onChange={(e) => setFieldRequired(e.target.checked)}
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

      <div className="card p-4 mb-4">
        <h3 className="mb-3">Section Fields</h3>

        {sortedFields.length === 0 ? (
          <p className="mb-0">No fields yet</p>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>Label</th>
                  <th>Type</th>
                  <th>Required</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedFields.map((field) => (
                  <tr key={field._id}>
                    <td>{field.label}</td>
                    <td>{field.type}</td>
                    <td>{field.required ? "Yes" : "No"}</td>
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

      <div className="card p-4 mb-4">
        <h3 className="mb-3">Add Record</h3>

        {sortedFields.length === 0 ? (
          <p className="mb-0">
            First create fields for this section, then you can add records.
          </p>
        ) : (
          <form onSubmit={handleCreateRecord}>
            {sortedFields.map((field) => (
              <div className="mb-3" key={field._id}>
                <label className="form-label">
                  {field.label}
                  {field.required ? " *" : ""}
                </label>
                {renderInputByFieldType(field)}
              </div>
            ))}

            <button className="btn btn-dark" type="submit">
              Save Record
            </button>
          </form>
        )}
      </div>

      <div className="card p-4">
        <h3 className="mb-3">Records</h3>

        {records.length === 0 ? (
          <p className="mb-0">No records yet</p>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  {sortedFields.map((field) => (
                    <th key={field._id}>{field.label}</th>
                  ))}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record._id}>
                    {sortedFields.map((field) => (
                      <td key={field._id}>
                        {record.values?.[field.key] ?? "-"}
                      </td>
                    ))}
                    <td>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDeleteRecord(record._id)}
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