import React, { useState } from 'react';

interface ResultCardProps {
  title: string;
  content: string;
  relevance: number;
  onRefine?: (refinement: string) => void;
  metadata?: {
    category?: string;
    date?: string;
    type?: string;
  };
}

export const ResultCard: React.FC<ResultCardProps> = ({ 
  title, 
  content, 
  relevance, 
  onRefine,
  metadata 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const getRelevanceInfo = (score: number) => {
    if (score > 0.8) return {
      class: 'high-relevance',
      label: 'Alta Relevancia',
      icon: '🎯'
    };
    if (score > 0.5) return {
      class: 'medium-relevance',
      label: 'Relevancia Media',
      icon: '📍'
    };
    return {
      class: 'low-relevance',
      label: 'Baja Relevancia',
      icon: '📌'
    };
  };

  const relevanceInfo = getRelevanceInfo(relevance);
  const contentPreview = isExpanded ? content : content.substring(0, 200) + (content.length > 200 ? '...' : '');

  // Acciones rápidas para refinamiento
  const quickActions = [
    { label: 'Ver más como este', action: () => onRefine?.(`similar to: "${title}"`) },
    { label: 'Buscar en este documento', action: () => onRefine?.(`in document: "${title}"`) },
    { label: 'Filtrar por categoría', action: () => onRefine?.(`category: "${metadata?.category}"`) },
  ];

  return (
    <div 
      className={`result-card ${relevanceInfo.class}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="result-header">
        <h3>{title}</h3>
        <div className="result-metadata">
          {metadata?.category && <span className="tag">{metadata.category}</span>}
          {metadata?.type && <span className="tag">{metadata.type}</span>}
          {metadata?.date && <span className="date">{metadata.date}</span>}
        </div>
      </div>

      <div className="result-body">
        <p>{contentPreview}</p>
        {content.length > 200 && (
          <button 
            className="expand-button"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? 'Ver menos' : 'Ver más'}
          >
            {isExpanded ? 'Ver menos' : 'Ver más'}
          </button>
        )}
      </div>

      <div className="result-footer">
        <div className="relevance-indicator" title={`${Math.round(relevance * 100)}% de relevancia`}>
          <span className="relevance-icon" role="img" aria-label={relevanceInfo.label}>
            {relevanceInfo.icon}
          </span>
          <div className="progress-container">
            <div 
              className="progress-bar" 
              style={{ width: `${relevance * 100}%` }}
              aria-valuenow={relevance * 100}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          <span className="relevance-label">{relevanceInfo.label}</span>
        </div>

        {showActions && onRefine && (
          <div className="quick-actions">
            {quickActions.map((action, index) => (
              <button 
                key={index}
                onClick={action.action}
                className="action-button"
                title={action.label}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
