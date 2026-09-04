export type Rule={section:string;number:number;title:string;text:string;critical?:boolean};
const lex=[
['Metagaming','Interdit d’utiliser des informations obtenues hors RP (vocal, chat, stream) pour avantager son personnage.'],
['Freekill','Tuer sans raison RP valable ni contexte est interdit. Toute violence doit être justifiée en RP.'],
['Revenge Kill','Après la mort, impossible de revenir se venger. Le personnage oublie les événements ayant mené à sa mort.'],
['Free Attack','Attaquer sans raison RP valable ni interaction préalable est interdit.'],
['Fear RP','Le personnage doit réagir avec réalisme et prudence face à une menace sérieuse, un supérieur ou un adversaire plus puissant.'],
['Bunny Hopping','Sauter continuellement pour obtenir un avantage en combat ou en fuite est interdit.'],
['Cheat / Use bug','Cheats, scripts, mods non autorisés et exploitation de bugs sont interdits et peuvent mener au bannissement définitif.'],
['Mass RP','Il faut tenir compte de la présence passive de PNJ et civils dans les lieux publics. Ne pas entrer sans invitation dans le bureau du directeur.'],
['Pain RP','Le personnage doit réagir de manière crédible à la douleur et aux blessures.'],
['StreamHack','Utiliser les informations du stream d’un autre joueur pour obtenir un avantage est interdit.'],
['Force RP','Ne jamais imposer une action, une interaction ou une conséquence à un autre joueur sans accord.'],
['Power Gaming','Utiliser la physique du jeu pour accomplir des actions irréalisables dans l’univers est interdit.'],
['Safe RP','Jouer systématiquement sans prendre de risque pour éviter toute conséquence est interdit.'],
['Win RP','Le personnage ne doit pas toujours réussir. Il faut laisser place aux échecs et aux conséquences.'],
['Logique RP','Caractère, histoire et apparence doivent évoluer de façon cohérente, progressive et justifiée en RP.'],
['NLR (New Life Rule)','Après une mort, oublier les 15 minutes précédentes. Retour sur la zone interdit pendant au moins 20 minutes, sauf accord ou validation staff.'],
['RPK Flash','Tuer immédiatement sans interaction ni contexte est interdit. Un meurtre exige un scénario, une interaction et une validation staff.'],
['AFK Farm','Progresser ou gagner des ressources en restant inactif est interdit.'],
['Roll','Un /roll par minute pour une même action, sauf échec critique. 0–15 : échec critique, 15–50 : échec, 50–85 : réussite, 85–100 : réussite critique.'],
['FairPlay','Respect, courtoisie, honnêteté et bonne humeur sont obligatoires. Aucun avantage injuste.'],
['Double Voc','Être connecté en vocal Discord pendant une scène RP en jeu est interdit.'],
['ERP à caractère sexuel','Les scènes sexuelles sont interdites. Les romances respectueuses restent autorisées.']
];
const general=[
['Nom Roleplay','Nom original et crédible au format Prénom Nom. Noms réels, célèbres, connus, trolls, offensants, chiffres et majuscules abusives interdits.'],
['Vocabulaire','Vocabulaire adapté à l’univers. Propos haineux, discriminatoires ou harcelants interdits en RP comme hors RP.'],
['Sanctions','Les infractions peuvent mener à un avertissement, kick ou bannissement. Les recours se font respectueusement par ticket.'],
['Langage HRP','Le langage hors roleplay est interdit pendant les interactions en jeu.'],
['Publicité','Toute publicité ou invitation pour un autre serveur RP est interdite.'],
['Soundboards / Voice mods','Soundboards et outils de modification de voix sont interdits en vocal durant les sessions RP.'],
['Insinuations HRP','Allusions et messages HRP sont interdits pendant les interactions en jeu.'],
['Arnaque / Boutique','Fraude dans la boutique et manipulation du staff pour obtenir argent ou avantages sont interdites.'],
['Partage de compte','Chaque joueur doit utiliser son compte personnel. Le partage de compte est interdit.'],
['Contestation','Toute contestation passe par un ticket Discord. Spam ou harcèlement du staff en privé interdit.'],
['Déconnexion en scène','Se déconnecter pour fuir une scène ou ses conséquences est interdit. Signaler immédiatement un crash réel par ticket.'],
['Mention staff','Ne pas mentionner le staff sans raison valable. Utiliser les tickets.'],
['Use Bug','Toute exploitation volontaire d’un dysfonctionnement est interdite. Signaler les bugs au staff.']
];
const roleplay=[
['Fear RP','Le danger doit être pris au sérieux : peur, hésitation, fuite ou obéissance doivent être jouées selon la situation.'],
['Nom de famille','Un nom appartenant à une famille notoire du lore ne peut être obtenu que par une naissance.'],
['Vol / Arnaque','Une arnaque RP peut atteindre au maximum 2 500 Dragondors.'],
['Potions','Les effets affichés des potions doivent être réellement joués, y compris l’amnésie.'],
['Coma','Ne pas mettre quelqu’un dans le coma uniquement pour lui faire perdre la mémoire. Il exige une cause grave et cohérente.'],
['RP Mage noir','Arc sombre sur ticket et autorisation staff pour les élèves. Capture ou accusation peut mener à la prison à vie et au RPK.'],
['Lycanthropie','Transformation forcée interdite. Infection sous contrôle staff, avec perte de contrôle, exposition et risque de mort.'],
['Lettre RP','Les lettres passent par le système en jeu, avec délai et contexte logiques. Les lettres Discord sont du metagaming.'],
['Incantation des sorts','Incantation verbale obligatoire avant chaque sort. Seules les formules du lore sont autorisées.'],
['Cohérence du personnage','Âge, passé, compétences et réactions doivent rester cohérents. Aucun personnage invincible ou omniscient. Pouvoirs et savoirs se gagnent en RP.'],
['Rec','Il est important d’enregistrer les scènes afin de pouvoir se défendre en BDA.'],
['Bully RP','Autorisé seulement si mutuel et cohérent. Harcèlement abusif, blocage du jeu et justification HRP sont interdits.'],
['Main character','Ne pas voler les scènes, interrompre les autres, forcer leur attention ou s’attribuer rôles, pouvoirs et prophéties sans autorisation.'],
['Respect des conséquences','Toute action entraîne des conséquences. Les indices, imprudences et expositions doivent être assumés.'],
['Autorité du personnel','Direction, professeurs et surveillants sont des autorités RP. Fear RP et comportement cohérent obligatoires.'],
['Temporalité','Deux semaines IRL correspondent à une année scolaire. Le personnage a exactement 15 ans à sa rentrée.'],
['Changement de maison','Changement de maison, wipe ou RPK forcé pour changer de maison sont interdits sous peine de bannissement définitif.']
];
function make(section:string,items:string[][],critical:string[]=[]):Rule[]{return items.map((x,i)=>({section,number:i+1,title:x[0],text:x[1],critical:critical.includes(x[0])}))}
export const rules:Rule[]=[...make('Lexique RP',lex,['Cheat / Use bug','ERP à caractère sexuel']),...make('Général',general,['Nom Roleplay','Use Bug']),...make('RolePlay',roleplay,['RP Mage noir','Changement de maison']),
{section:'RPK On',number:1,title:'Forêt interdite / Cathédrale / Grotte',text:'Zones sous risque RPK. Une rencontre ne justifie pas un meurtre : privilégier le RP. Entrée à vos risques et périls.',critical:true},
{section:'RPK On',number:2,title:'Bureau du directeur',text:'Sans invitation, l’entrée expose à un RPK possible sans porte de sortie.',critical:true},
{section:'Famille',number:1,title:'Effectif des familles',text:'Familles notoires : 7 élèves et 3 autres. Familles sur dossier : 4 élèves et 1 autre.'},
{section:'Vocal',number:1,title:'Enregistrement des communications vocales',text:'En jouant, vous acceptez que GREAT OWL STUDIO capte et conserve jusqu’à 24 mois les communications en jeu et sur le Discord officiel pour la modération, les réclamations et les preuves. Le serveur est réservé aux majeurs. Droits d’accès, suppression, opposition, rectification et limitation : direction@great-owl-studio.fr. D’autres joueurs peuvent aussi enregistrer ou diffuser sous leur propre responsabilité.'}
];
export const ruleSections=['Toutes','Lexique RP','Général','RolePlay','RPK On','Famille','Vocal'];
