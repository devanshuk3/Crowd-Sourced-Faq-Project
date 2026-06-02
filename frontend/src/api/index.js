import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001',
  headers: { 'Content-Type': 'application/json' },
});

// Automatically inject x-user-email header for authentication
api.interceptors.request.use((config) => {
  try {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const user = JSON.parse(userJson);
      if (user?.email) {
        config.headers['x-user-email'] = user.email;
      }
    }
  } catch (err) {
    console.error('Error in request interceptor:', err);
  }
  return config;
});

// FAQs
export const getFAQs = (params) => api.get('/faqs', { params }).then(r => r.data);
export const getFAQById = (id) => api.get(`/faqs/${id}`).then(r => r.data);
export const createFAQ = (data) => api.post('/faqs', data).then(r => r.data);
export const updateFAQ = (id, data) => api.put(`/faqs/${id}`, data).then(r => r.data);
export const deleteFAQ = (id) => api.delete(`/faqs/${id}`).then(r => r.data);
export const getUnansweredFAQs = (params) => api.get('/faqs/unanswered', { params }).then(r => r.data);
export const getPopularFAQs = (params) => api.get('/faqs/popular', { params }).then(r => r.data);
export const searchFAQs = (params) => api.get('/faqs/search', { params }).then(r => r.data);
export const getSimilarFAQs = (q) => api.get('/faqs/similar', { params: { q } }).then(r => r.data);
export const getStats = () => api.get('/faqs/stats').then(r => r.data);
export const upvoteFAQ = (id) => api.post(`/faqs/${id}/upvote`).then(r => r.data);

// Answers
export const getAnswersByFAQ = (faqId) => api.get(`/answers/${faqId}`).then(r => r.data);
export const createAnswer = (data) => api.post('/answers', data).then(r => r.data);
export const updateAnswer = (id, data) => api.put(`/answers/${id}`, data).then(r => r.data);
export const deleteAnswer = (id) => api.delete(`/answers/${id}`).then(r => r.data);
export const upvoteAnswer = (id) => api.post(`/answers/${id}/upvote`).then(r => r.data);

// Users & Auth
export const registerUser = (data) => api.post('/users/register', data).then(r => r.data);
export const loginUser = (data) => api.post('/users/login', data).then(r => r.data);
export const getUsers = () => api.get('/users').then(r => r.data);
export const updateUserRole = (id, role) => api.put(`/users/${id}/role`, { role }).then(r => r.data);
export const deleteUser = (id) => api.delete(`/users/${id}`).then(r => r.data);
export const getAdminStats = () => api.get('/users/admin/stats').then(r => r.data);

export default api;
