import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { createFAQ, getSimilarFAQs } from '../api';

const CATEGORIES = [
  'Registration', 'Technical Events', 'Cultural Events',
  'Accommodation', 'Transportation', 'General Information'
];

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function AskPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    authorName: '',
    authorEmail: '',
    tags: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    try {
      const userJson = localStorage.getItem('user');
      if (userJson) {
        const user = JSON.parse(userJson);
        setForm(f => ({
          ...f,
          authorName: user.name,
          authorEmail: user.email,
        }));
        setIsLoggedIn(true);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const debouncedTitle = useDebounce(form.title, 600);

  const similarQuery = useQuery({
    queryKey: ['similar', debouncedTitle],
    queryFn: () => getSimilarFAQs(debouncedTitle),
    enabled: debouncedTitle.trim().length > 8,
  });

  const createMut = useMutation({
    mutationFn: createFAQ,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['faqs'] });
      toast.success('Question submitted!');
      navigate({ to: `/faq/${data._id}` });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to submit');
    },
  });

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    else if (form.title.trim().length < 10) e.title = 'Title must be at least 10 characters';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.category) e.category = 'Please select a category';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    createMut.mutate({
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      author: { name: form.authorName.trim(), email: form.authorEmail.trim() || undefined },
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    });
  };

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const hasSimilar = similarQuery.data && similarQuery.data.length > 0;

  if (!isLoggedIn) {
    return (
      <main>
        <div className="container" style={{ maxWidth: 500, padding: '80px 24px', textAlign: 'center' }}>
          <div style={{ border: '2px solid var(--black)', padding: '40px 32px', background: 'var(--white)', boxShadow: '4px 4px 0 var(--border)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>🔒</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', marginBottom: 12, letterSpacing: '-0.01em' }}>
              Authentication Required
            </h2>
            <p style={{ color: 'var(--gray-600)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: 28 }}>
              To submit a question to the Samagama community, you must first register or sign in to your account.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Link to="/login" className="btn btn-filled" style={{ justifyContent: 'center', height: 44, textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                Sign In / Sign Up
              </Link>
              <Link to="/" className="btn btn-ghost" style={{ justifyContent: 'center', height: 44, textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                Back to Browse
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="container" style={{ maxWidth: 680 }}>
        <div className="page-header">
          <h1>Ask a <em>Question</em></h1>
          <p>Submit your question to the community. Be specific and descriptive.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Question Title *</label>
            <input
              className="form-input"
              value={form.title}
              onChange={set('title')}
              placeholder="What do you want to know?"
              maxLength={300}
            />
            {errors.title && <span className="form-error">{errors.title}</span>}
          </div>

          {/* Similar question suggestions */}
          {hasSimilar && (
            <div className="similar-list">
              <h4>⚠ Similar questions already exist</h4>
              {similarQuery.data.map(faq => (
                <Link key={faq._id} to={`/faq/${faq._id}`} className="similar-item" target="_blank">
                  <span>→</span>
                  <span>{faq.title}</span>
                  <span className={`badge ${faq.status === 'Answered' ? 'badge-answered' : 'badge-unanswered'}`} style={{ marginLeft: 'auto', flexShrink: 0 }}>{faq.status}</span>
                </Link>
              ))}
              <p style={{ marginTop: 10, fontSize: '0.8rem', color: 'var(--gray-600)' }}>
                Check if your question is already answered before submitting.
              </p>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Detailed Description *</label>
            <textarea
              className="form-textarea"
              value={form.description}
              onChange={set('description')}
              placeholder="Provide more context, background, or specific details..."
              style={{ minHeight: 130 }}
            />
            {errors.description && <span className="form-error">{errors.description}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Category *</label>
            <select className="form-select" value={form.category} onChange={set('category')}>
              <option value="">Select a category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.category && <span className="form-error">{errors.category}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Tags <span style={{ color: 'var(--gray-400)', fontWeight: 400, textTransform: 'none' }}>(optional, comma separated)</span></label>
            <input
              className="form-input"
              value={form.tags}
              onChange={set('tags')}
              placeholder="registration, deadline, fees"
            />
          </div>

          <hr className="divider" />

          <div style={{ padding: '16px 20px', border: '1.5px solid var(--black)', background: 'var(--gray-100)', marginBottom: 20 }}>
            <span className="mono" style={{ fontSize: '0.78rem', color: 'var(--gray-600)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 4 }}>
              Author Session Active
            </span>
            <span style={{ fontSize: '0.92rem', fontWeight: 500 }}>
              Posting as: {form.authorName} <span className="text-muted">({form.authorEmail})</span>
            </span>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button type="submit" className="btn btn-filled" disabled={createMut.isPending}>
              {createMut.isPending ? 'Submitting...' : 'Submit Question'}
            </button>
            <Link to="/" className="btn btn-ghost">Cancel</Link>
          </div>
        </form>
      </div>
    </main>
  );
}
