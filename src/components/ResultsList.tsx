import React, { useState, useEffect } from "react";
import type { SearchRow } from "../api";
import { ResultCard } from "./ResultCard";
import "./ResultsList.css";

interface ResultsListProps {
  rows: SearchRow[];
  onRefine?: (refinement: string) => void;
  sortBy?: 'relevance' | 'date' | 'type';
}

export default function ResultsList({ rows, onRefine, sortBy = 'relevance' }: ResultsListProps) {
  const [sortedRows, setSortedRows] = useState<SearchRow[]>([]);
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [groupedResults, setGroupedResults] = useState<{ [key: string]: SearchRow[] }>({});

  // Organizar y ordenar resultados
  useEffect(() => {
    let processedRows = [...rows];

    // Ordenar según criterio seleccionado
    processedRows.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date_modified || '').getTime() - new Date(a.date_modified || '').getTime();
        case 'type':
          return a.doc_type.localeCompare(b.doc_type);
        default:
          return b.score - a.score;
      }
    });

    // Agrupar por tipo de documento si es necesario
    const grouped = processedRows.reduce((acc, row) => {
      const key = row.doc_type || 'Otros';
      if (!acc[key]) acc[key] = [];
      acc[key].push(row);
      return acc;
    }, {} as { [key: string]: SearchRow[] });

    setGroupedResults(grouped);
    setSortedRows(processedRows);
  }, [rows, sortBy]);

  // Gestión de filtros
  const handleFilterToggle = (filter: string) => {
    setActiveFilters(prev => {
      const newFilters = new Set(prev);
      if (newFilters.has(filter)) {
        newFilters.delete(filter);
      } else {
        newFilters.add(filter);
      }
      return newFilters;
    });
  };

  if (!rows?.length) {
    return (
      <div className="no-results-container">
        <div className="no-results-icon">🔍</div>
        <h3>Sin resultados encontrados</h3>
        <p>Intenta con otros términos de búsqueda o ajusta los filtros</p>
        <div className="search-suggestions">
          <h4>Sugerencias:</h4>
          <ul>
            <li>Revisa la ortografía de las palabras</li>
            <li>Usa términos más generales</li>
            <li>Reduce los filtros activos</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="results-container">
      <div className="results-header">
        <div className="results-summary">
          <h2>{rows.length} resultados encontrados</h2>
          <div className="active-filters">
            {Array.from(activeFilters).map(filter => (
              <button
                key={filter}
                className="filter-tag"
                onClick={() => handleFilterToggle(filter)}
              >
                {filter} ✕
              </button>
            ))}
          </div>
        </div>
        
        <div className="results-controls">
          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => onRefine?.(`sort:${e.target.value}`)}
          >
            <option value="relevance">Ordenar por relevancia</option>
            <option value="date">Ordenar por fecha</option>
            <option value="type">Ordenar por tipo</option>
          </select>
        </div>
      </div>

      <div className="results-grid">
        {Object.entries(groupedResults).map(([type, typeRows]) => (
          <div key={type} className="results-group">
            <h3 className="group-header">
              {type}
              <span className="group-count">{typeRows.length}</span>
            </h3>
            <ul className="results-list">
              {typeRows.map((row, i) => (
                <li key={`${row.document_id}-${i}`} className="result-item">
                  <ResultCard
                    title={row.title}
                    content={row.snippet || 'No hay vista previa disponible'}
                    relevance={row.score}
                    onRefine={onRefine}
                    metadata={{
                      category: row.category,
                      type: row.doc_type,
                      date: row.date_modified
                    }}
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="results-footer">
        <button 
          className="load-more-button"
          onClick={() => onRefine?.('load:more')}
        >
          Cargar más resultados
        </button>
      </div>
    </div>
  );
}
