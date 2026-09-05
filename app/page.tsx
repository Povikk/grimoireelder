'use client';
import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  BriefcaseBusiness,
  Camera,
  Castle,
  ChevronRight,
  Compass,
  Dices,
  Download,
  ImagePlus,
  LayoutDashboard,
  MapPin,
  Menu,
  Moon,
  Pencil,
  Plus,
  Search,
  ShieldAlert,
  Sparkles,
  Star,
  Sun,
  Trash2,
  Upload,
  Users,
  WandSparkles,
  X,
} from 'lucide-react';
import { rules, ruleSections } from './rules';
import { lore, loreSections } from './lore';
type Kind = 'Personnage' | 'Lieu' | 'Connaissance' | 'Projet';
type Note = {
  id: string;
  kind: Kind;
  title: string;
  sub: string;
  text: string;
  tags: string[];
  image?: string;
  imageSize?: number;
  essential?: boolean;
  status?: 'À découvrir' | 'En cours' | 'Confirmé' | 'Archivé';
  relation?: 'Inconnue' | 'Neutre' | 'Allié' | 'Rival' | 'Famille';
  knowledge?:
    | 'Connu en RP'
    | 'Soupçonné'
    | 'À vérifier'
    | 'HRP uniquement'
    | 'Oublié';
  source?: string;
  nextAction?: string;
  tasks?: { id: string; text: string; done: boolean }[];
  details?: string[][];
};
type SearchDetail = {
  source: 'Fiche' | 'Lore' | 'Règle';
  section: string;
  title: string;
  excerpt: string;
  item: Note | (typeof lore)[number] | (typeof rules)[number];
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
    status: 'À découvrir',
    relation: 'Neutre',
    imageSize: 100,
  },
];
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
const canonicalPlaces: Note[] = [
  {
    id: 'elderwood-school',
    kind: 'Lieu',
    title: 'Elderwood',
    sub: 'École de sorcellerie · Royaume-Uni',
    text:
      lore.find(
        (entry) => entry.section === 'École' && entry.title === 'Elderwood',
      )?.text || '',
    tags: ['École', 'Château', 'Source de Vehr'],
    status: 'Confirmé',
    imageSize: 100,
  },
  ...lore
    .filter((entry) => entry.section === 'Lieux')
    .map((entry, index) => ({
      id: `elderwood-place-${index}`,
      kind: 'Lieu' as const,
      title: entry.title,
      sub: entry.subtitle || 'Lieu d’Elderwood',
      text: entry.text,
      tags: [
        'Elderwood',
        ['Brûlebrume', 'Terrain de Razeball', 'Shedwood'].includes(entry.title)
          ? 'Île'
          : 'Château',
      ],
      status: 'Confirmé' as const,
      imageSize: 100,
    })),
];

const mergeCanonicalPlaces = (saved: Note[]) => {
  const existingPlaces = new Set(
    saved
      .filter((note) => note.kind === 'Lieu')
      .map((note) => normalizeSearch(note.title)),
  );
  return [
    ...canonicalPlaces.filter(
      (place) => !existingPlaces.has(normalizeSearch(place.title)),
    ),
    ...saved,
  ];
};
export default function Home() {
  const [notes, setNotes] = useState(() => [...canonicalPlaces, ...initial]),
    [section, setSection] = useState('Toutes'),
    [q, setQ] = useState(''),
    [open, setOpen] = useState<Note | null>(null),
    [searchOpen, setSearchOpen] = useState<SearchDetail | null>(null),
    [edit, setEdit] = useState<Note | null>(null),
    [menu, setMenu] = useState(false),
    [dark, setDark] = useState(true),
    [greeting, setGreeting] = useState('Bienvenue');
  useEffect(() => {
    try {
      const s = localStorage.getItem('elderwood-grimoire');
      if (s)
        setNotes(
          mergeCanonicalPlaces(
            JSON.parse(s).map((n: Note) => ({
              ...n,
              imageSize: n.imageSize || 100,
              status: n.status || 'À découvrir',
              details:
                n.id === 'joueur' && n.title !== 'Mon personnage'
                  ? n.details || details
                  : n.details,
            })),
          ),
        );
      const savedTheme = localStorage.getItem('elderwood-dark');
      const night = savedTheme === null ? true : savedTheme === 'true';
      setDark(night);
      document.documentElement.classList.toggle('dark', night);
      const hour = new Date().getHours();
      setGreeting(hour < 6 ? 'Douce nuit' : hour < 18 ? 'Bonjour' : 'Bonsoir');
    } catch {}
  }, []);
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
  useEffect(
    () => localStorage.setItem('elderwood-grimoire', JSON.stringify(notes)),
    [notes],
  );
  useEffect(() => {
    if (!open && !edit && !searchOpen) return;
    const previousOverflow = document.body.style.overflow;
    const previousPadding = document.body.style.paddingRight;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (edit) setEdit(null);
        else if (open) setOpen(null);
        else setSearchOpen(null);
      }
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPadding;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [open, edit, searchOpen]);
  const toggleDark = () =>
    setDark((v) => {
      const next = !v;
      document.documentElement.classList.toggle('dark', next);
      localStorage.setItem('elderwood-dark', String(next));
      return next;
    });
  const shown = useMemo(
    () =>
      notes.filter(
        (n) =>
          (section === 'Toutes' || n.kind === section) &&
          [n.title, n.sub, n.text, ...n.tags]
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
        excerpt: item.text || item.sub,
        item,
        score: searchScore(
          q,
          item.title,
          [item.sub, item.text, ...item.tags].join(' '),
        ),
      })),
      ...lore.map((item) => ({
        source: 'Lore' as const,
        section: item.section,
        title: item.title,
        excerpt: item.text,
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
        item,
        score: searchScore(
          q,
          item.title,
          `${item.section} ${item.number} ${item.text}`,
        ),
      })),
    ]
      .filter((result) => result.score > 0)
      .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
  }, [notes, q]);
  const add = () =>
    setEdit({
      id: crypto.randomUUID(),
      kind: section === 'Toutes' ? 'Personnage' : (section as Kind),
      title: '',
      sub: '',
      text: '',
      tags: [],
      status: 'À découvrir',
      relation: 'Inconnue',
      imageSize: 100,
      essential: false,
    });
  const mainCharacter = notes.find((note) => note.id === 'joueur');
  const characterName = mainCharacter?.title?.split(' ')[0] || 'voyageur';
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
  const exportGrimoire = () => {
    const blob = new Blob([JSON.stringify({ version: 1, notes }, null, 2)], {
      type: 'application/json',
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `elderwood-grimoire-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  };
  const importGrimoire = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const imported = Array.isArray(parsed) ? parsed : parsed.notes;
        if (!Array.isArray(imported)) throw new Error();
        setNotes(mergeCanonicalPlaces(imported));
      } catch {
        alert('Ce fichier ne semble pas être une sauvegarde Elderwood valide.');
      }
    };
    reader.readAsText(file);
  };
  return (
    <main>
      <aside className={menu ? 'side on' : 'side'}>
        <div className="brand">
          <i>
            <WandSparkles />
          </i>
          <div>
            <b>Elderwood</b>
            <small>Grimoire privé</small>
          </div>
        </div>
        <p>LE GRIMOIRE</p>
        {[
          ['Toutes', LayoutDashboard],
          ['Personnage', Users],
          ['Lieu', MapPin],
          ['Connaissance', BookOpen],
          ['Projet', BriefcaseBusiness],
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
        <div className="local">
          <Sparkles />
          <span>
            <b>Mémoire locale</b>
            <br />
            Les fiches restent dans ce navigateur.
          </span>
        </div>
        <div className="vault-actions">
          <button onClick={exportGrimoire} title="Exporter une sauvegarde">
            <Download /> Sauvegarder
          </button>
          <label title="Restaurer une sauvegarde">
            <Upload /> Restaurer
            <input
              hidden
              type="file"
              accept="application/json,.json"
              onChange={(event) => importGrimoire(event.target.files?.[0])}
            />
          </label>
        </div>
      </aside>
      <section className="work">
        <header>
          <button className="hamb" onClick={() => setMenu(!menu)}>
            <Menu />
          </button>
          <label>
            <Search />
            <input
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
          <button
            className="theme-toggle"
            onClick={toggleDark}
            aria-label={dark ? 'Passer en mode clair' : 'Passer en mode sombre'}
          >
            {dark ? <Sun /> : <Moon />}
          </button>
          {!['Règlement', 'Lore', 'Elderwood'].includes(section) && (
            <button className="primary" onClick={add}>
              <Plus /> Nouvelle fiche
            </button>
          )}
        </header>
        <div className="content">
          {q.trim() ? (
            <section className="global-search">
              <div className="search-heading">
                <div>
                  <small>RECHERCHE DANS TOUT LE GRIMOIRE</small>
                  <h2>Résultats pour « {q} »</h2>
                </div>
                <span>
                  {globalResults.length} résultat
                  {globalResults.length !== 1 && 's'}
                </span>
              </div>
              <div className="search-results">
                {globalResults.map((result, index) => (
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
                {!globalResults.length && (
                  <div className="empty">
                    <Search />
                    <h3>Aucune trace trouvée</h3>
                    <p>Essaie un nom, une maison, un lieu ou un terme RP.</p>
                  </div>
                )}
              </div>
            </section>
          ) : section === 'Règlement' ? (
            <RulesView query={q} />
          ) : section === 'Lore' ? (
            <LoreView query={q} />
          ) : section === 'Elderwood' ? (
            <ElderwoodView query={q} />
          ) : (
            <>
              {section === 'Toutes' && !q && (
                <>
                  <section className="hero">
                    <img
                      src="/elderwood-archive.png"
                      alt="Académie magique dans une forêt nocturne"
                    />
                    <div>
                      <small>ARCHIVES PERSONNELLES · ANNÉE I</small>
                      <h1>
                        {greeting}, {characterName}.
                      </h1>
                      <p>
                        Ton grimoire conserve {notes.length} fragment
                        {notes.length !== 1 && 's'} de ton histoire.
                      </p>
                      <button
                        onClick={() => mainCharacter && setOpen(mainCharacter)}
                      >
                        Ouvrir mon personnage <ChevronRight />
                      </button>
                    </div>
                    <Dices className="seal" />
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
                        : section + 's'}
                  </h2>
                </div>
                <span>
                  {shown.length} fiche{shown.length !== 1 && 's'}
                </span>
              </div>
              <section className="list">
                {shown.map((n) => {
                  const I = icons[n.kind];
                  return (
                    <article onClick={() => setOpen(n)} key={n.id}>
                      <i className={n.image ? 'note-thumb' : ''}>
                        {n.image ? <img src={n.image} alt="" /> : <I />}
                      </i>
                      <div>
                        <small>{n.kind}</small>
                        <h3>{n.title}</h3>
                        <p>{n.text}</p>
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
              </section>
            </>
          )}
        </div>
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
                {open.kind === 'Connaissance' && open.knowledge && (
                  <span>
                    <b>Connaissance</b>
                    {open.knowledge}
                  </span>
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
              <p className="intro">{open.text}</p>
              {open.kind === 'Connaissance' && open.source && (
                <section className="knowledge-source">
                  <h3>Comment je le sais</h3>
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
                  <p>{d[1]}</p>
                </section>
              ))}
              <div className="actions">
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
              {searchOpen.source === 'Lore' ? <Compass /> : <ShieldAlert />}
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
          <article key={x.section + x.title}>
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
        <img src="/launcher-library-clean.png" alt="Bibliothèque d’Elderwood" />
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
          src="/launcher-magic-hall.png"
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
  return (
    <div className="overlay center">
      <form
        className="editor"
        onSubmit={(e) => {
          e.preventDefault();
          if (d.title.trim()) save(d);
        }}
      >
        <div className="edithead">
          <div>
            <small>NOUVELLE ENTRÉE</small>
            <h2>Écrire une fiche</h2>
          </div>
          <button type="button" onClick={cancel}>
            <X />
          </button>
        </div>
        <div className="grid">
          <label>
            Type
            <select
              value={d.kind}
              onChange={(e) => setD({ ...d, kind: e.target.value as Kind })}
            >
              {Object.keys(icons).map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label>
            Statut
            <select
              value={d.status || 'À découvrir'}
              onChange={(e) =>
                setD({ ...d, status: e.target.value as Note['status'] })
              }
            >
              {['À découvrir', 'En cours', 'Confirmé', 'Archivé'].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          {d.kind === 'Personnage' && (
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
          <label className="wide">
            Notes
            <textarea
              rows={6}
              value={d.text}
              onChange={(e) => setD({ ...d, text: e.target.value })}
            />
          </label>
          {d.kind === 'Connaissance' && (
            <label className="wide">
              Comment mon personnage l’a appris
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
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              image(e.dataTransfer.files[0]);
            }}
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
          <button type="button" onClick={cancel}>
            Annuler
          </button>
          <button className="primary">Enregistrer</button>
        </footer>
      </form>
    </div>
  );
}
