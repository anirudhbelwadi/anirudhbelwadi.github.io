/** One piece of rich content inside a modal body. */
export type ContentBlock =
  | { kind: 'image'; src: string; alt?: string }
  | { kind: 'heading'; text: string }
  | { kind: 'paragraph'; text: string }
  | { kind: 'list'; items: string[] };

export interface ModalLink {
  href: string;
  label: string;
}

export interface ModalContent {
  title: string;
  blocks: ContentBlock[];
  /** Optional call-to-action rendered in the modal footer. */
  link?: ModalLink;
}

export interface ProjectCategory {
  id: string;
  label: string;
}

export interface Project {
  id: string;
  category: string;
  title: string;
  description: string;
  /** Where the card links to. Omit for projects with no public URL. */
  href?: string;
  image: string;
  imageAlt?: string;
  /** Kept in the data file but not rendered — use instead of commenting out. */
  hidden?: boolean;
  modal: ModalContent;
}

export interface Recommendation {
  id: string;
  name: string;
  role: string;
  avatar: string;
  excerpt: string;
  modal: ModalContent;
}

export interface Admit {
  href: string;
  logo: string;
}

export interface SocialLink {
  href: string;
  label: string;
  /** Key into the icon registry in components/Icon.tsx. */
  icon: IconName;
}

export type IconName =
  | 'envelope'
  | 'linkedin'
  | 'github'
  | 'mortarboard'
  | 'camera'
  | 'music'
  | 'youtube'
  | 'instagram'
  | 'twitter';
