import { useState } from 'react';
import { useParams, Link, useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getFAQById, upvoteFAQ, upvoteAnswer, createAnswer, deleteFAQ } from '../api';

function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function InlineAnswerForm({ faqId, onDone }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ content: '', authorName: '', authorEmail: '' });
  const [errors, setErrors] = useState({});
  const [open, setOpen] = useState(false);

  const mut = useMutation({
    mutationFn: createAnswer,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['faq', faqId] });
      qc.invalidateQueries({ queryKey: ['unanswered'] });
      qc.invalidateQueries({ queryKey: ['faqs'] });
      toast.success('Answer submitted!');
      setOpen(false);
      setForm({ content: '', authorName: '', authorEmail: '' });
      onDone?.();
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to submit'),
  });

  const validate = () => {
    const e = {};
    if (!form.content.trim()) e.content = 'Answer is required';
    else if (form.content.trim().length < 10) e.content = 'Too short';
    if (!form.authorName.trim()) e.authorName = 'Name required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  if (!open) return (
    <button className="btn btn-filled" style={{ marginTop: 8 }} onClick={() => setOpen(true)}>
      + Write an Answer
    </button>
  );

  return (
    <div style={{ border: '1.5px solid var(--black)', padding: 24, marginTop: 16 }}>
      <div style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
        Your Answer
      </div>
      <form onSubmit={(e) => { e.preventDefault(); if (validate()) mut.mutate({ faqId, content: form.content.trim(), author: { name: form.authorName.trim(), email: form.authorEmail || undefined } }); }} noValidate>
        <div className="form-group">
          <textarea className="form-textarea" value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="Write a clear, helpful answer..." style={{ minHeight: 120 }} />
          {errors.content && <span className="form-error">{errors.content}</span>}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Name *</label>
            <input className="form-input" value={form.authorName} onChange={e => setForm(f => ({ ...f, authorName: e.target.value }))} placeholder="Full name" />
            {errors.authorName && <span className="form-error">{errors.authorName}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Email <span style={{ color: 'var(--gray-400)', fontWeight: 400, textTransform: 'none' }}>(optional)</span></label>
            <input className="form-input" type="email" value={form.authorEmail} onChange={e => setForm(f => ({ ...f, authorEmail: e.target.value }))} placeholder="you@example.com" />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="submit" className="btn btn-filled btn-sm" disabled={mut.isPending}>
            {mut.isPending ? 'Submitting...' : 'Submit Answer'}
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

export default function FAQDetailPage() {
  const { id } = useParams({ from: '/faq/$id' });
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['faq', id],
    queryFn: () => getFAQById(id),
  });

  const upvoteFAQMut = useMutation({
    mutationFn: () => upvoteFAQ(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['faq', id] }); toast.success('Upvoted'); },
  });

  const upvoteAnswerMut = useMutation({
    mutationFn: (answerId) => upvoteAnswer(answerId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['faq', id] }); toast.success('Upvoted'); },
  });

  const deleteMut = useMutation({
    mutationFn: () => deleteFAQ(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['faqs'] }); toast.success('Deleted'); navigate({ to: '/' }); },
    onError: () => toast.error('Failed to delete'),
  });

  if (isLoading) return (
    <div className="container" style={{ paddingTop: 48 }}>
      <div className="skeleton" style={{ height: 32, width: '60%', marginBottom: 16 }} />
      <div className="skeleton" style={{ height: 16, width: '80%', marginBottom: 8 }} />
      <div className="skeleton" style={{ height: 16, width: '70%' }} />
    </div>
  );

  if (isError || !data) return (
    <div className="container" style={{ paddingTop: 48 }}>
      <div className="empty-state">
        <div className="empty-state__icon">⚠</div>
        <h3>Not found</h3>
        <p>This question doesn't exist or couldn't be loaded.</p>
        <br /><Link to="/" className="btn">Go Back</Link>
      </div>
    </div>
  );

  const answers = data.answers || [];

  return (
    <main>
      <div className="container" style={{ maxWidth: 820 }}>
        {/* Breadcrumb */}
        <div style={{ padding: '16px 0', borderBottom: '1px solid var(--border)', marginBottom: 0, display: 'flex', gap: 8, alignItems: 'center', fontSize: '0.78rem', color: 'var(--gray-400)' }}>
          <Link to="/" style={{ color: 'var(--gray-400)', textDecoration: 'none' }}>FAQ</Link>
          <span>→</span>
          <span style={{ color: 'var(--gray-600)' }}>{data.category}</span>
        </div>

        {/* Question */}
        <div className="detail-question">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
            <h1>{data.title}</h1>
            <button
              className="upvote-btn"
              style={{ flexShrink: 0, flexDirection: 'row', gap: 6 }}
              onClick={() => upvoteFAQMut.mutate()}
              disabled={upvoteFAQMut.isPending}
            >
              <span>▲</span>
              <span>{data.upvoteCount || 0}</span>
            </button>
          </div>

          <div style={{ display: 'flex', gap: 10, margin: '16px 0', flexWrap: 'wrap', alignItems: 'center' }}>
            <span className={`badge ${data.status === 'Answered' ? 'badge-answered' : 'badge-unanswered'}`}>{data.status}</span>
            <span className="badge badge-category">{data.category}</span>
            <span className="text-sm text-muted">Asked by <strong>{data.author?.name}</strong></span>
            <span className="text-sm text-muted mono">{timeAgo(data.createdAt)}</span>
            <span className="text-sm text-muted">{data.viewCount} views</span>
          </div>

          {data.description && (
            <div className="detail-question__desc">{data.description}</div>
          )}

          {data.tags?.length > 0 && (
            <div style={{ display: 'flex', gap: 6, marginTop: 16, flexWrap: 'wrap' }}>
              {data.tags.map(tag => (
                <span key={tag} className="badge badge-category">{tag}</span>
              ))}
            </div>
          )}

          {/* Admin-style delete */}
          <div style={{ marginTop: 20 }}>
            <button
              className="btn btn-ghost btn-sm"
              style={{ color: '#c00', borderColor: '#c00' }}
              onClick={() => { if (window.confirm('Delete this question? This cannot be undone.')) deleteMut.mutate(); }}
              disabled={deleteMut.isPending}
            >
              Delete Question
            </button>
          </div>
        </div>

        {/* Answers */}
        <div style={{ marginBottom: 32 }}>
          <div className="section-label" style={{ marginBottom: 20 }}>
            {answers.length} Answer{answers.length !== 1 ? 's' : ''}
          </div>

          {answers.length === 0 && (
            <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--gray-400)', borderBottom: '1px solid var(--border)' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: 6 }}>No answers yet</p>
              <p style={{ fontSize: '0.88rem' }}>Be the first to answer this question.</p>
            </div>
          )}

          {answers.map((ans) => (
            <div key={ans._id} className={`answer-card${ans.isAccepted ? ' accepted' : ''}`}>
              {ans.isAccepted && (
                <div style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--black)', marginBottom: 10 }}>
                  ✓ Accepted Answer
                </div>
              )}
              <div className="answer-content">{ans.content}</div>
              <div className="answer-meta">
                <span>By <strong>{ans.author?.name}</strong> · {timeAgo(ans.createdAt)}</span>
                <button
                  className="upvote-btn"
                  style={{ flexDirection: 'row', gap: 6, padding: '4px 10px' }}
                  onClick={() => upvoteAnswerMut.mutate(ans._id)}
                  disabled={upvoteAnswerMut.isPending}
                >
                  <span>▲</span>
                  <span>{ans.upvoteCount || 0}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Inline answer form */}
        <InlineAnswerForm faqId={id} />

        <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
          <Link to="/" className="btn btn-ghost btn-sm">← Back to all questions</Link>
        </div>
      </div>
    </main>
  );
}
