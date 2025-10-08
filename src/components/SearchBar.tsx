import { useState } from "react";
import "./SearchBar.css";

type Props = { onSubmit: (q: string, projectId?: string) => void; };

export default function SearchBar({ onSubmit }: Props) {
  const [q, setQ] = useState("");
  const [project, setProject] = useState<string>("");

  return (
    <div className="searchbar">
      <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar..." />
      <input value={project} onChange={e => setProject(e.target.value)} placeholder="Project ID (opcional)" />
      <button onClick={() => onSubmit(q, project || undefined)}>Buscar</button>
    </div>
  );
}
