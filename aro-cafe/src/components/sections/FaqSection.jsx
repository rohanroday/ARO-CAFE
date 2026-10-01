import { FAQ } from '../../data/faq.js';

export default function FaqSection(){
  return (
    <section id="faq" aria-labelledby="faq-h">
      <div className="wrap faq-grid">
        <div>
          <p className="kicker rv">Good to know</p>
          <h2 className="title rv" id="faq-h">Before you come over.</h2>
          <p className="lede rv">Anything else? Send us a message on Instagram. Someone from the A-team will reply.</p>
        </div>
        <div className="faq-list">
          {FAQ.map(item => (
            <details key={item.q}><summary>{item.q}</summary><p>{item.a}</p></details>
          ))}
        </div>
      </div>
    </section>
  );
}
