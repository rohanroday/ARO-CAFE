// Scroll journey hero (tablets and up): a WebGL film scrubbed by scroll, with six caption bands.
// data-a / data-b are where each band enters and leaves (0 to 1 of the scroll), data-fx is its entrance.
// The animation engine reads these in animation/site.js.
export default function ScrollHero(){
  return (
    <section id="hero" aria-label="Aro Cafe, from the clouds to your cup">
      <div className="stage">
        <div className="glwrap" aria-hidden="true"><canvas id="gl" tabIndex={-1}></canvas></div>
        <div className="shade" aria-hidden="true"></div>

        <div className="band b1" data-a="0" data-b="0.15" data-fx="punch">
          <span className="kick chip">MG Marg · Gangtok · Sikkim</span>
          <h1 className="split">Aro!</h1>
          <p className="sub-plain">A warm hello, said out loud, the Tibetan way. It's our name, and it's how we'll greet you.</p>
        </div>
        <div className="band b2" data-a="0.18" data-b="0.31" data-fx="drift">
          <h2 className="split">Come down from the clouds.</h2>
          <p className="sub-plain">Every Gangtok morning starts up here, in the mist.</p>
        </div>
        <div className="band b3" data-a="0.36" data-b="0.49" data-fx="blur">
          <h2><span className="sr-only">Into the heart of town.</span><span className="blurwrap" aria-hidden="true"><span className="soft">Into the heart of town.</span><span className="sharp">Into the heart of town.</span></span></h2>
          <p className="sub-plain">Right on MG Marg, where all of Gangtok comes out to walk.</p>
        </div>
        <div className="band b4" data-a="0.53" data-b="0.64" data-fx="depth">
          <h2 className="dline">Your people are already inside.</h2>
          <p className="sub-plain">Coffee, sushi, ramen and cocktails, served by the A-team.</p>
        </div>
        <div className="band b5" data-a="0.69" data-b="0.83" data-fx="scatter" data-spread="0.55">
          <h2 className="split">Mountain clouds, poured over ice.</h2>
          <p className="sub-plain">Cold brew, sweet cream, and a slow minute to yourself.</p>
        </div>
        <div className="band b6" data-a="0.88" data-b="1" data-fx="rise" data-ramp="0.06">
          <h2 className="split">Pull up a chair. Say Aro.</h2>
          <p className="sub-fade">Open 9am to 9pm on MG Marg, Gangtok. Walk in, we'll find you a seat.</p>
          <div className="row cta-fade">
            <a className="btn btn-primary" href="#visit">Get directions</a>
            <a className="btn btn-ghost" href="#menu">See the menu</a>
          </div>
        </div>

        <div className="rail" aria-hidden="true">
          <div className="track"><i></i></div>
          <ol><li className="on">01 The peaks</li><li>02 Gangtok</li><li>03 Your cup</li></ol>
        </div>
        <div className="cue" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
          <span>Scroll to come down</span>
        </div>
      </div>
    </section>
  );
}
