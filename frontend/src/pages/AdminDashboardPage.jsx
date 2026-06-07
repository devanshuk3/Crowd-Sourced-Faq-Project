import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { getAdminStats, getUsers, updateUserRole, deleteUser, getFAQs, deleteFAQ } from '../api';
import toast from 'react-hot-toast';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [activeTab, setActiveTab] = useState('stats'); // 'stats', 'faqs', 'users'
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Route guard: Check if logged in user is admin
  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (!userJson) {
      toast.error('Please login first');
      navigate({ to: '/login' });
      return;
    }
    const user = JSON.parse(userJson);
    if (user.role !== 'admin') {
      toast.error('Access denied: Admins only');
      navigate({ to: '/' });
      return;
    }

    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, usersData, faqsData] = await Promise.all([
        getAdminStats(),
        getUsers(),
        getFAQs({ limit: 100 }), // Get all FAQs for moderation
      ]);
      setStats(statsData);
      setUsers(usersData);
      setFaqs(faqsData.data || []);
    } catch (err) {
      toast.error('Failed to load dashboard data. Check backend connection.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      toast.success('User role updated successfully');
      // Update local state
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
      // Refresh stats in case
      const updatedStats = await getAdminStats();
      setStats(updatedStats);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user role');
    }
  };

  const handleUserDelete = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
    try {
      await deleteUser(userId);
      toast.success('User deleted successfully');
      setUsers(users.filter(u => u._id !== userId));
      const updatedStats = await getAdminStats();
      setStats(updatedStats);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleFAQDelete = async (faqId) => {
    if (!confirm('Are you sure you want to delete this FAQ? This will also delete all associated answers.')) return;
    try {
      await deleteFAQ(faqId);
      toast.success('FAQ deleted successfully');
      setFaqs(faqs.filter(f => f._id !== faqId));
      const updatedStats = await getAdminStats();
      setStats(updatedStats);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete FAQ');
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <p className="mono text-muted">Initialising Dashboard Services...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1>Admin <em>Dashboard</em></h1>
          <p>Global system management, moderation panels, and user role configuration.</p>
        </div>
        <button onClick={loadDashboardData} className="btn btn-ghost btn-sm">
          ↻ Refresh Data
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 32, borderBottom: '1.5px solid var(--black)', paddingBottom: 16 }}>
        <button
          onClick={() => setActiveTab('stats')}
          className={`btn ${activeTab === 'stats' ? 'btn-filled' : 'btn-ghost'}`}
        >
          📊 Statistics Overview
        </button>
        <button
          onClick={() => setActiveTab('faqs')}
          className={`btn ${activeTab === 'faqs' ? 'btn-filled' : 'btn-ghost'}`}
        >
          📝 Content Moderation ({faqs.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`btn ${activeTab === 'users' ? 'btn-filled' : 'btn-ghost'}`}
        >
          👥 User Roles ({users.length})
        </button>
      </div>

      {/* TAB 1: STATISTICS */}
      {activeTab === 'stats' && stats && (
        <div>
          {/* Main Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 40 }}>
            <div style={{ border: '2px solid var(--black)', padding: 24, background: 'var(--white)' }}>
              <div style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', lineHeight: 1 }}>{stats.faqCount}</div>
              <div className="form-label" style={{ marginTop: 8 }}>Total Questions</div>
            </div>
            <div style={{ border: '2px solid var(--black)', padding: 24, background: 'var(--white)' }}>
              <div style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', lineHeight: 1 }}>{stats.unansweredCount}</div>
              <div className="form-label" style={{ marginTop: 8, color: '#c00' }}>Unanswered Questions</div>
            </div>
            <div style={{ border: '2px solid var(--black)', padding: 24, background: 'var(--white)' }}>
              <div style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', lineHeight: 1 }}>{stats.answerCount}</div>
              <div className="form-label" style={{ marginTop: 8 }}>Total Answers</div>
            </div>
            <div style={{ border: '2px solid var(--black)', padding: 24, background: 'var(--white)' }}>
              <div style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', lineHeight: 1 }}>{stats.totalUsers}</div>
              <div className="form-label" style={{ marginTop: 8 }}>Registered Users</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 40 }}>
            <div style={{ border: '1px solid var(--border)', padding: 20 }}>
              <div style={{ fontSize: '1.5rem', fontFamily: 'var(--font-mono)' }}>{stats.totalViews}</div>
              <div className="form-label" style={{ marginTop: 4 }}>Cumulative View Count</div>
            </div>
            <div style={{ border: '1px solid var(--border)', padding: 20 }}>
              <div style={{ fontSize: '1.5rem', fontFamily: 'var(--font-mono)' }}>{stats.totalUpvotes}</div>
              <div className="form-label" style={{ marginTop: 4 }}>Total Upvotes Cast</div>
            </div>
          </div>

          {/* Category split */}
          <div style={{ border: '2px solid var(--black)', padding: 28, background: 'var(--white)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', marginBottom: 20 }}>
              Questions by Category
            </h3>
            <div style={{ display: 'grid', gap: 14 }}>
              {stats.categories.map((cat, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 40px', alignItems: 'center', gap: 16 }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{cat.name}</span>
                  <div style={{ height: 16, background: 'var(--gray-100)', position: 'relative' }}>
                    <div style={{
                      height: '100%',
                      background: 'var(--black)',
                      width: `${(cat.count / stats.faqCount) * 100}%`
                    }} />
                  </div>
                  <span className="mono" style={{ fontSize: '0.8rem', textAlign: 'right' }}>{cat.count}</span>
                </div>
              ))}
              {stats.categories.length === 0 && (
                <p className="text-muted text-sm">No data available yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CONTENT MODERATION */}
      {activeTab === 'faqs' && (
        <div style={{ border: '2px solid var(--black)', padding: 28, background: 'var(--white)' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', marginBottom: 20 }}>
            FAQ Moderation List
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 600 }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid var(--black)', fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gray-600)' }}>
                  <th style={{ padding: 12 }}>Question Title</th>
                  <th style={{ padding: 12 }}>Category</th>
                  <th style={{ padding: 12 }}>Status</th>
                  <th style={{ padding: 12 }} className="mono">Upvotes/Views</th>
                  <th style={{ padding: 12, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {faqs.map((faq) => (
                  <tr key={faq._id} style={{ borderBottom: '1px solid var(--border)', fontSize: '0.9rem' }}>
                    <td style={{ padding: 12, fontWeight: 500 }}>
                      <a href={`/faq/${faq._id}`} style={{ textDecoration: 'none', color: 'inherit' }} target="_blank" rel="noreferrer">
                        {faq.title}
                      </a>
                    </td>
                    <td style={{ padding: 12 }}>
                      <span className="badge badge-category">{faq.category}</span>
                    </td>
                    <td style={{ padding: 12 }}>
                      <span className={`badge ${faq.status === 'Answered' ? 'badge-answered' : 'badge-unanswered'}`}>
                        {faq.status}
                      </span>
                    </td>
                    <td style={{ padding: 12 }} className="mono text-muted text-sm">
                      ▲ {faq.upvoteCount} / 👁 {faq.viewCount}
                    </td>
                    <td style={{ padding: 12, textAlign: 'right' }}>
                      <button
                        onClick={() => handleFAQDelete(faq._id)}
                        className="btn btn-ghost btn-sm"
                        style={{ borderColor: '#c00', color: '#c00' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {faqs.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ padding: 24, textAlign: 'center' }} className="text-muted">
                      No questions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: USER ROLES */}
      {activeTab === 'users' && (
        <div style={{ border: '2px solid var(--black)', padding: 28, background: 'var(--white)' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', marginBottom: 20 }}>
            User Roles Configuration
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 600 }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid var(--black)', fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gray-600)' }}>
                  <th style={{ padding: 12 }}>Name</th>
                  <th style={{ padding: 12 }}>Email Address</th>
                  <th style={{ padding: 12 }}>Assigned Role</th>
                  <th style={{ padding: 12 }} className="mono">Registration Date</th>
                  <th style={{ padding: 12, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} style={{ borderBottom: '1px solid var(--border)', fontSize: '0.9rem' }}>
                    <td style={{ padding: 12, fontWeight: 500 }}>{user.name}</td>
                    <td style={{ padding: 12 }}>{user.email}</td>
                    <td style={{ padding: 12 }}>
                      <select
                        className="form-select"
                        value={user.role}
                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                        style={{ padding: '4px 10px', fontSize: '0.8rem', width: 120 }}
                      >
                        <option value="student">Student</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td style={{ padding: 12 }} className="mono text-muted text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: 12, textAlign: 'right' }}>
                      <button
                        onClick={() => handleUserDelete(user._id)}
                        className="btn btn-ghost btn-sm"
                        style={{ borderColor: '#c00', color: '#c00' }}
                        disabled={user.email === 'admin@samagama.com'} // Protect primary admin from deletion
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ padding: 24, textAlign: 'center' }} className="text-muted">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
