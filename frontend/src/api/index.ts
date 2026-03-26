import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const register = (data: { name: string; email: string; password: string }) =>
  api.post('/auth/register', data);
export const login = (data: { email: string; password: string }) =>
  api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');
export const updateProfile = (data: object) => api.put('/auth/profile', data);

// Career Paths
export const getCareerPaths = (domain?: string) =>
  api.get(`/career-paths${domain ? `?domain=${encodeURIComponent(domain)}` : ''}`);
export const getCareerPath = (id: string) => api.get(`/career-paths/${id}`);

// Skills
export const getSkills = (params?: { domain?: string; category?: string; type?: string }) =>
  api.get('/skills', { params });

// Evaluation
export const evaluate = (careerPathId: string, knownSkills: { skillId: string; proficiency: string }[]) =>
  api.post('/evaluate', { careerPathId, knownSkills });
export const compareCareerPaths = (careerPathIds: string[], knownSkills: { skillId: string; proficiency: string }[]) =>
  api.post('/evaluate/compare', { careerPathIds, knownSkills });

export default api;
