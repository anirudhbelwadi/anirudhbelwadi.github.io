import { useEffect, useState } from 'react';
import { VisitorForm } from './VisitorForm';

interface VisitorChatbotProps {
  onSubmit: (name: string, role: string) => void;
}

const CLOSE_DELAY_MS = 3000;

/** Desktop presentation of the visitor prompt: a dismissible corner panel. */
export function VisitorChatbot({ onSubmit }: VisitorChatbotProps) {
  const [open, setOpen] = useState(true);
  const [submittedName, setSubmittedName] = useState<string | null>(null);

  useEffect(() => {
    if (submittedName === null) return;
    const timer = window.setTimeout(() => setOpen(false), CLOSE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [submittedName]);

  const handleSubmit = (name: string, role: string) => {
    onSubmit(name, role);
    setSubmittedName(name);
  };

  const submitted = submittedName !== null;

  return (
    <div id="visitor_chatbot" className="visitor_chatbot" aria-live="polite">
      {!submitted && (
        <button
          type="button"
          className="visitor_chatbot_toggle"
          aria-expanded={open}
          aria-controls="visitor_chatbot_panel"
          onClick={() => setOpen((current) => !current)}
        >
          Hello!
        </button>
      )}
      <div
        className={`visitor_chatbot_panel${open ? ' open' : ''}${submitted ? ' submitted' : ''}`}
        id="visitor_chatbot_panel"
        role="dialog"
        aria-modal="false"
        aria-labelledby="visitor_chatbot_title"
      >
        <div className="visitor_chatbot_header">
          <h2 id="visitor_chatbot_title">Quick hello</h2>
          <button
            type="button"
            className="visitor_chatbot_close"
            aria-label="Close chat"
            onClick={() => setOpen(false)}
          >
            &times;
          </button>
        </div>
        <div className="visitor_chatbot_body">
          <div className="visitor_chatbot_message bot">Hi! Who is visiting my portfolio today?</div>
          <VisitorForm
            idPrefix="visitor_chatbot"
            submitLabel="Send"
            onSubmit={handleSubmit}
            onSkip={() => setOpen(false)}
          />
          <div className="visitor_chatbot_message bot visitor_chatbot_thanks" id="visitor_chatbot_thanks">
            {submittedName ? `Thanks, ${submittedName}! Enjoy the portfolio.` : 'Thanks! Enjoy the portfolio.'}
          </div>
        </div>
      </div>
    </div>
  );
}
