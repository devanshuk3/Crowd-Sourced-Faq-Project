import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { getStats, getPopularFAQs, getFAQs } from '../api';

export default function StatsPage() {
  const statsQuery = useQuery({ queryKey: ['stats'], queryFn: getStats });
  const popularQuery = useQuery({ queryKey: ['popular', 10], queryFn: () => getPopularFAQs({ limit: 10 }) });
  const recentQuery = useQuery({ queryKey: ['recent-stats'], queryFn: () => getFAQs({ sort: 'newest', limit: 5 }) });

  const stats = statsQuery.data;
  const popular = popularQuery.data || [];
  const recent = recentQuery.data?.data || [];

  const answeredPct = stats ? Math.round((stats.answered / (stats.total || 1)) * 100) : 0;

  return (
    <main>
      <div className="container">
        <div className="page-header">
          <h1>Analytics <em>Dashboard</em></h1>
          <p>Community statistics and insights for the Samagama FAQ platform.</p>
        </div>

        {statsQuery.isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0, border: '1.5px solid var(--black)', marginBottom: 40 }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ padding: '20px 24px', borderRight: i < 3 ? '1px solid var(--border)' : 'none' }}>
                <div className="skeleton" style={{ height: 40, width: 60, marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 12, width: 80 }} />
              </div>
            ))}
          </div>
        ) : stats ? (
          <>
            <div className="stats-bar">
              <div className="stat-item">
                <div className="stat-number">{stats.total}</div>
                <div className="stat-label">Total Questions</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{stats.answered}</div>
                <div className="stat-label">Answered</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{stats.unanswered}</div>
                <div className="stat-label">Unanswered</div>
              </div>
            </div>

            {/* Answer rate bar */}
            <div style={{ marginBottom: 40 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gray-600)' }}>Answer Rate</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: 500 }}>{answeredPct}%</span>
              </div>
              <div style={{ height: 6, background: 'var(--gray-200)', width: '100%' }}>
                <div style={{ height: '100%', background: 'var(--black)', width: `${answeredPct}%`, transition: 'width 0.6s ease' }} />
              </div>
            </div>
          </>
        ) : null}

        <div className="two-col">
          {/* Popular questions */}
          <div>
            <div className="section-label" style={{ marginBottom: 16 }}>Most Upvoted Questions</div>
            {popularQuery.isLoading && (
              <>
                {[1,2,3,4,5].map(i => (
                  <div key={i} style={{ borderBottom: '1px solid var(--border)', padding: '16px 0' }}>
                    <div className="skeleton" style={{ height: 18, width: '75%', marginBottom: 8 }} />
                    <div className="skeleton" style={{ height: 12, width: '40%' }} />
                  </div>
                ))}
              </>
            )}
            {popular.map((faq, idx) => (
              <Link key={faq._id} to={`/faq/${faq._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ borderBottom: '1px solid var(--border)', padding: '16px 0', display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 14, alignItems: 'center', cursor: 'pointer' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--gray-400)', width: 20 }}>
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', lineHeight: 1.3, marginBottom: 4 }}>
                      {faq.title}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <span className={`badge ${faq.status === 'Answered' ? 'badge-answered' : 'badge-unanswered'}`} style={{ fontSize: '0.58rem' }}>{faq.status}</span>
                      <span className="text-sm text-muted">{faq.viewCount || 0} views</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>{faq.upvoteCount || 0}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>votes</div>
                  </div>
                </div>
              </Link>
            ))}
            {!popularQuery.isLoading && popular.length === 0 && (
              <p className="text-sm text-muted" style={{ paddingTop: 16 }}>No questions yet.</p>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <div style={{ position: 'sticky', top: 80 }}>
              {/* Recent questions */}
              <div className="section-label" style={{ marginBottom: 14 }}>Recent Questions</div>
              {recent.map(faq => (
                <Link key={faq._id} to={`/faq/${faq._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ borderBottom: '1px solid var(--border)', padding: '12px 0', cursor: 'pointer' }}>
                    <div style={{ fontSize: '0.86rem', fontFamily: 'var(--font-display)', lineHeight: 1.3, marginBottom: 4 }}>
                      {faq.title}
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <span className={`badge ${faq.status === 'Answered' ? 'badge-answered' : 'badge-unanswered'}`} style={{ fontSize: '0.56rem' }}>{faq.status}</span>
                      <span className="badge badge-category" style={{ fontSize: '0.56rem' }}>{faq.category}</span>
                    </div>
                  </div>
                </Link>
              ))}

              {/* Quick actions */}
              <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div className="section-label" style={{ marginBottom: 6 }}>Quick Actions</div>
                <Link to="/ask" className="btn btn-filled" style={{ justifyContent: 'center' }}>+ Ask a Question</Link>
                <Link to="/answer" className="btn" style={{ justifyContent: 'center' }}>Answer Questions</Link>
                <Link to="/" className="btn btn-ghost" style={{ justifyContent: 'center' }}>Browse All FAQs</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
