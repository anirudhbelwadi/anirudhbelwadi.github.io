import { useMemo, useState } from 'react';
import { projectCategories, projects } from '../data/projects';
import type { ModalContent } from '../types';
import { InfoModal } from './InfoModal';

const ALL = 'all';

export function Projects() {
  const [activeCategory, setActiveCategory] = useState<string>(ALL);
  const [openModal, setOpenModal] = useState<ModalContent | null>(null);

  const visibleProjects = useMemo(
    () =>
      projects.filter(
        (project) => !project.hidden && (activeCategory === ALL || project.category === activeCategory)
      ),
    [activeCategory]
  );

  // Matches the pre-React behaviour: re-clicking the active chip is a no-op;
  // "Clear Filters" or the "All projects" option is how you reset.
  const selectCategory = (id: string) => setActiveCategory(id);

  const filterChips = projectCategories.filter((category) => category.id !== ALL);

  return (
    <section id="portfolio" className="mt-5">
      <h3 className="title_font text-center">Projects</h3>
      <div className="container mt-5">
        <div className="row justify-content-center px-4 d-flex" id="filter_select_parent">
          <select
            id="filter_select"
            value={activeCategory}
            onChange={(event) => setActiveCategory(event.target.value)}
            aria-label="Select a project category"
          >
            {projectCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        <div className="row justify-content-center px-4 d-flex" id="filter_button_parent">
          {filterChips.map((category) => (
            <div className="col-lg-3 col-md-4 col-sm-6 col-12" key={category.id}>
              <span
                className={`filter_icons${activeCategory === category.id ? ' filter_active' : ''}`}
                role="button"
                tabIndex={0}
                onClick={() => selectCategory(category.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    selectCategory(category.id);
                  }
                }}
              >
                {category.label}
              </span>
            </div>
          ))}
        </div>

        <div className="row justify-content-center d-none d-md-flex">
          <div className="col-lg-3 col-md-4 col-sm-6 col-12">
            <div
              className="pt-2 text-danger text-center"
              style={{ cursor: 'pointer' }}
              role="button"
              tabIndex={0}
              onClick={() => setActiveCategory(ALL)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setActiveCategory(ALL);
                }
              }}
            >
              Clear Filters
            </div>
          </div>
        </div>

        <div className="row">
          {visibleProjects.map((project) => (
            <div className="col-lg-6 px-5 mt-5" key={project.id}>
              <a
                {...(project.href
                  ? { href: project.href, target: '_blank', rel: 'noopener noreferrer' }
                  : {})}
              >
                <img src={project.image} className="w-100" alt={project.imageAlt ?? project.title} />
                <h4 className="project_title mt-3">
                  <b>{project.title}</b>
                </h4>
                <p className="project_description">{project.description}</p>
              </a>
              <button type="button" className="read_more" onClick={() => setOpenModal(project.modal)}>
                Read More...
              </button>
            </div>
          ))}
        </div>
      </div>

      <InfoModal content={openModal} onHide={() => setOpenModal(null)} />
    </section>
  );
}
