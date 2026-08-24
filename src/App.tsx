import { useEffect } from 'react';
import { About } from './components/About';
import { Admits } from './components/Admits';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { Projects } from './components/Projects';
import { Recommendations } from './components/Recommendations';
import { VisitorChatbot } from './components/VisitorChatbot';
import { VisitorGate } from './components/VisitorGate';
import { useContent } from './hooks/useContent';
import { useIsMobile } from './hooks/useIsMobile';
import { useVisitorTracking } from './hooks/useVisitorTracking';

export function App() {
  const isMobile = useIsMobile();
  const { projects, recommendations } = useContent();
  const { visitCount, hasIntroducedBefore, submitVisitorMeta } = useVisitorTracking(isMobile);

  // Browsers restore the previous scroll position on reload; the page is meant
  // to start at the header.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Wait for the backend before deciding: showing the prompt to someone who has
  // already introduced themselves would be a regression from the old site.
  const showPrompt = hasIntroducedBefore === false;

  return (
    <>
      {showPrompt &&
        (isMobile ? (
          <VisitorGate onSubmit={submitVisitorMeta} />
        ) : (
          <VisitorChatbot onSubmit={submitVisitorMeta} />
        ))}

      <Header />
      <About />
      <Projects projects={projects} />
      <br />
      <br />
      <Admits />
      <br />
      <br />
      <Recommendations recommendations={recommendations} />
      <br />
      <br />
      <Contact />
      <Footer visitCount={visitCount} />
    </>
  );
}
