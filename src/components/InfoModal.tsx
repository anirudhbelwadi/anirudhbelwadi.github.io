import Modal from 'react-bootstrap/Modal';
import type { ModalContent } from '../types';
import { ContentBlocks } from './ContentBlocks';

interface InfoModalProps {
  content: ModalContent | null;
  onHide: () => void;
}

/** The single modal used for both project and recommendation detail views. */
export function InfoModal({ content, onHide }: InfoModalProps) {
  return (
    <Modal show={content !== null} onHide={onHide} aria-labelledby="info-modal-title" centered={false}>
      {content && (
        <>
          <Modal.Header closeButton>
            <Modal.Title as="h5" id="info-modal-title">
              {content.title}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <ContentBlocks blocks={content.blocks} />
          </Modal.Body>
          {content.link && (
            <Modal.Footer>
              <button
                type="button"
                className="btn btn-dark btn-lg px-4 py-2 border-radius-30"
                onClick={() => window.open(content.link!.href, '_blank', 'noopener')}
              >
                {content.link.label}
              </button>
            </Modal.Footer>
          )}
        </>
      )}
    </Modal>
  );
}
