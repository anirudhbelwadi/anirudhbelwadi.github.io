import { Fragment } from 'react';

/** Matches a markdown-style inline link: [label](https://example.com) */
const LINK_PATTERN = /\[([^\]]+)\]\(([^)\s]+)\)/g;

interface RichTextProps {
  text: string;
}

/**
 * Content strings may embed links using markdown link syntax, so the data files
 * stay plain text instead of carrying HTML.
 */
export function RichText({ text }: RichTextProps) {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(LINK_PATTERN)) {
    const [full, label, href] = match;
    const start = match.index;
    if (start > lastIndex) parts.push(text.slice(lastIndex, start));
    parts.push(
      <a key={start} className="read_more" href={href} target="_blank" rel="noopener noreferrer">
        {label}
      </a>
    );
    lastIndex = start + full.length;
  }

  if (parts.length === 0) return <>{text}</>;
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));

  return (
    <>
      {parts.map((part, index) => (
        <Fragment key={index}>{part}</Fragment>
      ))}
    </>
  );
}
