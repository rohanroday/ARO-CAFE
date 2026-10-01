import Wordmark from '../ui/Wordmark.jsx';
import { MAPS_URL, INSTAGRAM_URL } from '../../data/site.js';

export default function Footer(){
  return (
    <footer>
      <div className="wrap">
        <div className="bye">
          <svg className="gull" viewBox="0 0 40 14" aria-hidden="true"><path d="M1 9c5-5 11-6 19 1 8-7 14-6 19-1-6-1-11 0-19 5C12 9 7 8 1 9z" fill="#1C2B78"/></svg>
          <p className="kicker rv">Until we meet</p>
          <h2 className="rv">Thank you for stopping by. Now come say <em>Aro</em> in person.</h2>
          <p className="lede rv">Do give us a visit. The door is open from 9am to 9pm, the coffee is on, and there is always a chair waiting for you. Bring a friend, or come and make one here.</p>
          <div className="row rv">
            <a className="btn btn-primary" href={MAPS_URL} target="_blank" rel="noopener">Get directions</a>
            <a className="btn btn-ghost" href={INSTAGRAM_URL} target="_blank" rel="noopener">Say hi on Instagram</a>
          </div>
        </div>
        <div className="foot">
          <div className="where">
            <Wordmark />
            <p>Bar and Vibes. MG Marg, Gangtok, Sikkim. Open 9am to 9pm.</p>
          </div>
          <ul>
            <li><a href="#menu">Menu</a></li>
            <li><a href="#day">Our day</a></li>
            <li><a href="#faq">FAQ</a></li>
            <li><a href="#visit">Visit us</a></li>
          </ul>
          <p className="small">&copy; 2026 Aro Cafe. Made with love in Gangtok. See you soon, friend.</p>
        </div>
      </div>
    </footer>
  );
}
