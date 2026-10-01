// "Say it with us": press and hold the button. The hold logic lives in animation/holdToSayAro.js.
export default function HelloSection(){
  return (
    <section id="hello" aria-labelledby="hello-h">
      <div className="wrap">
        <div className="hello-card">
          <p className="kicker">Try it</p>
          <h2 className="title" id="hello-h">Say it with us.</h2>
          <p className="lede">Press and hold the button to say Aro. We'll say it back.</p>
          <button className="hold" id="holdBtn" type="button" aria-describedby="holdHint">
            <svg className="prog" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="48" pathLength="1"/></svg>
            <span className="waves" aria-hidden="true"></span>
            Aro!<small id="holdHint">Press and hold</small>
          </button>
          <p className="answer" aria-live="polite"></p>
          <div className="hello-cards">
            <div className="hc"><b>Open 9am to 9pm</b><span>Coffee first, cocktails later.</span></div>
            <div className="hc"><b>MG Marg, Gangtok</b><span>Look for the blue sign and the flowers.</span></div>
            <div className="hc"><b>Delivery on Dash</b><span>Sushi, ramen and matcha, anywhere in Gangtok.</span></div>
          </div>
          <div className="hello-go"><a className="btn btn-primary" href="#visit">Find your way to us</a></div>
        </div>
      </div>
    </section>
  );
}
