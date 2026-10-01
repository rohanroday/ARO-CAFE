import { TIMELINE } from '../../data/timeline.js';

// Line drawings for each stop of the day.
const ICONS = {
  sunrise: <><circle cx="16" cy="18" r="6"/><path d="M16 5v4M5 18h3M24 18h3M8 10l2 2M24 10l-2 2M4 26h24"/></>,
  bowl: <><path d="M5 16h22a11 11 0 0 1-22 0z"/><path d="M9 11c0-2 2-2 2-4M15 11c0-2 2-2 2-4M21 11c0-2 2-2 2-4"/></>,
  cocktail: <><path d="M8 6h16l-8 11z"/><path d="M16 17v9M11 26h10"/></>,
  moon: <path d="M22 20A9 9 0 0 1 12 6a10 10 0 1 0 10 14z"/>,
};

export default function DaySection(){
  return (
    <section id="day" aria-labelledby="day-h">
      <div className="wrap">
        <p className="kicker rv">A day at Aro</p>
        <h2 className="title rv" id="day-h">9am to 9pm. Three moods, one room.</h2>
        <p className="lede rv">Come back at a different hour and it feels like a different place. Same people, same hello.</p>
        <div className="timeline">
          <svg className="path" viewBox="0 0 1000 60" preserveAspectRatio="none" aria-hidden="true"><path d="M32 2C200 2 250 58 400 30S620 2 760 30 900 58 1000 30"/></svg>
          <svg className="vpath" viewBox="0 0 4 100" preserveAspectRatio="none" aria-hidden="true"><path d="M2 0V100"/></svg>
          <ol className="steps">
            {TIMELINE.map(step => (
              <li className="step" key={step.time}><div className="ico" aria-hidden="true"><svg viewBox="0 0 32 32">{ICONS[step.icon]}</svg></div><time>{step.time}</time><h3>{step.title}</h3><p>{step.text}</p></li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
