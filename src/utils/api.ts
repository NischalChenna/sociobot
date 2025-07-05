import axios from 'axios';
import { BusinessProfile, GeneratedContent } from '../types';

// API interfaces
export type RegisterData = {
  email: string;
  password: string;
  businessProfile: BusinessProfile;
};

interface SchedulePostData {
  festivalId?: string;
  content: GeneratedContent;
  platforms: ('twitter' | 'instagram')[];
  scheduledDate: string;
  timezone: string;
}

interface UpdatePostData {
  content?: GeneratedContent;
  platforms?: ('twitter' | 'instagram')[];
  scheduledDate?: string;
  timezone?: string;
  status?: 'draft' | 'scheduled' | 'posted' | 'failed';
}

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:3002/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// API functions
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (userData: RegisterData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
};

export const userAPI = {
  updateProfile: async (profile: BusinessProfile) => {
    const response = await api.put('/user/profile', { businessProfile: profile });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/user/profile');
    return response.data;
  },
};

export const schedulerAPI = {
  schedulePost: async (postData: SchedulePostData) => {
    const response = await api.post('/scheduler/schedule', postData);
    return response.data;
  },

  getPosts: async (params?: { status?: string; limit?: number; page?: number }) => {
    const response = await api.get('/scheduler/posts', { params });
    return response.data;
  },

  updatePost: async (id: string, updates: UpdatePostData) => {
    const response = await api.put(`/scheduler/posts/${id}`, updates);
    return response.data;
  },

  deletePost: async (id: string) => {
    const response = await api.delete(`/scheduler/posts/${id}`);
    return response.data;
  },
};

export const contentAPI = {
  generateContent: async (businessProfile: BusinessProfile, festival: unknown) => {
    const response = await api.post('/content/generate', { businessProfile, festival });
    return response.data;
  },

  generateMarketingImages: async (businessProfile: BusinessProfile, content: GeneratedContent) => {
    const response = await api.post('/content/generate-marketing-images', { businessProfile, content });
    return response.data;
  },

  generateFreeMarketingImages: async (businessProfile: BusinessProfile, content: GeneratedContent) => {
    const response = await api.post('/content/generate-free-marketing-images', { businessProfile, content });
    return response.data;
  },

  regenerateMarketingImage: async (businessProfile: BusinessProfile, content: GeneratedContent, imageType: string, originalPrompt?: string) => {
    const response = await api.post('/content/regenerate-marketing-image', { 
      businessProfile, 
      content, 
      imageType, 
      originalPrompt 
    });
    return response.data;
  },

  regenerateFreeMarketingImage: async (businessProfile: BusinessProfile, content: GeneratedContent, imageType: string, originalPrompt?: string) => {
    const response = await api.post('/content/regenerate-free-marketing-image', { 
      businessProfile, 
      content, 
      imageType, 
      originalPrompt 
    });
    return response.data;
  },
};

export default api; 