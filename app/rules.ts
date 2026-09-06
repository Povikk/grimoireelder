export type Rule={section:string;number:number;title:string;text:string;critical?:boolean};
const lex=[
['Metagaming',`Le metagaming est interdit. Utiliser des informations obtenues hors RP — vocal, chat, streams ou autre — pour avantager votre personnage en RP est strictement sanctionné.`],
['Freekill',`Le freekill est interdit. Tuer un joueur sans raison RP valable ou sans contexte est sanctionné. Chaque action violente doit être justifiée en RP.`],
['Revenge Kill',`Le revenge kill est interdit. Vous ne pouvez pas revenir vous venger après la mort de votre personnage. Une mort RP implique une perte de mémoire des événements ayant mené à celle-ci.`],
['Free Attack',`Le free attack est interdit. Attaquer un joueur sans raison RP valable ou sans interaction préalable est sanctionné. Toute agression doit être logique, justifiée et jouée en RP.`],
['Fear RP',`Le Fear RP est obligatoire. Votre personnage n’est pas invincible : il doit réagir avec réalisme et prudence face à une menace sérieuse, comme une prise d’otage, la torture ou le surnombre. Ignorer le danger, provoquer volontairement en situation de faiblesse ou foncer sans réfléchir est considéré comme du No-Fear.

Exemples : se moquer ou attaquer quelqu’un sans être en position de le faire ; refuser toute peur face à un supérieur ou un adversaire beaucoup plus puissant ; tenter de fuir sans logique alors que le personnage est maîtrisé ou gravement blessé.`],
['Bunny Hopping',`Le bunny hopping — sauter sans cesse pour esquiver ou exploiter le déplacement — est interdit lorsqu’il procure un avantage déloyal en combat ou en fuite. Votre personnage doit agir de façon réaliste : sauter continuellement nuit à l’immersion et à l’équilibre du jeu.`],
['Cheat / Use bug',`L’utilisation de cheats, scripts, mods non autorisés ou l’exploitation de bugs et glitches pour obtenir un avantage est strictement interdite. Toute triche détectée entraîne des sanctions immédiates pouvant aller jusqu’au bannissement définitif.`],
['Mass RP',`Le Mass RP consiste à tenir compte de la présence passive des PNJ et civils dans les lieux publics. Vous devez adapter votre comportement à l’environnement et aux personnes présentes.

Exemple : ne pas entrer dans le bureau du directeur sans y avoir été invité.`],
['Pain RP',`Le Pain RP est obligatoire. Votre personnage doit réagir de manière crédible à la douleur : grimacer, gémir, ralentir ou montrer des signes de souffrance. Ignorer ou minimiser une douleur excessive nuit à l’immersion et peut être sanctionné.

Exemples : continuer à courir normalement après une blessure grave ; ne montrer aucune réaction à des attaques ou blessures visibles.`],
['StreamHack',`Utiliser des informations obtenues en regardant le stream d’un autre joueur afin d’en tirer un avantage en jeu est strictement interdit. Les sanctions peuvent aller jusqu’au bannissement permanent.`],
['Force RP',`Le Force RP est interdit. Vous ne devez jamais imposer une action, une interaction ou une conséquence RP à un autre joueur sans son accord préalable. Le RP se pratique dans le respect et le consentement mutuel.`],
['Power Gaming',`Le Power Gaming est interdit. Il consiste à exploiter la physique ou les mécaniques du jeu pour réaliser des actions impossibles dans l’univers.`],
['Safe RP',`Le Safe RP — jouer systématiquement pour protéger son personnage ou ses biens sans jamais prendre de risque — est interdit. Fuir ou se protéger de manière irréaliste afin d’éviter toute conséquence nuit à l’immersion. Votre personnage doit accepter les risques liés à ses choix.`],
['Win RP',`Le Win RP est interdit. Il consiste à faire réussir constamment son personnage, sans obstacle, échec ni conséquence. Le RP doit rester équilibré et laisser place à des victoires comme à des défaites crédibles.`],
['Logique RP',`Le personnage doit rester cohérent avec l’univers et le serveur. Son caractère, son histoire ou son apparence physique ne peuvent pas changer soudainement sans justification RP crédible et progressive. Toute évolution doit être logique et jouée en RP.`],
['NLR (New Life Rule)',`Après la mort de votre personnage, vous devez oublier les événements, rencontres, positions et conflits survenus durant les 15 minutes précédentes. Le retour sur la zone de la mort est interdit pendant au moins 20 minutes, sauf accord RP ou validation du staff.`],
['RPK Flash',`Le RPK Flash — tuer un joueur immédiatement après l’avoir croisé, sans interaction ni contexte — est strictement interdit. Chaque meurtre doit reposer sur un scénario cohérent, une interaction préalable et un ticket RPK validé par le staff.

Une scène de RPK doit prendre le temps de rendre hommage au personnage dont la whitelist prend fin : elle doit être profonde, développée et agréable à jouer pour les deux parties.

Cette condition ne s’applique pas en cas de No-Fear ou de non-respect des zones RPK On du règlement.`],
['AFK Farm',`Faire progresser son personnage ou gagner des ressources en restant inactif est interdit. Toute exploitation d’un système en étant AFK nuit à l’équilibre du serveur et à l’expérience des autres.`],
['Roll',`Chaque /roll pour une même action doit être espacé d’une minute, sauf en cas d’échec critique.

De 1 à 10 : échec critique.
De 11 à 49 : échec.
De 50 à 89 : réussite.
De 90 à 100 : réussite critique.

Les rolls doivent occuper une place importante dans votre RP passif. Par exemple, après avoir raté un /roll pour voler les clés de quelqu’un, vous devrez attendre une minute avant de réessayer.`],
['FairPlay',`Chaque joueur s’engage à respecter les autres, à jouer honnêtement et à ne pas rechercher d’avantage injuste. Respect, courtoisie et bonne humeur sont essentiels à une expérience équitable. Toute attitude contraire au fair-play peut entraîner des sanctions.`],
['Double Voc',`Il est interdit d’être connecté en vocal Discord tout en jouant une scène RP, afin de préserver l’immersion et d’éviter les échanges d’informations HRP susceptibles de désavantager les autres joueurs.`],
['ERP à caractère sexuel',`Les scènes à caractère sexuel sont interdites. Les romances entre personnages restent autorisées lorsqu’elles demeurent respectueuses du roleplay.`],
['Insinuations HRP',`Les insinuations HRP sont interdites car elles nuisent à l’immersion.

Exemples : remplacer « Je suis dans ma tête » par « J’ai besoin de rester seul un peu » ou par un /it indiquant que le personnage semble absorbé ; poser sur Discord une question concernant une touche ; parler d’un sort appris plutôt que d’un sort « débloqué » ; dire qu’un personnage doit apprendre un sortilège ou rattraper son retard plutôt qu’évoquer une mécanique de jeu.

Les insinuations HRP sont passibles de sanctions.`]
];
const general=[
['Nom Roleplay','Nom original et crédible au format Prénom Nom. Noms réels, célèbres, connus, trolls, offensants, chiffres et majuscules abusives interdits.'],
['Vocabulaire','Vocabulaire adapté à l’univers. Propos haineux, discriminatoires ou harcelants interdits en RP comme hors RP.'],
['Sanctions','Les infractions peuvent mener à un avertissement, kick ou bannissement. Les recours se font respectueusement par ticket.'],
['Langage HRP','Le langage hors roleplay est interdit pendant les interactions en jeu.'],
['Publicité','Toute publicité ou invitation pour un autre serveur RP est interdite.'],
['Soundboards / Voice mods','Soundboards et outils de modification de voix sont interdits en vocal durant les sessions RP.'],
['Arnaque / Boutique','Fraude dans la boutique et manipulation du staff pour obtenir argent ou avantages sont interdites.'],
['Partage de compte','Chaque joueur doit utiliser son compte personnel. Le partage de compte est interdit.'],
['Contestation','Toute contestation passe par un ticket Discord. Spam ou harcèlement du staff en privé interdit.'],
['Déconnexion en scène','Se déconnecter pour fuir une scène ou ses conséquences est interdit. Signaler immédiatement un crash réel par ticket.'],
['Mention staff','Ne pas mentionner le staff sans raison valable. Utiliser les tickets.'],
['Use Bug','Toute exploitation volontaire d’un dysfonctionnement est interdite. Signaler les bugs au staff.']
];
const roleplay=[
['Fear RP','Le danger doit être pris au sérieux : professeur, directeur, créature ou menace. Vous devez jouer la peur, l’hésitation, la fuite ou l’obéissance. Un refus total de Fear RP peut entraîner de véritables conséquences RP.'],
['Nom de famille','Pour porter le nom d’une famille originelle, notable ou réputée du lore d’Elderwood, il faut attendre une naissance validée par le staff.'],
['/me, /it et /na',`Les narrations du tchat servent l’immersion.

Le /me décrit une action physique de votre personnage : porter une tasse à ses lèvres, sourire, tendre la main ou froncer les sourcils.

Le /it décrit l’environnement ou une impression visible, jamais directement une pensée : une tension ressentie dans la forêt, une salle devenue anormalement froide ou la pluie mêlée aux larmes d’un personnage.

Le /na est une narration globale envoyée à tout le serveur. Elle ne doit pas être spammée et doit relater un changement important réellement provoqué en RP.

Les pensées ne doivent jamais être dévoilées par /me, /it ou /na. Il est seulement possible de suggérer un état visible, par exemple qu’un personnage semble pensif.

En cas de RPK, l’auteur décrit l’action en /me ou /it selon sa nature. Un /na est possible mais facultatif. Le joueur décédé peut écrire un texte de fin en /na sans révéler comment ni par qui il est mort.`],
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
...make('RPK On',[
['Interdiction d’attirer quelqu’un dans une zone RPK pour le tuer (Force RP)',`Vous ne pouvez pas amener quelqu’un contre son gré dans une zone RPK afin qu’il y soit tué sans ticket RPK actif.

Vous devez posséder un ticket RPK pour tuer quelqu’un, ou avoir son accord HRP. En cas d’accord HRP, la personne tuée doit le signaler au staff par ticket afin que son consentement soit vérifié.

Une autorisation ou un ticket RPK ne supprime jamais les conséquences RP du meurtre.`],
['Forêt de Brûlebrume','Zone à risque RPK : entrez à vos risques et périls. Selon les situations rencontrées, vous pouvez y trouver la mort.'],
['Cathédrale abandonnée et cimetière','Zone à risque RPK : entrez à vos risques et périls. Vous pouvez y trouver la mort selon la situation, mais personne ne peut vous y tuer sans ticket RPK.'],
['Grottes','Zone à risque RPK : entrez à vos risques et périls. Vous pouvez y trouver la mort selon la situation, mais personne ne peut vous y tuer sans ticket RPK.'],
['Île de la Tour',`Zone à très haut risque RPK. Au large d’Elderwood se trouve une île portant une grande tour en ruines et un phare abandonné.

Vous y aventurer sans invitation vous soumet au RPK de ses occupants, qui seront libres de vous tuer ou non, sans porte de sortie.`],
['Bureau du Directeur d’Elderwood','N’entrez jamais sans invitation. Toute intrusion vous expose à un RPK sans porte de sortie.'],
['Siège de l’AMRU',`Ne vagabondez jamais dans le siège de l’Autorité Magique du Royaume-Uni sans autorisation. En dehors du hall central public, entrer dans une zone non accessible à tous sans invitation vous soumet au RPK sans porte de sortie.`],
['Prison de Brise-Flux',`Entrer dans la prison sans laisser-passer de l’AMRU ou autorisation spécifique vous soumet au RPK sans porte de sortie.

La zone autour de la prison est également soumise au RPK. Tant que vous n’êtes pas entré, une porte de sortie vous sera offerte. En cas de récidive dans cette zone, aucune porte de sortie ne sera accordée.`]
],['Interdiction d’attirer quelqu’un dans une zone RPK pour le tuer (Force RP)','Forêt de Brûlebrume','Cathédrale abandonnée et cimetière','Grottes','Île de la Tour','Bureau du Directeur d’Elderwood','Siège de l’AMRU','Prison de Brise-Flux']),
...make('Familles',[
['Les familles et leur hiérarchie',`Les familles originelles, notables et réputées sont connues au Royaume-Uni comme des familles de sang pur possédant un titre de noblesse magique.

Familles originelles : Dravenholt, Caerwyn, Hearthbane et Valemont.
Familles notables : Belladorn et Ravenscroft.
Familles réputées : elles seront ajoutées après l’ouverture du serveur selon la validation des dossiers joueurs.

Une famille non officielle peut aussi être de sang pur, sans bénéficier de la même notoriété. Est considéré comme sang pur le descendant d’au moins cinq générations de Résonants de sang pur.`],
['Effectif des familles',`Familles originelles : 6 places joueurs et 2 places streamers.
Familles notables : 6 places joueurs et 1 place streamer.
Familles réputées : 6 places joueurs.

Une famille non officielle sans dossier peut compter au maximum 5 membres portant le même nom. Les branches ou liens de cousinage utilisant des noms différents ne sont pas acceptés.`],
['Poser un dossier Famille',`Une famille non officielle composée de plus de 3 joueurs doit être signalée au staff par ticket avec la liste de ses joueurs et personnages.

Si elle est enregistrée, active et influente sur le plateau, elle pourra proposer un dossier pour devenir une famille officielle réputée. Le staff évaluera son potentiel et décidera de sa validation.`],
['Évoluer avec sa famille',`Selon le RP, l’impact et les actions réalisées, une famille peut évoluer ou régresser : une famille non officielle peut devenir réputée, puis notable ; une famille notable peut redevenir réputée, puis non officielle.

Toute évolution ou rétrogradation est discutée et décidée par le staff.`]
]),
{section:'Vocal',number:1,title:'Enregistrement des communications vocales',text:'En jouant, vous acceptez que GREAT OWL STUDIO capte et conserve jusqu’à 24 mois les communications en jeu et sur le Discord officiel pour la modération, les réclamations et les preuves. Le serveur est réservé aux majeurs. Droits d’accès, suppression, opposition, rectification et limitation : direction@great-owl-studio.fr. D’autres joueurs peuvent aussi enregistrer ou diffuser sous leur propre responsabilité.'}
];
export const ruleSections=['Toutes','Lexique RP','Général','RolePlay','RPK On','Familles','Vocal'];
