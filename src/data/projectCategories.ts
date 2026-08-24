import type { ProjectCategory } from '../types';

/** Filter chips for the projects section. Not backend-managed — these are
 * structural rather than content, and the UI depends on the ids. */
export const projectCategories: ProjectCategory[] = [
  { id: "all", label: "All projects" },
  { id: "professional", label: "Professional" },
  { id: "portfolios", label: "Portfolios" },
  { id: "research", label: "Research" },
  { id: "client", label: "Client" },
  { id: "internships", label: "Internships" },
  { id: "hackathons", label: "Hackathons" },
  { id: "student", label: "Student Clubs" },
  { id: "mini", label: "Mini Projects" },
];
