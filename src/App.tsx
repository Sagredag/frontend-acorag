import { useState } from "react";
import SearchBar from "./components/SearchBar";
import ResultsList from "./components/ResultsList";
import ChatAssistant from "./components/ChatAssistant";
import { search, type SearchRow } from "./api";
import "./App.css";

export default function App() {
  const [rows, setRows] = useState<SearchRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'search' | 'chat'>('search');

  const onSubmit = async (q: string, projectId?: string) => {
    setLoading(true);
    try {
      const data = await search({ query: q, project_id: projectId, top_k: 8, probes: 10 });
      setRows(data);
    } finally {
      setLoading(false);
    }
  };

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

  return (
    <main style={{ maxWidth: 1000, margin: "20px auto", padding: "0 20px" }}>
      <div className="app-header">
        <h1>Aconex RAG System</h1>
        <div className="mode-toggle">
          <button 
            className={mode === 'search' ? 'active' : ''} 
            onClick={() => setMode('search')}
          >
            Búsqueda
          </button>
          <button 
            className={mode === 'chat' ? 'active' : ''} 
            onClick={() => setMode('chat')}
          >
            Chat Assistant
          </button>
        </div>
      </div>

      {mode === 'search' ? (
        <div className="search-mode">
          <SearchBar onSubmit={onSubmit} />
          {loading ? <p className="loading">Buscando…</p> : <ResultsList rows={rows} />}
        </div>
      ) : (
        <div className="chat-mode">
          <ChatAssistant apiUrl={apiUrl} />
        </div>
      )}
    </main>
  );
}
