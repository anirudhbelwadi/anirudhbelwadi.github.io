import { footerSocials, profile } from '../data/profile';
import { SocialLinks } from './SocialLinks';

interface FooterProps {
  visitCount: number | null;
}

export function Footer({ visitCount }: FooterProps) {
  return (
    <footer className="mt-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-10">
            <SocialLinks links={footerSocials} className="icons justify-content-center" />
          </div>
          <div className="col-10 text-center">
            <hr />
            <br />
            {profile.copyright}
            <br />
            <br />
            <p id="visit_counter">
              <strong>No of visits:</strong> <span id="visit_count">{visitCount ?? 0}</span>
              <br />
              <br />
              <a href="/privacy.html" style={{ color: '#3B82F6' }}>
                Privacy Policy
              </a>
            </p>
            <p className="text-center">
              <b>Liked my work?</b>
              <br />
              <br />
              <a href={profile.buyMeACoffee} target="_blank" rel="noopener noreferrer">
                <img
                  alt="Buy me a book"
                  height="40"
                  src="https://img.buymeacoffee.com/button-api/?text=Buy me a book&emoji=📖&slug=anirudhbelwadi&button_colour=000000&font_colour=FFFFFF&font_family=Arial&outline_colour=000000&coffee_colour=ffffff"
                />
              </a>
            </p>
          </div>
        </div>
        <br />
      </div>
    </footer>
  );
}
