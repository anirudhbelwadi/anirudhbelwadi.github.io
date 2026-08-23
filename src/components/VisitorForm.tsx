import { useState } from 'react';
import { visitorRoles } from '../data/profile';

interface VisitorFormProps {
  /** Used for label/field ids so the chatbot and gate variants stay distinct. */
  idPrefix: string;
  submitLabel: string;
  onSubmit: (name: string, role: string) => void;
  onSkip: () => void;
}

export function VisitorForm({ idPrefix, submitLabel, onSubmit, onSkip }: VisitorFormProps) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const canSubmit = name.trim().length > 0 && role.trim().length > 0;

  const nameId = `${idPrefix}_name`;
  const roleId = `${idPrefix}_role`;

  return (
    <form
      id={`${idPrefix}_form`}
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        if (!canSubmit) return;
        onSubmit(name.trim(), role.trim());
      }}
    >
      <label className="visitor_label" htmlFor={nameId}>
        Your name
      </label>
      <input
        type="text"
        id={nameId}
        name={nameId}
        placeholder="e.g., Priya"
        required
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <label className="visitor_label" htmlFor={roleId}>
        I am a
      </label>
      <select
        id={roleId}
        name={roleId}
        required
        value={role}
        onChange={(event) => setRole(event.target.value)}
      >
        <option value="" disabled>
          Select one
        </option>
        {visitorRoles.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="visitor_chatbot_actions">
        <button type="button" className="visitor_chatbot_skip" onClick={onSkip}>
          Skip
        </button>
        <button
          type="submit"
          id={`${idPrefix}_submit`}
          className="btn btn-dark btn-lg px-4 py-2 border-radius-30"
          disabled={!canSubmit}
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
