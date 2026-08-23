import { useEffect, useState } from 'react';
import { VisitorForm } from './VisitorForm';

interface VisitorGateProps {
  onSubmit: (name: string, role: string) => void;
}

/** Mobile presentation of the visitor prompt: a full-screen blocking card. */
export function VisitorGate({ onSubmit }: VisitorGateProps) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    document.body.classList.toggle('stop-scrolling', open);
    return () => document.body.classList.remove('stop-scrolling');
  }, [open]);

  return (
    <div
      className={`visitor_gate${open ? '' : ' hidden'}`}
      id="visitor_gate"
      role="dialog"
      aria-modal="true"
      aria-labelledby="visitor_gate_title"
    >
      <div className="visitor_card">
        <button type="button" className="visitor_close" aria-label="Close" onClick={() => setOpen(false)} />
        <h2 id="visitor_gate_title">Quick hello</h2>
        <p className="visitor_subtitle">Tell me who is visiting my portfolio today.</p>
        <VisitorForm
          idPrefix="visitor_gate"
          submitLabel="Continue"
          onSubmit={(name, role) => {
            onSubmit(name, role);
            setOpen(false);
          }}
          onSkip={() => setOpen(false)}
        />
      </div>
    </div>
  );
}
