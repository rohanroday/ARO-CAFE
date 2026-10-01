// Phone hero: the looping film on top, the welcome underneath.
// The video source and the frame-by-frame fallback are handled in animation/phoneFilm.js.
export default function PhoneHero(){
  return (
    <section className="m-hero" aria-label="Welcome to Aro Cafe">
      <div className="m-film" aria-hidden="true">
        <video muted loop playsInline webkit-playsinline="" preload="auto" disablePictureInPicture disableRemotePlayback tabIndex={-1}></video>
        <canvas></canvas>
      </div>
      <div className="m-in">
        <span className="kick chip">MG Marg · Gangtok · Sikkim</span>
        <h1><em>Aro!</em> Pull up a chair.</h1>
        <p>A warm Tibetan hello, good coffee, good food and a good crowd. Open 9am to 9pm.</p>
        <div className="row">
          <a className="btn btn-primary" href="#visit">Get directions</a>
          <a className="btn btn-ghost" href="#menu">See the menu</a>
        </div>
        <div className="dots" aria-hidden="true"><i></i><i></i><i></i></div>
      </div>
    </section>
  );
}
