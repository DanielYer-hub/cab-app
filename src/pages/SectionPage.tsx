import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getSectionById } from "../api/sectionService";
import {
  createField,
  deleteField,
  getFieldsBySection,
  updateField,
} from "../api/fieldService";
import {
  createRecord,
  deleteRecord,
  getRecordsBySection,
  updateRecord,
} from "../api/recordService";
import type { Section } from "../types/section";
import type { FieldTemplate, FieldType } from "../types/field";
import type { RecordItem } from "../types/record";

const SectionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [section, setSection] = useState<Section | null>(null);
  const [fields, setFields] = useState<FieldTemplate[]>([]);
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [fieldLabel, setFieldLabel] = useState("");
  const [fieldType, setFieldType] = useState<FieldType>("text");
  const [fieldRequired, setFieldRequired] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);

  const [recordForm, setRecordForm] = useState<Record<string, any>>({});
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const sortedFields = useMemo(
    () => [...fields].sort((a, b) => a.order - b.order),
    [fields]
  );

  const filteredRecords = useMemo(() => {
    if (!searchTerm.trim()) return records;

    const normalizedSearch = searchTerm.toLowerCase().trim();

    return records.filter((record) =>
      (record.searchText || "").toLowerCase().includes(normalizedSearch)
    );
  }, [records, searchTerm]);

  const buildEmptyRecordForm = () => {
    const initialForm: Record<string, any> = {};
    sortedFields.forEach((field) => {
      initialForm[field.key] = "";
    });
    return initialForm;
  };

  const resetFieldForm = () => {
    setFieldLabel("");
    setFieldType("text");
    setFieldRequired(false);
    setEditingFieldId(null);
  };

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
    setRecordForm(buildEmptyRecordForm());
  }, [fields]);

  const handleCreateOrUpdateField = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) return;

    try {
      if (editingFieldId) {
        const updatedField = await updateField(editingFieldId, {
          label: fieldLabel,
          type: fieldType,
          required: fieldRequired,
        });

        setFields((prev) =>
          prev
            .map((field) => (field._id === editingFieldId ? updatedField : field))
            .sort((a, b) => a.order - b.order)
        );

        resetFieldForm();
        alert("Field updated successfully");
      } else {
        const newField = await createField(id, {
          label: fieldLabel,
          type: fieldType,
          required: fieldRequired,
          order: fields.length + 1,
        });

        setFields((prev) =>
          [...prev, newField].sort((a, b) => a.order - b.order)
        );

        resetFieldForm();
        alert("Field created successfully");
      }
    } catch (error: any) {
      console.error("SAVE FIELD ERROR:", error);
      console.error("SAVE FIELD RESPONSE:", error?.response?.data);
      alert(error?.response?.data?.message || "Failed to save field");
    }
  };

  const handleEditField = (field: FieldTemplate) => {
    setFieldLabel(field.label);
    setFieldType(field.type);
    setFieldRequired(field.required);
    setEditingFieldId(field._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelFieldEdit = () => {
    resetFieldForm();
  };

  const handleDeleteField = async (fieldId: string) => {
    const confirmed = window.confirm("Delete this field?");
    if (!confirmed) return;

    try {
      await deleteField(fieldId);
      setFields((prev) => prev.filter((field) => field._id !== fieldId));

      if (editingFieldId === fieldId) {
        handleCancelFieldEdit();
      }
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

  const handleCreateOrUpdateRecord = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) return;

    try {
      if (editingRecordId) {
        const updatedRecord = await updateRecord(editingRecordId, {
          values: recordForm,
        });

        setRecords((prev) =>
          prev.map((record) =>
            record._id === editingRecordId ? updatedRecord : record
          )
        );

        setEditingRecordId(null);
        setRecordForm(buildEmptyRecordForm());
        alert("Record updated successfully");
      } else {
        const newRecord = await createRecord(id, {
          values: recordForm,
        });

        setRecords((prev) => [newRecord, ...prev]);
        setRecordForm(buildEmptyRecordForm());
        alert("Record created successfully");
      }
    } catch (error: any) {
      console.error("SAVE RECORD ERROR:", error);
      console.error("SAVE RECORD RESPONSE:", error?.response?.data);
      alert(error?.response?.data?.message || "Failed to save record");
    }
  };

  const handleEditRecord = (record: RecordItem) => {
    const filledForm: Record<string, any> = buildEmptyRecordForm();

    sortedFields.forEach((field) => {
      filledForm[field.key] = record.values?.[field.key] ?? "";
    });

    setRecordForm(filledForm);
    setEditingRecordId(record._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingRecordId(null);
    setRecordForm(buildEmptyRecordForm());
  };

  const handleDeleteRecord = async (recordId: string) => {
    const confirmed = window.confirm("Delete this record?");
    if (!confirmed) return;

    try {
      await deleteRecord(recordId);
      setRecords((prev) => prev.filter((record) => record._id !== recordId));

      if (editingRecordId === recordId) {
        handleCancelEdit();
      }
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
      <div className="mb-4 d-flex justify-content-between align-items-start gap-3">
        <div>
          <h1>{section.title}</h1>
          <p className="text-muted mb-0">
            {section.description || "No description"}
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => navigate("/dashboard")}
        >
          Back to Dashboard
        </button>
      </div>

      <div className="accordion" id="sectionAccordion">
        <div className="accordion-item mb-3 border rounded">
          <h2 className="accordion-header" id="headingFields">
            <button
              className="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#collapseFields"
              aria-expanded="false"
              aria-controls="collapseFields"
            >
              Manage Fields ({sortedFields.length})
            </button>
          </h2>
          <div
            id="collapseFields"
            className="accordion-collapse collapse"
            aria-labelledby="headingFields"
            data-bs-parent="#sectionAccordion"
          >
            <div className="accordion-body">
              <div className="card border-0 shadow-sm p-4 mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className="mb-0">
                    {editingFieldId ? "Edit Field" : "Create Field"}
                  </h3>

                  {editingFieldId && (
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm"
                      onClick={handleCancelFieldEdit}
                    >
                      Cancel
                    </button>
                  )}
                </div>

                <form onSubmit={handleCreateOrUpdateField}>
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
                    {editingFieldId ? "Update Field" : "Add Field"}
                  </button>
                </form>
              </div>

              <div className="card border-0 shadow-sm p-4">
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
                              <div className="d-flex gap-2">
                                <button
                                  className="btn btn-sm btn-outline-dark"
                                  onClick={() => handleEditField(field)}
                                >
                                  Edit
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleDeleteField(field._id)}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="accordion-item mb-3 border rounded">
          <h2 className="accordion-header" id="headingRecordForm">
            <button
              className="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#collapseRecordForm"
              aria-expanded="false"
              aria-controls="collapseRecordForm"
            >
              {editingRecordId ? "Edit Record" : "Add Record"}
            </button>
          </h2>
          <div
            id="collapseRecordForm"
            className="accordion-collapse collapse"
            aria-labelledby="headingRecordForm"
            data-bs-parent="#sectionAccordion"
          >
            <div className="accordion-body">
              <div className="card border-0 shadow-sm p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className="mb-0">
                    {editingRecordId ? "Edit Record" : "Add Record"}
                  </h3>

                  {editingRecordId && (
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm"
                      onClick={handleCancelEdit}
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                {sortedFields.length === 0 ? (
                  <p className="mb-0">
                    First create fields for this section, then you can add records.
                  </p>
                ) : (
                  <form onSubmit={handleCreateOrUpdateRecord}>
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
                      {editingRecordId ? "Update Record" : "Save Record"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="accordion-item mb-3 border rounded">
          <h2 className="accordion-header" id="headingRecords">
            <button
              className="accordion-button"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#collapseRecords"
              aria-expanded="true"
              aria-controls="collapseRecords"
            >
              Records ({records.length})
            </button>
          </h2>
          <div
            id="collapseRecords"
            className="accordion-collapse collapse show"
            aria-labelledby="headingRecords"
            data-bs-parent="#sectionAccordion"
          >
            <div className="accordion-body">
              <div className="card border-0 shadow-sm p-4">
                <div className="d-flex justify-content-between align-items-center mb-3 gap-3 flex-wrap">
                  <h3 className="mb-0">Records</h3>

                  <input
                    type="text"
                    className="form-control"
                    style={{ maxWidth: 300 }}
                    placeholder="Search records..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {filteredRecords.length === 0 ? (
                  <p className="mb-0">
                    {searchTerm.trim()
                      ? "No matching records found"
                      : "No records yet"}
                  </p>
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
                        {filteredRecords.map((record) => (
                          <tr key={record._id}>
                            {sortedFields.map((field) => (
                              <td key={field._id}>
                                {record.values?.[field.key] ?? "-"}
                              </td>
                            ))}
                            <td>
                              <div className="d-flex gap-2">
                                <button
                                  className="btn btn-sm btn-outline-dark"
                                  onClick={() => handleEditRecord(record)}
                                >
                                  Edit
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleDeleteRecord(record._id)}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionPage;