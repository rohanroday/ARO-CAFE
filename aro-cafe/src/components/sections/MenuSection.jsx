import { MENU } from '../../data/menu.js';
import { asset, INSTAGRAM_URL } from '../../data/site.js';

export default function MenuSection(){
  return (
    <section id="menu" aria-labelledby="menu-h">
      <div className="wrap">
        <p className="kicker rv">On the table</p>
        <h2 className="title rv" id="menu-h">Something good for every hour.</h2>
        <p className="lede rv">Cafe in the morning, kitchen all day, bar when the lights come on.</p>
        <p className="swipe-hint">Swipe to see more &rarr;</p>
        <div className="bento">
          {MENU.map(item => (
            <article className={`tile ${item.tile}`} key={item.tile}>
              <div className="ph"><img src={asset(item.img)} alt={item.alt} loading="lazy" width={item.width} height={item.height} style={item.objectPosition ? { objectPosition: item.objectPosition } : undefined}/></div>
              <div className="tx"><h3>{item.title}</h3><p>{item.text}</p></div>
            </article>
          ))}
        </div>
        <p className="menu-note">The full menu lives in our <a href={INSTAGRAM_URL} target="_blank" rel="noopener">Instagram highlights</a>.</p>
      </div>
    </section>
  );
}
