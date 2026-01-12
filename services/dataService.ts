
import { Project } from '../types';

const STORAGE_KEY = 'zenith_portfolio_projects';

const DEFAULT_PROJECTS: Project[] = [
  {
    id: '1',
    title: 'Nexus Analytics Dashboard',
    description: 'Real-time financial tracking with interactive visualizations.',
    longDescription: 'Nexus is a comprehensive analytics platform designed for fintech startups. It features real-time data streaming, multi-currency support, and deep-dive reporting tools. Built with a focus on performance and intuitive user experience.',
    thumbnail: 'https://picsum.photos/id/1/800/600',
    images: ['https://picsum.photos/id/1/1200/800', 'https://picsum.photos/id/2/1200/800'],
    tags: ['React', 'D3.js', 'Tailwind', 'TypeScript'],
    githubUrl: 'https://github.com',
    demoUrl: 'https://demo.com',
    createdAt: Date.now() - 1000000
  },
  {
    id: '2',
    title: 'Aether eCommerce',
    description: 'High-performance storefront with headless CMS integration.',
    longDescription: 'Aether is a next-generation shopping experience. It uses a headless architecture to deliver sub-second page loads and a seamless checkout process. The design focuses on minimalism and conversion.',
    thumbnail: 'https://picsum.photos/id/3/800/600',
    images: ['https://picsum.photos/id/3/1200/800', 'https://picsum.photos/id/4/1200/800'],
    tags: ['Next.js', 'Prisma', 'Stripe', 'Framer Motion'],
    githubUrl: 'https://github.com',
    demoUrl: 'https://demo.com',
    createdAt: Date.now() - 5000000
  }
];

export const dataService = {
  getProjects: (): Project[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PROJECTS));
      return DEFAULT_PROJECTS;
    }
    return JSON.parse(data);
  },

  saveProject: (project: Project): void => {
    const projects = dataService.getProjects();
    const index = projects.findIndex(p => p.id === project.id);
    if (index !== -1) {
      projects[index] = project;
    } else {
      projects.unshift(project);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  },

  deleteProject: (id: string): void => {
    const projects = dataService.getProjects().filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  },

  getProjectById: (id: string): Project | undefined => {
    return dataService.getProjects().find(p => p.id === id);
  }
};
