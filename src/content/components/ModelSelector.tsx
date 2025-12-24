import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from './Icons';
import { AIModel } from '../../shared/types';

interface ModelSelectorProps {
  models: AIModel[];
  selectedModel: string;
  onSelect: (modelId: string) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  models,
  selectedModel,
  onSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = models.find((m) => m.id === selectedModel) || models[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="hdc-model-selector" ref={ref}>
      <button
        className={`hdc-model-btn ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="hdc-model-info">
          <span className="hdc-model-name">{selected?.name}</span>
          <span className="hdc-model-provider">{selected?.provider}</span>
        </div>
        <ChevronDownIcon />
      </button>

      <div className={`hdc-model-dropdown ${isOpen ? 'open' : ''}`}>
        {models.map((model) => (
          <div
            key={model.id}
            className={`hdc-model-option ${model.id === selectedModel ? 'selected' : ''}`}
            onClick={() => {
              onSelect(model.id);
              setIsOpen(false);
            }}
          >
            <div className="hdc-model-option-info">
              <span className="hdc-model-option-name">{model.name}</span>
              <span className="hdc-model-option-provider">{model.provider}</span>
            </div>
            {model.type === 'vision' && (
              <span className="hdc-model-badge">Vision</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
