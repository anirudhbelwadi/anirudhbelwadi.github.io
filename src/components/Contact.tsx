import { useEffect, useRef, useState } from 'react';
import { CONTACT_FORM_ENDPOINT, IP_LOOKUP_ENDPOINT } from '../config';
import { useRecaptcha } from '../hooks/useRecaptcha';

export function Contact() {
  const formRef = useRef<HTMLFormElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [ipAddress, setIpAddress] = useState('');
  const recaptcha = useRecaptcha();

  useEffect(() => {
    let cancelled = false;
    fetch(IP_LOOKUP_ENDPOINT)
      .then((response) => response.json() as Promise<{ ip: string }>)
      .then(({ ip }) => {
        if (!cancelled) setIpAddress(ip);
      })
      .catch((error: unknown) => {
        console.error('Error fetching IP address:', error);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // The loader overlay covers the page, so the body must not scroll behind it.
  useEffect(() => {
    document.body.classList.toggle('stop-scrolling', submitting);
    return () => document.body.classList.remove('stop-scrolling');
  }, [submitting]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = formRef.current;
    if (!form) return;

    const token = recaptcha.getResponse();
    if (!token) {
      alert('Please complete the CAPTCHA verification.');
      return;
    }

    setSubmitting(true);
    const formData = new FormData(form);
    formData.append('g-recaptcha-response', token);

    try {
      await fetch(CONTACT_FORM_ENDPOINT, { method: 'POST', body: formData });
      alert('Thank you for contacting! I will get back to you soon.');
    } catch (error) {
      console.error(error);
    } finally {
      form.reset();
      recaptcha.reset();
      setSubmitting(false);
    }
  };

  return (
    <>
      <section id="contact" className="mt-5">
        <h3 className="title_font text-center">Get In Touch</h3>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="form_container my-4">
                <div className="container py-5 px-5">
                  <form name="contactForm" id="contactForm" method="POST" ref={formRef} onSubmit={handleSubmit}>
                    <div className="row">
                      <div className="col-lg-6 mb-4">
                        <input type="text" className="w-100" required placeholder="Name" name="name" id="name" />
                      </div>
                      <div className="col-lg-6 mb-4">
                        <input type="email" className="w-100" required placeholder="Email ID" name="email" id="email" />
                      </div>
                      <div className="col-12 mb-4">
                        <textarea name="message" id="message" className="w-100" required placeholder="Message" cols={30} />
                      </div>
                      <input type="hidden" name="ip_address" id="ip_address" value={ipAddress} readOnly />
                      <div className="col-12 mb-4">
                        <div ref={recaptcha.containerRef} />
                      </div>
                      <div className="col-12">
                        <button type="submit" className="btn btn-dark btn-lg px-4 py-2 border-radius-30" disabled={submitting}>
                          Submit
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div id="form_loader" style={{ visibility: submitting ? 'visible' : 'hidden' }}>
        <img width="50" src="/assets/images/loader.gif" alt="Sending your message" />
      </div>
    </>
  );
}
