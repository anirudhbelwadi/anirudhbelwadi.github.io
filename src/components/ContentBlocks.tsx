import type { ContentBlock } from '../types';
import { RichText } from './RichText';

interface ContentBlocksProps {
  blocks: ContentBlock[];
}

/** Renders the body of a modal from its data description. */
export function ContentBlocks({ blocks }: ContentBlocksProps) {
  return (
    <>
      {blocks.map((block, index) => {
        switch (block.kind) {
          case 'image':
            return <img key={index} src={block.src} alt={block.alt ?? ''} className="w-100 mb-2" />;
          case 'heading':
            return <h4 key={index}>{block.text}</h4>;
          case 'paragraph':
            return (
              <p key={index}>
                <RichText text={block.text} />
              </p>
            );
          case 'list':
            return (
              <ul key={index}>
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <RichText text={item} />
                  </li>
                ))}
              </ul>
            );
        }
      })}
    </>
  );
}
