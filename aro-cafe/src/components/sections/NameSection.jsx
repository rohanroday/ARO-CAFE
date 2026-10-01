export default function NameSection(){
  return (
    <section id="name" aria-labelledby="name-h">
      <div className="wrap">
        <svg className="flight" viewBox="0 0 560 110" aria-hidden="true">
          <path className="trail" d="M10 96C90 96 120 40 200 52s120 50 200 18S500 12 530 22"/>
          <path className="gull" d="M514 24c6-6 13-7 22 1 9-8 16-7 22-1-7-1-13 0-22 6-9-6-15-7-22-6z"/>
        </svg>
        <p className="kicker rv" id="name-h">The name</p>
        <blockquote className="fill">Aro is what you shout across the street when you spot <em>a friend</em>.</blockquote>
        <p className="lede rv">It's a Tibetan hello, warm and a little loud. We opened on MG Marg on June 10, 2025 to give that feeling a home: good coffee in the morning, good food all day, and a good crowd at night.</p>
      </div>
    </section>
  );
}
