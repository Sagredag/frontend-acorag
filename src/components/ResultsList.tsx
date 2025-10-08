import type { SearchRow } from "../api";
import "./ResultsList.css";

export default function ResultsList({ rows }: { rows: SearchRow[] }) {
  if (!rows?.length) return <p className="no-results">Sin resultados encontrados.</p>;
  
  return (
    <ul className="results-list">
      {rows.map((r, i) => (
        <li key={`${r.document_id}-${i}`}>
          <div className="result-title">{r.title}</div>
          <div className="result-meta">Doc ID: {r.document_id}</div>
          <div className="result-score">Score: {r.score.toFixed(3)}</div>
          {r.snippet && (
            <p className="result-snippet">{r.snippet}</p>
          )}
        </li>
      ))}
    </ul>
  );
}
