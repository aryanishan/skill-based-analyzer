import axios from 'axios';
import { CommunityRoadmap, LearningResource, RoadmapNode } from '../types';

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
export const register = (data: { name: string; email: string; password: string; username?: string }) =>
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
export const getSkillHub = (slug: string) => api.get(`/skills/hub/${encodeURIComponent(slug)}`);

// Evaluation
export const evaluate = (careerPathId: string, knownSkills: { skillId: string; proficiency: string }[]) =>
  api.post('/evaluate', { careerPathId, knownSkills });
export const compareCareerPaths = (careerPathIds: string[], knownSkills: { skillId: string; proficiency: string }[]) =>
  api.post('/evaluate/compare', { careerPathIds, knownSkills });

// Community roadmaps
export const getRoadmaps = (params?: Record<string, any>) => api.get('/roadmaps', { params });
export const getCommunityRoadmap = (id: string) => api.get(`/roadmaps/${id}`);
export const createRoadmap = (data: {
  title: string;
  description?: string;
  category?: string;
  difficulty?: CommunityRoadmap['difficulty'];
  estimatedDuration?: string;
  thumbnail?: string;
  tags?: string[];
  visibility?: CommunityRoadmap['visibility'];
  nodes?: RoadmapNode[];
}) => api.post('/roadmaps', data);
export const updateRoadmap = (id: string, data: Partial<CommunityRoadmap>) => api.put(`/roadmaps/${id}`, data);
export const likeRoadmap = (id: string) => api.post(`/roadmaps/${id}/like`);
export const bookmarkRoadmap = (id: string) => api.post(`/roadmaps/${id}/bookmark`);
export const forkRoadmap = (id: string, data?: { title?: string; visibility?: string }) => api.post(`/roadmaps/${id}/fork`, data || {});
export const shareRoadmap = (id: string) => api.post(`/roadmaps/${id}/share`);
export const getRoadmapComments = (id: string) => api.get(`/roadmaps/${id}/comments`);
export const addRoadmapComment = (id: string, body: string) => api.post(`/roadmaps/${id}/comments`, { body });
export const getRoadmapProgress = (id: string) => api.get(`/roadmaps/${id}/progress`);
export const updateRoadmapProgress = (id: string, data: { completedNodes: string[]; currentNodeId?: string }) =>
  api.put(`/roadmaps/${id}/progress`, data);

// Learning resources
export const getResources = (params?: Record<string, any>) => api.get('/resources', { params });
export const getResourceRankings = () => api.get('/resources/rankings');
export const createResource = (data: Partial<LearningResource>) => api.post('/resources', data);
export const reviewResource = (id: string, data: { rating: number; review?: string; completed?: boolean }) =>
  api.post(`/resources/${id}/reviews`, data);
export const completeResource = (id: string, rating?: number) => api.post(`/resources/${id}/complete`, { rating });
export const voteResource = (id: string, value: 'helpful' | 'not_helpful') => api.post(`/resources/${id}/vote`, { value });
export const bookmarkResource = (id: string) => api.post(`/resources/${id}/bookmark`);

// Social and discovery
export const discoverUsers = (params?: Record<string, any>) => api.get('/users/discover', { params });
export const getPublicProfile = (username: string) => api.get(`/users/profile/${encodeURIComponent(username)}`);
export const toggleFollow = (id: string) => api.post(`/users/${id}/follow`);
export const getActivityFeed = () => api.get('/users/activity');

// Search, analytics, and AI-ready contracts
export const globalSearch = (params?: Record<string, any>) => api.get('/search', { params });
export const trackAnalyticsEvent = (data: { event: string; entityType?: string; entity?: string; properties?: Record<string, any> }) =>
  api.post('/analytics/events', data);
export const getAnalyticsSummary = () => api.get('/analytics/summary');
export const getAIStatus = () => api.get('/ai/status');

export default api;
