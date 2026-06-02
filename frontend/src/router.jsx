import { createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router';
import Nav from './components/Nav';
import BrowsePage from './pages/BrowsePage';
import AskPage from './pages/AskPage';
import AnswerPage from './pages/AnswerPage';
import FAQDetailPage from './pages/FAQDetailPage';
import StatsPage from './pages/StatsPage';
import LoginPage from './pages/LoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

// Root layout
const rootRoute = createRootRoute({
  component: () => (
    <>
      <Nav />
      <Outlet />
      <footer style={{ borderTop: '1px solid var(--border)', marginTop: 80, padding: '28px 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem' }}>
            Sama<em style={{ fontStyle: 'italic', color: 'var(--gray-400)' }}>gama</em> FAQ
          </span>
          <span style={{ fontSize: '0.78rem', color: 'var(--gray-400)', fontFamily: 'var(--font-mono)' }}>
            Community · Open · Collaborative
          </span>
        </div>
      </footer>
    </>
  ),
});

const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: BrowsePage });
const askRoute = createRoute({ getParentRoute: () => rootRoute, path: '/ask', component: AskPage });
const answerRoute = createRoute({ getParentRoute: () => rootRoute, path: '/answer', component: AnswerPage });
const statsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/stats', component: StatsPage });
const loginRoute = createRoute({ getParentRoute: () => rootRoute, path: '/login', component: LoginPage });
const adminRoute = createRoute({ getParentRoute: () => rootRoute, path: '/admin', component: AdminDashboardPage });
const faqDetailRoute = createRoute({ getParentRoute: () => rootRoute, path: '/faq/$id', component: FAQDetailPage });

const routeTree = rootRoute.addChildren([indexRoute, askRoute, answerRoute, statsRoute, loginRoute, adminRoute, faqDetailRoute]);

export const router = createRouter({ routeTree });
