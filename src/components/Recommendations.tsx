import { useState } from "react";
import { useGlider } from "../hooks/useGlider";
import type { ModalContent, Recommendation } from "../types";
import { InfoModal } from "./InfoModal";

const GLIDER_OPTIONS = {
  slidesToShow: 1,
  slidesToScroll: 5,
  draggable: true,
  responsive: [
    { breakpoint: 1200, settings: { slidesToShow: 3, slidesToScroll: 1 } },
    { breakpoint: 1000, settings: { slidesToShow: 2, slidesToScroll: 1 } },
    { breakpoint: 500, settings: { slidesToShow: 1, slidesToScroll: 1 } },
  ],
};

interface RecommendationsProps {
  recommendations: Recommendation[];
}

export function Recommendations({ recommendations }: RecommendationsProps) {
  const { trackRef, dotsRef } = useGlider(GLIDER_OPTIONS);
  const [openModal, setOpenModal] = useState<ModalContent | null>(null);

  return (
    <section id="recommendations" className="mt-5">
      <h3 className="title_font text-center">Recommendations</h3>
      <div className="container mt-2 px-5">
        <div className="glider-contain">
          <div className="glider px-4" ref={trackRef}>
            {/* Rendered here rather than by glider — see useGlider. */}
            <div className="glider-track">
              {recommendations.map((recommendation) => (
                <div key={recommendation.id}>
                  <div className="px-5 mt-5">
                    <div className="row align-items-center">
                      <div className="col-3">
                        <img
                          src={recommendation.avatar}
                          className="w-100 rounded-circle"
                          alt={recommendation.name}
                        />
                      </div>
                      <div className="col-9">
                        <h4 className="project_title">
                          <b>{recommendation.name}</b>
                        </h4>
                        <p className="mb-0">{recommendation.role}</p>
                      </div>
                    </div>
                    <p className="mt-2 project_description">
                      {recommendation.excerpt}
                    </p>
                    <button
                      type="button"
                      className="read_more"
                      onClick={() => setOpenModal(recommendation.modal)}
                    >
                      Read More...
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div role="tablist" className="dots mt-4" ref={dotsRef} />
        </div>
      </div>

      <InfoModal content={openModal} onHide={() => setOpenModal(null)} />
    </section>
  );
}
