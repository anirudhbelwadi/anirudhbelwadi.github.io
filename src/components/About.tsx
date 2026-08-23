import { Fragment } from 'react';
import { profile } from '../data/profile';

export function About() {
  return (
    <section id="about" className="mt-5">
      <div className="row px-5 align-items-center">
        <div className="col-lg-7 mb-3 px-5 order-lg-2">
          <div className="title_font">About me</div>
          <div className="content_font mt-2">
            {profile.about.map((paragraph, index) => (
              <Fragment key={index}>
                {index > 0 && (
                  <>
                    <br />
                    <br />
                  </>
                )}
                {paragraph}
              </Fragment>
            ))}
          </div>
        </div>
        <div className="col-lg-5 mb-3 px-5 text-center order-lg-1">
          <img src={profile.aboutImage} className="w-100 rounded" alt="Anirudh Belwadi Profile Photo" />
        </div>
      </div>
    </section>
  );
}
