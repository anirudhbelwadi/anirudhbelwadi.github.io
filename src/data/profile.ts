import type { SocialLink } from '../types';

export const profile = {
  fullName: 'Anirudh Srinath Belwadi',
  roles: 'Entrepreneur | Full Stack Developer | Musician | Photographer',
  greeting: "Hey, I'm Anirudh Belwadi!",
  tagline: "I'm passionate about building products that make a real impact!",
  heroImage: '/assets/images/anirudhbelwadi.webp',
  aboutImage: '/assets/images/anirudhbelwadi_about.webp',
  /** Each entry becomes one paragraph in the About section. */
  about: [
    "I am a Software Engineer with a Master's degree from Carnegie Mellon University, who loves building scalable distributed systems and cloud-native applications.",
    'I specialize in Java, Python & AWS/GCP, and enjoy owning features end-to-end from system design to production.',
    "Outside of tech, I'm a musician and photographer who enjoys creative expression.",
  ],
  copyright: '© 2025 anirudhbelwadi.com. All rights reserved. Developed by Anirudh Belwadi.',
  buyMeACoffee: 'https://www.buymeacoffee.com/anirudhbelwadi',
} as const;

/** Shown in the page header. */
export const headerSocials: SocialLink[] = [
  { href: 'mailto:anirudh.belwadi@gmail.com', label: 'Email', icon: 'envelope' },
  { href: 'https://www.linkedin.com/in/anirudh-srinath-belwadi', label: 'LinkedIn', icon: 'linkedin' },
  { href: 'https://github.com/anirudhbelwadi', label: 'GitHub', icon: 'github' },
  { href: 'https://scholar.google.com/citations?user=kkIto-0AAAAJ&hl=en', label: 'Google Scholar', icon: 'mortarboard' },
];

/** Shown in the footer. */
export const footerSocials: SocialLink[] = [
  { href: 'https://www.instagram.com/believed_it_after_clicking_it/', label: 'Photography Instagram', icon: 'camera' },
  { href: 'https://www.instagram.com/chakravyuh/', label: 'Music Instagram', icon: 'music' },
  { href: 'https://www.youtube.com/c/AnirudhBelwadi', label: 'YouTube', icon: 'youtube' },
  { href: 'https://instagram.com/anirudh.belwadi', label: 'Instagram', icon: 'instagram' },
  { href: 'https://www.linkedin.com/in/anirudh-srinath-belwadi', label: 'LinkedIn', icon: 'linkedin' },
  { href: 'mailto:anirudh.belwadi@gmail.com', label: 'Email', icon: 'envelope' },
  { href: 'https://twitter.com/belwadianirudh', label: 'Twitter', icon: 'twitter' },
  { href: 'https://github.com/anirudhbelwadi', label: 'GitHub', icon: 'github' },
  { href: 'https://scholar.google.com/citations?user=kkIto-0AAAAJ&hl=en', label: 'Google Scholar', icon: 'mortarboard' },
];

/** Options offered in the visitor chatbot / gate. */
export const visitorRoles = [
  { value: 'recruiter', label: 'Recruiter' },
  { value: 'hiring-manager', label: 'Hiring Manager' },
  { value: 'student', label: 'Student' },
  { value: 'collaborator', label: 'Collaborator' },
  { value: 'other', label: 'Other' },
];
