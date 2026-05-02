import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getSectionById } from "../api/sectionService";
import type { Section } from "../types/section";

const SectionPage = () => {
  const { id } = useParams();
  const [section, setSection] = useState<Section | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSection = async () => {
      try {
        if (!id) return;
        const data = await getSectionById(id);
        setSection(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchSection();
  }, [id]);

  if (loading) {
    return <div className="container py-5">Loading...</div>;
  }

  if (!section) {
    return <div className="container py-5">Section not found</div>;
  }

  return (
    <div className="container py-5">
      <h1>{section.title}</h1>
      <p>{section.description || "No description"}</p>
      <hr />
      <p>Here we will add fields and records later.</p>
    </div>
  );
};

export default SectionPage;