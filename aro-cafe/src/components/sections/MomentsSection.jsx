import { MOMENTS } from '../../data/moments.js';
import { asset } from '../../data/site.js';

export default function MomentsSection(){
  return (
    <section id="moments" aria-labelledby="moments-h">
      <div className="wrap">
        <p className="kicker rv">Real moments</p>
        <h2 className="title rv" id="moments-h">Proof it's fun in here.</h2>
        <p className="lede rv">No stock photos. Just our room, our food, and the people who fill it.</p>
        <div className="wall">
          {MOMENTS.map(m => (
            <figure className="pola" style={{ '--r': m.tilt }} key={m.img}><div className="ph"><img src={asset(m.img)} alt={m.alt} loading="lazy" width={m.width} height={m.height}/></div><figcaption>{m.caption}</figcaption></figure>
          ))}
        </div>
      </div>
    </section>
  );
}
