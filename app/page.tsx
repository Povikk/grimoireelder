'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import {
  BookOpen,
  BriefcaseBusiness,
  Camera,
  Castle,
  ChevronRight,
  Compass,
  Dices,
  ImagePlus,
  Eye,
  LayoutDashboard,
  Link2,
  LockKeyhole,
  LogIn,
  MapPin,
  StickyNote,
  Menu,
  Palette,
  Pencil,
  Plus,
  Search,
  ShieldAlert,
  Send,
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
type Kind = 'Personnage' | 'Lieu' | 'Connaissance' | 'Projet' | 'Sort' | 'Note libre';
type CharacterHouse = 'Aerwyn' | 'Brumval' | 'Falcon' | 'Venatrix';
type SchoolYear = 'Première année' | 'Deuxième année' | 'Troisième année' | 'Quatrième année' | 'Cinquième année' | 'Sixième année' | 'Septième année' | 'Personnel' | 'Hors cursus';
const schoolYears: SchoolYear[] = ['Première année', 'Deuxième année', 'Troisième année', 'Quatrième année', 'Cinquième année', 'Sixième année', 'Septième année', 'Personnel', 'Hors cursus'];
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
  'Note libre': StickyNote,
};
const statusesByKind: Record<Kind, string[]> = {
  Personnage: ['À rencontrer', 'Rencontré', 'À approfondir', 'Proche', 'Perdu de vue'],
  Lieu: ['À découvrir', 'Visité', 'À explorer', 'Important', 'Dangereux'],
  Connaissance: ['À vérifier', 'Soupçonné', 'Confirmé', 'Contredit', 'Obsolète'],
  Projet: ['Idée', 'À préparer', 'En cours', 'En attente', 'Terminé', 'Abandonné'],
  Sort: ['À découvrir', 'À apprendre', 'En entraînement', 'Maîtrisé', 'Interdit'],
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
const ruleAccent = (section: string) => ({
  Général: '#c4a34e', 'Lexique RP': '#4d8bcf', RolePlay: '#42a270', 'RPK On': '#d35d52',
  Famille: '#a875c2', Vocal: '#d17d45', Staff: '#6d7f95',
}[section] || '#c4a34e');
export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]),
    [section, setSection] = useState('Accueil'),
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
    [wikiSeed, setWikiSeed] = useState<Note | null>(null),
    [wikiEntries, setWikiEntries] = useState<WikiSubmission[]>([]),
    [wikiAdmin, setWikiAdmin] = useState(false);
  const [wikiDemoPending, setWikiDemoPending] = useState(true);
  const [visibleNoteLimit, setVisibleNoteLimit] = useState(10);
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
      setCurrentUser(user);
      if (user) setSection('Toutes');
      setAuthResolved(true);
    }).catch(() => setAuthResolved(true));
    const { data } = client.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setCurrentUser((existing) => {
          if (existing?.id === session.user.id) return existing;
          document.documentElement.classList.remove('grimoire-ready');
          setCloudReady(false);
          return session.user;
        });
        setSection('Toutes');
      }
      if (event === 'SIGNED_OUT') {
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
          let restored = remote.map((note) => {
            if (!shouldRestoreCorvin || note.id !== 'joueur')
              return note;
            if (note.title === 'Corvin Wrenfall')
              return note.schoolYear ? note : { ...note, schoolYear: 'Première année' };
            return {
              ...corvinCharacter,
              image: note.image,
              imagePath: note.imagePath,
            };
          });
          if (shouldRestoreCorvin && !restored.some((note) => note.id === 'joueur'))
            restored = [corvinCharacter, ...restored];
          if (restored.length !== remote.length || restored.some((note, index) => note !== remote[index]))
            await replacePrivateNotes(currentUser, restored);
          setNotes(restored);
        } else {
          const starter = currentUser.email?.toLowerCase() === 'jonathan.ragot@gmail.com'
            ? [corvinCharacter]
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
        excerpt: richPlainText(item.text) || item.sub,
        tags: item.tags,
        item,
        score: searchScore(
          q,
          item.title,
          [item.sub, item.text, item.schoolYear, item.incantation, item.spellDomain, item.mastery, ...item.tags].join(' '),
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
          (searchTag === 'Tous' || result.tags.includes(searchTag)),
      ),
    [globalResults, searchSource, searchTag],
  );
  const add = () =>
    setEdit({
      id: crypto.randomUUID(),
      kind: section === 'Toutes' ? 'Personnage' : (section as Kind),
      title: '',
      sub: '',
      text: '',
      tags: [],
      status: statusesByKind[section === 'Toutes' ? 'Personnage' : (section as Kind)][0],
      relation: 'Inconnue',
      schoolYear: (section === 'Toutes' || section === 'Personnage') ? 'Première année' : undefined,
      imageSize: 100,
      essential: false,
    });
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
        {currentUser && [
          ['Toutes', LayoutDashboard],
          ['Personnage', Users],
          ['Lieu', MapPin],
          ['Connaissance', BookOpen],
          ['Projet', BriefcaseBusiness],
          ['Sort', WandSparkles],
        ].map(([s, I]: any) => (
          <button
            className={section === s ? 'active' : ''}
            onClick={() => {
              setSection(s);
              setMenu(false);
              setQ('');
            }}
            key={s}
          >
            <I />
            {s === 'Toutes' ? 'Vue d’ensemble' : s + (s === 'Lieu' ? 'x' : 's')}
            <em>
              {s === 'Toutes'
                ? notes.length
                : notes.filter((n) => n.kind === s).length}
            </em>
          </button>
        ))}
        {currentUser && <button className={section === 'Tableau' ? 'active' : ''} onClick={() => { setSection('Tableau'); setMenu(false); setQ(''); }}>
          <StickyNote /> Notes diverses<em>{notes.filter((note) => note.kind === 'Note libre').length}</em>
        </button>}
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
          {currentUser && !['Règlement', 'Lore', 'Elderwood'].includes(section) && (
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
                        setOpen(result.item as Note);
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
          ) : section === 'Tableau' ? (
            <MagicBoard notes={notes.filter((note) => note.kind === 'Note libre')} update={(updated) => setNotes((current) => current.map((note) => note.id === updated.id ? updated : note))} remove={(id) => setNotes((current) => current.filter((note) => note.id !== id))} add={addLooseNote} />
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
                <span>
                  {shown.length} fiche{shown.length !== 1 && 's'}
                </span>
              </div>
              <section className="list">
                {shown.slice(0, visibleNoteLimit).map((n) => {
                  const I = icons[n.kind];
                  return (
                    <article onClick={() => setOpen(n)} key={n.id}>
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
                  <b>Statut</b>
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
              {open.details?.map((d) => (
                <section key={d[0]}>
                  <h3>{d[0]}</h3>
                  <div className="rich-output" dangerouslySetInnerHTML={{ __html: safeRichHtml(d[1]) }} />
                </section>
              ))}
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
          }}
        />
      )}
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
  const visible = admin ? entries : entries.filter((entry) => entry.created_by === user.id);
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
function AdminPanel({ close, openModeration }: { close: () => void; openModeration: () => void }) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [userNotes, setUserNotes] = useState<Note[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
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
    setSelected(user); setExpanded(null); setBusy(true); setError('');
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
        {busy ? <p>Déchiffrement du grimoire…</p> : <div className="admin-notes">{!userNotes.length && <p>Ce grimoire ne contient aucune fiche.</p>}{userNotes.map((note) => <article className={expanded === note.id ? 'expanded' : ''} key={note.id}><button onClick={() => setExpanded(expanded === note.id ? null : note.id)}>{note.image && <img src={note.image} alt="" />}<span><small>{note.kind}</small><b>{note.title}</b><p>{richPlainText(note.text)}</p></span><Eye /></button>{expanded === note.id && <div className="admin-note-detail"><h4>{note.sub}</h4><div className="rich-output" dangerouslySetInnerHTML={{ __html: safeRichHtml(note.text) }} />{note.details?.map((detail, index) => <section key={index}><h4>{detail[0]}</h4><div className="rich-output" dangerouslySetInnerHTML={{ __html: safeRichHtml(detail[1]) }} /></section>)}</div>}</article>)}</div>}
      </div>}
    </section>
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
        else setMessage('Ton grimoire est scellé. Ouvre la lettre reçue par mail pour l’activer.');
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
              {mode === 'signup' && (
                <>
                  <label htmlFor="grimoire-password-confirm">Confirmer le mot de passe</label>
                  <div className="auth-input"><LockKeyhole /><input id="grimoire-password-confirm" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength={8} required /></div>
                  {confirmPassword && password !== confirmPassword && <p className="auth-password-error">Les deux mots de passe ne correspondent pas.</p>}
                </>
              )}
              {message && <p className="auth-message">{message}</p>}
              <button className="auth-submit" disabled={busy || !email || password.length < 8 || (mode === 'signup' && password !== confirmPassword)}>
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
      <img className="archive-background" src={`${import.meta.env.BASE_URL}launcher-magic-hall.png`} alt="" aria-hidden="true" />
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
      <img className="archive-background" src={`${import.meta.env.BASE_URL}launcher-society.png`} alt="" aria-hidden="true" />
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
                style={{ '--house': h.accent } as React.CSSProperties}
                key={h.title}
              >
                <i />
                <small>{h.subtitle}</small>
                <h2>{h.title}</h2>
                <p>{h.text}</p>
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
          <article style={{ '--entry-accent': loreAccent(x.section) } as React.CSSProperties} key={x.section + x.title}>
            <div className="lore-meta">
              <span>{x.section}</span>
              {x.year && <b>{x.year}</b>}
            </div>
            <h2>{x.title}</h2>
            {x.subtitle && <h3>{x.subtitle}</h3>}
            <p>{x.text}</p>
          </article>
        ))}
      </div>
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
      .forEach(({ match }) => {
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
              {Object.keys(icons).map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label>
            Statut
            <select
              value={d.status || statusesByKind[d.kind][0]}
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
              <article key={index}>
                <div className="detail-heading">
                  <input aria-label="Titre de la catégorie" value={detail[0]} placeholder="Titre de la catégorie" onChange={(e) => setD({ ...d, details: d.details?.map((item, itemIndex) => itemIndex === index ? [e.target.value, item[1]] : item) })} />
                  <button type="button" disabled={index === 0} title="Monter" onClick={() => { const next = [...(d.details || [])]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; setD({ ...d, details: next }); }}>↑</button>
                  <button type="button" disabled={index === (d.details || []).length - 1} title="Descendre" onClick={() => { const next = [...(d.details || [])]; [next[index], next[index + 1]] = [next[index + 1], next[index]]; setD({ ...d, details: next }); }}>↓</button>
                  <button type="button" title="Supprimer la catégorie" aria-label="Supprimer la catégorie" onClick={() => setD({ ...d, details: d.details?.filter((_, itemIndex) => itemIndex !== index) })}><Trash2 /></button>
                </div>
                <CorrectableRichEditor value={detail[1]} placeholder="Contenu de cette catégorie…" onChange={(text) => setD((current) => ({ ...current, details: current.details?.map((item, itemIndex) => itemIndex === index ? [item[0], text] : item) }))} />
              </article>
            ))}
            <button type="button" className="add-detail" onClick={() => setD({ ...d, details: [...(d.details || []), ['Nouvelle catégorie', '']] })}><Plus /> Ajouter une catégorie</button>
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
