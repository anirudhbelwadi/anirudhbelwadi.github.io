import { headerSocials, profile } from '../data/profile';
import { SocialLinks } from './SocialLinks';

export function Header() {
  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView();
  };

  return (
    <header>
      <div className="header_background">
        <div className="header_content">
          <div className="container">
            <div className="row px-5 pt-3 pb-1">
              <div className="col-lg-6">
                <h1 className="mt-2">{profile.fullName}</h1>
                <p>{profile.roles}</p>
              </div>
              <div className="col-lg-6 mb-3">
                <SocialLinks links={headerSocials} />
              </div>
            </div>
            <div className="row px-5 align-items-center h-100">
              <div className="col-lg-6 mb-3">
                <div className="header_name_content">
                  <h2 className="text-secondary">{profile.greeting}</h2>
                </div>
                <div className="header_tagline_content mt-4">
                  <span className="type title_font">{profile.tagline}</span>
                </div>
                <div className="header_button mt-4">
                  <button
                    type="button"
                    className="btn btn-dark btn-lg px-4 py-2 border-radius-30"
                    onClick={scrollToContact}
                  >
                    Get In Touch
                  </button>
                </div>
              </div>
              <div className="col-lg-6 mb-3 text-center">
                <img src={profile.heroImage} className="w-75" alt="Anirudh Belwadi Profile Photo" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
