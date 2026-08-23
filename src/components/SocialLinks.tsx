import type { SocialLink } from '../types';
import { Icon } from './Icon';

interface SocialLinksProps {
  links: SocialLink[];
  className?: string;
}

export function SocialLinks({ links, className = 'icons' }: SocialLinksProps) {
  return (
    <div className={className}>
      {links.map((link) => (
        <a
          key={`${link.icon}-${link.href}`}
          href={link.href}
          aria-label={link.label}
          {...(link.href.startsWith('mailto:') ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
        >
          <Icon name={link.icon} />
        </a>
      ))}
    </div>
  );
}
