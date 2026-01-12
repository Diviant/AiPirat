
export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  thumbnail: string;
  images: string[];
  tags: string[];
  githubUrl?: string;
  demoUrl?: string;
  createdAt: number;
}

export interface User {
  id: string;
  username: string;
}

export type Language = 'ru' | 'en';

export type AppView = 'home' | 'projects' | 'about' | 'contact' | 'admin-login' | 'admin-dashboard';
