'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { User } from '@supabase/supabase-js';
import {
  BookOpen,
  CalendarDays,
  BriefcaseBusiness,
  Camera,
  Castle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Compass,
  Dices,
  ImagePlus,
  Eye,
  GraduationCap,
  LayoutDashboard,
  List,
  LibraryBig,
  Link2,
  LockKeyhole,
  LogIn,
  MapPin,
  MoreHorizontal,
  Network,
  Rows3,
  StickyNote,
  Menu,
  Palette,
  Pencil,
  Plus,
  Search,
  Settings,
  ShieldAlert,
  Send,
  Share2,
  Check,
  Sparkles,
  SpellCheck2,
  Star,
  Trash2,
  UserCog,
  Users,
  WandSparkles,
  X,
} from 'lucide-react';
import { rules, ruleSections } from './rules';
import { lore, loreSections } from './lore';
import {
  getSupabase,
  isSupabaseConfigured,
  loadPrivateNotes,
  replacePrivateNotes,
  updateProfileName,
  loadWikiSubmissions,
  isWikiAdmin,
  submitWikiProposal,
  reviewWikiProposal,
  loadAdminUsers,
  loadAdminNotes,
  type AdminUser,
  type WikiSubmission,
} from '@/lib/supabase';
type Kind = 'Personnage' | 'Lieu' | 'Connaissance' | 'Projet' | 'Sort' | 'Cours' | 'Note libre';
type CharacterHouse = 'Aerwyn' | 'Brumval' | 'Falcon' | 'Venatrix';
type SchoolYear = 'Première année' | 'Deuxième année' | 'Troisième année' | 'Quatrième année' | 'Cinquième année' | 'Sixième année' | 'Septième année' | 'Personnel' | 'Hors cursus';
type CourseCategory = 'Flux et magie' | 'Sortilèges' | 'Défense magique' | 'Potions et alchimie' | 'Runomancie' | 'Créatures magiques' | 'Botanique' | 'Histoire magique' | 'Divination' | 'Razeball' | 'Autres';
const schoolYears: SchoolYear[] = ['Première année', 'Deuxième année', 'Troisième année', 'Quatrième année', 'Cinquième année', 'Sixième année', 'Septième année', 'Personnel', 'Hors cursus'];
const courseCategories: CourseCategory[] = ['Flux et magie', 'Sortilèges', 'Défense magique', 'Potions et alchimie', 'Runomancie', 'Créatures magiques', 'Botanique', 'Histoire magique', 'Divination', 'Razeball', 'Autres'];
const characterHouses: CharacterHouse[] = [
  'Aerwyn',
  'Brumval',
  'Falcon',
  'Venatrix',
];
type HouseTheme = 'aerwyn' | 'brumval' | 'falcon' | 'venatrix';
const houseThemes: { id: HouseTheme; name: string; motto: string }[] = [
  { id: 'aerwyn', name: 'Aerwyn', motto: 'Honneur & protection' },
  { id: 'brumval', name: 'Brumval', motto: 'Loyauté & courage' },
  { id: 'falcon', name: 'Falcon', motto: 'Savoir & curiosité' },
  { id: 'venatrix', name: 'Venatrix', motto: 'Maîtrise & influence' },
];
type Note = {
  id: string;
  kind: Kind;
  title: string;
  sub: string;
  text: string;
  tags: string[];
  image?: string;
  imagePath?: string;
  imageSize?: number;
  essential?: boolean;
  status?: string;
  relation?: 'Inconnue' | 'Neutre' | 'Allié' | 'Rival' | 'Famille';
  house?: CharacterHouse;
  age?: number;
  schoolYear?: SchoolYear;
  eventDate?: string;
  knowledge?:
    | 'Connu en RP'
    | 'Soupçonné'
    | 'À vérifier'
    | 'HRP uniquement'
    | 'Oublié';
  source?: string;
  nextAction?: string;
  incantation?: string;
  spellDomain?: 'Charme' | 'Défense' | 'Soin' | 'Altération' | 'Élémentaire' | 'Utilitaire' | 'Interdit' | 'Autre';
  mastery?: 'À étudier' | 'En apprentissage' | 'Instable' | 'Maîtrisé';
  courseTeacher?: string;
  courseRoom?: string;
  courseCategory?: CourseCategory;
  courseSessions?: { id: string; title: string; date: string; content: string }[];
  courseSchedule?: { id: string; weekday: number; start: string; end: string }[];
  boardX?: number;
  boardY?: number;
  boardWidth?: number;
  boardHeight?: number;
  connections?: string[];
  noteColor?: 'or' | 'violet' | 'bleu' | 'vert' | 'rose';
  tasks?: { id: string; text: string; done: boolean }[];
  details?: string[][];
};
type SearchDetail = {
  source: 'Fiche' | 'Lore' | 'Règle' | 'Wiki';
  section: string;
  title: string;
  excerpt: string;
  item: Note | (typeof lore)[number] | (typeof rules)[number] | WikiSubmission;
};
const initial: Note[] = [
  {
    id: 'joueur',
    kind: 'Personnage',
    title: 'Mon personnage',
    sub: '15 ans · Première année à Elderwood',
    text: 'Cette page attend encore son histoire.',
    tags: ['Élève', 'Résonant'],
    essential: true,
    status: 'À approfondir',
    relation: 'Neutre',
    age: 15,
    schoolYear: 'Première année',
    imageSize: 100,
  },
];
const corvinCharacter: Note = {
  id: 'joueur',
  kind: 'Personnage',
  title: 'Corvin Wrenfall',
  sub: 'Le joueur du hasard · 15 ans · Première année',
  text: "Jeune Résonant britannique, sociable, joueur et observateur. Corvin aime moins gagner que l’instant où le résultat n’existe pas encore. Il garde toujours sur lui la vieille pièce confiée par son père.",
  tags: ['Élève', 'Résonant', 'Jeux', 'Hasard', 'À suivre'],
  essential: true,
  status: 'À approfondir',
  relation: 'Neutre',
  age: 15,
  schoolYear: 'Première année',
  imageSize: 100,
  details: [
    ['Histoire', "Corvin vient d’une famille magique ordinaire. Son père tient une boutique de jeux, jouets et curiosités magiques où Corvin a grandi parmi les cartes, dés, casse-têtes et objets enchantés. Sa mère, Résonante et très organisée, travaille comme secrétaire dans une petite structure du monde magique."],
    ['La vieille pièce', "Avant son départ pour Elderwood, son père lui a confié une pièce ancienne dont personne ne connaît vraiment l’origine. D’abord simple souvenir familial, elle pourrait prendre une place croissante dans ses choix et devenir presque un rituel."],
    ['Caractère', "Sociable et curieux, il aime le bluff, les défis et les règles improvisées. Il observe davantage les réactions des joueurs que le résultat : qui hésite, qui triche, qui refuse et qui se laisse entraîner."],
    ['Pourquoi Elderwood ?', "Elderwood est pour lui une partie dont il ignore encore les règles : de nouveaux élèves, des rivalités, des groupes et des habitudes à comprendre, autant qu’un lieu où apprendre à maîtriser son Flux."],
    ['Rapport au Flux', "Corvin ne contrôle ni la chance ni les probabilités. Lorsqu’il hésite, il pourrait cependant laisser une pièce, une carte ou un dé décider de la manière dont il emploie sa magie."],
    ['Évolution possible', "Le jeu pourrait devenir pari, puis influence. En découvrant qu’une règle suffit parfois à diviser un groupe, Corvin pourrait provoquer rivalités et conséquences sans sembler diriger. Le hasard deviendrait alors une porte vers le chaos, jusqu’à lui paraître plus honnête que les êtres humains."],
    ['Objectifs', "Créer un club de jeux, organiser défis et tournois, réunir des élèves qui ne se fréquentent pas, inventer ses propres règles et observer jusqu’où chacun est prêt à aller pour honorer un pari."],
    ['Anecdotes', "Il fait parfois pile ou face pour des décisions inutiles, préfère apprendre les règles en jouant, ajoute volontiers une règle à un jeu qui fonctionnait déjà et s’ennuie davantage d’une partie prévisible que d’une défaite."],
  ],
};
const demoCourse: Note = {
  id: 'course-demo',
  kind: 'Cours',
  title: 'Initiation à la Runomancie',
  sub: 'Première année · Salle des runes',
  text: 'Un fil de démonstration pour organiser tes notes séance après séance.',
  tags: ['Runomancie', 'Première année'],
  status: 'En cours',
  schoolYear: 'Première année',
  courseTeacher: 'Professeur à renseigner',
  courseRoom: 'Salle des runes',
  courseCategory: 'Runomancie',
  courseSchedule: [{ id: 'course-demo-schedule', weekday: 2, start: '18:00', end: '19:00' }],
  courseSessions: [
    {
      id: 'course-demo-session',
      title: 'Les fréquences runiques',
      date: new Date().toISOString().slice(0, 10),
      content: '<p>Introduction aux runes et à leur relation avec l’Écho. Une rune ne représente pas seulement une lettre : elle retranscrit une fréquence magique.</p><h3>À retenir</h3><ul><li>Observer avant de tracer.</li><li>Stabiliser le Flux avant de fermer la rune.</li></ul>',
    },
  ],
};
const details = [
  [
    'Identité',
    '15 ans · Jeune Résonant britannique · Première année à Elderwood · Famille magique ordinaire · Maison non imposée.',
  ],
  [
    'Caractère',
    'Sociable et difficile à saisir. Il transforme vite une attente en jeu, observe avant d’agir et comprend qui aime jouer, triche, hésite ou se braque.',
  ],
  [
    'Famille',
    'Son père tient une boutique de jeux et curiosités magiques. Sa mère travaille à l’accueil d’un dispensaire et garde le foyer bien cadré.',
  ],
  [
    'Évolution possible',
    'Le joueur peut devenir parieur, provocateur, instigateur, puis croire que le hasard tranche plus honnêtement que les gens. Cette pente reste ouverte aux scènes vécues.',
  ],
  [
    'Idées de scènes',
    'Jeu clandestin · Faveur mise en jeu · Conflit tranché par un défi · Disparition de la pièce · Pari de trop · Choix impossible.',
  ],
  [
    'Anecdotes',
    'Il garde toujours un dé, une carte ou sa pièce. Seul, il relance parfois la pièce si le résultat lui déplaît. Il retient mieux les réactions que les scores.',
  ],
];
const icons = {
  Personnage: Users,
  Lieu: MapPin,
  Connaissance: BookOpen,
  Projet: BriefcaseBusiness,
  Sort: WandSparkles,
  Cours: GraduationCap,
  'Note libre': StickyNote,
};
const statusesByKind: Record<Kind, string[]> = {
  Personnage: ['À rencontrer', 'Rencontré', 'À approfondir', 'Proche', 'Perdu de vue'],
  Lieu: ['À découvrir', 'Visité', 'À explorer', 'Important', 'Dangereux'],
  Connaissance: ['À classer', 'En cours d’étude', 'Documentée', 'À compléter', 'Archivée'],
  Projet: ['Idée', 'À préparer', 'En cours', 'En attente', 'Terminé', 'Abandonné'],
  Sort: ['À découvrir', 'À apprendre', 'En entraînement', 'Maîtrisé', 'Interdit'],
  Cours: ['À venir', 'En cours', 'À réviser', 'Terminé'],
  'Note libre': ['Brouillon'],
};

const normalizeSearch = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[’']/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const blobToDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

const optimizeImage = async (file: File) => {
  if (!file.type.startsWith('image/'))
    throw new Error('Le fichier choisi n’est pas une image.');
  const bitmap = await createImageBitmap(file);
  const maxSide = 1600;
  const ratio = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * ratio));
  canvas.height = Math.max(1, Math.round(bitmap.height * ratio));
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Conversion impossible sur ce navigateur.');
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  let result: Blob | null = null;
  for (const quality of [0.82, 0.72, 0.62]) {
    result = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/webp', quality),
    );
    if (result && result.size <= 1_000_000) break;
  }
  if (!result) throw new Error('La conversion WebP a échoué.');
  return blobToDataUrl(result);
};

const searchScore = (query: string, title: string, content: string) => {
  const words = normalizeSearch(query).split(' ').filter(Boolean);
  const cleanTitle = normalizeSearch(title);
  const cleanContent = normalizeSearch(`${title} ${content}`);
  if (!words.length || !words.every((word) => cleanContent.includes(word)))
    return 0;
  return words.reduce(
    (score, word) =>
      score +
      (cleanTitle === word
        ? 10
        : cleanTitle.startsWith(word)
          ? 6
          : cleanTitle.includes(word)
            ? 4
            : 1),
    0,
  );
};
const loreAccent = (section: string) => ({
  Fondements: '#cf9d32', École: '#d7b33f', Maisons: '#7b64c7', Lieux: '#3b8bd6',
  Chronologie: '#c57732', Glossaire: '#3da67a', Créatures: '#4b9b52', Société: '#a86cb9',
  Familles: '#b27b46', Personnalités: '#d05e58', Razeball: '#4d82cf',
}[section] || '#c8a755');
const houseAssetSlug = (title: string) => {
  const slug = title.toLowerCase();
  return ['aerwyn', 'brumval', 'falcon', 'venatrix'].includes(slug) ? slug : null;
};
const houseAsset = (title: string, kind: 'insigne' | 'maison') => {
  const slug = houseAssetSlug(title);
  return slug ? `${import.meta.env.BASE_URL}houses/${kind}-${slug}.webp` : null;
};
const ruleAccent = (section: string) => ({
  Général: '#c4a34e', 'Lexique RP': '#4d8bcf', RolePlay: '#42a270', 'RPK On': '#d35d52',
  Famille: '#a875c2', Vocal: '#d17d45', Staff: '#6d7f95',
}[section] || '#c4a34e');
export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]),
    [section, setSection] = useState(() => typeof window !== 'undefined' ? sessionStorage.getItem('elderwood-active-section') || 'Accueil' : 'Accueil'),
    [q, setQ] = useState(''),
    [open, setOpen] = useState<Note | null>(null),
    [searchOpen, setSearchOpen] = useState<SearchDetail | null>(null),
    [edit, setEdit] = useState<Note | null>(null),
    [menu, setMenu] = useState(false),
    [searchSource, setSearchSource] = useState<
      'Tout' | 'Fiche' | 'Lore' | 'Règle' | 'Wiki'
    >('Tout'),
    [searchTag, setSearchTag] = useState('Tous'),
    [theme, setTheme] = useState<HouseTheme>('falcon'),
    [themeOpen, setThemeOpen] = useState(false),
    [greeting, setGreeting] = useState('Bienvenue'),
    [authOpen, setAuthOpen] = useState(false),
    [passwordRecovery, setPasswordRecovery] = useState(false),
    [authNotice, setAuthNotice] = useState(''),
    [profileName, setProfileName] = useState(''),
    [currentUser, setCurrentUser] = useState<User | null>(null),
    [authResolved, setAuthResolved] = useState(false),
    [cloudReady, setCloudReady] = useState(false),
    [syncState, setSyncState] = useState<'local' | 'syncing' | 'synced' | 'error'>('local'),
    [tourOpen, setTourOpen] = useState(false),
    [tourStep, setTourStep] = useState(0),
    [wikiOpen, setWikiOpen] = useState(false),
    [adminOpen, setAdminOpen] = useState(false),
    [templateOpen, setTemplateOpen] = useState(false),
    [viewMode, setViewMode] = useState<'list' | 'compact' | 'library'>('list'),
    [saveNotice, setSaveNotice] = useState(''),
    [gettingStartedDismissed, setGettingStartedDismissed] = useState(() => typeof window !== 'undefined' && localStorage.getItem('elderwood-getting-started-dismissed') === 'true'),
    [wikiSeed, setWikiSeed] = useState<Note | null>(null),
    [wikiEntries, setWikiEntries] = useState<WikiSubmission[]>([]),
    [wikiAdmin, setWikiAdmin] = useState(false);
  const [wikiDemoPending, setWikiDemoPending] = useState(true);
  const [visibleNoteLimit, setVisibleNoteLimit] = useState(10);
  const [navFlyout, setNavFlyout] = useState<'sheets' | 'organize' | null>(null);
  const currentUserIdRef = useRef<string | null>(null);
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('elderwood-house-theme') as HouseTheme | null;
      const activeTheme = houseThemes.some((item) => item.id === savedTheme)
        ? savedTheme!
        : 'falcon';
      setTheme(activeTheme);
      document.documentElement.classList.add('dark');
      document.documentElement.dataset.theme = activeTheme;
      const hour = new Date().getHours();
      setGreeting(hour < 6 ? 'Douce nuit' : hour < 18 ? 'Bonjour' : 'Bonsoir');
    } catch {}
  }, []);
  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const query = new URLSearchParams(window.location.search);
    const isSignupConfirmation =
      hash.get('type') === 'signup' || query.get('type') === 'signup';
    const client = getSupabase();
    if (!client) {
      setAuthResolved(true);
      return;
    }
    client.auth.getSession().then(({ data }) => {
      const user = data.session?.user || null;
      currentUserIdRef.current = user?.id || null;
      setCurrentUser(user);
      const rememberedSection = sessionStorage.getItem('elderwood-active-section');
      if (user && (!rememberedSection || rememberedSection === 'Accueil')) setSection('Toutes');
      if (!user && !['Accueil', 'Règlement', 'Lore', 'Elderwood'].includes(rememberedSection || '')) setSection('Accueil');
      setAuthResolved(true);
    }).catch(() => setAuthResolved(true));
    const { data } = client.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const isNewLogin = currentUserIdRef.current !== session.user.id;
        currentUserIdRef.current = session.user.id;
        setCurrentUser((existing) => {
          if (existing?.id === session.user.id) return existing;
          document.documentElement.classList.remove('grimoire-ready');
          setCloudReady(false);
          return session.user;
        });
        if (isNewLogin) setSection('Toutes');
      }
      if (event === 'SIGNED_OUT') {
        currentUserIdRef.current = null;
        setCloudReady(false);
        setCurrentUser(null);
        setSection('Accueil');
      }
      if (event === 'PASSWORD_RECOVERY') {
        setPasswordRecovery(true);
        setAuthOpen(true);
      }
      if (event === 'SIGNED_IN' && isSignupConfirmation) {
        setAuthNotice('Ton grimoire est bien scellé !');
        window.setTimeout(() => setAuthNotice(''), 5200);
        window.history.replaceState({}, '', window.location.pathname);
      }
    });
    return () => data.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    sessionStorage.setItem('elderwood-active-section', section);
  }, [section]);
  useEffect(() => {
    if (!currentUser) {
      setCloudReady(false);
      setSyncState('local');
      setNotes([]);
      setProfileName('');
      setOpen(null);
      setEdit(null);
      return;
    }
    let active = true;
    const openCloudGrimoire = async () => {
      setSyncState('syncing');
      try {
        const remote = (await loadPrivateNotes(currentUser)) as Note[];
        if (!active) return;
        if (remote.length) {
          const shouldRestoreCorvin = currentUser.email?.toLowerCase() === 'jonathan.ragot@gmail.com';
          let restored: Note[] = remote.map((note): Note => {
            if (!shouldRestoreCorvin || note.id !== 'joueur')
              return note;
            if (note.title === 'Corvin Wrenfall')
              return note.schoolYear ? note : { ...note, schoolYear: 'Première année' as SchoolYear };
            return {
              ...corvinCharacter,
              image: note.image,
              imagePath: note.imagePath,
            };
          });
          if (shouldRestoreCorvin && !restored.some((note) => note.id === 'joueur'))
            restored = [corvinCharacter, ...restored];
          const courseDemoKey = `elderwood-course-demo-${currentUser.id}`;
          if (shouldRestoreCorvin && !restored.some((note) => note.kind === 'Cours') && localStorage.getItem(courseDemoKey) !== 'deleted')
            restored = [...restored, demoCourse];
          if (restored.length !== remote.length || restored.some((note, index) => note !== remote[index]))
            await replacePrivateNotes(currentUser, restored);
          setNotes(restored);
        } else {
          const starter = currentUser.email?.toLowerCase() === 'jonathan.ragot@gmail.com'
            ? [corvinCharacter, demoCourse]
            : initial;
          await replacePrivateNotes(currentUser, starter);
          if (!active) return;
          setNotes(starter);
        }
        const identity =
          currentUser.user_metadata?.display_name ||
          currentUser.email?.split('@')[0] ||
          '';
        if (identity) {
          setProfileName(identity);
          localStorage.setItem('elderwood-profile-name', identity);
        }
        setCloudReady(true);
        setSyncState('synced');
        if (!localStorage.getItem('elderwood-onboarding-done')) setTourOpen(true);
      } catch {
        if (active) setSyncState('error');
      }
    };
    openCloudGrimoire();
    return () => {
      active = false;
    };
  }, [currentUser]);
  useEffect(() => {
    const ready = authResolved && (!currentUser || cloudReady || syncState === 'error');
    if (!ready) {
      document.documentElement.classList.remove('grimoire-ready');
      return;
    }
    const reveal = window.setTimeout(() => {
      requestAnimationFrame(() =>
        requestAnimationFrame(() =>
          document.documentElement.classList.add('grimoire-ready'),
        ),
      );
    }, 650);
    return () => window.clearTimeout(reveal);
  }, [authResolved, currentUser, cloudReady, syncState]);
  useEffect(() => {
    loadWikiSubmissions(currentUser).then(setWikiEntries).catch(() => setWikiEntries([]));
    isWikiAdmin(currentUser).then(setWikiAdmin).catch(() => setWikiAdmin(false));
  }, [currentUser]);
  useEffect(() => {
    if (wikiAdmin && new URLSearchParams(window.location.search).get('moderation') === '1')
      setWikiOpen(true);
  }, [wikiAdmin]);
  useEffect(() => {
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!finePointer.matches || reducedMotion.matches) return;
    let lastParticle = 0;
    const leaveMagic = (event: PointerEvent) => {
      const now = performance.now();
      if (now - lastParticle < 38) return;
      lastParticle = now;
      const particle = document.createElement('i');
      particle.className = 'cursor-magic';
      particle.textContent = Math.random() > 0.45 ? '✦' : '·';
      particle.style.left = `${event.clientX}px`;
      particle.style.top = `${event.clientY}px`;
      particle.style.setProperty('--drift', `${Math.random() * 20 - 10}px`);
      document.body.appendChild(particle);
      particle.addEventListener('animationend', () => particle.remove(), {
        once: true,
      });
    };
    window.addEventListener('pointermove', leaveMagic, { passive: true });
    return () => window.removeEventListener('pointermove', leaveMagic);
  }, []);
  useEffect(() => {
    if (!currentUser || !cloudReady) return;
    const timer = window.setTimeout(async () => {
      setSyncState('syncing');
      try {
        await replacePrivateNotes(
          currentUser,
          notes.filter((note) => !note.id.startsWith('elderwood-')),
        );
        setSyncState('synced');
      } catch {
        setSyncState('error');
      }
    }, 650);
    return () => window.clearTimeout(timer);
  }, [notes, currentUser, cloudReady]);
  useEffect(() => {
    if (!q.trim()) {
      setSearchSource('Tout');
      setSearchTag('Tous');
    }
  }, [q]);
  useEffect(() => setVisibleNoteLimit(10), [section, q]);
  useEffect(() => {
    if (!open && !edit && !searchOpen && !authOpen && !tourOpen && !wikiOpen) return;
    const previousOverflow = document.body.style.overflow;
    const previousPadding = document.body.style.paddingRight;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (edit) setEdit(null);
        else if (open) setOpen(null);
        else if (searchOpen) setSearchOpen(null);
        else if (authOpen) setAuthOpen(false);
        else if (wikiOpen) setWikiOpen(false);
        else setTourOpen(false);
      }
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPadding;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [open, edit, searchOpen, authOpen, tourOpen, wikiOpen]);
  const chooseTheme = (next: HouseTheme) => {
    setTheme(next);
    setThemeOpen(false);
    document.documentElement.classList.add('dark');
    document.documentElement.dataset.theme = next;
    localStorage.setItem('elderwood-house-theme', next);
  };
  const shown = useMemo(
    () =>
      notes.filter(
        (n) =>
          (section === 'Toutes' || n.kind === section) &&
          [n.title, n.sub, n.text, n.schoolYear, n.incantation, n.spellDomain, n.mastery, ...n.tags]
            .join(' ')
            .toLowerCase()
            .includes(q.toLowerCase()),
      ),
    [notes, section, q],
  );
  const globalResults = useMemo(() => {
    if (!q.trim()) return [];
    return [
      ...notes.map((item) => ({
        source: 'Fiche' as const,
        section: item.kind,
        title: item.title,
        excerpt: item.kind === 'Cours' ? `${item.courseSessions?.length || 0} séance${(item.courseSessions?.length || 0) !== 1 ? 's' : ''} · ${item.courseTeacher || item.sub}` : richPlainText(item.text) || item.sub,
        tags: item.tags,
        item,
        score: searchScore(
          q,
          item.title,
          [item.sub, item.text, item.schoolYear, item.incantation, item.spellDomain, item.mastery, item.courseTeacher, item.courseRoom, ...(item.courseSessions || []).flatMap((session) => [session.title, richPlainText(session.content)]), ...item.tags].join(' '),
        ),
      })),
      ...lore.map((item) => ({
        source: 'Lore' as const,
        section: item.section,
        title: item.title,
        excerpt: item.text,
        tags: [] as string[],
        item,
        score: searchScore(
          q,
          item.title,
          [item.subtitle, item.year, item.text].join(' '),
        ),
      })),
      ...rules.map((item) => ({
        source: 'Règle' as const,
        section: item.section,
        title: item.title,
        excerpt: item.text,
        tags: [] as string[],
        item,
        score: searchScore(
          q,
          item.title,
          `${item.section} ${item.number} ${item.text}`,
        ),
      })),
      ...wikiEntries.filter((item) => item.status === 'approved').map((item) => ({
        source: 'Wiki' as const,
        section: `${item.category} · ${item.section}`,
        title: item.title,
        excerpt: item.content,
        tags: [item.category],
        item,
        score: searchScore(q, item.title, `${item.category} ${item.section} ${item.subtitle} ${item.content}`),
      })),
    ]
      .filter((result) => result.score > 0)
      .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
  }, [notes, q, wikiEntries]);
  const searchTags = useMemo(
    () =>
      [...new Set(globalResults.flatMap((result) => result.tags))].sort(
        (a, b) => a.localeCompare(b),
      ),
    [globalResults],
  );
  const filteredGlobalResults = useMemo(
    () =>
      globalResults.filter(
        (result) =>
          (searchSource === 'Tout' || result.source === searchSource) &&
          (searchTag === 'Tous' || result.tags.some((tag) => tag === searchTag)),
      ),
    [globalResults, searchSource, searchTag],
  );
  const add = () => setTemplateOpen(true);
  const addKind = (kind: Kind) =>
    setEdit({
      id: crypto.randomUUID(),
      kind,
      title: '',
      sub: '',
      text: '',
      tags: [],
      status: statusesByKind[kind][0],
      relation: 'Inconnue',
      schoolYear: kind === 'Personnage' ? 'Première année' : undefined,
      imageSize: 100,
      essential: false,
    });
  const addTemplate = (template: { kind: Kind; title: string; sub: string; tags: string[]; details: string[][] }) => {
    setTemplateOpen(false);
    setEdit({ id: crypto.randomUUID(), kind: template.kind, title: '', sub: template.sub, text: '', tags: template.tags, details: template.details, status: statusesByKind[template.kind][0], relation: template.kind === 'Personnage' ? 'Inconnue' : undefined, schoolYear: template.kind === 'Personnage' ? 'Première année' : undefined, imageSize: 100, essential: false });
  };
  const addLooseNote = () =>
    setNotes((current) => [{
      id: crypto.randomUUID(), kind: 'Note libre', title: 'Nouvelle note', sub: '', text: '', tags: [],
      status: 'Brouillon', boardX: 8 + Math.random() * 48, boardY: 10 + Math.random() * 42,
      noteColor: ['or', 'violet', 'bleu', 'vert', 'rose'][Math.floor(Math.random() * 5)] as Note['noteColor'],
    }, ...current]);
  const mainCharacter = notes.find((note) => note.id === 'joueur');
  const characterReady =
    !!mainCharacter?.title &&
    !['Nom à définir', 'Mon personnage'].includes(mainCharacter.title);
  const characterName = characterReady
    ? mainCharacter.title.trim().split(/\s+/)[0]
    : profileName.trim().split(/\s+/)[0];
  const characterCount = notes.filter(
    (note) => note.kind === 'Personnage' && (note.id !== 'joueur' || characterReady),
  ).length;
  const gettingStartedProgress = Math.min(4, Number(characterReady) + Number(notes.length > 1) + Number(notes.some((note) => note.image)) + Number(notes.some((note) => note.eventDate)));
  useEffect(() => {
    if (gettingStartedProgress !== 4 || gettingStartedDismissed) return;
    localStorage.setItem('elderwood-getting-started-dismissed', 'true');
    setGettingStartedDismissed(true);
  }, [gettingStartedProgress, gettingStartedDismissed]);
  const dismissGettingStarted = () => {
    localStorage.setItem('elderwood-getting-started-dismissed', 'true');
    setGettingStartedDismissed(true);
  };
  const closeTour = () => {
    localStorage.setItem('elderwood-onboarding-done', 'true');
    setTourOpen(false);
    setTourStep(0);
  };
  const addPhotos = (files: FileList | File[]) =>
    Array.from(files)
      .filter((file) => file.type.startsWith('image/'))
      .forEach(async (file) => {
        try {
          const image = await optimizeImage(file);
          setNotes((current) => [
            {
              id: crypto.randomUUID(),
              kind: 'Connaissance',
              title: file.name.replace(/\.[^.]+$/, ''),
              sub: 'Souvenir photographique · WebP optimisé',
              text: 'Image optimisée et ajoutée au grimoire.',
              tags: ['Souvenir', 'Photo'],
              image,
              imageSize: 100,
              status: 'Confirmé',
              essential: false,
            },
            ...current,
          ]);
        } catch (error) {
          alert(
            error instanceof Error
              ? error.message
              : 'Impossible de convertir cette image.',
          );
        }
      });
  return (
    <main>
      <aside className={menu ? 'side on' : 'side'}>
        <div className="brand">
          <i className="brand-sigil">
            <WandSparkles />
            <span>✦</span>
          </i>
          <div>
            <b>Elderwood</b>
            <small>Le grimoire des résonants</small>
          </div>
        </div>
        <button className="account-gate" onClick={() => setAuthOpen(true)}>
          <span className="account-avatar">
            {currentUser || profileName ? profileName.slice(0, 1).toUpperCase() || <LogIn /> : <LogIn />}
          </span>
          <span className="account-copy">
            <small>{currentUser ? wikiAdmin ? 'SCEAU DE L’ADMINISTRATEUR' : 'GRIMOIRE SYNCHRONISÉ' : 'ACCÈS PERSONNEL'}</small>
            <b>{currentUser ? profileName || 'Mon grimoire' : 'Se connecter'}</b>
            <em>
              {currentUser
                ? syncState === 'syncing'
                  ? 'Synchronisation…'
                  : syncState === 'error'
                    ? 'Synchronisation interrompue'
                    : wikiAdmin
                      ? 'Administrateur du grimoire'
                      : 'Grimoire en ligne'
                : 'Se connecter'}
            </em>
          </span>
          <ChevronRight />
        </button>
        {currentUser && <p>MON GRIMOIRE</p>}
        {currentUser && <button className={section === 'Toutes' ? 'active' : ''} onClick={() => { setSection('Toutes'); setMenu(false); setQ(''); setNavFlyout(null); }}><LayoutDashboard /> Vue d’ensemble<em>{notes.length}</em></button>}
        {currentUser && <div className={`side-nav-group${['Personnage', 'Lieu', 'Connaissance', 'Projet', 'Sort', 'Tableau'].includes(section) ? ' current' : ''}${navFlyout === 'sheets' ? ' open' : ''}`} onMouseEnter={() => setNavFlyout('sheets')} onMouseLeave={() => setNavFlyout(null)}>
          <button className="side-group-trigger" aria-expanded={navFlyout === 'sheets'} onClick={() => setNavFlyout((value) => value === 'sheets' ? null : 'sheets')}><BookOpen /><span><b>Mes fiches</b><small>{section === 'Tableau' ? 'Notes diverses' : ['Personnage', 'Lieu', 'Connaissance', 'Projet', 'Sort'].includes(section) ? section + (section === 'Lieu' ? 'x' : 's') : '6 rubriques'}</small></span><ChevronRight /></button>
          {navFlyout === 'sheets' && <nav className="side-nav-flyout"><small>MES FICHES</small>{([
            ['Personnage', 'Personnages', Users],
            ['Lieu', 'Lieux', MapPin],
            ['Connaissance', 'Connaissances', BookOpen],
            ['Projet', 'Projets', BriefcaseBusiness],
            ['Sort', 'Sorts', WandSparkles],
            ['Tableau', 'Notes diverses', StickyNote],
          ] as const).map(([target, label, Icon]) => <button className={section === target ? 'active' : ''} onClick={() => { setSection(String(target)); setMenu(false); setQ(''); setNavFlyout(null); }} key={target}><Icon /><span><b>{label}</b><small>{target === 'Tableau' ? notes.filter((note) => note.kind === 'Note libre').length : notes.filter((note) => note.kind === target).length} fiche{(target === 'Tableau' ? notes.filter((note) => note.kind === 'Note libre').length : notes.filter((note) => note.kind === target).length) !== 1 ? 's' : ''}</small></span><ChevronRight /></button>)}</nav>}
        </div>}
        {currentUser && <div className={`side-nav-group${['Cours', 'Chronologie', 'Relations'].includes(section) ? ' current' : ''}${navFlyout === 'organize' ? ' open' : ''}`} onMouseEnter={() => setNavFlyout('organize')} onMouseLeave={() => setNavFlyout(null)}>
          <button className="side-group-trigger" aria-expanded={navFlyout === 'organize'} onClick={() => setNavFlyout((value) => value === 'organize' ? null : 'organize')}><CalendarDays /><span><b>Organisation</b><small>{['Cours', 'Chronologie', 'Relations'].includes(section) ? section : '3 rubriques'}</small></span><ChevronRight /></button>
          {navFlyout === 'organize' && <nav className="side-nav-flyout"><small>ORGANISATION</small>{([
            ['Cours', 'Cours', GraduationCap, notes.filter((note) => note.kind === 'Cours').length],
            ['Chronologie', 'Chronologie', CalendarDays, notes.filter((note) => note.eventDate).length],
            ['Relations', 'Relations', Network, notes.filter((note) => note.kind === 'Personnage').length],
          ] as const).map(([target, label, Icon, count]) => <button className={section === target ? 'active' : ''} onClick={() => { setSection(target); setMenu(false); setQ(''); setNavFlyout(null); }} key={target}><Icon /><span><b>{label}</b><small>{count} élément{count !== 1 ? 's' : ''}</small></span><ChevronRight /></button>)}</nav>}
        </div>}
        <p className="archive-label">ARCHIVES OFFICIELLES</p>
        {!currentUser && <button className={section === 'Accueil' ? 'active' : ''} onClick={() => { setSection('Accueil'); setMenu(false); setQ(''); }}>
          <Sparkles /> Accueil
        </button>}
        <button
          className={section === 'Règlement' ? 'active' : ''}
          onClick={() => {
            setSection('Règlement');
            setMenu(false);
            setQ('');
          }}
        >
          <ShieldAlert />
          Règlement<em>56</em>
        </button>
        <button
          className={section === 'Lore' ? 'active' : ''}
          onClick={() => {
            setSection('Lore');
            setMenu(false);
            setQ('');
          }}
        >
          <Compass />
          Lore<em>{lore.length}</em>
        </button>
        <button
          className={section === 'Elderwood' ? 'active' : ''}
          onClick={() => {
            setSection('Elderwood');
            setMenu(false);
            setQ('');
          }}
        >
          <Castle />
          Elderwood<em>15</em>
        </button>
        <button className="wiki-gate" onClick={() => currentUser ? setWikiOpen(true) : setAuthOpen(true)}>
          <Send />
          {wikiAdmin ? 'Modérer le wiki' : 'Proposer au wiki'}
          <em>{wikiAdmin ? wikiEntries.filter((item) => item.status === 'pending').length + (wikiDemoPending ? 1 : 0) : wikiEntries.filter((item) => item.created_by === currentUser?.id && item.status === 'pending').length}</em>
        </button>
        {wikiAdmin && <button className="admin-gate" onClick={() => setAdminOpen(true)}>
          <UserCog /> Administration
        </button>}
        <div className="local">
          {currentUser ? <LockKeyhole /> : <Sparkles />}
          <span>
            <b>{currentUser ? 'Coffre privé en ligne' : 'Archives publiques'}</b>
            <br />
            {currentUser
              ? syncState === 'syncing'
                ? 'Synchronisation en cours…'
                : syncState === 'error'
                  ? 'Les données locales restent disponibles.'
                  : 'Tes fiches suivent ton compte.'
              : 'Connecte-toi pour créer ton grimoire personnel.'}
          </span>
        </div>
      </aside>
      <section className="work">
        <header>
          <button className="hamb" onClick={() => setMenu(!menu)}>
            <Menu />
          </button>
          <label className="grimoire-searchbar">
            <Sparkles className="search-spark" />
            <Search />
            <input
              id="grimoire-search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher une personne, un lieu, un souvenir…"
            />
            {q && (
              <button onClick={() => setQ('')}>
                <X />
              </button>
            )}
          </label>
          <div className="header-actions"><div className="theme-control">
            <button
              className={`theme-toggle theme-${theme}`}
              onClick={() => setThemeOpen((value) => !value)}
              aria-label="Choisir l’ambiance d’une maison"
              aria-expanded={themeOpen}
              title={`Thème ${houseThemes.find((item) => item.id === theme)?.name}`}
            >
              <Palette />
              <i />
            </button>
            {themeOpen && (
              <>
                <button
                  className="theme-backdrop"
                  onClick={() => setThemeOpen(false)}
                  aria-label="Fermer les thèmes"
                />
                <div className="theme-menu" role="dialog" aria-label="Thèmes des maisons">
                  <small>AMBIANCE DU GRIMOIRE</small>
                  <strong>Choisis ta maison</strong>
                  <div>
                    {houseThemes.map((item) => (
                      <button
                        className={`${item.id}${theme === item.id ? ' active' : ''}`}
                        onClick={() => chooseTheme(item.id)}
                        key={item.id}
                      >
                        <i />
                        <span><b>{item.name}</b><small>{item.motto}</small></span>
                        {theme === item.id && <Sparkles />}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
          {currentUser && !['Règlement', 'Lore', 'Elderwood', 'Cours'].includes(section) && (
            <button className="primary" onClick={section === 'Tableau' ? addLooseNote : add}>
              <Plus /> {section === 'Tableau' ? 'Nouvelle note' : 'Nouvelle fiche'}
            </button>
          )}
          </div>
        </header>
        <div className={`content${section === 'Toutes' && !q ? ' home-overview' : ''}`}>
          {q.trim() ? (
            <section className="global-search">
              <div className="search-heading">
                <div>
                  <small>RECHERCHE DANS TOUT LE GRIMOIRE</small>
                  <h2>Résultats pour « {q} »</h2>
                </div>
                <span>
                  {filteredGlobalResults.length} résultat
                  {filteredGlobalResults.length !== 1 && 's'}
                </span>
              </div>
              <div className="search-filters" aria-label="Filtres de recherche">
                <div>
                  <b>Afficher</b>
                  {(['Tout', 'Fiche', 'Lore', 'Règle', 'Wiki'] as const).map(
                    (source) => (
                      <button
                        className={searchSource === source ? 'active' : ''}
                        onClick={() => {
                          setSearchSource(source);
                          if (source !== 'Tout' && source !== 'Fiche')
                            setSearchTag('Tous');
                        }}
                        key={source}
                      >
                        {source === 'Tout'
                          ? 'Tout'
                          : source === 'Fiche'
                            ? 'Mes fiches'
                            : `${source}s`}
                        <span>
                          {source === 'Tout'
                            ? globalResults.length
                            : globalResults.filter(
                                (result) => result.source === source,
                              ).length}
                        </span>
                      </button>
                    ),
                  )}
                </div>
                {!!searchTags.length &&
                  (searchSource === 'Tout' || searchSource === 'Fiche') && (
                    <div>
                      <b>Tags</b>
                      {['Tous', ...searchTags].map((tag) => (
                        <button
                          className={
                            searchTag === tag
                              ? 'active tag-filter'
                              : 'tag-filter'
                          }
                          onClick={() => setSearchTag(tag)}
                          key={tag}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  )}
              </div>
              <div className="search-results">
                {filteredGlobalResults.map((result, index) => (
                  <button
                    className={
                      result.source === 'Fiche' && (result.item as Note).image
                        ? 'has-search-photo'
                        : undefined
                    }
                    key={`${result.source}-${result.section}-${result.title}-${index}`}
                    onClick={() => {
                      if (result.source === 'Fiche') {
                        const foundNote = result.item as Note;
                        if (foundNote.kind === 'Cours') {
                          setSection('Cours');
                          setQ('');
                        } else {
                          setOpen(foundNote);
                        }
                        return;
                      }
                      setSearchOpen(result);
                    }}
                  >
                    {result.source === 'Fiche' &&
                      (result.item as Note).image && (
                        <img
                          className="search-thumb"
                          src={(result.item as Note).image}
                          alt={`Aperçu de ${result.title}`}
                        />
                      )}
                    <span
                      className={`search-source source-${result.source.toLowerCase().replace('è', 'e')}`}
                    >
                      {result.source}
                    </span>
                    <span className="search-copy">
                      <small>{result.section}</small>
                      <strong>{result.title}</strong>
                      <p>{result.excerpt}</p>
                    </span>
                    <ChevronRight />
                  </button>
                ))}
                {!filteredGlobalResults.length && (
                  <div className="empty">
                    <Search />
                    <h3>Aucun résultat avec ces filtres</h3>
                    <p>
                      Essaie un autre filtre, un nom, un lieu ou un terme RP.
                    </p>
                  </div>
                )}
              </div>
            </section>
          ) : !currentUser && section === 'Accueil' ? (
            <PublicLanding connect={() => setAuthOpen(true)} explore={() => setSection('Lore')} school={() => setSection('Elderwood')} />
          ) : section === 'Règlement' ? (
            <RulesView query={q} />
          ) : section === 'Lore' ? (
            <LoreView query={q} />
          ) : section === 'Elderwood' ? (
            <ElderwoodView query={q} />
          ) : section === 'Cours' ? (
            <CourseNotebookView user={currentUser!} courses={notes.filter((note) => note.kind === 'Cours')} entries={wikiEntries} update={(course) => setNotes((current) => current.map((note) => note.id === course.id ? course : note))} add={(course) => setNotes((current) => [course, ...current])} remove={(course) => { if (course.id === 'course-demo') localStorage.setItem(`elderwood-course-demo-${currentUser!.id}`, 'deleted'); setNotes((current) => current.filter((note) => note.id !== course.id)); }} refreshShared={async () => setWikiEntries(await loadWikiSubmissions(currentUser))} />
          ) : section === 'Tableau' ? (
            <MagicBoard notes={notes.filter((note) => note.kind === 'Note libre')} update={(updated) => setNotes((current) => current.map((note) => note.id === updated.id ? updated : note))} remove={(id) => setNotes((current) => current.filter((note) => note.id !== id))} add={addLooseNote} />
          ) : section === 'Chronologie' ? (
            <TimelineView notes={notes} open={setOpen} edit={setEdit} />
          ) : section === 'Relations' ? (
            <RelationsView notes={notes} open={setOpen} />
          ) : (
            <>
              {section === 'Toutes' && !q && (
                <>
                  <section className="hero">
                    <img
                      src={`${import.meta.env.BASE_URL}elderwood-archive.png`}
                      alt="Académie magique dans une forêt nocturne"
                    />
                    <div>
                      <small>ARCHIVES PERSONNELLES · ANNÉE I</small>
                      <h1>
                        {characterName
                          ? `${greeting}, ${characterName}.`
                          : `${greeting} dans ton grimoire.`}
                      </h1>
                      <p>
                        {characterCount}{' '}
                        personnage · {notes.filter((n) => n.kind === 'Lieu').length}{' '}
                        lieux · {notes.filter((n) => n.kind === 'Projet').length}{' '}
                        projet
                      </p>
                      <button
                        onClick={() =>
                          mainCharacter &&
                          (characterReady
                            ? setOpen(mainCharacter)
                            : setEdit(mainCharacter))
                        }
                      >
                        {characterReady
                          ? 'Ouvrir mon personnage'
                          : 'Créer mon personnage'}{' '}
                        <ChevronRight />
                      </button>
                    </div>
                    <Dices className="seal" />
                  </section>
                  {!gettingStartedDismissed && gettingStartedProgress < 4 && <section className="getting-started"><button className="getting-started-dismiss" onClick={dismissGettingStarted} aria-label="Masquer la prise en main" title="Ne plus afficher"><X /></button><div><small>PRISE EN MAIN</small><h2>{gettingStartedProgress}/4 étapes accomplies</h2></div><div><button className={characterReady ? 'done' : ''} onClick={() => mainCharacter && setEdit(mainCharacter)}><Check /> Créer ton personnage</button><button className={notes.length > 1 ? 'done' : ''} onClick={add}><Check /> Ajouter une première fiche</button><button className={notes.some((note) => note.image) ? 'done' : ''} onClick={() => document.querySelector<HTMLInputElement>('.photo-drop input')?.click()}><Check /> Ajouter une image</button><button className={notes.some((note) => note.eventDate) ? 'done' : ''} onClick={() => setSection('Chronologie')}><Check /> Commencer la chronologie</button></div></section>}
                  <section className="first-actions" aria-label="Actions rapides">
                    <button
                      onClick={() =>
                        document.getElementById('grimoire-search')?.focus()
                      }
                    >
                      <Search />
                      <span>
                        <small>RETROUVER</small>
                        <b>Une information</b>
                        <em>Lore, règle, personne ou lieu</em>
                      </span>
                      <ChevronRight />
                    </button>
                    <button onClick={() => addKind('Personnage')}>
                      <Users />
                      <span>
                        <small>MÉMORISER</small>
                        <b>Une rencontre</b>
                        <em>Relation, détails et portrait</em>
                      </span>
                      <ChevronRight />
                    </button>
                    <button onClick={() => addKind('Projet')}>
                      <BriefcaseBusiness />
                      <span>
                        <small>PRÉPARER</small>
                        <b>Une scène RP</b>
                        <em>Objectifs, pistes et étapes</em>
                      </span>
                      <ChevronRight />
                    </button>
                  </section>
                  <div className="heading">
                    <div>
                      <small>À PORTÉE DE PLUME</small>
                      <h2>Les essentiels</h2>
                    </div>
                  </div>
                  <section className="cards">
                    {notes
                      .filter((n) => n.essential)
                      .slice(0, 3)
                      .map((n, i) => {
                        const I = icons[n.kind];
                        return (
                          <button
                            className={n.image ? 'has-photo' : ''}
                            onClick={() => setOpen(n)}
                            key={n.id}
                          >
                            {n.image && (
                              <div className="essential-photo">
                                <img src={n.image} alt="" />
                                <span>Voir la fiche</span>
                              </div>
                            )}
                            <span>
                              {n.kind}
                              {i === 0 && <Star />}
                            </span>
                            {!n.image && (
                              <i>
                                <I />
                              </i>
                            )}
                            <h3>{n.title}</h3>
                            <p>{n.sub}</p>
                            <Tags tags={n.tags.slice(0, 2)} onPick={setQ} />
                          </button>
                        );
                      })}
                    <button className="add" onClick={add}>
                      <Plus />
                      <h3>Ajouter une fiche</h3>
                      <p>Personnage, lieu, connaissance ou projet</p>
                    </button>
                  </section>
                  <section className="memory-section">
                    <div className="heading">
                      <div>
                        <small>SOUVENIRS VISUELS</small>
                        <h2>Album de mémoire</h2>
                      </div>
                      <span>
                        {notes.filter((n) => n.image).length} image
                        {notes.filter((n) => n.image).length !== 1 && 's'}
                      </span>
                    </div>
                    <label
                      className="photo-drop"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        addPhotos(e.dataTransfer.files);
                      }}
                    >
                      <Camera />
                      <span>
                        <b>Dépose tes images ici</b>
                        <small>
                          ou clique pour les choisir depuis ton ordinateur
                        </small>
                      </span>
                      <input
                        hidden
                        multiple
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          e.target.files && addPhotos(e.target.files)
                        }
                      />
                    </label>
                    {!!notes.filter((n) => n.image).length && (
                      <div className="memory-grid">
                        {notes
                          .filter((n) => n.image)
                          .slice(0, 8)
                          .map((n) => (
                            <button key={n.id} onClick={() => setOpen(n)}>
                              <img src={n.image} alt={n.title} />
                              <span>{n.title}</span>
                            </button>
                          ))}
                      </div>
                    )}
                  </section>
                </>
              )}
              <div className="heading">
                <div>
                  <small>{q ? 'RÉSULTATS' : 'DERNIÈRES ÉCRITURES'}</small>
                  <h2>
                    {q
                      ? `Recherche « ${q} »`
                      : section === 'Toutes'
                        ? 'Toutes les notes'
                        : section === 'Lieu'
                          ? 'Lieux'
                          : section + 's'}
                  </h2>
                </div>
                <div className="heading-actions">
                  <span>{shown.length} fiche{shown.length !== 1 && 's'}</span>
                  <div className="view-switcher"><button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')}><List /> Liste</button><button className={viewMode === 'compact' ? 'active' : ''} onClick={() => setViewMode('compact')}><Rows3 /> Compact</button><button className={viewMode === 'library' ? 'active' : ''} onClick={() => setViewMode('library')}><LibraryBig /> Bibliothèque</button></div>
                </div>
              </div>
              <section className={`list view-${viewMode}`}>
                {shown.slice(0, visibleNoteLimit).map((n) => {
                  const I = icons[n.kind];
                  return (
                    <article className={`kind-${n.kind.toLowerCase().replace(' ', '-')}`} onClick={() => setOpen(n)} key={n.id}>
                      <i className={n.image ? 'note-thumb' : ''}>
                        {n.image ? <img src={n.image} alt="" /> : <I />}
                      </i>
                      <div>
                        <small>{n.kind}</small>
                        <h3>{n.title}</h3>
                        <p>{richPlainText(n.text)}</p>
                        <Tags tags={n.tags} onPick={setQ} />
                      </div>
                      <ChevronRight />
                    </article>
                  );
                })}
                {!shown.length && (
                  <div className="empty">
                    <Search />
                    <h3>Rien dans ces pages</h3>
                    <p>Essaie un autre mot, ou crée une nouvelle fiche.</p>
                  </div>
                )}
                {shown.length > visibleNoteLimit && (
                  <button className="older-notes" onClick={() => setVisibleNoteLimit((limit) => limit + 10)}>
                    <BookOpen />
                    <span><b>Voir les notes précédemment ajoutées</b><small>{shown.length - visibleNoteLimit} fiche{shown.length - visibleNoteLimit > 1 ? 's' : ''} restante{shown.length - visibleNoteLimit > 1 ? 's' : ''}</small></span>
                    <ChevronRight />
                  </button>
                )}
              </section>
            </>
          )}
        </div>
        <footer className="povik-signature" aria-label="Crédits du site">
          <span>✦</span> by Povik · Tous droits réservés
        </footer>
      </section>
      {open && (
        <div
          className="overlay fiche-overlay"
          onMouseDown={(e) => e.target === e.currentTarget && setOpen(null)}
        >
          <article
            className={`sheet ${open.image ? 'with-image' : ''}`}
            role="dialog"
            aria-modal="true"
            aria-label={`Fiche de ${open.title}`}
          >
            <button className="close" onClick={() => setOpen(null)}>
              <X />
            </button>
            <div className="cover">
              {open.image ? (
                <>
                  <span
                    className="image-backdrop"
                    style={{ backgroundImage: `url(${open.image})` }}
                  />
                  <img src={open.image} alt={open.title} />
                </>
              ) : (
                <>
                  <span>✦　·　✧　·　✦</span>
                  {(() => {
                    const I = icons[open.kind];
                    return <I />;
                  })()}
                </>
              )}
            </div>
            <div className="body">
              <small>{open.kind}</small>
              <h2>{open.title}</h2>
              <h4>{open.sub}</h4>
              <div className="facts">
                <span>
                  <b>{open.kind === 'Connaissance' ? 'État de la fiche' : 'Statut'}</b>
                  {open.status || 'À découvrir'}
                </span>
                {open.kind === 'Personnage' && (
                  <span>
                    <b>Relation</b>
                    {open.relation || 'Inconnue'}
                  </span>
                )}
                {open.kind === 'Personnage' && (
                  <span className={`house-fact ${open.house?.toLowerCase() || 'none'}`}>
                    <b>Maison</b>
                    {open.house || 'Sans maison'}
                  </span>
                )}
                {open.kind === 'Personnage' && (
                  <span><b>Année</b>{open.schoolYear || 'Non renseignée'}</span>
                )}
                {open.kind === 'Personnage' && open.age && (
                  <span><b>Âge</b>{open.age} ans</span>
                )}
                {open.kind === 'Connaissance' && open.knowledge && (
                  <span>
                    <b>Connaissance</b>
                    {open.knowledge}
                  </span>
                )}
                {open.kind === 'Sort' && (
                  <>
                    <span><b>Domaine</b>{open.spellDomain || 'Non classé'}</span>
                    <span><b>Maîtrise</b>{open.mastery || 'À étudier'}</span>
                  </>
                )}
              </div>
              <Tags
                tags={open.tags}
                onPick={(tag) => {
                  setQ(tag);
                  setSection('Toutes');
                  setOpen(null);
                }}
              />
              <div className="intro rich-output" dangerouslySetInnerHTML={{ __html: safeRichHtml(open.text) }} />
              {open.kind === 'Sort' && open.incantation && (
                <section className="spell-incantation"><small>INCANTATION</small><p>{open.incantation}</p></section>
              )}
              {(open.kind === 'Connaissance' || open.kind === 'Sort') && open.source && (
                <section className="knowledge-source">
                  <h3>{open.kind === 'Sort' ? 'Source d’apprentissage' : 'Comment je le sais'}</h3>
                  <p>{open.source}</p>
                </section>
              )}
              {open.kind === 'Projet' && !!open.tasks?.length && (
                <section className="project-checklist">
                  <div>
                    <h3>Étapes du projet</h3>
                    <span>
                      {open.tasks.filter((task) => task.done).length}/
                      {open.tasks.length}
                    </span>
                  </div>
                  {open.tasks.map((task) => (
                    <label key={task.id}>
                      <input
                        type="checkbox"
                        checked={task.done}
                        onChange={() => {
                          const tasks = open.tasks!.map((item) =>
                            item.id === task.id
                              ? { ...item, done: !item.done }
                              : item,
                          );
                          const updated = { ...open, tasks };
                          setOpen(updated);
                          setNotes(
                            notes.map((note) =>
                              note.id === open.id ? updated : note,
                            ),
                          );
                        }}
                      />
                      <span>{task.text}</span>
                    </label>
                  ))}
                </section>
              )}
              {open.kind === 'Projet' && open.nextAction && (
                <section className="next-action">
                  <small>PROCHAINE ACTION</small>
                  <p>{open.nextAction}</p>
                </section>
              )}
              {open.details?.filter((d) => richPlainText(d[1]).trim()).map((d) => (
                <section key={d[0]}>
                  <h3>{d[0]}</h3>
                  <div className="rich-output" dangerouslySetInnerHTML={{ __html: safeRichHtml(d[1]) }} />
                </section>
              ))}
              <LinkedReferences note={open} notes={notes} open={(note) => setOpen(note)} />
              <div className="actions">
                <button className="action-wiki" onClick={() => { setWikiSeed(open); setOpen(null); setWikiOpen(true); }}>
                  <Send /> Proposer au wiki
                </button>
                <button
                  className={`action-pin ${open.essential ? 'is-pinned' : ''}`}
                  onClick={() => {
                    setNotes(
                      notes.map((n) =>
                        n.id === open.id
                          ? { ...n, essential: !n.essential }
                          : n,
                      ),
                    );
                    setOpen({ ...open, essential: !open.essential });
                  }}
                >
                  <Star fill={open.essential ? 'currentColor' : 'none'} />
                  {open.essential ? 'Épinglé' : 'Épingler'}
                </button>
                <button
                  className="action-edit"
                  onClick={() => {
                    setEdit(open);
                    setOpen(null);
                  }}
                >
                  <Pencil />
                  Modifier
                </button>
                <button
                  className="action-delete"
                  aria-label="Supprimer la fiche"
                  title="Supprimer la fiche"
                  onClick={() => {
                    if (confirm('Supprimer cette fiche ?')) {
                      setNotes(notes.filter((n) => n.id !== open.id));
                      setOpen(null);
                    }
                  }}
                >
                  <Trash2 />
                </button>
              </div>
            </div>
          </article>
        </div>
      )}
      {searchOpen && (
        <div
          className="overlay search-detail-overlay"
          onMouseDown={(event) =>
            event.target === event.currentTarget && setSearchOpen(null)
          }
        >
          <article className="search-detail" role="dialog" aria-modal="true">
            <button
              className="close"
              onClick={() => setSearchOpen(null)}
              aria-label="Fermer"
            >
              <X />
            </button>
            <div className="search-detail-mark">
              {searchOpen.source === 'Lore' || searchOpen.source === 'Wiki' ? <Compass /> : <ShieldAlert />}
            </div>
            <small>
              {searchOpen.source} · {searchOpen.section}
            </small>
            <h2>{searchOpen.title}</h2>
            {'subtitle' in searchOpen.item && searchOpen.item.subtitle && (
              <p className="search-detail-subtitle">
                {searchOpen.item.subtitle}
              </p>
            )}
            {'year' in searchOpen.item && searchOpen.item.year && (
              <span className="search-detail-year">{searchOpen.item.year}</span>
            )}
            {'number' in searchOpen.item && (
              <span className="search-detail-year">
                Règle {String(searchOpen.item.number).padStart(2, '0')}
              </span>
            )}
            <div className="search-detail-rule" />
            <p className="search-detail-text">{searchOpen.excerpt}</p>
          </article>
        </div>
      )}
      {tourOpen && (
        <WelcomeTour
          step={tourStep}
          name={profileName}
          setStep={setTourStep}
          saveName={(name) => {
            setProfileName(name);
            localStorage.setItem('elderwood-profile-name', name);
          }}
          close={closeTour}
          createCharacter={() => {
            closeTour();
            if (mainCharacter) setEdit(mainCharacter);
          }}
          startSearch={() => {
            closeTour();
            setTimeout(
              () => document.getElementById('grimoire-search')?.focus(),
              50,
            );
          }}
        />
      )}
      {authOpen && (
        <AuthPanel
          name={profileName}
          user={currentUser}
          configured={isSupabaseConfigured}
          passwordRecovery={passwordRecovery}
          cancel={() => {
            setAuthOpen(false);
            setPasswordRecovery(false);
          }}
          save={async (name) => {
            setProfileName(name);
            localStorage.setItem('elderwood-profile-name', name);
            if (currentUser) await updateProfileName(currentUser, name);
            setAuthOpen(false);
          }}
        />
      )}
      {authNotice && (
        <div className="auth-notice" role="status" aria-live="polite">
          <span><Sparkles /></span>
          <div>
            <small>LE SCEAU A RÉPONDU</small>
            <b>{authNotice}</b>
            <p>Bienvenue dans tes archives, Résonant.</p>
          </div>
        </div>
      )}
      {wikiOpen && currentUser && (
        <WikiPanel
          user={currentUser}
          admin={wikiAdmin}
          entries={wikiEntries}
          seed={wikiSeed}
          demoPending={wikiDemoPending}
          setDemoPending={setWikiDemoPending}
          close={() => { setWikiOpen(false); setWikiSeed(null); }}
          refresh={async () => setWikiEntries(await loadWikiSubmissions(currentUser))}
        />
      )}
      {adminOpen && currentUser && wikiAdmin && (
        <AdminPanel
          close={() => setAdminOpen(false)}
          openModeration={() => { setAdminOpen(false); setWikiOpen(true); }}
        />
      )}
      {templateOpen && <TemplatePicker close={() => setTemplateOpen(false)} choose={addTemplate} />}
      {edit && (
        <Editor
          note={edit}
          cancel={() => setEdit(null)}
          save={(n) => {
            setNotes(
              notes.some((x) => x.id === n.id)
                ? notes.map((x) => (x.id === n.id ? n : x))
                : [n, ...notes],
            );
            setEdit(null);
            setOpen(n);
            setSaveNotice('La fiche a été scellée dans ton grimoire.');
            window.setTimeout(() => setSaveNotice(''), 2600);
          }}
        />
      )}
      {saveNotice && <div className="save-rune-notice"><Sparkles /><span><b>Encre scellée</b>{saveNotice}</span></div>}
    </main>
  );
}
function WikiPanel({ user, admin, entries, seed, demoPending, setDemoPending, close, refresh }: {
  user: User;
  admin: boolean;
  entries: WikiSubmission[];
  seed: Note | null;
  demoPending: boolean;
  setDemoPending: (pending: boolean) => void;
  close: () => void;
  refresh: () => Promise<void>;
}) {
  const seedCategory: WikiSubmission['category'] = seed?.kind === 'Lieu' ? 'Lieu' : seed?.kind === 'Personnage' ? 'Personnalité' : 'Lore';
  const [category, setCategory] = useState<WikiSubmission['category']>(seedCategory);
  const [section, setSection] = useState(seed?.kind || 'Communauté');
  const [title, setTitle] = useState(seed?.title || '');
  const [subtitle, setSubtitle] = useState(seed?.sub || '');
  const [content, setContent] = useState(seed ? [richPlainText(seed.text), ...(seed.details || []).map((detail) => `${detail[0]}\n${richPlainText(detail[1])}`)].filter(Boolean).join('\n\n') : '');
  const [source, setSource] = useState(seed?.source || '');
  const [publicConsent, setPublicConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const visible = (admin ? entries : entries.filter((entry) => entry.created_by === user.id)).map((entry) => entry.section.startsWith('Cours ·') ? { ...entry, category: 'Cours' as WikiSubmission['category'] } : entry);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setMessage('');
    try {
      const result = await submitWikiProposal(user, { category, section, title, subtitle, content, source });
      setTitle(''); setSubtitle(''); setContent(''); setSource('');
      setPublicConsent(false);
      setMessage(result.notificationSent ? 'Ta proposition attend désormais le sceau de l’admin.' : 'Proposition enregistrée. La notification e-mail devra être configurée.');
      await refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Impossible d’envoyer la proposition.'); }
    finally { setBusy(false); }
  };
  const review = async (id: string, status: 'approved' | 'rejected') => {
    setBusy(true);
    try { await reviewWikiProposal(id, status); await refresh(); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Modération impossible.'); }
    finally { setBusy(false); }
  };
  return <div className="overlay wiki-overlay" onMouseDown={(event) => event.target === event.currentTarget && close()}>
    <section className="wiki-panel" role="dialog" aria-modal="true">
      <button className="close" onClick={close}><X /></button>
      <header><span><Sparkles /></span><div><small>SCRIPTORIUM COMMUNAUTAIRE</small><h2>{admin ? 'Salle de modération' : 'Proposer une page officielle'}</h2><p>Rien ne rejoint les archives communes avant ta validation.</p></div></header>
      {!admin && <form onSubmit={submit}>
        <aside className="wiki-warning"><ShieldAlert /><div><b>Cette proposition deviendra publique si elle est acceptée</b><p>Retire les secrets, relations, projets personnels et informations privées. Propose plutôt une pièce, un lieu, un objet, une créature ou une connaissance utile à tous.</p></div></aside>
        <div className="wiki-grid"><label>Catégorie<select value={category} onChange={(e) => setCategory(e.target.value as WikiSubmission['category'])}>{['Lore','Règle','Lieu','Créature','Personnalité'].map(v => <option key={v}>{v}</option>)}</select></label><label>Section<input value={section} onChange={(e) => setSection(e.target.value)} maxLength={60} required /></label></div>
        <label>Titre<input value={title} onChange={(e) => setTitle(e.target.value)} minLength={2} maxLength={100} required /></label>
        <label>Sous-titre (facultatif)<input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} maxLength={160} /></label>
        <label>Contenu<textarea value={content} onChange={(e) => setContent(e.target.value)} minLength={20} maxLength={10000} required /></label>
        <label>Source ou contexte (recommandé)<input value={source} onChange={(e) => setSource(e.target.value)} maxLength={300} placeholder="Scène RP, annonce staff, lien…" /></label>
        <label className="wiki-consent"><input type="checkbox" checked={publicConsent} onChange={(e) => setPublicConsent(e.target.checked)} /><span>J’ai relu cette fiche et je confirme qu’elle peut être rendue publique.</span></label>
        <button className="wiki-submit" disabled={busy || !publicConsent || title.length < 2 || content.length < 20}><Send /> Envoyer pour validation</button>
      </form>}
      {message && <p className="wiki-message">{message}</p>}
      <div className="wiki-list"><div className="wiki-list-heading"><h3>{admin ? 'Demandes reçues' : 'Mes propositions'}</h3>{admin && !demoPending && <button onClick={() => { setDemoPending(true); setMessage(''); }}><Sparkles /> Voir une demande d’exemple</button>}</div>{!visible.length && !demoPending && <p className="wiki-empty">Aucune proposition pour le moment.</p>}{admin && demoPending && <article className="wiki-pending wiki-demo"><span className="demo-ribbon">SIMULATION</span><small>Lieu · Château d’Elderwood</small><h4>La Salle des Murmures</h4><em>Une ancienne salle d’étude oubliée sous la bibliothèque</em><p>Cette pièce circulaire possède une acoustique étrange : les conversations prononcées près des murs semblent réapparaître quelques minutes plus tard à l’autre bout de la salle. Des élèves l’utiliseraient pour étudier les manifestations résiduelles de l’Écho.</p><footer>Proposé par : autrejoueur@exemple.fr<br />Source déclarée : découverte lors d’une scène RP, à vérifier avec le lore officiel.</footer><span className="wiki-status">En attente</span><div><button onClick={() => { setDemoPending(false); setMessage('Simulation : la fiche aurait été publiée et serait devenue visible par tous.'); }}><Check /> Publier</button><button onClick={() => { setDemoPending(false); setMessage('Simulation : la proposition aurait été refusée sans modifier les archives.'); }}><X /> Refuser</button></div></article>}{visible.map((entry) => <article key={entry.id} className={`wiki-${entry.status}`}><small>{entry.category} · {entry.section}</small><h4>{entry.title}</h4>{entry.subtitle && <em>{entry.subtitle}</em>}<p>{entry.content}</p>{entry.source && <footer>Source : {entry.source}</footer>}<span className="wiki-status">{entry.status === 'pending' ? 'En attente' : entry.status === 'approved' ? 'Publiée' : 'Refusée'}</span>{admin && entry.status === 'pending' && <div><button disabled={busy} onClick={() => review(entry.id, 'approved')}><Check /> Publier</button><button disabled={busy} onClick={() => review(entry.id, 'rejected')}><X /> Refuser</button></div>}</article>)}</div>
    </section>
  </div>;
}
const sheetTemplates: { kind: Kind; title: string; sub: string; tags: string[]; details: string[][] }[] = [
  { kind: 'Personnage', title: 'Élève', sub: 'Élève d’Elderwood', tags: ['Élève'], details: [['Histoire',''],['Caractère',''],['Relations',''],['Objectifs',''],['Anecdotes','']] },
  { kind: 'Personnage', title: 'Professeur', sub: 'Membre du personnel d’Elderwood', tags: ['Professeur'], details: [['Parcours',''],['Matière enseignée',''],['Caractère',''],['Réputation','']] },
  { kind: 'Lieu', title: 'Lieu', sub: 'Lieu à découvrir', tags: ['Lieu'], details: [['Description',''],['Ambiance',''],['Accès',''],['Secrets et rumeurs','']] },
  { kind: 'Sort', title: 'Sort', sub: 'Formule magique', tags: ['Magie'], details: [['Effet',''],['Gestuelle',''],['Limites et risques',''],['Origine','']] },
  { kind: 'Connaissance', title: 'Créature', sub: 'Créature magique', tags: ['Créature'], details: [['Apparence',''],['Comportement',''],['Habitat',''],['Dangers','']] },
  { kind: 'Connaissance', title: 'Objet magique', sub: 'Artefact ou curiosité', tags: ['Objet'], details: [['Description',''],['Pouvoirs',''],['Limites',''],['Provenance','']] },
  { kind: 'Projet', title: 'Événement', sub: 'Événement de la chronologie', tags: ['Événement'], details: [['Contexte',''],['Déroulement',''],['Conséquences','']] },
];
function TemplatePicker({ close, choose }: { close: () => void; choose: (template: typeof sheetTemplates[number]) => void }) {
  return <div className="overlay template-overlay"><section className="template-picker"><button className="close" onClick={close}><X /></button><small>UNE PAGE ADAPTÉE À TON IDÉE</small><h2>Que veux-tu inscrire&nbsp;?</h2><p>Le modèle prépare les catégories utiles. Tout reste modifiable ensuite.</p><div>{sheetTemplates.map((template) => { const Icon = icons[template.kind]; return <button onClick={() => choose(template)} key={template.title}><i><Icon /></i><span><b>{template.title}</b><small>{template.sub}</small></span><ChevronRight /></button>; })}</div></section></div>;
}
function LegacyCourseView({ user, courses, entries, update, add, remove, refreshShared }: { user: User; courses: Note[]; entries: WikiSubmission[]; update: (course: Note) => void; add: (course: Note) => void; remove: (course: Note) => void; refreshShared: () => Promise<void> }) {
  const [tab, setTab] = useState<'mine' | 'shared'>('mine');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sharedOpen, setSharedOpen] = useState<WikiSubmission | null>(null);
  const [creating, setCreating] = useState(false);
  const [courseTitle, setCourseTitle] = useState('');
  const [teacher, setTeacher] = useState('');
  const [room, setRoom] = useState('');
  const [year, setYear] = useState<SchoolYear>('Première année');
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().slice(0, 10));
  const [sessionContent, setSessionContent] = useState('');
  const [sharing, setSharing] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const selected = courses.find((course) => course.id === selectedId) || null;
  const shared = entries.filter((entry) => entry.status === 'approved' && entry.section.startsWith('Cours ·'));
  const proposals = entries.filter((entry) => entry.created_by === user.id && entry.section.startsWith('Cours ·'));
  const createCourse = () => {
    if (courseTitle.trim().length < 2) return;
    const course: Note = { id: crypto.randomUUID(), kind: 'Cours', title: courseTitle.trim(), sub: [year, room.trim()].filter(Boolean).join(' · '), text: 'Fil personnel de notes de cours.', tags: [year], status: 'En cours', schoolYear: year, courseTeacher: teacher.trim(), courseRoom: room.trim(), courseSessions: [] };
    add(course); setSelectedId(course.id); setCreating(false); setCourseTitle(''); setTeacher(''); setRoom('');
  };
  const addSession = () => {
    if (!selected || sessionTitle.trim().length < 2 || richPlainText(sessionContent).trim().length < 3) return;
    update({ ...selected, courseSessions: [...(selected.courseSessions || []), { id: crypto.randomUUID(), title: sessionTitle.trim(), date: sessionDate, content: sessionContent }] });
    setSessionTitle(''); setSessionContent(''); setSessionDate(new Date().toISOString().slice(0, 10)); setMessage('La séance a été ajoutée au fil.');
  };
  const shareSession = async (course: Note, session: NonNullable<Note['courseSessions']>[number]) => {
    setSharing(session.id); setMessage('Envoi à la modération…');
    try {
      await submitWikiProposal(user, { category: 'Lore', section: `Cours · ${course.title}`, title: session.title, subtitle: [course.schoolYear, course.courseTeacher].filter(Boolean).join(' · '), content: richPlainText(session.content), source: [`Séance du ${session.date ? new Intl.DateTimeFormat('fr-FR').format(new Date(`${session.date}T12:00:00`)) : 'date inconnue'}`, course.courseRoom].filter(Boolean).join(' · ') });
      await refreshShared(); setMessage('Le cours a été envoyé. Il apparaîtra dans la bibliothèque après validation.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Impossible de partager ce cours.'); }
    finally { setSharing(null); }
  };
  return <section className="courses-page">
    <header className="courses-hero"><div><small>CARNET SCOLAIRE PERSONNEL</small><h1>Cours</h1><p>Un fil privé par matière, une entrée pour chaque séance.</p></div><button onClick={() => { setCreating(true); setSelectedId(null); setTab('mine'); }}><Plus /> Nouveau cours</button></header>
    <nav className="course-tabs"><button className={tab === 'mine' ? 'active' : ''} onClick={() => { setTab('mine'); setSharedOpen(null); }}><GraduationCap /> Mes cours <span>{courses.length}</span></button><button className={tab === 'shared' ? 'active' : ''} onClick={() => { setTab('shared'); setSelectedId(null); }}><BookOpen /> Cours partagés <span>{shared.length}</span></button></nav>
    {message && <p className="course-message"><Sparkles /> {message}<button onClick={() => setMessage('')} aria-label="Fermer"><X /></button></p>}
    {creating && <section className="course-create"><div><small>NOUVEAU FIL</small><h2>Créer une matière</h2></div><label>Nom du cours<input value={courseTitle} onChange={(event) => setCourseTitle(event.target.value)} placeholder="Ex. Potions" autoFocus /></label><div><label>Enseignant ou enseignante<input value={teacher} onChange={(event) => setTeacher(event.target.value)} placeholder="Facultatif" /></label><label>Salle<input value={room} onChange={(event) => setRoom(event.target.value)} placeholder="Facultatif" /></label><label>Année<select value={year} onChange={(event) => setYear(event.target.value as SchoolYear)}>{schoolYears.slice(0, 7).map((item) => <option key={item}>{item}</option>)}</select></label></div><footer><button onClick={() => setCreating(false)}>Annuler</button><button className="primary" disabled={courseTitle.trim().length < 2} onClick={createCourse}><Plus /> Créer le fil</button></footer></section>}
    {tab === 'mine' && !selected && !creating && <div className="course-thread-list">{courses.map((course) => <article key={course.id} onClick={() => setSelectedId(course.id)}><i><GraduationCap /></i><div><small>{course.schoolYear || 'Année non renseignée'}</small><h2>{course.title}</h2><p>{[course.courseTeacher, course.courseRoom].filter(Boolean).join(' · ') || 'Informations à compléter'}</p></div><span><b>{course.courseSessions?.length || 0}</b> séance{(course.courseSessions?.length || 0) !== 1 && 's'}</span><ChevronRight /></article>)}</div>}
    {tab === 'mine' && !selected && !creating && !courses.length && <div className="course-empty"><GraduationCap /><h2>Ton premier cahier attend</h2><p>Crée une matière pour commencer à noter tes séances.</p><button onClick={() => setCreating(true)}><Plus /> Créer un cours</button></div>}
    {selected && <section className="course-thread"><header><button onClick={() => setSelectedId(null)}>← Tous mes cours</button><div><small>{selected.schoolYear}</small><h2>{selected.title}</h2><p>{[selected.courseTeacher, selected.courseRoom].filter(Boolean).join(' · ')}</p></div><button className="course-delete" onClick={() => { if (confirm(`Supprimer le cours « ${selected.title} » et toutes ses séances ?`)) { remove(selected); setSelectedId(null); } }}><Trash2 /> Supprimer</button></header><details className="course-settings"><summary><Pencil /> Modifier les informations du cours</summary><div><label>Nom<input value={selected.title} onChange={(event) => update({ ...selected, title: event.target.value })} /></label><label>Enseignant ou enseignante<input value={selected.courseTeacher || ''} onChange={(event) => update({ ...selected, courseTeacher: event.target.value })} /></label><label>Salle<input value={selected.courseRoom || ''} onChange={(event) => update({ ...selected, courseRoom: event.target.value })} /></label><label>Année<select value={selected.schoolYear || 'Première année'} onChange={(event) => update({ ...selected, schoolYear: event.target.value as SchoolYear })}>{schoolYears.slice(0, 7).map((item) => <option key={item}>{item}</option>)}</select></label></div></details><div className="course-posts">{[...(selected.courseSessions || [])].reverse().map((session, index) => { const proposal = proposals.find((entry) => entry.title === session.title && entry.section === `Cours · ${selected.title}`); return <article key={session.id}><aside><span>{(selected.courseSessions?.length || 0) - index}</span><i /></aside><div><header><div><small>{session.date ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date(`${session.date}T12:00:00`)) : 'Sans date'}</small><h3>{session.title}</h3></div>{proposal && <em className={`course-share-status ${proposal.status}`}>{proposal.status === 'pending' ? 'En validation' : proposal.status === 'approved' ? 'Publié' : 'Refusé'}</em>}</header><div className="rich-output" dangerouslySetInnerHTML={{ __html: safeRichHtml(session.content) }} /><footer><button disabled={sharing === session.id || proposal?.status === 'pending'} onClick={() => shareSession(selected, session)}><Share2 /> {proposal?.status === 'approved' ? 'Partager une nouvelle version' : proposal?.status === 'pending' ? 'En attente de validation' : 'Partager ce cours'}</button><button onClick={() => { if (confirm('Supprimer cette séance ?')) update({ ...selected, courseSessions: selected.courseSessions?.filter((item) => item.id !== session.id) }); }}><Trash2 /> Supprimer</button></footer></div></article>; })}{!selected.courseSessions?.length && <p className="course-no-post">Aucune séance dans ce fil pour le moment.</p>}</div><section className="course-compose"><small>NOUVELLE SÉANCE</small><h3>Ajouter une note au fil</h3><div><label>Titre<input value={sessionTitle} onChange={(event) => setSessionTitle(event.target.value)} placeholder="Sujet de la séance" /></label><label>Date<input type="date" value={sessionDate} onChange={(event) => setSessionDate(event.target.value)} /></label></div><CorrectableRichEditor value={sessionContent} onChange={setSessionContent} placeholder="Écris tes notes de cours…" /><button disabled={sessionTitle.trim().length < 2 || richPlainText(sessionContent).trim().length < 3} onClick={addSession}><Plus /> Ajouter au fil</button></section></section>}
    {tab === 'shared' && !sharedOpen && <div className="shared-course-library">{shared.map((entry) => <article key={entry.id} onClick={() => setSharedOpen(entry)}><i><BookOpen /></i><small>{entry.section.replace('Cours · ', '')}</small><h2>{entry.title}</h2>{entry.subtitle && <p>{entry.subtitle}</p>}<span>Lire le cours <ChevronRight /></span></article>)}</div>}
    {tab === 'shared' && !sharedOpen && !shared.length && <div className="course-empty"><BookOpen /><h2>La bibliothèque attend ses premiers cours</h2><p>Les séances validées par la modération apparaîtront ici.</p></div>}
    {sharedOpen && <article className="shared-course-reader"><button onClick={() => setSharedOpen(null)}>← Bibliothèque des cours</button><small>{sharedOpen.section.replace('Cours · ', '')}</small><h2>{sharedOpen.title}</h2>{sharedOpen.subtitle && <h3>{sharedOpen.subtitle}</h3>}<div className="rich-output">{sharedOpen.content}</div>{sharedOpen.source && <footer>{sharedOpen.source}</footer>}</article>}
  </section>;
}
function CourseNotebookView({ user, courses, entries, update, add, remove, refreshShared }: { user: User; courses: Note[]; entries: WikiSubmission[]; update: (course: Note) => void; add: (course: Note) => void; remove: (course: Note) => void; refreshShared: () => Promise<void> }) {
  type Session = NonNullable<Note['courseSessions']>[number];
  type Schedule = NonNullable<Note['courseSchedule']>[number];
  const [tab, setTab] = useState<'mine' | 'agenda' | 'shared'>('mine');
  const [activeCategory, setActiveCategory] = useState<CourseCategory | 'Tous'>('Tous');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [editingCourse, setEditingCourse] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftDate, setDraftDate] = useState(new Date().toISOString().slice(0, 10));
  const [draftContent, setDraftContent] = useState('');
  const [actionsOpen, setActionsOpen] = useState<string | null>(null);
  const [sharedOpen, setSharedOpen] = useState<WikiSubmission | null>(null);
  const [message, setMessage] = useState('');
  const [sharing, setSharing] = useState<string | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleCourseId, setScheduleCourseId] = useState('');
  const [scheduleDraft, setScheduleDraft] = useState<Schedule>({ id: '', weekday: 1, start: '18:00', end: '19:00' });
  const [newCourse, setNewCourse] = useState({ title: '', teacher: '', room: '', year: 'Première année' as SchoolYear, category: 'Flux et magie' as CourseCategory });
  const selected = courses.find((course) => course.id === selectedId) || null;
  const visibleCourses = activeCategory === 'Tous' ? courses : courses.filter((course) => (course.courseCategory || 'Autres') === activeCategory);
  const shared = entries.filter((entry) => entry.status === 'approved' && entry.section.startsWith('Cours ·'));
  const proposals = entries.filter((entry) => entry.created_by === user.id && entry.section.startsWith('Cours ·'));
  const weekStart = useMemo(() => {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() - ((date.getDay() + 6) % 7) + weekOffset * 7);
    return date;
  }, [weekOffset]);
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);
    return date;
  }), [weekStart]);
  const localDateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  useEffect(() => {
    if (tab !== 'mine') return;
    if (!selectedId || !visibleCourses.some((course) => course.id === selectedId)) setSelectedId(visibleCourses[0]?.id || null);
  }, [activeCategory, courses, selectedId, tab]);
  const openComposer = (session?: Session) => {
    setDraftId(session?.id || null);
    setDraftTitle(session?.title || '');
    setDraftDate(session?.date || new Date().toISOString().slice(0, 10));
    setDraftContent(session?.content || '');
    setActionsOpen(null);
    setComposerOpen(true);
  };
  const openScheduledSession = (course: Note, date: Date) => {
    const dateKey = localDateKey(date);
    const existing = (course.courseSessions || []).find((session) => session.date === dateKey);
    setSelectedId(course.id);
    setTab('mine');
    setDraftId(existing?.id || null);
    setDraftTitle(existing?.title || `Cours du ${new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long' }).format(date)}`);
    setDraftDate(dateKey);
    setDraftContent(existing?.content || '');
    setActionsOpen(null);
    setComposerOpen(true);
  };
  const editSchedule = (course?: Note, schedule?: Schedule) => {
    const target = course || courses[0];
    if (!target) { setMessage('Crée d’abord une matière pour ajouter un créneau.'); return; }
    setScheduleCourseId(target.id);
    setScheduleDraft(schedule ? { ...schedule } : { id: '', weekday: Math.max(1, new Date().getDay() || 7), start: '18:00', end: '19:00' });
    setScheduleOpen(true);
  };
  const saveSchedule = () => {
    const course = courses.find((item) => item.id === scheduleCourseId);
    if (!course || !scheduleDraft.start || !scheduleDraft.end) return;
    const schedule = { ...scheduleDraft, id: scheduleDraft.id || crypto.randomUUID() };
    const current = course.courseSchedule || [];
    update({ ...course, courseSchedule: scheduleDraft.id ? current.map((item) => item.id === scheduleDraft.id ? schedule : item) : [...current, schedule] });
    setScheduleOpen(false);
    setMessage(scheduleDraft.id ? 'Le créneau a été modifié.' : 'Le créneau a été ajouté à l’agenda.');
  };
  const deleteSchedule = () => {
    const course = courses.find((item) => item.id === scheduleCourseId);
    if (!course || !scheduleDraft.id) return;
    update({ ...course, courseSchedule: (course.courseSchedule || []).filter((item) => item.id !== scheduleDraft.id) });
    setScheduleOpen(false);
    setMessage('Le créneau a été supprimé.');
  };
  const saveSession = () => {
    if (!selected || draftTitle.trim().length < 2 || richPlainText(draftContent).trim().length < 3) return;
    const session: Session = { id: draftId || crypto.randomUUID(), title: draftTitle.trim(), date: draftDate, content: draftContent };
    const current = selected.courseSessions || [];
    update({ ...selected, courseSessions: draftId ? current.map((item) => item.id === draftId ? session : item) : [...current, session] });
    setComposerOpen(false);
    setMessage(draftId ? 'La séance a été modifiée.' : 'La séance a été ajoutée.');
  };
  const createCourse = () => {
    if (newCourse.title.trim().length < 2) return;
    const course: Note = { id: crypto.randomUUID(), kind: 'Cours', title: newCourse.title.trim(), sub: [newCourse.year, newCourse.room.trim()].filter(Boolean).join(' · '), text: 'Cahier personnel de cours.', tags: [newCourse.year, newCourse.category], status: 'En cours', schoolYear: newCourse.year, courseTeacher: newCourse.teacher.trim(), courseRoom: newCourse.room.trim(), courseCategory: newCourse.category, courseSessions: [] };
    add(course);
    setSelectedId(course.id);
    setActiveCategory(newCourse.category);
    setNewCourse({ title: '', teacher: '', room: '', year: 'Première année', category: 'Flux et magie' });
    setCreating(false);
  };
  const shareSession = async (course: Note, session: Session) => {
    if (richPlainText(session.content).trim().length < 20) { setMessage('Cette séance est trop courte pour être proposée au partage.'); return; }
    setSharing(session.id);
    setActionsOpen(null);
    try {
      await submitWikiProposal(user, { category: 'Lore', section: `Cours · ${course.title}`, title: session.title, subtitle: [course.schoolYear, course.courseTeacher].filter(Boolean).join(' · '), content: richPlainText(session.content), source: [`Séance du ${session.date ? new Intl.DateTimeFormat('fr-FR').format(new Date(`${session.date}T12:00:00`)) : 'date inconnue'}`, course.courseRoom].filter(Boolean).join(' · ') });
      await refreshShared();
      setMessage('La séance a été envoyée à la modération.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Impossible de partager cette séance.'); }
    finally { setSharing(null); }
  };
  return <section className="course-notebook-page">
    <header className="notebook-heading"><div><small>CARNET SCOLAIRE PERSONNEL</small><h1>Mes cours</h1><p>Choisis une matière et écris directement dans son fil.</p></div><nav><button className={tab === 'mine' ? 'active' : ''} onClick={() => { setTab('mine'); setSharedOpen(null); }}><GraduationCap /> Mes matières</button><button className={tab === 'agenda' ? 'active' : ''} onClick={() => { setTab('agenda'); setSharedOpen(null); }}><CalendarDays /> Agenda</button><button className={tab === 'shared' ? 'active' : ''} onClick={() => setTab('shared')}><BookOpen /> Bibliothèque <span>{shared.length}</span></button></nav></header>
    {message && <div className="notebook-toast"><Sparkles />{message}<button onClick={() => setMessage('')}><X /></button></div>}
    {tab === 'mine' && <div className="notebook-layout">
      <aside className="subject-rail"><header><b>Matières</b><button onClick={() => setCreating(true)}><Plus /><span>Nouveau cours</span></button></header><nav className="course-category-tabs"><button className={activeCategory === 'Tous' ? 'active' : ''} onClick={() => setActiveCategory('Tous')}><span>Tous les cours</span><em>{courses.length}</em></button>{courseCategories.map((category) => <button className={activeCategory === category ? 'active' : ''} onClick={() => setActiveCategory(category)} key={category}><span>{category}</span><em>{courses.filter((course) => (course.courseCategory || 'Autres') === category).length}</em></button>)}</nav><div className="subject-course-list"><small>{activeCategory === 'Tous' ? 'MATIÈRES' : activeCategory.toUpperCase()}</small>{visibleCourses.map((course) => <button className={selectedId === course.id ? 'active' : ''} onClick={() => { setSelectedId(course.id); setEditingCourse(false); }} key={course.id}><i><GraduationCap /></i><span><b>{course.title}</b><small>{course.courseSessions?.length || 0} séance{(course.courseSessions?.length || 0) !== 1 && 's'}</small></span></button>)}{!visibleCourses.length && <p>Aucun cours dans cette catégorie.</p>}</div></aside>
      <main className="notebook-thread">{selected ? <>
        <header className="thread-heading"><div><small>{selected.schoolYear || 'Année non renseignée'}</small><h2>{selected.title}</h2><p>{[selected.courseTeacher, selected.courseRoom].filter(Boolean).join(' · ') || 'Ajoute les informations du cours'}</p></div><div className="thread-actions"><button className="quick-session-top" onClick={() => openComposer()}><Plus /> Ajouter une séance</button><button className="thread-settings" onClick={() => setEditingCourse((value) => !value)} aria-label="Paramètres du cours" title="Paramètres du cours"><Settings /></button></div></header>
        {editingCourse && <section className="notebook-settings"><label>Nom<input value={selected.title} onChange={(event) => update({ ...selected, title: event.target.value })} /></label><label>Type de cours<select value={selected.courseCategory || 'Autres'} onChange={(event) => update({ ...selected, courseCategory: event.target.value as CourseCategory })}>{courseCategories.map((category) => <option key={category}>{category}</option>)}</select></label><label>Enseignant ou enseignante<input value={selected.courseTeacher || ''} onChange={(event) => update({ ...selected, courseTeacher: event.target.value })} /></label><label>Salle<input value={selected.courseRoom || ''} onChange={(event) => update({ ...selected, courseRoom: event.target.value })} /></label><label>Année<select value={selected.schoolYear || 'Première année'} onChange={(event) => update({ ...selected, schoolYear: event.target.value as SchoolYear })}>{schoolYears.slice(0, 7).map((item) => <option key={item}>{item}</option>)}</select></label><button className="notebook-delete-course" onClick={() => { if (confirm(`Supprimer le cours « ${selected.title} » et toutes ses séances ?`)) remove(selected); }}><Trash2 /> Supprimer ce cours</button></section>}
        <div className="notebook-posts">{[...(selected.courseSessions || [])].reverse().map((session) => { const proposal = proposals.find((entry) => entry.title === session.title && entry.section === `Cours · ${selected.title}`); return <article key={session.id}><div className="post-date"><b>{session.date ? new Intl.DateTimeFormat('fr-FR', { day: '2-digit' }).format(new Date(`${session.date}T12:00:00`)) : '•'}</b><small>{session.date ? new Intl.DateTimeFormat('fr-FR', { month: 'short' }).format(new Date(`${session.date}T12:00:00`)) : ''}</small></div><div className="post-paper"><header><div><h3>{session.title}</h3><small>{session.date ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date(`${session.date}T12:00:00`)) : 'Sans date'}{proposal ? ` · ${proposal.status === 'pending' ? 'En validation' : proposal.status === 'approved' ? 'Publié' : 'Refusé'}` : ''}</small></div><button onClick={() => setActionsOpen(actionsOpen === session.id ? null : session.id)} aria-label="Actions"><MoreHorizontal /></button>{actionsOpen === session.id && <div className="post-menu"><button onClick={() => openComposer(session)}><Pencil /> Modifier</button><button disabled={sharing === session.id || proposal?.status === 'pending'} onClick={() => shareSession(selected, session)}><Share2 /> {proposal?.status === 'pending' ? 'En validation' : 'Partager'}</button><button onClick={() => { if (confirm('Supprimer cette séance ?')) update({ ...selected, courseSessions: selected.courseSessions?.filter((item) => item.id !== session.id) }); setActionsOpen(null); }}><Trash2 /> Supprimer</button></div>}</header><div className="rich-output" dangerouslySetInnerHTML={{ __html: safeRichHtml(session.content) }} /></div></article>; })}{!selected.courseSessions?.length && <div className="thread-empty"><BookOpen /><h3>Ce cahier est encore vide</h3><p>Ajoute la première séance de ce cours.</p></div>}</div>
      </> : <div className="thread-empty"><GraduationCap /><h3>Crée ta première matière</h3><p>Elle apparaîtra ici comme un nouveau cahier.</p><button onClick={() => setCreating(true)}><Plus /> Nouveau cours</button></div>}</main>
    </div>}
    {tab === 'agenda' && <section className="course-agenda">
      <header className="agenda-toolbar"><div><small>SEMAINE DU {new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long' }).format(weekStart).toUpperCase()}</small><h2>Agenda des cours</h2><p>Prépare tes cours et ouvre une séance directement au bon endroit.</p></div><div><button onClick={() => setWeekOffset((value) => value - 1)} aria-label="Semaine précédente"><ChevronLeft /></button><button className="agenda-today" onClick={() => setWeekOffset(0)}>Aujourd’hui</button><button onClick={() => setWeekOffset((value) => value + 1)} aria-label="Semaine suivante"><ChevronRight /></button><button className="agenda-add" onClick={() => editSchedule()}><Plus /> Ajouter un créneau</button></div></header>
      <div className="agenda-week">{weekDays.map((date, dayIndex) => { const events = courses.flatMap((course) => (course.courseSchedule || []).filter((schedule) => schedule.weekday === dayIndex + 1).map((schedule) => ({ course, schedule }))).sort((a, b) => a.schedule.start.localeCompare(b.schedule.start)); const today = localDateKey(date) === localDateKey(new Date()); return <article className={today ? 'today' : ''} key={localDateKey(date)}><header><small>{new Intl.DateTimeFormat('fr-FR', { weekday: 'short' }).format(date).replace('.', '')}</small><b>{date.getDate()}</b></header><div>{events.map(({ course, schedule }) => <section className="agenda-event" key={`${course.id}-${schedule.id}`}><button className="agenda-event-main" onClick={() => openScheduledSession(course, date)}><span><Clock3 /> {schedule.start} à {schedule.end}</span><b>{course.title}</b><small>{[course.courseRoom, course.courseTeacher].filter(Boolean).join(' · ') || 'Informations à compléter'}</small><em>Ouvrir la séance <ChevronRight /></em></button><button className="agenda-event-edit" onClick={() => editSchedule(course, schedule)} aria-label={`Modifier le créneau ${course.title}`}><Pencil /></button></section>)}{!events.length && <span className="agenda-free">Libre</span>}</div></article>; })}</div>
      {!courses.some((course) => course.courseSchedule?.length) && <div className="agenda-empty"><CalendarDays /><b>Ton emploi du temps est encore vide</b><p>Ajoute un créneau récurrent à l’une de tes matières.</p><button onClick={() => editSchedule()}><Plus /> Ajouter le premier créneau</button></div>}
    </section>}
    {tab === 'shared' && !sharedOpen && <div className="notebook-library">{shared.map((entry) => <button onClick={() => setSharedOpen(entry)} key={entry.id}><i><BookOpen /></i><span><small>{entry.section.replace('Cours · ', '')}</small><b>{entry.title}</b><p>{entry.subtitle}</p></span><ChevronRight /></button>)}{!shared.length && <div className="thread-empty"><BookOpen /><h3>Aucun cours partagé</h3><p>Les séances acceptées par la modération apparaîtront ici.</p></div>}</div>}
    {tab === 'shared' && sharedOpen && <article className="notebook-shared-reader"><button onClick={() => setSharedOpen(null)}>← Retour à la bibliothèque</button><small>{sharedOpen.section.replace('Cours · ', '')}</small><h2>{sharedOpen.title}</h2>{sharedOpen.subtitle && <h3>{sharedOpen.subtitle}</h3>}<div>{sharedOpen.content}</div>{sharedOpen.source && <footer>{sharedOpen.source}</footer>}</article>}
    {creating && createPortal(<div className="overlay notebook-modal" onMouseDown={(event) => event.target === event.currentTarget && setCreating(false)}><section><button className="close" onClick={() => setCreating(false)}><X /></button><small>NOUVEAU CAHIER</small><h2>Créer une matière</h2><label>Nom du cours<input value={newCourse.title} onChange={(event) => setNewCourse({ ...newCourse, title: event.target.value })} autoFocus placeholder="Ex. Potions" /></label><label>Type de cours<select value={newCourse.category} onChange={(event) => setNewCourse({ ...newCourse, category: event.target.value as CourseCategory })}>{courseCategories.map((category) => <option key={category}>{category}</option>)}</select></label><div><label>Enseignant ou enseignante<input value={newCourse.teacher} onChange={(event) => setNewCourse({ ...newCourse, teacher: event.target.value })} /></label><label>Salle<input value={newCourse.room} onChange={(event) => setNewCourse({ ...newCourse, room: event.target.value })} /></label></div><label>Année<select value={newCourse.year} onChange={(event) => setNewCourse({ ...newCourse, year: event.target.value as SchoolYear })}>{schoolYears.slice(0, 7).map((item) => <option key={item}>{item}</option>)}</select></label><footer><button onClick={() => setCreating(false)}>Annuler</button><button disabled={newCourse.title.trim().length < 2} onClick={createCourse}><Plus /> Créer le cahier</button></footer></section></div>, document.body)}
    {composerOpen && selected && createPortal(<div className="overlay notebook-modal session-modal" onMouseDown={(event) => event.target === event.currentTarget && setComposerOpen(false)}><section><button className="close" onClick={() => setComposerOpen(false)}><X /></button><small>{selected.title}</small><h2>{draftId ? 'Modifier la séance' : 'Nouvelle séance'}</h2><div><label>Titre<input value={draftTitle} onChange={(event) => setDraftTitle(event.target.value)} autoFocus placeholder="Sujet du cours" /></label><label>Date<input type="date" value={draftDate} onChange={(event) => setDraftDate(event.target.value)} /></label></div><CorrectableRichEditor value={draftContent} onChange={setDraftContent} placeholder="Écris tes notes de cours…" /><footer><button onClick={() => setComposerOpen(false)}>Annuler</button><button disabled={draftTitle.trim().length < 2 || richPlainText(draftContent).trim().length < 3} onClick={saveSession}>{draftId ? 'Enregistrer' : 'Ajouter au fil'}</button></footer></section></div>, document.body)}
    {scheduleOpen && createPortal(<div className="overlay notebook-modal schedule-modal" onMouseDown={(event) => event.target === event.currentTarget && setScheduleOpen(false)}><section><button className="close" onClick={() => setScheduleOpen(false)}><X /></button><small>AGENDA DES COURS</small><h2>{scheduleDraft.id ? 'Modifier le créneau' : 'Nouveau créneau'}</h2><label>Matière<select value={scheduleCourseId} disabled={!!scheduleDraft.id} onChange={(event) => setScheduleCourseId(event.target.value)}>{courses.map((course) => <option value={course.id} key={course.id}>{course.title}</option>)}</select></label><label>Jour<select value={scheduleDraft.weekday} onChange={(event) => setScheduleDraft({ ...scheduleDraft, weekday: Number(event.target.value) })}>{['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'].map((day, index) => <option value={index + 1} key={day}>{day}</option>)}</select></label><div><label>Début<input type="time" value={scheduleDraft.start} onChange={(event) => setScheduleDraft({ ...scheduleDraft, start: event.target.value })} /></label><label>Fin<input type="time" value={scheduleDraft.end} onChange={(event) => setScheduleDraft({ ...scheduleDraft, end: event.target.value })} /></label></div><footer>{scheduleDraft.id && <button className="schedule-delete" onClick={deleteSchedule}><Trash2 /> Supprimer</button>}<button onClick={() => setScheduleOpen(false)}>Annuler</button><button disabled={!scheduleDraft.start || !scheduleDraft.end || scheduleDraft.end <= scheduleDraft.start} onClick={saveSchedule}>{scheduleDraft.id ? 'Enregistrer' : 'Ajouter à l’agenda'}</button></footer></section></div>, document.body)}
  </section>;
}
function TimelineView({ notes, open, edit }: { notes: Note[]; open: (note: Note) => void; edit: (note: Note) => void }) {
  const dated = [...notes].filter((note) => note.eventDate).sort((a,b) => String(b.eventDate).localeCompare(String(a.eventDate)));
  return <section className="timeline-page"><header><small>FIL DE TON HISTOIRE</small><h1>Chronologie personnelle</h1><p>Ajoute une date à n’importe quelle fiche pour la faire apparaître ici.</p></header>{!dated.length && <div className="timeline-empty"><CalendarDays /><h2>Ta chronologie attend son premier événement</h2><p>Ouvre une fiche et renseigne « Date dans la chronologie ».</p></div>}<div className="timeline-line">{dated.map((note) => <button onClick={() => open(note)} key={note.id}><time>{new Intl.DateTimeFormat('fr-FR',{dateStyle:'long'}).format(new Date(`${note.eventDate}T12:00:00`))}</time><i /><span><small>{note.kind}</small><b>{note.title}</b><p>{note.sub}</p></span></button>)}</div></section>;
}
function RelationsView({ notes, open }: { notes: Note[]; open: (note: Note) => void }) {
  const people = notes.filter((note) => note.kind === 'Personnage'); const main = people.find((note) => note.id === 'joueur') || people[0];
  return <section className="relations-page"><header><small>CONSTELLATION SOCIALE</small><h1>Carte des relations</h1><p>Les personnages sont regroupés selon la relation indiquée dans leur fiche.</p></header>{main && <button className="relation-center" onClick={() => open(main)}>{main.image ? <img src={main.image} alt="" /> : <Users />}<b>{main.title}</b><small>Ton personnage</small></button>}<div className="relation-orbits">{people.filter((note) => note.id !== main?.id).map((note) => <button className={`relation-${(note.relation || 'Inconnue').toLowerCase()}`} onClick={() => open(note)} key={note.id}>{note.image ? <img src={note.image} alt="" /> : <Users />}<span><b>{note.title}</b><small>{note.relation || 'Inconnue'}</small></span></button>)}</div></section>;
}
function LinkedReferences({ note, notes, open }: { note: Note; notes: Note[]; open: (note: Note) => void }) {
  const content = `${richPlainText(note.text)} ${(note.details || []).map((detail) => richPlainText(detail[1])).join(' ')}`.toLowerCase();
  const linked = notes.filter((candidate) => candidate.id !== note.id && content.includes(`@${candidate.title.toLowerCase()}`));
  if (!linked.length) return null;
  return <section className="linked-references"><h3>Fiches liées</h3><p>Références détectées avec @nom de la fiche.</p><div>{linked.map((candidate) => <button onClick={() => open(candidate)} key={candidate.id}>@{candidate.title}<ChevronRight /></button>)}</div></section>;
}
function AdminSheetPreview({ note, notes, back, open }: { note: Note; notes: Note[]; back: () => void; open: (note: Note) => void }) {
  const Icon = icons[note.kind];
  return <div className="overlay fiche-overlay admin-fiche-preview" onMouseDown={(event) => event.target === event.currentTarget && back()}>
    <article className={`sheet ${note.image ? 'with-image' : ''}`} role="dialog" aria-modal="true" aria-label={`Aperçu de ${note.title}`}>
      <button className="close" onClick={back} aria-label="Retour au grimoire"><X /></button>
      <div className="admin-preview-label"><Eye /> Aperçu joueur</div>
      <div className="cover">{note.image ? <><span className="image-backdrop" style={{ backgroundImage: `url(${note.image})` }} /><img src={note.image} alt={note.title} /></> : <><span>✦　·　✧　·　✦</span><Icon /></>}</div>
      <div className="body">
        <small>{note.kind}</small><h2>{note.title}</h2>{note.sub && <h4>{note.sub}</h4>}
        <div className="facts">
          <span><b>{note.kind === 'Connaissance' ? 'État de la fiche' : 'Statut'}</b>{note.status || 'À découvrir'}</span>
          {note.kind === 'Personnage' && <span><b>Relation</b>{note.relation || 'Inconnue'}</span>}
          {note.kind === 'Personnage' && <span className={`house-fact ${note.house?.toLowerCase() || 'none'}`}><b>Maison</b>{note.house || 'Sans maison'}</span>}
          {note.kind === 'Personnage' && <span><b>Année</b>{note.schoolYear || 'Non renseignée'}</span>}
          {note.kind === 'Personnage' && note.age && <span><b>Âge</b>{note.age} ans</span>}
          {note.kind === 'Connaissance' && note.knowledge && <span><b>Connaissance</b>{note.knowledge}</span>}
          {note.kind === 'Sort' && <><span><b>Domaine</b>{note.spellDomain || 'Non classé'}</span><span><b>Maîtrise</b>{note.mastery || 'À étudier'}</span></>}
        </div>
        <Tags tags={note.tags} />
        <div className="intro rich-output" dangerouslySetInnerHTML={{ __html: safeRichHtml(note.text) }} />
        {note.kind === 'Sort' && note.incantation && <section className="spell-incantation"><small>INCANTATION</small><p>{note.incantation}</p></section>}
        {(note.kind === 'Connaissance' || note.kind === 'Sort') && note.source && <section className="knowledge-source"><h3>{note.kind === 'Sort' ? 'Source d’apprentissage' : 'Comment je le sais'}</h3><p>{note.source}</p></section>}
        {note.kind === 'Projet' && !!note.tasks?.length && <section className="project-checklist"><div><h3>Étapes du projet</h3><span>{note.tasks.filter((task) => task.done).length}/{note.tasks.length}</span></div>{note.tasks.map((task) => <label key={task.id}><input type="checkbox" checked={task.done} readOnly /><span>{task.text}</span></label>)}</section>}
        {note.kind === 'Projet' && note.nextAction && <section className="next-action"><small>PROCHAINE ACTION</small><p>{note.nextAction}</p></section>}
        {note.details?.filter((detail) => richPlainText(detail[1]).trim()).map((detail) => <section key={detail[0]}><h3>{detail[0]}</h3><div className="rich-output" dangerouslySetInnerHTML={{ __html: safeRichHtml(detail[1]) }} /></section>)}
        <LinkedReferences note={note} notes={notes} open={open} />
      </div>
    </article>
  </div>;
}
function AdminPanel({ close, openModeration }: { close: () => void; openModeration: () => void }) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [userNotes, setUserNotes] = useState<Note[]>([]);
  const [preview, setPreview] = useState<Note | null>(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const refreshUsers = async () => {
    setBusy(true); setError('');
    try { setUsers(await loadAdminUsers()); }
    catch (reason) { setError(reason instanceof Error ? reason.message : String(reason)); }
    finally { setBusy(false); }
  };
  useEffect(() => { refreshUsers(); }, []);
  const inspect = async (user: AdminUser) => {
    setSelected(user); setPreview(null); setBusy(true); setError('');
    try { setUserNotes((await loadAdminNotes(user.user_id)) as Note[]); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Impossible d’ouvrir ce grimoire.'); }
    finally { setBusy(false); }
  };
  const visible = users.filter((user) => `${user.display_name} ${user.email}`.toLowerCase().includes(query.toLowerCase()));
  const formatDate = (value?: string | null) => value ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : 'Jamais';
  const formatBytes = (value: number) => value < 1024 * 1024 ? `${Math.round(value / 1024)} Ko` : `${(value / 1024 / 1024).toFixed(1)} Mo`;
  return <div className="overlay admin-overlay">
    <section className="admin-panel" role="dialog" aria-modal="true" aria-label="Administration des grimoires">
      <header><div><small>SCEAU DE L’ADMINISTRATEUR</small><h2>Administration</h2><p>Inspecte les grimoires en lecture seule sans te connecter à la place des joueurs.</p></div><button className="close" onClick={close}><X /></button></header>
      <div className="admin-summary"><span><Users /><b>{users.length}</b><small>comptes</small></span><span><BookOpen /><b>{users.reduce((sum, user) => sum + Number(user.note_count), 0)}</b><small>fiches privées</small></span><button onClick={openModeration}><ShieldAlert /><b>Modérer le wiki</b><small>Ouvrir les propositions</small></button></div>
      {error && <div className="admin-error"><ShieldAlert /><span><b>Supabase a refusé la requête</b>{error}<small>La migration semble présente : ce détail indique maintenant la cause exacte.</small><button onClick={refreshUsers}>Réessayer</button></span></div>}
      {!selected ? <>
        <label className="admin-search"><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher un joueur ou une adresse e-mail…" /></label>
        <div className="admin-users">{busy && <p>Ouverture du registre…</p>}{!busy && visible.map((user) => <button key={user.user_id} onClick={() => inspect(user)}><span className="admin-avatar">{(user.display_name || user.email || '?').slice(0, 1).toUpperCase()}</span><span><b>{user.display_name || 'Grimoire sans nom'}</b><small>{user.email}</small></span><span><b>{user.note_count}</b><small>fiches</small></span><span><b>{formatBytes(Number(user.storage_bytes))}</b><small>images</small></span><span><b>{formatDate(user.last_sign_in_at)}</b><small>dernière connexion</small></span><Eye /></button>)}</div>
      </> : <div className="admin-inspection">
        <header><button onClick={() => { setSelected(null); setUserNotes([]); }}>← Retour aux utilisateurs</button><div><small>MODE INSPECTION · LECTURE SEULE</small><h3>{selected.display_name || selected.email}</h3><p>{selected.email} · inscrit le {formatDate(selected.created_at)}</p></div></header>
        {busy ? <p>Déchiffrement du grimoire…</p> : <div className="admin-notes">{!userNotes.length && <p>Ce grimoire ne contient aucune fiche.</p>}{userNotes.map((note) => <article key={note.id}><button onClick={() => setPreview(note)}>{note.image && <img src={note.image} alt="" />}<span><small>{note.kind}</small><b>{note.title}</b><p>{richPlainText(note.text)}</p></span><Eye /></button></article>)}</div>}
      </div>}
    </section>
    {preview && <AdminSheetPreview note={preview} notes={userNotes} back={() => setPreview(null)} open={setPreview} />}
  </div>;
}
function PublicLanding({ connect, explore, school }: { connect: () => void; explore: () => void; school: () => void }) {
  return <section className="public-landing">
    <section className="public-hero">
      <img src={`${import.meta.env.BASE_URL}elderwood-archive.png`} alt="Elderwood dans la forêt, de nuit" />
      <div><small>LE GRIMOIRE DES RÉSONANTS</small><h1>Tout Elderwood.<br /><em>Une histoire rien qu’à toi.</em></h1><p>Explore les connaissances communes du serveur, puis construis ton propre grimoire privé au fil de tes rencontres et de tes aventures.</p><div><button onClick={connect}><WandSparkles /> Ouvrir mon grimoire</button><button onClick={explore}>Explorer le wiki <ChevronRight /></button></div></div>
      <span className="public-rune">✦</span>
    </section>
    <section className="public-pillars">
      <article className="pillar-wiki"><span><Compass /></span><small>UN SAVOIR PARTAGÉ</small><h2>Le wiki d’Elderwood</h2><p>Lore, règlement, maisons, créatures, chronologie et lieux officiels : les informations utiles sont accessibles à tous et réunies dans des archives faciles à rechercher.</p><ul><li>Contenu commun à tous les joueurs</li><li>Recherche dans toutes les archives</li><li>Propositions vérifiées par un administrateur</li></ul><button onClick={explore}>Parcourir les archives <ChevronRight /></button></article>
      <article className="pillar-private"><span><LockKeyhole /></span><small>TES ARCHIVES PERSONNELLES</small><h2>Ton grimoire privé</h2><p>Une fois connecté, conserve tout ce que ton personnage apprend sans le montrer aux autres : rencontres, projets, sorts, images, pistes et notes libres.</p><ul><li>Fiches et images privées</li><li>Tableau de notes magiques</li><li>Synchronisation sécurisée avec ton compte</li></ul><button onClick={connect}>Créer mon grimoire <ChevronRight /></button></article>
    </section>
    <section className="public-steps"><div><small>COMMENT ÇA MARCHE ?</small><h2>Entre dans les archives en quelques secondes</h2></div>{[['01','Explore','Consulte librement le lore et les règles.'],['02','Crée ton compte','Scelle un espace personnel et privé.'],['03','Écris ton histoire','Ajoute les gens, lieux, sorts et souvenirs rencontrés.']].map(([number,title,text]) => <article key={number}><b>{number}</b><span><h3>{title}</h3><p>{text}</p></span></article>)}</section>
    <section className="public-cta"><div><small>L’ÉCOLE T’ATTEND</small><h2>Commence par découvrir Elderwood</h2><p>Ses maisons, ses salles et les secrets connus de son île.</p></div><button onClick={school}><Castle /> Entrer dans l’école</button></section>
  </section>;
}
function WelcomeTour({
  step,
  name,
  setStep,
  saveName,
  close,
  createCharacter,
  startSearch,
}: {
  step: number;
  name: string;
  setStep: (step: number) => void;
  saveName: (name: string) => void;
  close: () => void;
  createCharacter: () => void;
  startSearch: () => void;
}) {
  const [draft, setDraft] = useState(name);
  return (
    <div className="overlay welcome-overlay">
      <section className="welcome-card" role="dialog" aria-modal="true">
        <button className="tour-skip" onClick={close}>Passer le guide</button>
        <div className="tour-progress" aria-label={`Étape ${step + 1} sur 3`}>
          {[0, 1, 2].map((item) => (
            <i className={item <= step ? 'active' : ''} key={item} />
          ))}
        </div>
        {step === 0 && (
          <div className="tour-page">
            <div className="tour-mark"><WandSparkles /><span>✦</span></div>
            <small>BIENVENUE À ELDERWOOD</small>
            <h2>À qui appartient ce grimoire&nbsp;?</h2>
            <p>
              Ton nom personnalise l’accueil. Pour l’instant, tout reste
              uniquement sur cet appareil.
            </p>
            <label htmlFor="welcome-name">Ton nom ou pseudonyme</label>
            <div className="tour-input">
              <Sparkles />
              <input
                id="welcome-name"
                autoFocus
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Ex. Corvin"
                maxLength={40}
              />
            </div>
            <button
              className="tour-primary"
              disabled={!draft.trim()}
              onClick={() => {
                saveName(draft.trim());
                setStep(1);
              }}
            >
              Continuer <ChevronRight />
            </button>
          </div>
        )}
        {step === 1 && (
          <div className="tour-page">
            <div className="tour-mark"><BookOpen /></div>
            <small>UN GRIMOIRE, DEUX ESPACES</small>
            <h2>Tu sais toujours où tu écris.</h2>
            <div className="tour-worlds">
              <article>
                <Users />
                <span><b>Mon grimoire</b><p>Tes personnages, relations, projets et souvenirs.</p></span>
              </article>
              <article>
                <Castle />
                <span><b>Archives officielles</b><p>Le lore, les règles et les lieux d’Elderwood.</p></span>
              </article>
            </div>
            <button className="tour-primary" onClick={() => setStep(2)}>
              J’ai compris <ChevronRight />
            </button>
          </div>
        )}
        {step === 2 && (
          <div className="tour-page">
            <div className="tour-mark"><Compass /></div>
            <small>TON PREMIER PAS</small>
            <h2>Que veux-tu faire maintenant&nbsp;?</h2>
            <p>Le guide se termine ici. Les archives resteront ensuite entièrement à ta disposition.</p>
            <div className="tour-choices">
              <button onClick={createCharacter}>
                <Users /><span><b>Créer mon personnage</b><small>Compléter ma fiche principale</small></span><ChevronRight />
              </button>
              <button onClick={startSearch}>
                <Search /><span><b>Explorer les archives</b><small>Rechercher dans tout Elderwood</small></span><ChevronRight />
              </button>
              <button onClick={close}>
                <LayoutDashboard /><span><b>Découvrir librement</b><small>Entrer sur la vue d’ensemble</small></span><ChevronRight />
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
function AuthPanel({
  name,
  user,
  configured,
  passwordRecovery,
  cancel,
  save,
}: {
  name: string;
  user: User | null;
  configured: boolean;
  passwordRecovery: boolean;
  cancel: () => void;
  save: (name: string) => Promise<void>;
}) {
  const [draft, setDraft] = useState(name);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const passwordLongEnough = password.length >= 8;
  const authRedirectUrl = () =>
    window.location.hostname === 'localhost'
      ? 'https://povikk.github.io/grimoireelder/'
      : new URL(import.meta.env.BASE_URL, window.location.origin).href;
  const requestPasswordReset = async () => {
    const client = getSupabase();
    if (!client || !email) return;
    setBusy(true);
    setMessage('');
    try {
      const { error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: authRedirectUrl(),
      });
      if (error) throw error;
      setMessage('Une lettre de récupération vient de partir. Consulte aussi tes courriers indésirables.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Envoi impossible.');
    } finally {
      setBusy(false);
    }
  };
  const chooseNewPassword = async () => {
    const client = getSupabase();
    if (!client) return;
    setBusy(true);
    setMessage('');
    try {
      if (password !== confirmPassword) {
        throw new Error('Les deux mots de passe ne correspondent pas.');
      }
      const { error } = await client.auth.updateUser({ password });
      if (error) throw error;
      setMessage('Ton nouveau sceau est posé. Le grimoire est de nouveau accessible.');
      setPassword('');
      setConfirmPassword('');
      window.setTimeout(cancel, 1100);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Modification impossible.');
    } finally {
      setBusy(false);
    }
  };
  const authenticate = async () => {
    const client = getSupabase();
    if (!client) return;
    setBusy(true);
    setMessage('');
    try {
      if (password.length < 8) {
        throw new Error('Le mot de passe doit contenir au moins 8 caractères.');
      }
      if (mode === 'signup' && password !== confirmPassword) {
        throw new Error('Les deux mots de passe ne correspondent pas.');
      }
      if (mode === 'login') {
        const { error } = await client.auth.signInWithPassword({ email, password });
        if (error) throw error;
        cancel();
      } else {
        const emailRedirectTo = authRedirectUrl();
        const { data, error } = await client.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: draft.trim() || email.split('@')[0] },
            emailRedirectTo,
          },
        });
        if (error) throw error;
        if (data.session) cancel();
        else setMessage(`Ton compte a bien été créé !\n\nUn e-mail de confirmation a été envoyé à ${email}. Clique sur le lien contenu dans ce message pour activer ton grimoire, puis tu pourras te connecter. Pense à vérifier les courriers indésirables si tu ne le vois pas.`);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Connexion impossible.');
    } finally {
      setBusy(false);
    }
  };
  return (
    <div
      className="overlay auth-overlay"
      onMouseDown={(event) => event.target === event.currentTarget && cancel()}
    >
      <section className="auth-card" role="dialog" aria-modal="true">
        <button className="close" onClick={cancel} aria-label="Fermer">
          <X />
        </button>
        <div className="auth-rune">
          <WandSparkles />
          <span>✦</span>
        </div>
        <small>LE SCEAU DU PROPRIÉTAIRE</small>
        <h2>{user ? 'Ton grimoire est ouvert' : 'Ouvre ton grimoire'}</h2>
        {!configured ? (
          <div className="auth-future auth-warning">
            <LockKeyhole />
            <span>
              <b>Supabase attend ses deux clés</b>
              <small>Ajoute l’URL du projet et la clé publique dans le fichier .env.local.</small>
            </span>
          </div>
        ) : passwordRecovery ? (
          <form onSubmit={(event) => { event.preventDefault(); chooseNewPassword(); }}>
            <p className="auth-connected">Choisis un nouveau mot de passe pour briser l’ancien sceau.</p>
            <label htmlFor="grimoire-new-password">Nouveau mot de passe</label>
            <div className="auth-input">
              <LockKeyhole />
              <input id="grimoire-new-password" type="password" autoFocus value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required />
            </div>
            <label htmlFor="grimoire-new-password-confirm">Confirmer le nouveau mot de passe</label>
            <div className="auth-input">
              <LockKeyhole />
              <input id="grimoire-new-password-confirm" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength={8} required />
            </div>
            {confirmPassword && password !== confirmPassword && <p className="auth-password-error">Les deux mots de passe ne correspondent pas.</p>}
            {message && <p className="auth-message">{message}</p>}
            <button className="auth-submit" disabled={busy || password.length < 8 || password !== confirmPassword}>
              {busy ? 'Nouveau sceau…' : 'Choisir ce nouveau mot de passe'} <ChevronRight />
            </button>
          </form>
        ) : user ? (
          <>
            <p className="auth-connected">Connecté avec <b>{user.email}</b>. Tes fiches et tes images sont privées et synchronisées.</p>
            <form onSubmit={async (event) => { event.preventDefault(); if (draft.trim()) await save(draft.trim()); }}>
              <label htmlFor="grimoire-name">Nom affiché</label>
              <div className="auth-input">
                <Sparkles />
                <input id="grimoire-name" value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={40} />
              </div>
              <button className="auth-submit" disabled={busy || !draft.trim()}>Mettre à jour mon sceau <ChevronRight /></button>
            </form>
            <button className="auth-signout" onClick={async () => { setBusy(true); await getSupabase()?.auth.signOut(); setBusy(false); cancel(); }}>
              Fermer la session sur cet appareil
            </button>
          </>
        ) : (
          <>
            <div className="auth-tabs" role="tablist">
              <button className={mode === 'login' ? 'active' : ''} onClick={() => { setMode('login'); setMessage(''); }}>Connexion</button>
              <button className={mode === 'signup' ? 'active' : ''} onClick={() => { setMode('signup'); setMessage(''); }}>Créer un compte</button>
            </div>
            <form onSubmit={(event) => { event.preventDefault(); authenticate(); }}>
              {mode === 'signup' && (
                <>
                  <label htmlFor="grimoire-name">Nom affiché</label>
                  <div className="auth-input"><Sparkles /><input id="grimoire-name" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Ex. Corvin" maxLength={40} /></div>
                </>
              )}
              <label htmlFor="grimoire-email">Adresse e-mail</label>
              <div className="auth-input"><LogIn /><input id="grimoire-email" type="email" autoFocus value={email} onChange={(event) => setEmail(event.target.value)} placeholder="sorcier@exemple.fr" required /></div>
              <label htmlFor="grimoire-password">Mot de passe</label>
              <div className="auth-input"><LockKeyhole /><input id="grimoire-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required /></div>
              {mode === 'signup' && <p className={`auth-password-hint ${passwordLongEnough ? 'valid' : ''}`}>{passwordLongEnough ? <><Check /> Mot de passe valide. 8 caractères minimum.</> : password.length ? `Il manque ${8 - password.length} caractère${8 - password.length > 1 ? 's' : ''}. Minimum requis : 8.` : 'Le mot de passe doit contenir au moins 8 caractères.'}</p>}
              {mode === 'signup' && (
                <>
                  <label htmlFor="grimoire-password-confirm">Confirmer le mot de passe</label>
                  <div className="auth-input"><LockKeyhole /><input id="grimoire-password-confirm" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength={8} required /></div>
                  {confirmPassword && password !== confirmPassword && <p className="auth-password-error">Les deux mots de passe ne correspondent pas.</p>}
                  {confirmPassword && password === confirmPassword && passwordLongEnough && <p className="auth-password-hint valid"><Check /> Les deux mots de passe correspondent.</p>}
                </>
              )}
              {message && <p className="auth-message">{message}</p>}
              <button className="auth-submit" disabled={busy}>
                {busy ? 'Ouverture…' : mode === 'login' ? 'Entrer dans mon grimoire' : 'Créer mon grimoire'} <ChevronRight />
              </button>
            </form>
            {mode === 'login' && (
              <button className="auth-forgot" disabled={busy || !email} onClick={requestPasswordReset}>
                Mot de passe oublié ? Envoyer une lettre de récupération
              </button>
            )}
          </>
        )}
      </section>
    </div>
  );
}
function RulesView({ query }: { query: string }) {
  const [tab, setTab] = useState('Toutes');
  const visible = rules.filter(
    (r) =>
      (tab === 'Toutes' || r.section === tab) &&
      [r.title, r.text, r.section]
        .join(' ')
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <section className="rules-page">
      <img className="archive-background" src={`${import.meta.env.BASE_URL}elderwood-archive.png`} alt="" aria-hidden="true" />
      <div className="rules-title">
        <div>
          <small>CODE DE CONDUITE · 56 RÈGLES</small>
          <h1>Règlement d’Elderwood</h1>
          <p>Les bases de jeu et les limites RP à garder à portée de main.</p>
        </div>
        <ShieldAlert />
      </div>
      <div className="rule-tabs">
        {ruleSections.map((s) => (
          <button
            className={tab === s ? 'active' : ''}
            onClick={() => setTab(s)}
            key={s}
          >
            {s}
            <span>
              {s === 'Toutes'
                ? 56
                : rules.filter((r) => r.section === s).length}
            </span>
          </button>
        ))}
      </div>
      <div className="rules-summary">
        <b>{visible.length}</b>
        <span>règles affichées</span>
        <i />
        <b>{visible.filter((r) => r.critical).length}</b>
        <span>points critiques</span>
      </div>
      <div className="rule-list">
        {visible.map((r) => (
          <article
            className={r.critical ? 'critical' : ''}
            style={{ '--entry-accent': ruleAccent(r.section) } as React.CSSProperties}
            key={r.section + r.number}
          >
            <div className="rule-num">{String(r.number).padStart(2, '0')}</div>
            <div>
              <small>{r.section}</small>
              <h2>{r.title}</h2>
              <p>{r.text}</p>
            </div>
            {r.critical && <span className="warning">À RETENIR</span>}
          </article>
        ))}
      </div>
    </section>
  );
}
function LoreView({ query }: { query: string }) {
  const [tab, setTab] = useState('Tout');
  const [selectedLore, setSelectedLore] = useState<(typeof lore)[number] | null>(null);
  const visible = lore.filter(
    (x) =>
      (tab === 'Tout' || x.section === tab) &&
      [x.title, x.subtitle, x.text, x.year, x.section]
        .join(' ')
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <section className="lore-page">
      <img className="archive-background" src={`${import.meta.env.BASE_URL}elderwood-archive.png`} alt="" aria-hidden="true" />
      <div className="lore-title">
        <div>
          <small>ENCYCLOPÉDIE DU MONDE</small>
          <h1>Les archives d’Elderwood</h1>
          <p>Magie, école, lignées et créatures connues du monde résonant.</p>
        </div>
        <Compass />
      </div>
      <div className="lore-tabs">
        {loreSections.map((s) => (
          <button
            className={tab === s ? 'active' : ''}
            onClick={() => setTab(s)}
            key={s}
          >
            {s}
            <span>
              {s === 'Tout'
                ? lore.length
                : lore.filter((x) => x.section === s).length}
            </span>
          </button>
        ))}
      </div>
      {tab === 'Tout' && !query && (
        <section className="house-strip">
          {lore
            .filter((x) => x.section === 'Maisons')
            .map((h) => (
              <article
                className="lore-entry-card"
                role="button"
                tabIndex={0}
                onClick={() => setSelectedLore(h)}
                onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelectedLore(h); } }}
                style={{ '--house': h.accent } as React.CSSProperties}
                key={h.title}
              >
                <img className="house-card-scene" src={houseAsset(h.title, 'maison') || ''} alt="" aria-hidden="true" />
                <img className="house-card-crest" src={houseAsset(h.title, 'insigne') || ''} alt={`Blason de la maison ${h.title}`} />
                <small>{h.subtitle}</small>
                <h2>{h.title}</h2>
                <p>{h.text}</p>
                <span className="lore-readmore">Lire l’article complet <ChevronRight /></span>
              </article>
            ))}
        </section>
      )}
      <div className="lore-count">
        {visible.length} entrée{visible.length !== 1 && 's'} dans les archives
      </div>
      <div
        className={tab === 'Chronologie' ? 'lore-grid timeline' : 'lore-grid'}
      >
        {visible.map((x) => (
          <article className="lore-entry-card" role="button" tabIndex={0} onClick={() => setSelectedLore(x)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelectedLore(x); } }} style={{ '--entry-accent': loreAccent(x.section) } as React.CSSProperties} key={x.section + x.title}>
            {x.section === 'Maisons' && <img className="lore-house-crest" src={houseAsset(x.title, 'insigne') || ''} alt={`Blason de la maison ${x.title}`} />}
            <div className="lore-meta">
              <span>{x.section}</span>
              {x.year && <b>{x.year}</b>}
            </div>
            <h2>{x.title}</h2>
            {x.subtitle && <h3>{x.subtitle}</h3>}
            <p>{x.text}</p>
            <span className="lore-readmore">Lire l’article complet <ChevronRight /></span>
          </article>
        ))}
      </div>
      {selectedLore && <div className="overlay lore-reader-overlay" onMouseDown={(event) => event.target === event.currentTarget && setSelectedLore(null)}><article className={`lore-reader${selectedLore.section === 'Maisons' ? ' house-reader' : ''}`} role="dialog" aria-modal="true" aria-label={selectedLore.title}><button className="close" onClick={() => setSelectedLore(null)} aria-label="Fermer"><X /></button>{selectedLore.section === 'Maisons' && <div className="house-reader-visual"><img className="house-reader-scene" src={houseAsset(selectedLore.title, 'maison') || ''} alt={`Salle de la maison ${selectedLore.title}`} /><img className="house-reader-crest" src={houseAsset(selectedLore.title, 'insigne') || ''} alt={`Blason de la maison ${selectedLore.title}`} /></div>}<header style={{ '--entry-accent': selectedLore.accent || loreAccent(selectedLore.section) } as React.CSSProperties}><small>{selectedLore.section}</small>{selectedLore.year && <time>{selectedLore.year}</time>}<h2>{selectedLore.title}</h2>{selectedLore.subtitle && <h3>{selectedLore.subtitle}</h3>}</header><div className="lore-reader-text">{selectedLore.text.split(/\n\s*\n/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div><footer><BookOpen /> Article complet des archives d’Elderwood</footer></article></div>}
    </section>
  );
}
function ElderwoodView({ query }: { query: string }) {
  const places = lore.filter(
    (x) =>
      x.section === 'Lieux' &&
      [x.title, x.subtitle, x.text]
        .join(' ')
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const houses = lore.filter((x) => x.section === 'Maisons');
  return (
    <section className="school-page">
      <section className="school-hero">
        <img src={`${import.meta.env.BASE_URL}launcher-library-clean.png`} alt="Bibliothèque d’Elderwood" />
        <div>
          <small>L’ÉCOLE</small>
          <h1>Elderwood</h1>
          <p>
            Seule grande école de sorcellerie du Royaume-Uni, dissimulée par un
            Voile puissant et bâtie autour de la Source de Vehr.
          </p>
          <span>Fondée en 1300</span>
        </div>
      </section>
      <section className="school-history">
        <div>
          <small>HISTOIRE D’ELDERWOOD</small>
          <h2>Une île, une Source, quatre fondateurs</h2>
        </div>
        <p>
          <b>E</b>n 1298, Falcon découvrit une eau capable de révéler la couleur
          de l’âme. Deux ans plus tard, Aerwyn, Brumval, Falcon et Venatrix
          fondèrent l’école autour de cette Source.
        </p>
      </section>
      <div className="school-heading">
        <small>LES QUATRE MAISONS</small>
        <h2>Quatre façons de répondre à l’Écho</h2>
      </div>
      <section className="school-houses">
        {houses.map((h) => (
          <article
            style={{ '--house': h.accent } as React.CSSProperties}
            key={h.title}
          >
            <span>{h.subtitle}</span>
            <h3>{h.title}</h3>
            <p>{h.text}</p>
          </article>
        ))}
      </section>
      <section className="magic-banner">
        <img
          src={`${import.meta.env.BASE_URL}launcher-magic-hall.png`}
          alt="Grand hall magique d’Elderwood"
        />
        <div>
          <small>LES FONDEMENTS DU MONDE</small>
          <h2>La magie traverse chaque pierre</h2>
          <p>
            L’Écho rend la magie possible. La Résonance lui répond, puis leur
            rencontre fait naître le Flux.
          </p>
        </div>
      </section>
      <div className="school-heading">
        <small>LE CHÂTEAU</small>
        <h2>Salles et lieux intérieurs</h2>
      </div>
      <section className="place-grid">
        {places
          .filter(
            (x) =>
              !['Brûlebrume', 'Terrain de Razeball', 'Shedwood'].includes(
                x.title,
              ),
          )
          .map((p, i) => (
            <article
              key={p.title}
              style={
                {
                  '--place-accent': [
                    '#d0a92d',
                    '#d6574f',
                    '#3a9b54',
                    '#458dd8',
                    '#ad8140',
                    '#8b53b3',
                  ][i % 6],
                } as React.CSSProperties
              }
            >
              <MapPin />
              <div>
                <small>{p.subtitle || 'Lieu du château'}</small>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </div>
            </article>
          ))}
      </section>
      <div className="school-heading">
        <small>L’ÎLE, HORS DU CHÂTEAU</small>
        <h2>Au-delà des murs</h2>
      </div>
      <section className="outside-grid">
        {places
          .filter((x) =>
            ['Brûlebrume', 'Terrain de Razeball', 'Shedwood'].includes(x.title),
          )
          .map((p) => (
            <article key={p.title}>
              <MapPin />
              <div>
                <small>{p.subtitle}</small>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </div>
            </article>
          ))}
      </section>
    </section>
  );
}
function Tags({
  tags,
  onPick,
}: {
  tags: string[];
  onPick?: (tag: string) => void;
}) {
  return (
    <div className="tags">
      {tags.map((t) => (
        <span
          role={onPick ? 'button' : undefined}
          tabIndex={onPick ? 0 : undefined}
          key={t}
          onClick={(e) => {
            e.stopPropagation();
            onPick?.(t);
          }}
          onKeyDown={(e) => {
            if (onPick && (e.key === 'Enter' || e.key === ' ')) onPick(t);
          }}
        >
          {t}
        </span>
      ))}
    </div>
  );
}
function MagicBoard({ notes, update, remove, add }: {
  notes: Note[];
  update: (note: Note) => void;
  remove: (id: string) => void;
  add: () => void;
}) {
  const colors: NonNullable<Note['noteColor']>[] = ['or', 'violet', 'bleu', 'vert', 'rose'];
  const boardRef = useRef<HTMLDivElement>(null);
  const [boardSize, setBoardSize] = useState({ width: 1, height: 1 });
  const [linkingId, setLinkingId] = useState<string | null>(null);
  const [colorPickerId, setColorPickerId] = useState<string | null>(null);
  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;
    const measure = () => setBoardSize({ width: board.clientWidth, height: board.clientHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(board);
    return () => observer.disconnect();
  }, []);
  const centerOf = (note: Note) => ({
    x: ((note.boardX ?? 8) / 100) * boardSize.width + (note.boardWidth || 230) / 2,
    y: ((note.boardY ?? 10) / 100) * boardSize.height + (note.boardHeight || 190) / 2,
  });
  const links = notes.flatMap((source) => (source.connections || []).map((targetId) => ({ source, target: notes.find((note) => note.id === targetId) })).filter((link): link is { source: Note; target: Note } => !!link.target));
  const chooseConnection = (target: Note) => {
    if (!linkingId) {
      setLinkingId(target.id);
      return;
    }
    if (linkingId === target.id) {
      setLinkingId(null);
      return;
    }
    const source = notes.find((note) => note.id === linkingId);
    if (!source) return setLinkingId(null);
    const connected = source.connections?.includes(target.id);
    update({ ...source, connections: connected ? source.connections?.filter((id) => id !== target.id) : [...(source.connections || []), target.id] });
    setLinkingId(null);
  };
  const startDrag = (event: React.PointerEvent<HTMLDivElement>, note: Note) => {
    if (linkingId) return;
    if ((event.target as HTMLElement).closest('button,input,textarea')) return;
    const board = event.currentTarget.closest('.chalk-board') as HTMLElement | null;
    const card = event.currentTarget.closest('.magic-note') as HTMLElement | null;
    if (!board || !card) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const rect = board.getBoundingClientRect();
    const startX = event.clientX;
    const startY = event.clientY;
    const initialLeft = card.offsetLeft;
    const initialTop = card.offsetTop;
    const move = (moveEvent: PointerEvent) => {
      const width = card.offsetWidth || note.boardWidth || 230;
      const height = card.offsetHeight || note.boardHeight || 190;
      const left = Math.max(0, Math.min(rect.width - width, initialLeft + moveEvent.clientX - startX));
      const top = Math.max(0, Math.min(rect.height - height, initialTop + moveEvent.clientY - startY));
      update({ ...note, boardX: (left / rect.width) * 100, boardY: (top / rect.height) * 100 });
    };
    const stop = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', stop);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', stop, { once: true });
  };
  const startResize = (event: React.PointerEvent<HTMLButtonElement>, note: Note) => {
    event.preventDefault();
    event.stopPropagation();
    const card = event.currentTarget.closest('.magic-note') as HTMLElement | null;
    if (!card) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const startX = event.clientX;
    const startY = event.clientY;
    const initialWidth = card.offsetWidth;
    const initialHeight = card.offsetHeight;
    const move = (moveEvent: PointerEvent) => update({
      ...note,
      boardWidth: Math.max(175, Math.min(460, initialWidth + moveEvent.clientX - startX)),
      boardHeight: Math.max(150, Math.min(520, initialHeight + moveEvent.clientY - startY)),
    });
    const stop = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', stop);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', stop, { once: true });
  };
  return <section className="magic-board-page">
    <header><div><small>CARNET DE TRAVERSE</small><h1>Notes diverses</h1><p>Écris librement, puis déplace tes pensées sur le tableau.</p></div><button onClick={add}><Plus /> Ajouter une note</button></header>
    <div className={`chalk-board${linkingId ? ' is-linking' : ''}`} ref={boardRef}>
      <span className="chalk-sigil">✦　☾　✧</span>
      {linkingId && <div className="linking-hint"><Link2 /><span><b>Première cellule choisie</b>Clique maintenant sur la cellule de destination.</span><button onClick={() => setLinkingId(null)}>Annuler</button></div>}
      <svg className="mind-links" width="100%" height="100%" aria-label="Connexions entre les notes">
        {links.map(({ source, target }) => {
          const from = centerOf(source), to = centerOf(target);
          const curve = Math.max(36, Math.min(115, Math.abs(to.x - from.x) * .2));
          const path = `M ${from.x} ${from.y} C ${from.x + curve} ${from.y}, ${to.x - curve} ${to.y}, ${to.x} ${to.y}`;
          return <g key={`${source.id}-${target.id}`} className="mind-link" onClick={() => { if (confirm(`Supprimer le lien entre « ${source.title} » et « ${target.title} » ?`)) update({ ...source, connections: source.connections?.filter((id) => id !== target.id) }); }}><path className="mind-link-glow" d={path} /><path className="mind-link-line" d={path} /><title>{source.title} ↔ {target.title} · Cliquer pour supprimer</title></g>;
        })}
      </svg>
      {!notes.length && <button className="board-empty" onClick={add}><StickyNote /><b>Le tableau attend tes premières pensées</b><small>Ajouter une note magique</small></button>}
      {notes.map((note) => <article className={`magic-note note-${note.noteColor || 'or'}${linkingId && linkingId !== note.id ? ' link-target' : ''}`} onClick={(event) => { if (linkingId && linkingId !== note.id && !(event.target as HTMLElement).closest('button,input,textarea')) chooseConnection(note); }} style={{ left: `${note.boardX ?? 8}%`, top: `${note.boardY ?? 10}%`, width: `${note.boardWidth || 230}px`, height: `${note.boardHeight || 190}px` }} key={note.id}>
        <div className="note-handle" onPointerDown={(event) => startDrag(event, note)}><span>✦</span><em>Glisser</em><button className="note-color-trigger" aria-label="Choisir la couleur" title="Choisir la couleur" onClick={(event) => { event.stopPropagation(); setColorPickerId((current) => current === note.id ? null : note.id); }} /><button className={linkingId === note.id ? 'link-active' : ''} aria-label="Relier cette note" title={linkingId === note.id ? 'Annuler la liaison' : 'Créer une liaison'} onClick={(event) => { event.stopPropagation(); chooseConnection(note); setColorPickerId(null); }}><Link2 /></button><button aria-label="Supprimer la note" title="Supprimer" onClick={(event) => { event.stopPropagation(); if (confirm('Effacer cette note ?')) remove(note.id); }}><X /></button></div>
        {colorPickerId === note.id && <div className="note-color-picker" onClick={(event) => event.stopPropagation()}>{colors.map((color) => <button type="button" className={`color-${color}${note.noteColor === color || (!note.noteColor && color === 'or') ? ' selected' : ''}`} aria-label={`Couleur ${color}`} title={color} onClick={() => { update({ ...note, noteColor: color }); setColorPickerId(null); }} key={color} />)}</div>}
        <input value={note.title} onChange={(event) => update({ ...note, title: event.target.value })} placeholder="Titre de la note" />
        <textarea value={note.text} onChange={(event) => update({ ...note, text: event.target.value })} placeholder="Écris quelque chose…" />
        <button className="note-resize" type="button" aria-label="Redimensionner la note" title="Agrandir ou réduire" onPointerDown={(event) => startResize(event, note)}>↘</button>
      </article>)}
    </div>
  </section>;
}
const escapeRichText = (value: string) => value
  .replace(/&(?!(?:amp|lt|gt|quot|#39|nbsp);)/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');
function richPlainText(value: string) {
  return value
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h[2-4]|li|blockquote)>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
function safeRichHtml(value: string) {
  if (!value) return '';
  if (!/<[^>]+>/.test(value)) return escapeRichText(value).replace(/\n/g, '<br>');
  const allowed = new Set(['p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'ul', 'ol', 'li', 'h2', 'h3', 'h4', 'blockquote', 'div']);
  return value.split(/(<[^>]*>)/g).map((part) => {
    if (!part.startsWith('<')) return escapeRichText(part);
    const match = part.match(/^<\s*(\/?)\s*([a-z0-9]+)/i);
    if (!match || !allowed.has(match[2].toLowerCase())) return '';
    const tag = match[2].toLowerCase();
    return tag === 'br' ? '<br>' : `<${match[1] ? '/' : ''}${tag}>`;
  }).join('');
}
function RichTextEditor({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder?: string }) {
  const editor = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (editor.current && editor.current.innerHTML !== safeRichHtml(value))
      editor.current.innerHTML = safeRichHtml(value);
  }, [value]);
  const command = (name: string, commandValue?: string) => {
    editor.current?.focus();
    document.execCommand(name, false, commandValue);
    if (editor.current) onChange(editor.current.innerHTML);
  };
  return <div className="rich-editor">
    <div className="rich-toolbar" aria-label="Mise en forme du texte">
      <button type="button" title="Gras" onMouseDown={(e) => { e.preventDefault(); command('bold'); }}><b>B</b></button>
      <button type="button" title="Italique" onMouseDown={(e) => { e.preventDefault(); command('italic'); }}><i>I</i></button>
      <button type="button" title="Souligné" onMouseDown={(e) => { e.preventDefault(); command('underline'); }}><u>U</u></button>
      <span />
      <button type="button" title="Titre" onMouseDown={(e) => { e.preventDefault(); command('formatBlock', 'h3'); }}>Titre</button>
      <button type="button" title="Paragraphe" onMouseDown={(e) => { e.preventDefault(); command('formatBlock', 'p'); }}>Texte</button>
      <button type="button" title="Citation" onMouseDown={(e) => { e.preventDefault(); command('formatBlock', 'blockquote'); }}>❝</button>
      <span />
      <button type="button" title="Liste à puces" onMouseDown={(e) => { e.preventDefault(); command('insertUnorderedList'); }}>• Liste</button>
      <button type="button" title="Liste numérotée" onMouseDown={(e) => { e.preventDefault(); command('insertOrderedList'); }}>1. Liste</button>
      <button type="button" title="Annuler" onMouseDown={(e) => { e.preventDefault(); command('undo'); }}>↶</button>
      <button type="button" title="Effacer la mise en forme" onMouseDown={(e) => { e.preventDefault(); command('removeFormat'); }}>Tx</button>
    </div>
    <div ref={editor} className="rich-surface" contentEditable suppressContentEditableWarning data-placeholder={placeholder} onInput={(e) => onChange(e.currentTarget.innerHTML)} onPaste={(e) => { e.preventDefault(); document.execCommand('insertText', false, e.clipboardData.getData('text/plain')); }} />
  </div>;
}
type LanguageMatch = { offset: number; length: number; message: string; replacements: { value: string }[] };
function CorrectableRichEditor({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder?: string }) {
  const [matches, setMatches] = useState<LanguageMatch[]>([]);
  const [accepted, setAccepted] = useState<Set<number>>(new Set());
  const [choices, setChoices] = useState<Record<number, number>>({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const formatted = /<[^>]+>/.test(value);
  const check = async () => {
    setBusy(true);
    setMessage('Analyse de la plume…');
    try {
      const body = new URLSearchParams({ text: value, language: 'fr', enabledOnly: 'false' });
      const response = await fetch('https://api.languagetool.org/v2/check', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
      if (!response.ok) throw new Error('Le correcteur ne répond pas pour le moment.');
      const result = await response.json();
      const found = (result.matches || []).filter((match: LanguageMatch) => match.replacements?.[0]).sort((a: LanguageMatch, b: LanguageMatch) => a.offset - b.offset).filter((match: LanguageMatch, index: number, all: LanguageMatch[]) => index === 0 || match.offset >= all[index - 1].offset + all[index - 1].length);
      setMatches(found);
      setAccepted(new Set());
      setChoices({});
      setMessage(found.length ? `${found.length} proposition${found.length > 1 ? 's' : ''} à vérifier.` : 'Aucune faute détectée.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Correction impossible.');
    } finally { setBusy(false); }
  };
  const apply = () => {
    let corrected = value;
    matches.map((match, index) => ({ match, index })).filter(({ index }) => accepted.has(index)).sort((a, b) => b.match.offset - a.match.offset).forEach(({ match, index }) => {
      const replacement = match.replacements[choices[index] || 0].value;
      corrected = corrected.slice(0, match.offset) + replacement + corrected.slice(match.offset + match.length);
    });
    onChange(corrected);
    setMessage(`${accepted.size} correction${accepted.size > 1 ? 's appliquées' : ' appliquée'}.`);
    setMatches([]); setAccepted(new Set()); setChoices({});
  };
  return <div className="correctable-rich">
    <div className="rich-correction-bar"><button type="button" className="correct-notes" disabled={busy || !value.trim() || formatted} title={formatted ? 'Retire la mise en forme pour utiliser le correcteur automatique.' : undefined} onClick={check}><SpellCheck2 />{busy ? 'Correction…' : 'Corriger les fautes'}</button></div>
    <RichTextEditor value={value} onChange={(text) => { onChange(text); setMatches([]); setAccepted(new Set()); setChoices({}); }} placeholder={placeholder} />
    {!!matches.length && <section className="correction-workshop compact-corrections">
      <div className="correction-preview">{(() => { const parts: React.ReactNode[] = []; let cursor = 0; matches.forEach((match, index) => { parts.push(value.slice(cursor, match.offset)); const before = value.slice(match.offset, match.offset + match.length); const after = match.replacements[choices[index] || 0].value; parts.push(<mark className={accepted.has(index) ? 'accepted' : ''} data-change={`Avant : ${before}  →  Après : ${after}`} key={`${match.offset}-${index}`}>{after}</mark>); cursor = match.offset + match.length; }); parts.push(value.slice(cursor)); return parts; })()}</div>
      <div className="correction-head"><div><small>PROPOSITIONS DE LA PLUME</small><b>{accepted.size}/{matches.length} validées</b></div><button type="button" onClick={() => setAccepted(new Set(matches.map((_, index) => index)))}><Check /> Tout valider</button></div>
      <div className="correction-list">{matches.map((match, index) => <article className={accepted.has(index) ? 'correction-choice accepted' : 'correction-choice'} key={`${match.offset}-${index}`}><button type="button" className="correction-main" onClick={() => setAccepted((current) => { const next = new Set(current); next.has(index) ? next.delete(index) : next.add(index); return next; })}><del>{value.slice(match.offset, match.offset + match.length)}</del><ChevronRight /><ins>{match.replacements[choices[index] || 0].value}</ins><span>{accepted.has(index) ? 'Validée' : 'Valider'}</span></button>{match.replacements.length > 1 && <div className="correction-alternatives">{match.replacements.slice(0, 4).map((replacement, replacementIndex) => <button type="button" className={(choices[index] || 0) === replacementIndex ? 'selected' : ''} onClick={() => setChoices((current) => ({ ...current, [index]: replacementIndex }))} key={replacementIndex}>{replacement.value}</button>)}</div>}</article>)}</div>
      <footer><button type="button" onClick={() => { setMatches([]); setMessage('Corrections ignorées.'); }}>Ignorer</button><button type="button" className="apply-corrections" disabled={!accepted.size} onClick={apply}><SpellCheck2 /> Appliquer {accepted.size || ''}</button></footer>
    </section>}
    {message && <small className="correction-message">{message}</small>}
  </div>;
}
function Editor({
  note,
  cancel,
  save,
}: {
  note: Note;
  cancel: () => void;
  save: (n: Note) => void;
}) {
  const [d, setD] = useState(note);
  const [imageOptimizing, setImageOptimizing] = useState(false);
  const [imageDragging, setImageDragging] = useState(false);
  const [correcting, setCorrecting] = useState(false);
  const [correctionMessage, setCorrectionMessage] = useState('');
  const [closeWarning, setCloseWarning] = useState(false);
  const [expandedDetail, setExpandedDetail] = useState<number | null>(null);
  const originalNote = useRef(note);
  type CorrectionMatch = { offset: number; length: number; message: string; replacements: { value: string }[] };
  const [correctionReview, setCorrectionReview] = useState<CorrectionMatch[]>([]);
  const [acceptedCorrections, setAcceptedCorrections] = useState<Set<number>>(new Set());
  const [selectedReplacements, setSelectedReplacements] = useState<Record<number, number>>({});
  const hasUnsavedChanges = JSON.stringify(d) !== JSON.stringify(originalNote.current);
  const tagChoices = [
    'Élève',
    'Professeur',
    'Ami',
    'Allié',
    'Rival',
    'Famille',
    'Mystère',
    'Secret',
    'À suivre',
    'Priorité',
    'Photo',
  ];
  const image = async (f?: File) => {
    if (!f) return;
    setImageOptimizing(true);
    try {
      const optimized = await optimizeImage(f);
      setD((current) => ({ ...current, image: optimized }));
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : 'Impossible de convertir cette image.',
      );
    } finally {
      setImageOptimizing(false);
    }
  };
  const correctNotes = async () => {
    if (!d.text.trim()) return;
    setCorrecting(true);
    setCorrectionMessage('Analyse de la plume en cours…');
    try {
      const body = new URLSearchParams({ text: d.text, language: 'fr-FR', level: 'picky' });
      const response = await fetch('https://api.languagetool.org/v2/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });
      if (!response.ok) throw new Error('Le correcteur est momentanément indisponible.');
      const result = await response.json() as { matches?: CorrectionMatch[] };
      const corrections = (result.matches || [])
        .filter((match) => match.replacements?.[0])
        .sort((a, b) => a.offset - b.offset)
        .filter((match, index, all) => index === 0 || match.offset >= all[index - 1].offset + all[index - 1].length);
      if (!corrections.length) {
        setCorrectionMessage('Aucune faute détectée.');
        return;
      }
      setCorrectionReview(corrections);
      setAcceptedCorrections(new Set());
      setSelectedReplacements({});
      setCorrectionMessage(`${corrections.length} proposition${corrections.length > 1 ? 's' : ''} à vérifier.`);
    } catch (error) {
      setCorrectionMessage(error instanceof Error ? error.message : 'Correction impossible.');
    } finally {
      setCorrecting(false);
    }
  };
  const applyCorrections = () => {
    let corrected = d.text;
    correctionReview
      .map((match, index) => ({ match, index }))
      .filter(({ index }) => acceptedCorrections.has(index))
      .sort((a, b) => b.match.offset - a.match.offset)
      .forEach(({ match, index }) => {
        const replacementIndex = selectedReplacements[index] || 0;
        corrected = corrected.slice(0, match.offset) + match.replacements[replacementIndex].value + corrected.slice(match.offset + match.length);
      });
    const count = acceptedCorrections.size;
    setD((current) => ({ ...current, text: corrected }));
    setCorrectionReview([]);
    setAcceptedCorrections(new Set());
    setSelectedReplacements({});
    setCorrectionMessage(`${count} correction${count > 1 ? 's appliquées' : ' appliquée'}.`);
  };
  const persistDraft = () => {
    if (!d.title.trim()) return false;
    const tagsWithoutHouse = d.tags.filter(
      (tag) => !characterHouses.includes(tag as CharacterHouse),
    );
    save({
      ...d,
      status: statusesByKind[d.kind].includes(d.status || '')
        ? d.status
        : statusesByKind[d.kind][0],
      tags:
        d.kind === 'Personnage' && d.house
          ? [...tagsWithoutHouse, d.house]
          : tagsWithoutHouse,
      house: d.kind === 'Personnage' ? d.house : undefined,
    });
    return true;
  };
  const attemptClose = () => hasUnsavedChanges ? setCloseWarning(true) : cancel();
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      if (closeWarning) setCloseWarning(false);
      else attemptClose();
    };
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, [hasUnsavedChanges, closeWarning]);
  return (
    <div className="overlay center">
      <form
        className={`editor${imageDragging ? ' image-dragging' : ''}`}
        onDragEnter={(event) => {
          if (Array.from(event.dataTransfer.items).some((item) => item.kind === 'file')) {
            event.preventDefault();
            setImageDragging(true);
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          event.dataTransfer.dropEffect = 'copy';
          setImageDragging(true);
        }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null))
            setImageDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setImageDragging(false);
          const dropped = Array.from(event.dataTransfer.files).find((file) => file.type.startsWith('image/'));
          if (dropped) image(dropped);
        }}
        onSubmit={(e) => {
          e.preventDefault();
          persistDraft();
        }}
      >
        {imageDragging && <div className="editor-dropveil"><ImagePlus /><b>Dépose l’image dans le grimoire</b><span>Elle sera optimisée automatiquement en WebP</span></div>}
        <div className="edithead">
          <div>
            <small>NOUVELLE ENTRÉE</small>
            <h2>Écrire une fiche</h2>
          </div>
          <button className="editor-close" type="button" onClick={attemptClose} aria-label="Fermer l’éditeur" title="Fermer">
            <X />
          </button>
        </div>
        <div className="grid">
          <label>
            Type
            <select
              value={d.kind}
              onChange={(e) => {
                const kind = e.target.value as Kind;
                setD({ ...d, kind, status: statusesByKind[kind][0] });
              }}
            >
              {Object.keys(icons).filter((x) => x !== 'Cours').map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label>
            {d.kind === 'Connaissance' ? 'État de la fiche' : 'Statut'}
            <select
              value={statusesByKind[d.kind].includes(d.status || '') ? d.status : statusesByKind[d.kind][0]}
              onChange={(e) =>
                setD({ ...d, status: e.target.value as Note['status'] })
              }
            >
                  {statusesByKind[d.kind].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          {d.kind === 'Personnage' && (
            <>
              <label>
                Relation
                <select
                  value={d.relation || 'Inconnue'}
                  onChange={(e) =>
                    setD({ ...d, relation: e.target.value as Note['relation'] })
                  }
                >
                  {['Inconnue', 'Neutre', 'Allié', 'Rival', 'Famille'].map(
                    (x) => (
                      <option key={x}>{x}</option>
                    ),
                  )}
                </select>
              </label>
              <label className="house-select-label">
                Maison
                <select
                  className={d.house ? `house-select ${d.house.toLowerCase()}` : 'house-select none'}
                  value={d.house || ''}
                  onChange={(e) =>
                    setD({
                      ...d,
                      house: (e.target.value || undefined) as CharacterHouse | undefined,
                    })
                  }
                >
                  <option value="">Pas de maison</option>
                  {characterHouses.map((house) => (
                    <option value={house} key={house}>{house}</option>
                  ))}
                </select>
              </label>
              <label>
                Année scolaire
                <select value={d.schoolYear || 'Première année'} onChange={(e) => setD({ ...d, schoolYear: e.target.value as SchoolYear })}>
                  {schoolYears.map((year) => <option value={year} key={year}>{year}</option>)}
                </select>
              </label>
              <label>
                Âge
                <input type="number" min="1" max="999" inputMode="numeric" value={d.age || ''} placeholder="Ex. 15" onChange={(e) => setD({ ...d, age: e.target.value ? Number(e.target.value) : undefined })} />
              </label>
            </>
          )}
          {d.kind === 'Connaissance' && (
            <label>
              Niveau de connaissance
              <select
                value={d.knowledge || 'À vérifier'}
                onChange={(e) =>
                  setD({ ...d, knowledge: e.target.value as Note['knowledge'] })
                }
              >
                {[
                  'Connu en RP',
                  'Soupçonné',
                  'À vérifier',
                  'HRP uniquement',
                  'Oublié',
                ].map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </label>
          )}
          {d.kind === 'Sort' && (
            <>
              <label>
                Domaine magique
                <select value={d.spellDomain || 'Charme'} onChange={(e) => setD({ ...d, spellDomain: e.target.value as Note['spellDomain'] })}>
                  {['Charme', 'Défense', 'Soin', 'Altération', 'Élémentaire', 'Utilitaire', 'Interdit', 'Autre'].map((value) => <option key={value}>{value}</option>)}
                </select>
              </label>
              <label>
                Niveau de maîtrise
                <select value={d.mastery || 'À étudier'} onChange={(e) => setD({ ...d, mastery: e.target.value as Note['mastery'] })}>
                  {['À étudier', 'En apprentissage', 'Instable', 'Maîtrisé'].map((value) => <option key={value}>{value}</option>)}
                </select>
              </label>
            </>
          )}
          <label>
            Titre
            <input
              autoFocus
              required
              value={d.title}
              onChange={(e) => setD({ ...d, title: e.target.value })}
            />
          </label>
          <label className="wide">
            Sous-titre
            <input
              value={d.sub}
              onChange={(e) => setD({ ...d, sub: e.target.value })}
            />
          </label>
          <label>
            Date dans la chronologie
            <input type="date" value={d.eventDate || ''} onChange={(e) => setD({ ...d, eventDate: e.target.value || undefined })} />
          </label>
          {d.kind === 'Sort' && (
            <label className="wide spell-formula">
              Formule / incantation
              <input value={d.incantation || ''} onChange={(e) => setD({ ...d, incantation: e.target.value })} placeholder="Formule exacte à prononcer avant le sort…" />
              <small>L’incantation verbale est obligatoire selon le règlement d’Elderwood.</small>
            </label>
          )}
          <label className="wide">
            <span className="notes-label"><span>Notes principales</span><button type="button" className="correct-notes" title={/<[^>]+>/.test(d.text) ? 'Retire la mise en forme pour utiliser le correcteur automatique.' : undefined} disabled={correcting || !d.text.trim() || /<[^>]+>/.test(d.text)} onClick={correctNotes}><SpellCheck2 />{correcting ? 'Correction…' : 'Corriger les fautes'}</button></span>
            <RichTextEditor value={d.text} placeholder="Écris le résumé principal de cette fiche…" onChange={(text) => { setD({ ...d, text }); setCorrectionReview([]); setAcceptedCorrections(new Set()); setSelectedReplacements({}); }} />
            {!!correctionReview.length && <section className="correction-workshop">
              <div className="correction-preview">{(() => {
                const parts: React.ReactNode[] = [];
                let cursor = 0;
                correctionReview.forEach((match, index) => {
                  parts.push(d.text.slice(cursor, match.offset));
                  const before = d.text.slice(match.offset, match.offset + match.length);
                  const after = match.replacements[selectedReplacements[index] || 0].value;
                  parts.push(<mark className={acceptedCorrections.has(index) ? 'accepted' : ''} data-change={`Avant : ${before}  →  Après : ${after}`} key={`${match.offset}-${index}`}>{after}</mark>);
                  cursor = match.offset + match.length;
                });
                parts.push(d.text.slice(cursor));
                return parts;
              })()}</div>
              <div className="correction-head"><div><small>PROPOSITIONS DE LA PLUME</small><b>{acceptedCorrections.size}/{correctionReview.length} validées</b></div><button type="button" onClick={() => setAcceptedCorrections(new Set(correctionReview.map((_, index) => index)))}><Check /> Tout valider</button></div>
              <div className="correction-list">{correctionReview.map((match, index) => <article className={acceptedCorrections.has(index) ? 'correction-choice accepted' : 'correction-choice'} key={`${match.offset}-${index}`}><button type="button" className="correction-main" onClick={() => setAcceptedCorrections((current) => { const next = new Set(current); next.has(index) ? next.delete(index) : next.add(index); return next; })} title={match.message}><del>{d.text.slice(match.offset, match.offset + match.length)}</del><ChevronRight /><ins>{match.replacements[selectedReplacements[index] || 0].value}</ins><span>{acceptedCorrections.has(index) ? 'Validée' : 'Valider'}</span></button>{match.replacements.length > 1 && <div className="correction-alternatives"><small>Autres formes :</small>{match.replacements.slice(0, 4).map((replacement, replacementIndex) => <button type="button" className={(selectedReplacements[index] || 0) === replacementIndex ? 'selected' : ''} onClick={() => setSelectedReplacements((current) => ({ ...current, [index]: replacementIndex }))} key={`${index}-${replacementIndex}`}>{replacement.value}</button>)}</div>}</article>)}</div>
              <footer><button type="button" onClick={() => { setCorrectionReview([]); setAcceptedCorrections(new Set()); setSelectedReplacements({}); setCorrectionMessage('Corrections ignorées.'); }}>Ignorer</button><button type="button" className="apply-corrections" disabled={!acceptedCorrections.size} onClick={applyCorrections}><SpellCheck2 /> Appliquer {acceptedCorrections.size || ''}</button></footer>
            </section>}
            {correctionMessage && <small className="correction-message">{correctionMessage}</small>}
            <small className="correction-privacy">Le texte est envoyé à <a href="https://languagetool.org" target="_blank" rel="noreferrer">LanguageTool</a> uniquement lorsque tu demandes une correction.</small>
          </label>
          <fieldset className="wide detail-editor">
            <legend>Catégories de la fiche</legend>
            <p>Ajoute des chapitres comme « Histoire », « Caractère » ou « Anecdotes ».</p>
            {(d.details || []).map((detail, index) => (
              <article className={expandedDetail === index ? 'expanded' : ''} key={index}>
                <div className="detail-heading">
                  <button className="detail-toggle" type="button" title={expandedDetail === index ? 'Replier' : 'Déplier'} aria-label={expandedDetail === index ? 'Replier la catégorie' : 'Déplier la catégorie'} aria-expanded={expandedDetail === index} onClick={() => setExpandedDetail(expandedDetail === index ? null : index)}><ChevronDown /></button>
                  <input aria-label="Titre de la catégorie" value={detail[0]} placeholder="Titre de la catégorie" onChange={(e) => setD({ ...d, details: d.details?.map((item, itemIndex) => itemIndex === index ? [e.target.value, item[1]] : item) })} />
                  <button type="button" disabled={index === 0} title="Monter" onClick={() => { const next = [...(d.details || [])]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; setD({ ...d, details: next }); }}>↑</button>
                  <button type="button" disabled={index === (d.details || []).length - 1} title="Descendre" onClick={() => { const next = [...(d.details || [])]; [next[index], next[index + 1]] = [next[index + 1], next[index]]; setD({ ...d, details: next }); }}>↓</button>
                  <button type="button" title="Supprimer la catégorie" aria-label="Supprimer la catégorie" onClick={() => setD({ ...d, details: d.details?.filter((_, itemIndex) => itemIndex !== index) })}><Trash2 /></button>
                </div>
                {expandedDetail === index && <CorrectableRichEditor value={detail[1]} placeholder="Contenu de cette catégorie…" onChange={(text) => setD((current) => ({ ...current, details: current.details?.map((item, itemIndex) => itemIndex === index ? [item[0], text] : item) }))} />}
              </article>
            ))}
            <button type="button" className="add-detail" onClick={() => { const nextIndex = (d.details || []).length; setD({ ...d, details: [...(d.details || []), ['Nouvelle catégorie', '']] }); setExpandedDetail(nextIndex); }}><Plus /> Ajouter une catégorie</button>
          </fieldset>
          {(d.kind === 'Connaissance' || d.kind === 'Sort') && (
            <label className="wide">
              {d.kind === 'Sort' ? 'Source d’apprentissage' : 'Comment mon personnage l’a appris'}
              <input
                placeholder="Personne, scène, lieu ou date…"
                value={d.source || ''}
                onChange={(e) => setD({ ...d, source: e.target.value })}
              />
            </label>
          )}
          {d.kind === 'Projet' && (
            <>
              <label className="wide">
                Prochaine action
                <input
                  placeholder="La prochaine chose concrète à faire…"
                  value={d.nextAction || ''}
                  onChange={(e) => setD({ ...d, nextAction: e.target.value })}
                />
              </label>
              <fieldset className="wide task-editor">
                <legend>Étapes du projet</legend>
                {(d.tasks || []).map((task) => (
                  <div key={task.id}>
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={(e) =>
                        setD({
                          ...d,
                          tasks: d.tasks?.map((item) =>
                            item.id === task.id
                              ? { ...item, done: e.target.checked }
                              : item,
                          ),
                        })
                      }
                    />
                    <input
                      value={task.text}
                      placeholder="Décrire une étape…"
                      onChange={(e) =>
                        setD({
                          ...d,
                          tasks: d.tasks?.map((item) =>
                            item.id === task.id
                              ? { ...item, text: e.target.value }
                              : item,
                          ),
                        })
                      }
                    />
                    <button
                      type="button"
                      aria-label="Supprimer cette étape"
                      onClick={() =>
                        setD({
                          ...d,
                          tasks: d.tasks?.filter((item) => item.id !== task.id),
                        })
                      }
                    >
                      <X />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="add-task"
                  onClick={() =>
                    setD({
                      ...d,
                      tasks: [
                        ...(d.tasks || []),
                        { id: crypto.randomUUID(), text: '', done: false },
                      ],
                    })
                  }
                >
                  <Plus /> Ajouter une étape
                </button>
              </fieldset>
            </>
          )}
          <fieldset className="wide choices">
            <legend>Étiquettes rapides</legend>
            {tagChoices.map((tag) => (
              <label key={tag}>
                <input
                  type="checkbox"
                  checked={d.tags.includes(tag)}
                  onChange={() =>
                    setD({
                      ...d,
                      tags: d.tags.includes(tag)
                        ? d.tags.filter((x) => x !== tag)
                        : [...d.tags, tag],
                    })
                  }
                />
                <span>{tag}</span>
              </label>
            ))}
          </fieldset>
          <label className="wide custom-tag">
            Autres étiquettes
            <input
              placeholder="Séparées par des virgules"
              onBlur={(e) =>
                setD({
                  ...d,
                  tags: [
                    ...new Set([
                      ...d.tags,
                      ...e.target.value
                        .split(',')
                        .map((x) => x.trim())
                        .filter(Boolean),
                    ]),
                  ],
                })
              }
            />
          </label>
          <label className="essential-check wide">
            <input
              type="checkbox"
              checked={!!d.essential}
              onChange={(e) => setD({ ...d, essential: e.target.checked })}
            />
            <Star />
            Afficher cette fiche dans « Les essentiels »
          </label>
          <label
            className="wide file"
          >
            <ImagePlus />
            {imageOptimizing ? 'Optimisation en cours…' : 'Choisir une image'}
            <small>Conversion WebP automatique · 1 600 px maximum</small>
            <input
              hidden
              type="file"
              accept="image/*"
              disabled={imageOptimizing}
              onChange={(e) => image(e.target.files?.[0])}
            />
          </label>
          {d.image && <img className="preview" src={d.image} />}
          {d.image && (
            <label className="wide image-size">
              Taille de l’image <span>{d.imageSize || 100}%</span>
              <input
                type="range"
                min="40"
                max="160"
                value={d.imageSize || 100}
                onChange={(e) =>
                  setD({ ...d, imageSize: Number(e.target.value) })
                }
              />
            </label>
          )}
        </div>
        <footer>
          <button type="button" onClick={attemptClose}>
            Annuler
          </button>
          <button className="primary">Enregistrer</button>
        </footer>
        {closeWarning && <div className="unsaved-layer" role="alertdialog" aria-modal="true" aria-labelledby="unsaved-title">
          <section className="unsaved-card">
            <span><Pencil /></span>
            <small>MODIFICATIONS NON ENREGISTRÉES</small>
            <h3 id="unsaved-title">Que veux-tu faire de cette fiche&nbsp;?</h3>
            <p>Les changements apportés depuis l’ouverture seront perdus si tu quittes maintenant.</p>
            <div>
              <button type="button" onClick={() => setCloseWarning(false)}>Continuer l’édition</button>
              <button type="button" className="discard-changes" onClick={cancel}>Quitter sans enregistrer</button>
              <button type="button" className="save-changes" onClick={persistDraft} disabled={!d.title.trim()}><Check /> Enregistrer</button>
            </div>
          </section>
        </div>}
      </form>
    </div>
  );
}
