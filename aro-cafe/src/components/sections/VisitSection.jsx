import { MAPS_URL, INSTAGRAM_URL } from '../../data/site.js';

export default function VisitSection(){
  return (
    <section id="visit" aria-labelledby="visit-h">
      <div className="wrap">
        <div className="visit-card">
          <div className="bg" aria-hidden="true"></div>
          <div className="visit-in">
            <p className="kicker rv">Come say it in person</p>
            <h2 className="title rv" id="visit-h">See you on MG Marg.</h2>
            <p className="lede rv">Pull up a chair, order something cold or something strong, and say Aro. We'll say it back.</p>
            <dl className="facts rv">
              <div><dt>Where</dt><dd>MG Marg, Gangtok, Sikkim 737101</dd></div>
              <div><dt>Hours</dt><dd>9:00am to 9:00pm</dd></div>
              <div><dt>Instagram</dt><dd><a href={INSTAGRAM_URL} target="_blank" rel="noopener">@_aro.cafe_</a></dd></div>
              <div><dt>Delivery</dt><dd>On Dash, across Gangtok</dd></div>
            </dl>
            <div className="row rv">
              <a className="btn btn-primary" href={MAPS_URL} target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>Get directions</a>
              <a className="btn btn-ghost" href={INSTAGRAM_URL} target="_blank" rel="noopener">Message us</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
