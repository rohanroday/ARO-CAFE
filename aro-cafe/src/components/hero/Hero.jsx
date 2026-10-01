import PhoneHero from './PhoneHero.jsx';
import ScrollHero from './ScrollHero.jsx';

// Both heroes are always in the page; the stylesheet shows the right one
// (phones get the looping film, larger screens get the scroll journey).
export default function Hero(){
  return (
    <header id="top">
      <PhoneHero />
      <ScrollHero />
    </header>
  );
}
