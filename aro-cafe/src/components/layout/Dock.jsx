import { MAPS_URL } from '../../data/site.js';

// Phones only: a directions bar that stays one thumb away.
export default function Dock(){
  return (
    <a className="dock" href={MAPS_URL} target="_blank" rel="noopener" aria-label="Get directions to Aro Cafe on MG Marg">
      <span><b>Aro cafe</b>Open 9am to 9pm</span>
      <span className="btn btn-primary">Directions</span>
    </a>
  );
}
