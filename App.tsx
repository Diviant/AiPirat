import React, { useState, useEffect, useRef } from 'react';
import { Project, AppView, Language } from './types';
import { dataService } from './services/dataService';
import { authService } from './services/authService';
import { ProjectCard } from './components/ProjectCard';
import { Modal } from './components/Modal';
import { GoogleGenAI } from "@google/genai";

// --- Constants ---
const INITIAL_BACKUP_BG = "https://images.unsplash.com/photo-1514467958574-23b9c81b37ec?q=80&w=2070&auto=format&fit=crop";

// --- Helper for safe localStorage ---
const safeStorage = {
  get: (key: string, fallback: string) => {
    try { 
      if (typeof window === 'undefined') return fallback;
      return localStorage.getItem(key) || fallback; 
    } 
    catch { return fallback; }
  },
  set: (key: string, value: string) => {
    try { 
      if (typeof window !== 'undefined') localStorage.setItem(key, value); 
    } 
    catch (e) { console.error("Storage write failed", e); }
  }
};

// --- Translations ---
const translations = {
  en: {
    nav: { intro: 'Intro', works: 'Works', profile: 'Profile', inquiry: 'Inquiry', admin: 'Admin', dashboard: 'Dashboard' },
    home: {
      badge: 'Available for high-stakes projects',
      title: 'Navigating the digital deep. Architecting future-proof code.',
      subtitle: 'Senior full-stack engineer specialized in building high-performance systems and breathtaking interfaces that dominate the market.',
      btnWorks: 'Explore Artifacts',
      btnTalk: "Let's Talk",
      generating: 'Summoning the storm...'
    },
    about: {
      title: 'Captain’s Log',
      subtitle: 'Behind the code and design.',
      bio: 'I am a digital artisan who believes that software is not just about logic—it is about the experience. With over a decade of experience in the shadows of the tech industry, I’ve mastered the art of building systems that are as resilient as a ghost ship and as fast as a lightning strike.',
      stackTitle: 'The Arsenal',
      philosophyTitle: 'The Code',
      philosophyDesc: '1. Speed is life. 2. Design is respect. 3. Code is the only law.',
      skills: ['React / Next.js', 'Node.js / Go', 'System Architecture', 'UI/UX Engineering', 'AI Integration', 'Blockchain']
    },
    contact: {
      title: 'Establish Contact',
      subtitle: 'Send a message through the void.',
      formName: 'Identity',
      formEmail: 'Signal Frequency',
      formMsg: 'Message Content',
      formSubmit: 'Broadcast Message',
      direct: 'Direct Channels'
    },
    projects: {
      title: 'Digital Artifacts',
      subtitle: 'A collection of projects spanning tech, design, and innovation.',
      viewAll: 'Explore Entire Portfolio',
      empty: 'The Vault is Empty',
      createFirst: 'Create First Entry'
    },
    admin: {
      loginTitle: 'Admin Access',
      loginSub: 'Manage AiPirat ecosystem',
      userLabel: 'Username',
      passLabel: 'Password',
      authBtn: 'Authenticate',
      dashTitle: 'Command Center',
      dashSub: 'Orchestrate the AiPirat experience',
      newBtn: 'Add Project',
      logoutBtn: 'Logout',
      tableThumb: 'Identity',
      tableActions: 'Actions',
      edit: 'Edit',
      delete: 'Delete',
      modalTitle: 'Edit Project',
      modalNewTitle: 'Create Project',
      fieldTitle: 'Title',
      fieldShort: 'Short Description',
      fieldLong: 'Case Study Details',
      saveBtn: 'Deploy Changes',
      discardBtn: 'Discard',
      regenHero: 'Summon New Storm',
      uploadBtn: 'Upload Artifact',
      stormTitle: 'Atmosphere Control',
      stormSub: 'AI-Generation or Manual Upload',
      promptPlaceholder: 'Enter custom prompt (leave empty for default pirate storm)...',
      historyTitle: 'Atmosphere Archive',
      historySub: 'Previous variants',
      download: 'Download',
      apply: 'Set as Hero'
    },
    modal: {
      context: 'Context',
      deliverables: 'Deliverables',
      links: 'Resources',
      explore: 'Explore Live',
      source: 'View Source'
    }
  },
  ru: {
    nav: { intro: 'Интро', works: 'Работы', profile: 'Обо мне', inquiry: 'Контакты', admin: 'Админ', dashboard: 'Панель' },
    home: {
      badge: 'Доступен для сложных вызовов',
      title: 'Навигатор цифрового океана. Архитектор безупречного кода.',
      subtitle: 'Senior Full-stack инженер. Проектирую высоконагруженные системы и интерфейсы, которые диктуют новые правила игры.',
      btnWorks: 'Проекты',
      btnTalk: 'Связаться',
      generating: 'Призываем шторм...'
    },
    about: {
      title: 'Капитанский журнал',
      subtitle: 'История за кодом и пикселями.',
      bio: 'Я цифровой ремесленник, верящий, что софт — это не просто логика, а опыт. Проведя десятилетие в тени технологической индустрии, я освоил искусство создания систем, надежных как призрачный галеон и быстрых как разряд молнии.',
      stackTitle: 'Арсенал технологий',
      philosophyTitle: 'Кодекс',
      philosophyDesc: '1. Скорость — это жизнь. 2. Дизайн — это уважение. 3. Код — единственный закон.',
      skills: ['React / Next.js', 'Node.js / Python', 'Архитектура систем', 'UI/UX инжиниринг', 'Интеграция ИИ', 'Cyber Security']
    },
    contact: {
      title: 'Связаться с капитаном',
      subtitle: 'Отправьте сигнал сквозь пустоту.',
      formName: 'Ваше имя',
      formEmail: 'Email для ответа',
      formMsg: 'Суть дела',
      formSubmit: 'Отправить сигнал',
      direct: 'Прямые каналы'
    },
    projects: {
      title: 'Избранные артефакты',
      subtitle: 'Коллекция работ в сфере технологий, дизайна и инноваций.',
      viewAll: 'Все проекты',
      empty: 'Список проектов пуст',
      createFirst: 'Добавить первый проект'
    },
    admin: {
      loginTitle: 'Вход в панель',
      loginSub: 'Управление экосистемой AiPirat',
      userLabel: 'Логин',
      passLabel: 'Пароль',
      authBtn: 'Войти',
      dashTitle: 'Центр управления',
      dashSub: 'Управление экосистемой AiPirat',
      newBtn: 'Новый проект',
      logoutBtn: 'Выход',
      tableThumb: 'Проект',
      tableActions: 'Действия',
      edit: 'Ред.',
      delete: 'Удалить',
      modalTitle: 'Редактировать',
      modalNewTitle: 'Новый проект',
      fieldTitle: 'Название',
      fieldShort: 'Краткое описание',
      fieldLong: 'Полная история кейса',
      saveBtn: 'Сохранить',
      discardBtn: 'Отмена',
      regenHero: 'Призвать новый шторм',
      uploadBtn: 'Загрузить артефакт',
      stormTitle: 'Управление атмосферой',
      stormSub: 'Генерация AI или ручная загрузка',
      promptPlaceholder: 'Введите свой промпт (или оставьте пустым для пиратского шторма)...',
      historyTitle: 'Архив атмосферы',
      historySub: 'Предыдущие варианты',
      download: 'Скачать',
      apply: 'Сделать главным'
    },
    modal: {
      context: 'О проекте',
      deliverables: 'Что сделано',
      links: 'Ссылки',
      explore: 'Демо',
      source: 'Код'
    }
  }
};

// --- API Service ---
const aiService = {
  generatePirateHero: async (customPrompt?: string): Promise<string | null> => {
    try {
      // Fix: Obtained exclusively from process.env.API_KEY as per Gemini SDK guidelines
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = customPrompt || "Legendary epic digital art: A massive black ghost pirate ship with glowing electric-cyan magic runes on the hull, floating in a cosmic dark stormy ocean at night. Extreme detail, cinematic 8k resolution, volumetric lighting, 16:9.";
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: prompt }]
        },
        config: { imageConfig: { aspectRatio: "16:9" } }
      });

      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          // Fix: Iterate through all parts to find the image part as per Gemini SDK guidelines
          if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
          }
        }
      }
      return null;
    } catch (err) {
      console.error("AI Generation Failed:", err);
      return null;
    }
  }
};

// --- Global Background Component ---
const GlobalBackground: React.FC<{ heroImg: string }> = ({ heroImg }) => {
  return (
    <div className="fixed inset-0 w-full h-full z-0 pointer-events-none">
      <div className="absolute inset-0 bg-[#020202]" />
      <img 
        key={heroImg} 
        src={heroImg || INITIAL_BACKUP_BG} 
        alt="Atmosphere" 
        className="w-full h-full object-cover opacity-80 animate-in fade-in duration-1000" 
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
      <div className="absolute inset-0 bg-black/30 z-10" />
    </div>
  );
};

// --- Navigation ---
const Navbar: React.FC<{ activeView: AppView; onNavigate: (v: AppView) => void; isAdmin: boolean; lang: Language; onLangChange: (l: Language) => void; }> = ({ activeView, onNavigate, isAdmin, lang, onLangChange }) => {
  const currentTranslations = translations[lang] || translations.ru;
  const t = currentTranslations.nav;
  const isSelected = (view: AppView) => activeView === view ? 'text-white' : 'text-gray-400 hover:text-white';
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between glass px-6 py-3 rounded-full border border-white/10 shadow-2xl">
        <div className="text-lg font-extrabold tracking-tighter cursor-pointer flex items-center gap-2 group" onClick={() => onNavigate('home')}>
          <div className="w-7 h-7 bg-gradient-pirate rounded-lg flex items-center justify-center text-white text-[10px] font-black group-hover:rotate-12 transition-all shadow-[0_0_15px_rgba(34,211,238,0.4)]">AP</div>
          <span className="text-gradient font-black tracking-tight">AI PIRAT</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-[10px] font-bold uppercase tracking-[0.2em]">
          <button onClick={() => onNavigate('home')} className={`transition-colors ${isSelected('home')}`}>{t.intro}</button>
          <button onClick={() => onNavigate('projects')} className={`transition-colors ${isSelected('projects')}`}>{t.works}</button>
          <button onClick={() => onNavigate('about')} className={`transition-colors ${isSelected('about')}`}>{t.profile}</button>
          <button onClick={() => onNavigate('contact')} className={`transition-colors ${isSelected('contact')}`}>{t.inquiry}</button>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-white/5 border border-white/10 rounded-full p-1 ml-4 backdrop-blur-md">
            <button onClick={() => onLangChange('en')} className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${lang === 'en' ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`}>EN</button>
            <button onClick={() => onLangChange('ru')} className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${lang === 'ru' ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`}>RU</button>
          </div>
          {isAdmin ? (
            <button onClick={() => onNavigate('admin-dashboard')} className="px-4 py-2 bg-gradient-pirate rounded-full text-[10px] font-black transition-all text-white border-none uppercase tracking-widest shadow-lg">{t.dashboard}</button>
          ) : (
            <button onClick={() => onNavigate('admin-login')} className="text-white/40 hover:text-white text-[10px] font-bold tracking-widest uppercase transition-all">{t.admin}</button>
          )}
        </div>
      </div>
    </nav>
  );
};

// --- Main Components ---

const HomeView: React.FC<{ onNavigate: (v: AppView) => void; lang: Language }> = ({ onNavigate, lang }) => {
  const t = (translations[lang] || translations.ru).home;
  return (
    <section className="min-h-screen pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col justify-center relative z-20">
      <div className="space-y-8">
        <div className="inline-block px-4 py-1.5 bg-cyan-600/10 border border-cyan-600/20 rounded-full text-cyan-400 text-[9px] font-black tracking-[0.2em] uppercase">{t.badge}</div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight max-w-4xl text-white drop-shadow-2xl">
          {lang === 'ru' ? (<>Навигатор <span className="text-gradient">цифрового океана</span>. Архитектор безупречного кода.</>) : (<>Navigating the <span className="text-gradient">digital deep</span>. Architecting future-proof code.</>)}
        </h1>
        <p className="text-base md:text-xl text-gray-300 max-w-2xl font-medium leading-relaxed drop-shadow-xl opacity-90">{t.subtitle}</p>
        <div className="flex flex-wrap gap-5 pt-6">
          <button onClick={() => onNavigate('projects')} className="px-10 py-5 bg-gradient-pirate text-white font-black uppercase tracking-widest text-[11px] rounded-full hover:scale-105 transition-all shadow-2xl border-none">{t.btnWorks}</button>
          <button onClick={() => onNavigate('contact')} className="px-10 py-5 bg-white/5 border border-white/10 font-black uppercase tracking-widest text-[11px] rounded-full hover:bg-white/10 transition-all text-white backdrop-blur-md shadow-xl">{t.btnTalk}</button>
        </div>
      </div>
    </section>
  );
};

const AboutView: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = (translations[lang] || translations.ru).about;
  return (
    <section className="min-h-screen pt-40 pb-20 px-6 max-w-7xl mx-auto relative z-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
        <div className="space-y-12">
          <div>
            <h2 className="text-5xl font-black text-white mb-4 tracking-tighter">{t.title}</h2>
            <p className="text-cyan-500 font-bold uppercase tracking-[0.3em] text-[10px]">{t.subtitle}</p>
          </div>
          <p className="text-lg text-gray-300 leading-relaxed font-medium">{t.bio}</p>
          <div className="space-y-6">
            <h3 className="text-xl font-black text-white">{t.philosophyTitle}</h3>
            <p className="text-gray-400 italic text-sm">{t.philosophyDesc}</p>
          </div>
        </div>
        <div className="glass p-12 rounded-[3rem] border border-white/10 space-y-10">
          <h3 className="text-2xl font-black text-white">{t.stackTitle}</h3>
          <div className="grid grid-cols-2 gap-4">
            {t.skills.map(skill => (
              <div key={skill} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-3 group hover:border-cyan-500/30 transition-all">
                <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full" />
                <span className="text-[11px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white transition-colors">{skill}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const ContactView: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = (translations[lang] || translations.ru).contact;
  return (
    <section className="min-h-screen pt-40 pb-20 px-6 max-w-7xl mx-auto relative z-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
        <div className="space-y-12">
          <div>
            <h2 className="text-5xl font-black text-white mb-4 tracking-tighter">{t.title}</h2>
            <p className="text-cyan-500 font-bold uppercase tracking-[0.3em] text-[10px]">{t.subtitle}</p>
          </div>
          <div className="space-y-8">
             <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t.direct}</span>
                <a href="mailto:captain@aipirat.io" className="text-2xl font-black text-white hover:text-cyan-400 transition-colors uppercase">captain@aipirat.io</a>
                <a href="#" className="text-2xl font-black text-white hover:text-cyan-400 transition-colors uppercase">TELEGRAM: @AIPIRAT</a>
             </div>
          </div>
        </div>
        <div className="glass p-10 rounded-[3rem] border border-white/10">
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-500 ml-2">{t.formName}</label>
              <input type="text" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm outline-none focus:border-cyan-500 transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-500 ml-2">{t.formEmail}</label>
              <input type="email" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm outline-none focus:border-cyan-500 transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-500 ml-2">{t.formMsg}</label>
              <textarea className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm outline-none focus:border-cyan-500 transition-all h-32" />
            </div>
            <button className="w-full py-5 bg-gradient-pirate text-white font-black uppercase tracking-widest text-[11px] rounded-2xl shadow-xl hover:scale-[1.02] transition-all">
              {t.formSubmit}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

// --- App Root ---
export default function App() {
  const [view, setView] = useState<AppView>('home');
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [lang, setLang] = useState<Language>(() => {
    const saved = safeStorage.get('pirate_lang', 'ru');
    return (saved === 'en' || saved === 'ru') ? (saved as Language) : 'ru';
  });
  
  const [heroImg, setHeroImg] = useState<string>(() => safeStorage.get('pirate_hero_img_static', INITIAL_BACKUP_BG));

  useEffect(() => {
    try {
      setProjects(dataService.getProjects());
      setIsAdmin(authService.isAuthenticated());
    } catch (e) {
      console.error("Initialization error", e);
    }
  }, []);

  useEffect(() => {
    safeStorage.set('pirate_lang', lang);
  }, [lang]);

  const handleNavigate = (v: AppView) => { 
    setView(v); 
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  const currentTranslations = translations[lang] || translations.ru;

  return (
    <div className={`min-h-screen text-white selection:bg-cyan-500 selection:text-white ${lang === 'ru' ? 'lang-ru' : ''}`}>
      <GlobalBackground heroImg={heroImg} />
      <Navbar activeView={view} onNavigate={handleNavigate} isAdmin={isAdmin} lang={lang} onLangChange={setLang} />
      
      <main className="relative z-10">
        {view === 'home' && (
          <>
            <HomeView onNavigate={handleNavigate} lang={lang} />
            <div className="py-20 px-6 max-w-7xl mx-auto">
               <h2 className="text-3xl md:text-4xl font-black mb-12 tracking-tight drop-shadow-2xl">{currentTranslations.projects.title}</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {projects.slice(0, 3).map(p => <ProjectCard key={p.id} project={p} onClick={setSelectedProject} />)}
               </div>
               <div className="text-center mt-16">
                 <button onClick={() => handleNavigate('projects')} className="px-10 py-4 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white/10 backdrop-blur-md">ALL WORKS</button>
               </div>
            </div>
          </>
        )}
        
        {view === 'projects' && (
          <div className="py-32 px-6 max-w-7xl mx-auto">
            <h2 className="text-4xl font-black mb-12 drop-shadow-2xl">{currentTranslations.projects.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map(p => <ProjectCard key={p.id} project={p} onClick={setSelectedProject} />)}
            </div>
          </div>
        )}

        {view === 'about' && <AboutView lang={lang} />}
        {view === 'contact' && <ContactView lang={lang} />}

        {view === 'admin-login' && (
          <div className="min-h-screen flex items-center justify-center pt-20">
            <div className="glass p-12 rounded-[2.5rem] w-full max-w-md text-center shadow-3xl">
              <h2 className="text-2xl font-black mb-8 uppercase tracking-widest">Captain Login</h2>
              <form onSubmit={(e) => { e.preventDefault(); if(authService.login('admin','admin')){setIsAdmin(true); setView('home');} }} className="space-y-4">
                <input className="w-full bg-white/5 p-5 rounded-2xl border border-white/10 outline-none text-white text-sm" value="admin" readOnly />
                <input className="w-full bg-white/5 p-5 rounded-2xl border border-white/10 outline-none text-white text-sm" type="password" value="admin" readOnly />
                <button type="submit" className="w-full py-5 bg-white text-black font-black rounded-2xl uppercase tracking-[0.2em] text-[10px] hover:bg-cyan-500 hover:text-white transition-all">ACCESS CONSOLE</button>
              </form>
            </div>
          </div>
        )}
      </main>

      <footer className="py-16 border-t border-white/5 bg-black/40 backdrop-blur-xl relative z-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
          <div className="space-y-4">
            <div className="text-xl font-black text-white tracking-tighter">AI <span className="text-gradient">PIRAT</span>.</div>
            <p className="text-gray-500 max-w-xs mx-auto md:mx-0 leading-relaxed text-xs">{lang === 'ru' ? 'Цифровой кодекс и премиальный дизайн.' : 'Digital code and premium design.'}</p>
          </div>
        </div>
      </footer>

      <Modal isOpen={!!selectedProject} onClose={() => setSelectedProject(null)}>
        {selectedProject && (
          <div className="p-8 sm:p-20 space-y-16">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tighter leading-tight drop-shadow-2xl">{selectedProject.title}</h2>
            <div className="aspect-video rounded-[2.5rem] overflow-hidden shadow-3xl bg-black border border-white/10">
              <img src={selectedProject.thumbnail} className="w-full h-full object-cover" alt={selectedProject.title} />
            </div>
            <p className="text-lg sm:text-xl text-gray-400 font-medium leading-relaxed max-w-4xl">{selectedProject.longDescription}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
