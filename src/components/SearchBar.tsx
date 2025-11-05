import React, { useState, useCallback, useEffect, useRef } from "react";
import "./SearchBar.css";

interface SearchSuggestion {
  text: string;
  type: 'recent' | 'popular' | 'category';
  icon?: string;
}

interface Props {
  onSubmit: (q: string, projectId?: string, filters?: SearchFilters) => void;
  recentSearches?: string[];
  categories?: string[];
}

interface SearchFilters {
  category?: string;
  dateRange?: string;
  documentType?: string;
}

export default function SearchBar({ onSubmit, recentSearches = [], categories = [] }: Props) {
  const [q, setQ] = useState("");
  const [project, setProject] = useState<string>("");
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Gestión de sugerencias
  const generateSuggestions = useCallback(() => {
    const allSuggestions: SearchSuggestion[] = [
      ...recentSearches.slice(0, 3).map(search => ({
        text: search,
        type: 'recent' as const,
        icon: '🕒'
      })),
      ...categories.map(cat => ({
        text: cat,
        type: 'category' as const,
        icon: '📁'
      }))
    ];
    
    if (q) {
      const filtered = allSuggestions.filter(sug => 
        sug.text.toLowerCase().includes(q.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions(allSuggestions);
    }
  }, [q, recentSearches, categories]);

  useEffect(() => {
    generateSuggestions();
  }, [q, generateSuggestions]);

  // Manejo de eventos
  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQ(e.target.value);
    setIsTyping(true);
    setShowSuggestions(true);
    const timer = setTimeout(() => setIsTyping(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = useCallback(() => {
    if (q.trim()) {
      onSubmit(q, project || undefined, filters);
      setShowSuggestions(false);
    }
  }, [q, project, filters, onSubmit]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  // Click fuera para cerrar sugerencias
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="search-container" ref={searchContainerRef}>
      <div className="search-input-wrapper">
        <div className="search-icon">🔍</div>
        <input
          type="text"
          value={q}
          onChange={handleSearch}
          onKeyPress={handleKeyPress}
          placeholder="Buscar documentos, planos, especificaciones..."
          className={`search-input ${isTyping ? "typing" : ""}`}
          aria-label="Campo de búsqueda"
          aria-expanded={showSuggestions}
          role="searchbox"
        />
        {q && (
          <button 
            className="clear-button" 
            onClick={() => setQ("")}
            aria-label="Limpiar búsqueda"
          >
            ✕
          </button>
        )}
      </div>

      <div className="search-controls">
        <input
          value={project}
          onChange={(e) => setProject(e.target.value)}
          placeholder="ID del Proyecto (opcional)"
          className="project-input"
          aria-label="ID del Proyecto"
        />
        <button 
          onClick={handleSubmit}
          className="search-button"
          disabled={!q.trim()}
          aria-label="Buscar"
        >
          <span className="button-text">Buscar</span>
          {isTyping && <span className="typing-indicator">...</span>}
        </button>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="suggestions-panel" role="listbox">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              className={`suggestion-item ${suggestion.type}`}
              onClick={() => {
                setQ(suggestion.text);
                handleSubmit();
              }}
              role="option"
            >
              <span className="suggestion-icon">{suggestion.icon}</span>
              <span className="suggestion-text">{suggestion.text}</span>
              <span className="suggestion-type">{suggestion.type}</span>
            </button>
          ))}
        </div>
      )}

      <div className="search-filters">
        {categories.length > 0 && (
          <select
            value={filters.category || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            className="filter-select"
          >
            <option value="">Todas las categorías</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        )}
        <select
          value={filters.dateRange || ''}
          onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
          className="filter-select"
        >
          <option value="">Cualquier fecha</option>
          <option value="today">Hoy</option>
          <option value="week">Última semana</option>
          <option value="month">Último mes</option>
          <option value="year">Último año</option>
        </select>
      </div>
      
      {isTyping && (
        <div className="search-feedback" role="status" aria-live="polite">
          <span className="feedback-text">Refinando resultados...</span>
          <div className="feedback-dots">
            <span>.</span><span>.</span><span>.</span>
          </div>
        </div>
      )}
    </div>
  );
}
