import api from '../../api/index';

export const sendChatMessage = (message) =>
  api.post('/api/chat', { message }).then(r => r.data);
