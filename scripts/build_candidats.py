#!/usr/bin/env python3
"""Génère data/candidats.json : biographies (source Wikipédia) et résultats aux présidentielles 2012-2017-2022.
Résultats du premier tour (et du second, le cas échéant) tirés des pages Wikipédia
« Élection présidentielle française de 2012 / 2017 / 2022 »."""
import json, urllib.parse

W = lambda t: 'https://fr.wikipedia.org/wiki/' + urllib.parse.quote(t.replace(' ', '_'))
ELEC = {
    2012: W('Élection présidentielle française de 2012'),
    2017: W('Élection présidentielle française de 2017'),
    2022: W('Élection présidentielle française de 2022'),
}

def r(year, who, party, t1, t2=None, note=None):
    return {'year': year, 'who': who, 'party': party, 't1': t1, 't2': t2, 'note': note}

def none(year, note):
    return {'year': year, 'who': None, 'party': None, 't1': None, 't2': None, 'note': note}

C = {}

C['arthaud'] = dict(
    wiki='Nathalie Arthaud', logo='lo.svg',
    born='23 février 1970, Peyrins (Drôme)',
    bio="Enseignante en économie et gestion, Nathalie Arthaud s'engage d'abord aux Jeunesses communistes avant de rejoindre Lutte ouvrière en 1988. Conseillère municipale de Vaulx-en-Velin de 2008 à 2014, elle devient la même année porte-parole nationale du parti, après avoir été celle d'Arlette Laguiller en 2007. Elle porte les couleurs de LO à chaque présidentielle depuis 2012.",
    reperes=[[1988, "Adhère à Lutte ouvrière"], [2008, "Conseillère municipale de Vaulx-en-Velin ; devient porte-parole nationale de LO"], [2012, "Première candidature à la présidentielle"], [2022, "Troisième candidature à la présidentielle"], [2027, "Candidate déclarée à la présidentielle"]],
    results=[r(2012, 'Nathalie Arthaud', 'LO', 0.56), r(2017, 'Nathalie Arthaud', 'LO', 0.64), r(2022, 'Nathalie Arthaud', 'LO', 0.56)],
    resultsNote=None)

C['kazib'] = dict(
    wiki='Anasse Kazib', logo='rp.png',
    born='2 janvier 1987, Sarcelles (Val-d’Oise)',
    bio="Cheminot, délégué syndical SUD Rail au Bourget, Anasse Kazib se fait connaître lors de la grève de 2018 puis comme chroniqueur télé. Militant du courant Révolution permanente, issu du NPA et devenu indépendant en 2021, il tente de se présenter à la présidentielle de 2022 mais ne réunit que 160 parrainages. Il a annoncé en juin 2026 une candidature « ouvrière, communiste et révolutionnaire » pour 2027.",
    reperes=[[2017, "Rejoint le Courant communiste révolutionnaire, au sein du NPA"], [2018, "Figure de la grève des cheminots ; chroniqueur aux Grandes Gueules"], [2021, "Révolution permanente quitte le NPA ; pré-candidature à la présidentielle"], [2022, "Candidature non validée faute de parrainages (160)"], [2026, "Annonce sa candidature pour 2027"]],
    results=[none(2012, "Révolution permanente n'existait pas encore."), none(2017, "Révolution permanente n'existait pas encore en tant que parti."), none(2022, "Candidature non validée : 160 parrainages recueillis, sur 500 requis.")],
    resultsNote="Révolution permanente, indépendante du NPA depuis 2021, n'a jamais figuré sur un bulletin de présidentielle.")

C['labib'] = dict(
    wiki='Nouveau Parti anticapitaliste', logo='npa.svg',
    born=None,
    bio="Conductrice de bus, Selma Labib est porte-parole du NPA – Révolutionnaires, issu de la scission du NPA. Elle conduit avec Gaël Quirante la liste du NPA-R aux européennes de 2024, après l'échec des négociations avec Lutte ouvrière. Le NPA-R la présente à la présidentielle de 2027.",
    reperes=[[2024, "Tête de liste du NPA-R aux élections européennes, avec Gaël Quirante"], [2027, "Candidate du NPA – Révolutionnaires à la présidentielle"]],
    results=[r(2012, 'Philippe Poutou', 'NPA', 1.15), r(2017, 'Philippe Poutou', 'NPA', 1.09), r(2022, 'Philippe Poutou', 'NPA', 0.76)],
    resultsNote="Selma Labib n'a jamais été candidate : ces scores sont ceux du NPA, dont le NPA – Révolutionnaires est issu, avec Philippe Poutou.")

C['melenchon'] = dict(
    wiki='Jean-Luc Mélenchon', logo='lfi.svg',
    born='19 août 1951, Tanger',
    bio="Militant trotskiste (OCI) dans les années 1970, Jean-Luc Mélenchon entre au Parti socialiste, devient sénateur de l'Essonne en 1986 puis ministre délégué à l'Enseignement professionnel (2000-2002). Il quitte le PS en 2008 pour fonder le Parti de gauche, puis La France insoumise en 2016. Troisième de la présidentielle de 2022 avec 22 %, il a annoncé en 2026 sa candidature pour 2027.",
    reperes=[[1986, "Sénateur de l'Essonne"], [2000, "Ministre délégué à l'Enseignement professionnel"], [2008, "Quitte le PS ; fonde le Parti de gauche"], [2016, "Fonde La France insoumise"], [2022, "Chef de file de la NUPES aux législatives"], [2026, "Annonce sa candidature pour 2027"]],
    results=[r(2012, 'Jean-Luc Mélenchon', 'Front de gauche', 11.10), r(2017, 'Jean-Luc Mélenchon', 'LFI', 19.58), r(2022, 'Jean-Luc Mélenchon', 'LFI', 21.95)],
    resultsNote=None)

C['roussel'] = dict(
    wiki='Fabien Roussel', logo='pcf.svg',
    born='16 avril 1969, Béthune (Pas-de-Calais)',
    bio="Issu d'une famille de militants communistes, Fabien Roussel adhère au mouvement des jeunes communistes à 16 ans. Député du Nord de 2017 à 2024, il dirige le PCF comme secrétaire national depuis 2018 et est maire de Saint-Amand-les-Eaux depuis 2025. Candidat en 2022 (2,28 %), il a de nouveau été désigné par son parti pour 2027.",
    reperes=[[1985, "Adhère au Mouvement des jeunes communistes"], [2017, "Élu député du Nord"], [2018, "Secrétaire national du PCF"], [2022, "Candidat à la présidentielle : 8e avec 2,28 %"], [2025, "Maire de Saint-Amand-les-Eaux"], [2026, "Désigné candidat pour 2027"]],
    results=[r(2012, 'Jean-Luc Mélenchon', 'Front de gauche', 11.10, note="Le PCF soutenait Jean-Luc Mélenchon."), r(2017, 'Jean-Luc Mélenchon', 'LFI', 19.58, note="Le PCF soutenait Jean-Luc Mélenchon."), r(2022, 'Fabien Roussel', 'PCF', 2.28)],
    resultsNote="En 2012 et 2017, le PCF n'avait pas de candidat propre.")

C['glucksmann'] = dict(
    wiki='Raphaël Glucksmann', logo='pp.svg',
    born='15 octobre 1979, Boulogne-Billancourt',
    bio="Documentariste et essayiste, fils du philosophe André Glucksmann, Raphaël Glucksmann a été conseiller du président géorgien Saakachvili de 2009 à 2012. Il fonde Place publique en 2018 et mène en 2019 la liste PS-PP-Nouvelle Donne qui l'envoie au Parlement européen. Il a remporté la primaire socialiste le 11 octobre 2026, après s'être déclaré candidat le 23 août.",
    reperes=[[2009, "Conseiller de Mikheil Saakachvili en Géorgie"], [2018, "Fonde Place publique"], [2019, "Élu député européen"], [2026, "Remporte la primaire socialiste (11 octobre)"]],
    results=[none(2012, "Place publique n'existait pas."), none(2017, "Place publique n'existait pas."), none(2022, "Place publique n'a pas présenté de candidat.")],
    resultsNote="Place publique, fondée en 2018, n'a jamais présenté de candidat à une présidentielle.")

C['bouamrane'] = dict(
    wiki='Karim Bouamrane', logo='ps.png',
    born='21 février 1973, Clichy',
    bio="Fils d'un ouvrier du bâtiment marocain, Karim Bouamrane a grandi à Saint-Ouen. Membre du Parti communiste de 1995 à 2014 et conseiller municipal, il rejoint le PS en 2014 et dirige une première liste sans succès. Maire de Saint-Ouen-sur-Seine depuis 2020 (réélu en 2026) et conseiller départemental de Seine-Saint-Denis, il s'est déclaré candidat à la présidentielle de 2027.",
    reperes=[[1995, "Adhère au PCF ; conseiller municipal de Saint-Ouen"], [2014, "Rejoint le PS ; conduit une liste aux municipales"], [2020, "Élu maire de Saint-Ouen-sur-Seine"], [2021, "Conseiller départemental de Seine-Saint-Denis"], [2026, "Réélu maire ; candidat déclaré à la présidentielle"]],
    results=[r(2012, 'François Hollande', 'PS', 28.63, 51.64, "Élu président de la République."), r(2017, 'Benoît Hamon', 'PS', 6.36), r(2022, 'Anne Hidalgo', 'PS', 1.74)],
    resultsNote="Karim Bouamrane n'a jamais été candidat : ces scores sont ceux du candidat du Parti socialiste.")

C['tondelier'] = dict(
    wiki='Marine Tondelier', logo='ecologistes.svg',
    born='23 août 1986, Bois-Bernard (Pas-de-Calais)',
    bio="Élue d'opposition à Hénin-Beaumont depuis 2014, Marine Tondelier a affronté trois fois Marine Le Pen aux législatives. Conseillère régionale des Hauts-de-France depuis 2021, elle devient secrétaire nationale d'EELV en 2022 et rebaptise le parti « Les Écologistes » en 2023. Réélue en 2025, elle a joué un rôle central dans la formation du Nouveau Front populaire en 2024.",
    reperes=[[2009, "Adhère à EELV"], [2014, "Conseillère municipale d'opposition à Hénin-Beaumont"], [2021, "Conseillère régionale des Hauts-de-France"], [2022, "Secrétaire nationale d'EELV"], [2024, "Participe à la formation du Nouveau Front populaire"], [2025, "Réélue à la tête du parti"]],
    results=[r(2012, 'Eva Joly', 'EELV', 2.31), none(2017, "Pas de candidat : Yannick Jadot s'est retiré au profit de Benoît Hamon."), r(2022, 'Yannick Jadot', 'EELV', 4.63)],
    resultsNote="Marine Tondelier n'a jamais été candidate : ces scores sont ceux du candidat des écologistes.")

C['philippe'] = dict(
    wiki='Édouard Philippe', logo='horizons.svg',
    born='28 novembre 1970, Rouen',
    bio="Énarque et membre du Conseil d'État, Édouard Philippe cofonde l'UMP en 2002. Maire du Havre de 2010 à 2017, député en 2012, il est Premier ministre d'Emmanuel Macron de 2017 à 2020, période marquée par les Gilets jaunes et la crise du Covid-19. Revenu à la mairie du Havre, il crée le parti Horizons en 2021 et annonce en 2024 sa candidature pour 2027.",
    reperes=[[2002, "Participe à la création de l'UMP"], [2010, "Maire du Havre"], [2017, "Premier ministre (jusqu'en 2020)"], [2021, "Crée le parti Horizons"], [2024, "Annonce sa candidature pour 2027"]],
    results=[none(2012, "Horizons n'existait pas."), none(2017, "Horizons n'existait pas."), r(2022, 'Emmanuel Macron', 'LREM', 27.85, 58.55, "Horizons, fondé en 2021, soutenait Emmanuel Macron.")],
    resultsNote="Horizons, créé en 2021, n'a jamais présenté de candidat propre.")

C['attal'] = dict(
    wiki='Gabriel Attal', logo='renaissance.svg',
    born='16 mars 1989, Clamart (Hauts-de-Seine)',
    bio="Militant socialiste de 2006 à 2016, Gabriel Attal rejoint En marche en 2016 et devient député des Hauts-de-Seine en 2017. Secrétaire d'État puis ministre de l'Éducation nationale, il est nommé Premier ministre en janvier 2024, à 34 ans, le plus jeune de l'histoire. Président du groupe Ensemble pour la République à l'Assemblée, il est secrétaire général de Renaissance depuis décembre 2024.",
    reperes=[[2006, "Militant au Parti socialiste (jusqu'en 2016)"], [2016, "Rejoint En marche"], [2017, "Élu député"], [2024, "Premier ministre (janvier-septembre)"], [2024, "Secrétaire général de Renaissance"]],
    results=[none(2012, "Le parti n'existait pas (En marche est fondé en 2016)."), r(2017, 'Emmanuel Macron', 'En marche', 24.01, 66.10, "Élu président de la République."), r(2022, 'Emmanuel Macron', 'LREM', 27.85, 58.55, "Réélu président de la République.")],
    resultsNote="Gabriel Attal n'a jamais été candidat : ces scores sont ceux d'Emmanuel Macron, fondateur du parti.")

C['retailleau'] = dict(
    wiki='Bruno Retailleau', logo='lr.svg',
    born='20 novembre 1960, Cholet (Maine-et-Loire)',
    bio="Élu conseiller général de Vendée en 1988, Bruno Retailleau préside le département (2010-2015) puis la région Pays de la Loire (2015-2017). Député en 1994, sénateur de 2004 à 2024 et depuis 2025, il préside le groupe LR au Sénat de 2014 à 2024. Ministre de l'Intérieur de septembre 2024 à octobre 2025, il prend la tête des Républicains en 2025 et en devient le candidat à la présidentielle.",
    reperes=[[1988, "Conseiller général de la Vendée"], [2004, "Sénateur de la Vendée"], [2014, "Président du groupe LR au Sénat"], [2024, "Ministre de l'Intérieur"], [2025, "Élu président des Républicains"]],
    results=[r(2012, 'Nicolas Sarkozy', 'UMP', 27.18, 48.36), r(2017, 'François Fillon', 'LR', 20.01), r(2022, 'Valérie Pécresse', 'LR', 4.78)],
    resultsNote="Bruno Retailleau n'a jamais été candidat : ces scores sont ceux du candidat de la droite (UMP puis LR).")

C['lisnard'] = dict(
    wiki='David Lisnard', logo='nouvelle-energie.png',
    born='2 février 1969, Limoges',
    bio="Diplômé de Sciences Po Bordeaux, David Lisnard est conseiller général des Alpes-Maritimes depuis 2008 et maire de Cannes depuis 2014. Il préside l'Association des maires de France. Longtemps membre de LR, dont il était vice-président, il quitte le parti en 2026 et se déclare candidat à la présidentielle de 2027 avec Nouvelle Énergie, le parti libéral de droite qu'il a fondé.",
    reperes=[[2008, "Conseiller général des Alpes-Maritimes"], [2014, "Maire de Cannes"], [2017, "Président de l'agglomération Cannes Pays de Lérins"], [2026, "Quitte LR ; candidat avec Nouvelle Énergie"]],
    results=[none(2012, "Nouvelle Énergie n'existait pas."), none(2017, "Nouvelle Énergie n'existait pas."), none(2022, "Nouvelle Énergie n'avait pas de candidat.")],
    resultsNote="Nouvelle Énergie n'a jamais présenté de candidat à une présidentielle.")

C['dupontaignan'] = dict(
    wiki='Nicolas Dupont-Aignan', logo='dlf.png',
    born='7 mars 1961, Paris',
    bio="Énarque passé par le RPR puis l'UMP, Nicolas Dupont-Aignan fonde Debout la République, devenu Debout la France, parti gaulliste et souverainiste. Maire d'Yerres de 1995 à 2017 et de nouveau depuis 2026, député de l'Essonne de 1997 à 2024, il est candidat à la présidentielle en 2012, 2017 et 2022. Entre les deux tours de 2017, il noue une alliance avec Marine Le Pen, rompue après l'élection.",
    reperes=[[1995, "Maire d'Yerres"], [1997, "Député de l'Essonne"], [2012, "Première candidature à la présidentielle"], [2017, "Alliance avec Marine Le Pen entre les deux tours"], [2024, "Battu aux législatives"], [2026, "Retrouve la mairie d'Yerres"]],
    results=[r(2012, 'Nicolas Dupont-Aignan', 'DLR', 1.79), r(2017, 'Nicolas Dupont-Aignan', 'DLF', 4.70), r(2022, 'Nicolas Dupont-Aignan', 'DLF', 2.06)],
    resultsNote=None)

C['lepen'] = dict(
    wiki='Marine Le Pen', logo='rn.svg',
    born='5 août 1968, Neuilly-sur-Seine',
    bio="Engagée au Front national en 1986, Marine Le Pen siège au Parlement européen de 2004 à 2017 et préside le FN de 2011 à 2021, avant de le rebaptiser Rassemblement national. Finaliste de la présidentielle en 2017 et 2022, elle est députée du Pas-de-Calais et préside le groupe RN à l'Assemblée. Condamnée en 2025 puis en appel en 2026 dans l'affaire des assistants parlementaires, elle s'est pourvue en cassation et officialise sa candidature pour 2027.",
    reperes=[[1986, "Adhère au Front national"], [2011, "Présidente du FN"], [2017, "Finaliste de la présidentielle ; élue députée"], [2022, "Finaliste de la présidentielle (41,45 % au second tour)"], [2025, "Condamnée en première instance (assistants parlementaires)"], [2026, "Peine réduite en appel ; officialise sa candidature"]],
    results=[r(2012, 'Marine Le Pen', 'FN', 17.90), r(2017, 'Marine Le Pen', 'FN', 21.30, 33.90), r(2022, 'Marine Le Pen', 'RN', 23.15, 41.45)],
    resultsNote=None)

C['zemmour'] = dict(
    wiki='Éric Zemmour', logo='reconquete.svg',
    born='31 août 1958, Montreuil',
    bio="Diplômé de Sciences Po, Éric Zemmour a été journaliste au Figaro et chroniqueur à la radio et à la télévision, et il a publié des essais à succès. Il a été condamné à plusieurs reprises pour provocation à la haine et diffamation. Candidat à la présidentielle de 2022 (7,07 %, quatrième), il fonde Reconquête et annonce en septembre 2026 qu'il se représente en 2027.",
    reperes=[[1986, "Journaliste au Quotidien de Paris, puis au Figaro (1996)"], [2021, "Fonde Reconquête"], [2022, "Candidat à la présidentielle : 4e avec 7,07 %"], [2022, "Éliminé au premier tour des législatives (Var)"], [2026, "Annonce sa candidature pour 2027"]],
    results=[none(2012, "Reconquête n'existait pas."), none(2017, "Reconquête n'existait pas."), r(2022, 'Éric Zemmour', 'Reconquête', 7.07)],
    resultsNote=None)

out = {
    'updated': '2026-10-23',
    'note': "Biographies rédigées à partir des articles Wikipédia ; résultats : premier tour (et second tour pour les finalistes) des présidentielles 2012, 2017 et 2022.",
    'elections': {str(y): u for y, u in ELEC.items()},
    'candidates': {},
}
for k, c in C.items():
    c['source'] = {'label': 'Wikipédia · ' + c['wiki'], 'url': W(c['wiki'])}
    out['candidates'][k] = c
json.dump(out, open('data/candidats.json', 'w'), ensure_ascii=False, indent=1)
print(len(C), 'candidats')
