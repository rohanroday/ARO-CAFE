import { asset } from '../../data/site.js';

export default function TeamSection(){
  return (
    <section id="team" aria-labelledby="team-h">
      <div className="wrap duo">
        <div className="team-photos">
          <div className="main"><img src={asset('a-team.jpg')} alt="Two Aro Cafe baristas in A-team t-shirts at the coffee bar" loading="lazy" width="399" height="501"/></div>
          <div className="side"><img src={asset('interior-busy.jpg')} alt="The A-team serving guests in the busy Aro Cafe dining room" loading="lazy" width="400" height="500"/></div>
        </div>
        <div>
          <p className="kicker rv">The A-team</p>
          <h2 className="title rv" id="team-h">The crew who'll say it first.</h2>
          <p className="lede rv">Walk in and someone will call out Aro before you've found a seat. They run the coffee bar, the kitchen and the night shift, all with the same big hello.</p>
          <div className="stats rv">
            <div className="stat"><b data-count="2700" data-suffix="+">2,700+</b><span>friends following along on Instagram</span></div>
            <div className="stat"><b data-count="12">12</b><span>hours a day, 9am to 9pm</span></div>
            <div className="stat"><b>2025</b><span>opened on MG Marg, June 10</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}
