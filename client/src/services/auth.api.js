import api from './api';

export async function signup(data) {
  const response = await api.post('/auth/signup', data);
  if (response.data?.token) {
    localStorage.setItem('trackflow_token', response.data.token);
  }
  return response.data;
}

export async function login(data) {
  const response = await api.post('/auth/login', data);
  if (response.data?.token) {
    localStorage.setItem('trackflow_token', response.data.token);
  }
  return response.data;
}

export async function getCurrentUser() {
  const response = await api.get('/auth/me');
  return response.data?.user || response.data;
}

export async function getProfile() {
  const response = await api.get('/auth/profile');
  return response.data?.data || response.data;
}

export async function updateProfile(data) {
  const response = await api.put('/auth/profile', data);
  return response.data?.user || response.data;
}

export async function logout() {
  try {
    const response = await api.post('/auth/logout');
    localStorage.removeItem('trackflow_token');
    return response.data;
  } catch (error) {
    localStorage.removeItem('trackflow_token');
    throw error;
  }
}
