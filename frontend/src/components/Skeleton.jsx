export function SkeletonCard() {
  return (
    <div style={{ borderBottom: '1px solid var(--border)', padding: '22px 0' }}>
      <div className="skeleton" style={{ height: 22, width: '70%', marginBottom: 10 }} />
      <div className="skeleton" style={{ height: 14, width: '90%', marginBottom: 6 }} />
      <div className="skeleton" style={{ height: 14, width: '60%', marginBottom: 14 }} />
      <div style={{ display: 'flex', gap: 8 }}>
        <div className="skeleton" style={{ height: 20, width: 60 }} />
        <div className="skeleton" style={{ height: 20, width: 50 }} />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 5 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
    </>
  );
}
