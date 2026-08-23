import { admits } from '../data/admits';
import { useIsMobile } from '../hooks/useIsMobile';

export function Admits() {
  // The logos fade in on hover, which never fires on touch devices — show them
  // at full opacity there instead.
  const isMobile = useIsMobile();

  return (
    <section id="admits" className="mt-5">
      <h3 className="title_font text-center">A Season of Success: 2023-24 Admits</h3>
      <div className="container">
        <div className="row justify-content-center align-items-center text-center mt-5">
          {admits.map((admit) => (
            <div className="col-xl-3 col-lg-4 col-md-6 mb-5 px-5" key={admit.href}>
              <a href={admit.href} target="_blank" rel="noopener noreferrer">
                <img className="w-75" src={admit.logo} alt="" style={isMobile ? { opacity: 1 } : undefined} />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
