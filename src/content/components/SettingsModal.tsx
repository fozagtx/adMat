import React, { useState, useEffect } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSave: (apiKey: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSave,
}) => {
  const [value, setValue] = useState(apiKey);

  useEffect(() => {
    setValue(apiKey);
  }, [apiKey, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(value);
    onClose();
  };

  return (
    <div className="hdc-modal-overlay" onClick={onClose}>
      <div className="hdc-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="hdc-modal-title">Settings</h2>

        <div className="hdc-form-field">
          <label className="hdc-form-label">Hyperbolic API Key</label>
          <input
            type="password"
            className="hdc-form-input"
            placeholder="Enter your API key..."
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoFocus
          />
          <p className="hdc-form-hint">
            Get your API key from hyperbolic.xyz
          </p>
        </div>

        <div className="hdc-modal-actions">
          <button className="hdc-btn hdc-btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="hdc-btn hdc-btn-primary" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
