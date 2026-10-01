// The marquee of the greeting. Each row holds its line twice so it can loop without a gap.
const Dot = () => <i className="dot"></i>;
const Greeting = () => <span>Aro! <Dot />Hello, friend <Dot />Come on in <Dot /></span>;
const Place = () => <span>Bar and Vibes <Dot />MG Marg <Dot />Gangtok <Dot /></span>;

export default function Echo(){
  return (
    <div className="echo" aria-hidden="true">
      <div className="row r1"><Greeting /><Greeting /></div>
      <div className="row r2"><Place /><Place /></div>
    </div>
  );
}
