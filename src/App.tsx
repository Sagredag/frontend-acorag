import React, { useState, useCallback, useEffect } from "react";
import SearchBar from "./components/SearchBar";
import ResultsList from "./components/ResultsList";
import ChatAssistant from "./components/ChatAssistant";
import { search, type SearchRow } from "./api";
import "./App.css";

// Constantes para categorías y tipos de documentos
const DOCUMENT_CATEGORIES = [
  "Planos",
  "Especificaciones",
  "Contratos",
  "Informes",
  "Presupuestos"
];

interface SearchState {
  query: string;
  projectId?: string;
  filters: {
    category?: string;
    dateRange?: string;
    documentType?: string;
  };
  sortBy: 'relevance' | 'date' | 'type';
}

export default function App() {
  const [rows, setRows] = useState<SearchRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'search' | 'chat'>('search');
  const [searchState, setSearchState] = useState<SearchState>({
    query: '',
    filters: {},
    sortBy: 'relevance'
  });
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

  // Cargar búsquedas recientes del localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Guardar búsquedas recientes
  const updateRecentSearches = useCallback((query: string) => {
    setRecentSearches(prev => {
      const updated = [query, ...prev.filter(q => q !== query)].slice(0, 5);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Manejar la búsqueda
  const handleSearch = useCallback(async (
    query: string, 
    projectId?: string, 
    filters?: SearchState['filters']
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      // Actualizar estado de búsqueda
      setSearchState(prev => ({
        ...prev,
        query,
        projectId,
        filters: filters || prev.filters
      }));

      // Realizar búsqueda
      const data = await search({ 
        query,
        project_id: projectId,
        top_k: 12,
        probes: 10
      });

      setRows(data);
      updateRecentSearches(query);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al realizar la búsqueda');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [updateRecentSearches]);

  // Manejar refinamiento de búsqueda
  const handleRefine = useCallback((refinement: string) => {
    const [type, value] = refinement.split(':');
    
    switch (type) {
      case 'sort':
        setSearchState(prev => ({
          ...prev,
          sortBy: value as 'relevance' | 'date' | 'type'
        }));
        break;
      case 'filter':
        setSearchState(prev => ({
          ...prev,
          filters: { ...prev.filters, ...JSON.parse(value) }
        }));
        break;
      default:
        handleSearch(refinement);
    }
  }, [handleSearch]);

  // Transición suave entre modos
  const handleModeChange = (newMode: 'search' | 'chat') => {
    document.body.style.opacity = '0';
    setTimeout(() => {
      setMode(newMode);
      document.body.style.opacity = '1';
    }, 200);
  };

  return (
    <main className="app-container">
      <header className="app-header">
        <div className="header-content">
          <h1>Aconex RAG System</h1>
          <p className="header-subtitle">Sistema de Búsqueda Semántica para Documentos de Construcción</p>
        </div>
        
        <nav className="mode-toggle">
          <button 
            className={`mode-button ${mode === 'search' ? 'active' : ''}`}
            onClick={() => handleModeChange('search')}
            aria-pressed={mode === 'search'}
          >
            <span className="mode-icon">🔍</span>
            <span className="mode-label">Búsqueda</span>
          </button>
          <button 
            className={`mode-button ${mode === 'chat' ? 'active' : ''}`}
            onClick={() => handleModeChange('chat')}
            aria-pressed={mode === 'chat'}
          >
            <span className="mode-icon">💬</span>
            <span className="mode-label">Asistente</span>
          </button>
        </nav>
      </header>

      <div className={`content-container ${mode}-mode`}>
        {mode === 'search' ? (
          <div className="search-interface">
            <SearchBar 
              onSubmit={handleSearch}
              recentSearches={recentSearches}
              categories={DOCUMENT_CATEGORIES}
            />
            
            {error && (
              <div className="error-message" role="alert">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}
            
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p className="loading-text">Buscando documentos relevantes...</p>
              </div>
            ) : (
              <ResultsList 
                rows={rows}
                onRefine={handleRefine}
                sortBy={searchState.sortBy}
              />
            )}
          </div>
        ) : (
          <div className="chat-interface">
            <ChatAssistant apiUrl={apiUrl} />
          </div>
        )}
      </div>

      <footer className="app-footer">
        <div className="footer-content">
          <p>© 2025 Aconex RAG System</p>
          <div className="footer-links">
            <button className="footer-link" onClick={() => handleRefine('help')}>
              Ayuda
            </button>
            <button className="footer-link" onClick={() => handleRefine('about')}>
              Acerca de
            </button>
          </div>
        </div>
      </footer>
    </main>
  );
}
