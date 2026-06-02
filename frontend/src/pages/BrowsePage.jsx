import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { getFAQs, getPopularFAQs, searchFAQs } from '../api';
import FAQCard from '../components/FAQCard';
import { SkeletonList } from '../components/Skeleton';

const CATEGORIES = ['All', 'Registration', 'Technical Events', 'Cultural Events', 'Accommodation', 'Transportation', 'General Information'];
const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Popular' },
  { value: 'views', label: 'Most Viewed' },
];

export default function BrowsePage() {
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);

  const isSearching = query.trim().length > 0;

  const faqsQuery = useQuery({
    queryKey: ['faqs', { category, sort, page }],
    queryFn: () => getFAQs({ category: category || undefined, sort, page, limit: 10 }),
    enabled: !isSearching,
    keepPreviousData: true,
  });

  const searchQuery = useQuery({
    queryKey: ['search', { query, category }],
    queryFn: () => searchFAQs({ q: query, category: category || undefined }),
    enabled: isSearching,
  });

  const popularQuery = useQuery({
    queryKey: ['popular'],
    queryFn: () => getPopularFAQs({ limit: 4 }),
  });

  const activeData = isSearching ? searchQuery : faqsQuery;
  const faqs = isSearching ? (activeData.data?.data || []) : (activeData.data?.data || []);
  const pagination = activeData.data?.pagination;

  const handleSearch = (e) => {
    e.preventDefault();
    setQuery(search);
    setPage(1);
  };

  const handleClear = () => {
    setSearch('');
    setQuery('');
    setPage(1);
  };

  return (
    <main>
      <div className="container">
        <div className="page-header">
          <h1>Community <em>FAQ</em></h1>
          <p>Questions and answers from the Samagama community. Search, browse, contribute.</p>
        </div>

        {/* Search */}
        <form className="search-bar" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search questions..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {query && (
            <button type="button" onClick={handleClear} style={{ borderLeft: 'none', background: 'transparent', color: 'var(--gray-600)', borderRight: '1.5px solid var(--black)' }}>
              ✕
            </button>
          )}
          <button type="submit">Search</button>
        </form>

        {/* Filters */}
        <div className="filter-bar">
          <span style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gray-400)', alignSelf: 'center', marginRight: 4 }}>Category</span>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`filter-chip ${(category === '' && cat === 'All') || category === cat ? 'active' : ''}`}
              onClick={() => { setCategory(cat === 'All' ? '' : cat); setPage(1); }}
            >
              {cat}
            </button>
          ))}
          {!isSearching && (
            <>
              <span style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gray-400)', alignSelf: 'center', marginLeft: 12, marginRight: 4 }}>Sort</span>
              {SORTS.map(s => (
                <button
                  key={s.value}
                  className={`filter-chip ${sort === s.value ? 'active' : ''}`}
                  onClick={() => { setSort(s.value); setPage(1); }}
                >
                  {s.label}
                </button>
              ))}
            </>
          )}
        </div>

        <div className="two-col">
          <div>
            {/* Results label */}
            {isSearching && !activeData.isLoading && (
              <div className="section-label" style={{ marginBottom: 16 }}>
                {faqs.length} result{faqs.length !== 1 ? 's' : ''} for "{query}"
              </div>
            )}
            {!isSearching && (
              <div className="section-label" style={{ marginBottom: 16 }}>
                {pagination ? `${pagination.total} question${pagination.total !== 1 ? 's' : ''}` : 'Questions'}
              </div>
            )}

            {activeData.isLoading && <SkeletonList count={6} />}
            {activeData.isError && (
              <div className="empty-state">
                <div className="empty-state__icon">⚠</div>
                <h3>Failed to load</h3>
                <p>Could not connect to the server. Make sure the backend is running.</p>
              </div>
            )}
            {!activeData.isLoading && !activeData.isError && faqs.length === 0 && (
              <div className="empty-state">
                <div className="empty-state__icon">○</div>
                <h3>No questions found</h3>
                <p>
                  {isSearching ? `No results for "${query}". Try different keywords.` : 'Be the first to ask a question.'}
                </p>
                <br />
                <Link to="/ask" className="btn btn-filled btn-sm">Ask a Question</Link>
              </div>
            )}
            {faqs.map(faq => (
              <FAQCard key={faq._id} faq={faq} />
            ))}

            {/* Pagination */}
            {!isSearching && pagination && pagination.pages > 1 && (
              <div className="pagination">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>←</button>
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                  <button key={p} className={page === p ? 'active' : ''} onClick={() => setPage(p)}>{p}</button>
                ))}
                <button disabled={page === pagination.pages} onClick={() => setPage(p => p + 1)}>→</button>
              </div>
            )}
          </div>

          {/* Sidebar: Popular */}
          <aside>
            <div style={{ position: 'sticky', top: 80 }}>
              <div className="section-label" style={{ marginBottom: 14 }}>Popular</div>
              {popularQuery.isLoading && <SkeletonList count={3} />}
              {popularQuery.data && popularQuery.data.length === 0 && (
                <p className="text-sm text-muted">No popular questions yet.</p>
              )}
              {popularQuery.data?.map(faq => (
                <Link key={faq._id} to={`/faq/${faq._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ borderBottom: '1px solid var(--border)', padding: '14px 0', cursor: 'pointer' }}>
                    <div style={{ fontSize: '0.88rem', fontFamily: 'var(--font-display)', lineHeight: 1.3, marginBottom: 4 }}>
                      {faq.title}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <span className="text-sm mono text-muted">▲ {faq.upvoteCount}</span>
                      <span className={`badge ${faq.status === 'Answered' ? 'badge-answered' : 'badge-unanswered'}`} style={{ fontSize: '0.58rem' }}>
                        {faq.status}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
              <div style={{ marginTop: 24 }}>
                <Link to="/ask" className="btn btn-filled" style={{ width: '100%', justifyContent: 'center' }}>
                  + Ask a Question
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
