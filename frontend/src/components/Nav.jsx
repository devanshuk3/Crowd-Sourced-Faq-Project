import { Link, useLocation } from '@tanstack/react-router';

export default function Nav() {
  const { pathname } = useLocation();

  return (
    <nav>
      <div className="container nav-inner">
        <Link to="/" className="nav-logo">
          Sama<span>gama</span> FAQ
        </Link>
        <ul className="nav-links">
          <li><Link to="/" className={pathname === '/' ? 'active' : ''}>Browse</Link></li>
          <li><Link to="/ask" className={pathname === '/ask' ? 'active' : ''}>Ask</Link></li>
          <li><Link to="/answer" className={pathname === '/answer' ? 'active' : ''}>Answer</Link></li>
          <li><Link to="/stats" className={pathname === '/stats' ? 'active' : ''}>Stats</Link></li>
        </ul>
      </div>
    </nav>
  );
}
