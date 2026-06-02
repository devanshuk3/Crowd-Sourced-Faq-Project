import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import toast from 'react-hot-toast';
import { getUnansweredFAQs, createAnswer } from '../api';
import { SkeletonList } from '../components/Skeleton';

const CATEGORY_SHORT = {
  'Registration': 'REG', 'Technical Events': 'TECH', 'Cultural Events': 'CULT',
  'Accommodation': 'ACCM', 'Transportation': 'TRANS', 'General Information': 'GEN',
};

function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function AnswerModal({ faq, onClose }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ content: '', authorName: '', authorEmail: '' });
  const [errors, setErrors] = useState({});

  const mut = useMutation({
    mutationFn: createAnswer,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['unanswered'] });
      qc.invalidateQueries({ queryKey: ['faqs'] });
      toast.success('Answer submitted!');
      onClose();
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to submit'),
  });

  const validate = () => {
    const e = {};
    if (!form.content.trim()) e.content = 'Answer content is required';
    else if (form.content.trim().length < 10) e.content = 'Answer must be at least 10 characters';
    if (!form.authorName.trim()) e.authorName = 'Your name is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    mut.mutate({
      faqId: faq._id,
      content: form.content.trim(),
      author: { name: form.authorName.trim(), email: form.authorEmail.trim() || undefined },
    });
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }} onClick={onClose}>
      <div style={{
        background: 'var(--white)', border: '1.5px solid var(--black)', width: '100%',
        maxWidth: 580, maxHeight: '90vh', overflow: 'auto', padding: '32px',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gray-400)', marginBottom: 6 }}>
              Answering
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', lineHeight: 1.3 }}>{faq.title}</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--gray-400)', flexShrink: 0, marginLeft: 16 }}>✕</button>
        </div>

        {faq.description && (
          <div style={{ background: 'var(--gray-100)', padding: '12px 16px', marginBottom: 24, fontSize: '0.88rem', color: 'var(--gray-600)', lineHeight: 1.6 }}>
            {faq.description}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Your Answer *</label>
            <textarea
              className="form-textarea"
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              placeholder="Write a clear, helpful answer..."
              style={{ minHeight: 140 }}
            />
            {errors.content && <span className="form-error">{errors.content}</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Your Name *</label>
              <input
                className="form-input"
                value={form.authorName}
                onChange={e => setForm(f => ({ ...f, authorName: e.target.value }))}
                placeholder="Full name"
              />
              {errors.authorName && <span className="form-error">{errors.authorName}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Email <span style={{ color: 'var(--gray-400)', fontWeight: 400, textTransform: 'none' }}>(optional)</span></label>
              <input
                className="form-input"
                type="email"
                value={form.authorEmail}
                onChange={e => setForm(f => ({ ...f, authorEmail: e.target.value }))}
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button type="submit" className="btn btn-filled" disabled={mut.isPending}>
              {mut.isPending ? 'Submitting...' : 'Submit Answer'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AnswerPage() {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  const query = useQuery({
    queryKey: ['unanswered', page],
    queryFn: () => getUnansweredFAQs({ page, limit: 10 }),
    keepPreviousData: true,
  });

  const faqs = query.data?.data || [];
  const pagination = query.data?.pagination;

  return (
    <main>
      <div className="container">
        <div className="page-header">
          <h1>Answer <em>Questions</em></h1>
          <p>Help the community by answering unanswered questions. Your knowledge matters.</p>
        </div>

        {query.isLoading && <SkeletonList count={6} />}

        {query.isError && (
          <div className="empty-state">
            <div className="empty-state__icon">⚠</div>
            <h3>Failed to load</h3>
            <p>Could not connect to the server.</p>
          </div>
        )}

        {!query.isLoading && !query.isError && faqs.length === 0 && (
          <div className="empty-state">
            <div className="empty-state__icon">✓</div>
            <h3>All caught up!</h3>
            <p>There are no unanswered questions right now. Check back later.</p>
            <br />
            <Link to="/" className="btn">Browse FAQs</Link>
          </div>
        )}

        {faqs.length > 0 && (
          <>
            <div className="section-label" style={{ marginBottom: 0 }}>
              {pagination?.total} unanswered question{pagination?.total !== 1 ? 's' : ''}
            </div>

            {faqs.map(faq => (
              <div key={faq._id} style={{ borderBottom: '1px solid var(--border)', padding: '22px 0', display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'start' }}>
                <div>
                  <Link to={`/faq/${faq._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', lineHeight: 1.35, marginBottom: 6 }}>{faq.title}</div>
                  </Link>
                  {faq.description && (
                    <div style={{ fontSize: '0.86rem', color: 'var(--gray-600)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: 10 }}>
                      {faq.description}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span className="badge badge-category">{CATEGORY_SHORT[faq.category] || faq.category}</span>
                    <span className="text-sm text-muted mono">{timeAgo(faq.createdAt)}</span>
                    <span className="text-sm text-muted">by {faq.author?.name}</span>
                  </div>
                </div>
                <button className="btn btn-sm btn-filled" onClick={() => setSelected(faq)}>
                  Answer
                </button>
              </div>
            ))}

            {pagination && pagination.pages > 1 && (
              <div className="pagination">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>←</button>
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                  <button key={p} className={page === p ? 'active' : ''} onClick={() => setPage(p)}>{p}</button>
                ))}
                <button disabled={page === pagination.pages} onClick={() => setPage(p => p + 1)}>→</button>
              </div>
            )}
          </>
        )}
      </div>

      {selected && <AnswerModal faq={selected} onClose={() => setSelected(null)} />}
    </main>
  );
}
