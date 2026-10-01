import Wordmark from '../ui/Wordmark.jsx';

export default function Nav(){
  return (
    <nav className="nav" aria-label="Main">
      <a className="brand" href="#top" aria-label="Aro Cafe, back to top">
        <Wordmark />
      </a>
      <ul>
        <li><a href="#menu">Menu</a></li>
        <li><a href="#day">Our day</a></li>
        <li><a href="#team">The A-team</a></li>
        <li><a href="#faq">FAQ</a></li>
      </ul>
      <a className="btn btn-primary" href="#visit">Visit us</a>
    </nav>
  );
}
