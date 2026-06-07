import { Link } from '@tanstack/react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { upvoteFAQ } from '../api';
import toast from 'react-hot-toast';

const CATEGORY_SHORT = {
  'Registration': 'REG',
  'Technical Events': 'TECH',
  'Cultural Events': 'CULT',
  'Accommodation': 'ACCM',
  'Transportation': 'TRANS',
  'General Information': 'GEN',
};

function timeAgo(date) {
  const d = new Date(date);
  const diff = (Date.now() - d) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function FAQCard({ faq, onUpvote }) {
  const qc = useQueryClient();

  const upvoteMut = useMutation({
    mutationFn: () => upvoteFAQ(faq._id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['faqs'] });
      qc.invalidateQueries({ queryKey: ['popular'] });
      toast.success('Upvoted');
      onUpvote?.();
    },
    onError: () => toast.error('Failed to upvote'),
  });

  return (
    <div className="faq-card">
      <Link to={`/faq/${faq._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="faq-card__title">{faq.title}</div>
        {faq.description && (
          <div className="faq-card__desc">{faq.description}</div>
        )}
        <div className="faq-card__meta">
          <span className={`badge ${faq.status === 'Answered' ? 'badge-answered' : 'badge-unanswered'}`}>
            {faq.status}
          </span>
          <span className="badge badge-category">
            {CATEGORY_SHORT[faq.category] || faq.category}
          </span>
          <span className="text-sm text-muted mono">{timeAgo(faq.createdAt)}</span>
          {faq.viewCount > 0 && (
            <span className="text-sm text-muted">{faq.viewCount} views</span>
          )}
        </div>
      </Link>
      <div className="faq-card__actions">
        <button
          className="upvote-btn"
          onClick={(e) => { e.preventDefault(); upvoteMut.mutate(); }}
          disabled={upvoteMut.isPending}
          title="Upvote"
        >
          <span>▲</span>
          <span>{faq.upvoteCount || 0}</span>
        </button>
      </div>
    </div>
  );
}
