var app = {
	title: "Riddle Rush",
	subtitle: "Das ultimative Ratespiel für Freunde & Familie",
	description: "Ein spannendes Wortratespiel für Freunde und Familie. Offline spielbar, perfekt für Spieleabende!"
};
var common = {
	loading: "Laden...",
	error: "Fehler",
	close: "Schließen",
	cancel: "Abbrechen",
	confirm: "Bestätigen",
	save: "Speichern",
	"delete": "Löschen",
	edit: "Bearbeiten",
	share: "Teilen",
	back: "Zurück",
	ok: "OK",
	next: "WEITER",
	category: "Kategorie",
	letter: "Buchstabe"
};
var home = {
	offline_badge: "Offline spielbar",
	quick_start: "Schnellstart",
	category_title: "Verfügbare Kategorien",
	category_description: "Kategorien werden zufällig pro Runde ausgewählt",
	load_more: "Mehr Kategorien",
	about_link: "Über das Spiel",
	loading_categories: "Kategorien werden geladen...",
	starting_game: "Spiel wird gestartet..."
};
var features = {
	offline: {
		title: "Offline Spielen",
		description: "Keine Internetverbindung nötig"
	},
	multiplayer: {
		title: "Multiplayer",
		description: "Perfekt für Spieleabende"
	},
	installable: {
		title: "Installierbar",
		description: "Als App installieren"
	}
};
var game = {
	title: "Spielen",
	round: "Runde",
	players: "Spieler",
	current_turn: "Aktueller Zug",
	score: "Punkte",
	attempts: "Versuche",
	starts_with: "Beginnt mit",
	your_answer: "Deine Antwort...",
	submit: "Senden",
	skip: "Überspringen",
	new_round: "Neue Runde",
	checking: "Prüfe...",
	correct: "Richtig! +10 Punkte",
	incorrect: "Leider falsch",
	error_checking: "Fehler beim Überprüfen",
	other_answers: "Weitere Lösungen:",
	your_attempts: "Deine Versuche",
	category_loading: "Lade...",
	loading: "Wird geladen...",
	all_submitted: "Alle Spieler haben geantwortet!",
	go_to_scoring: "Zur Auswertung",
	new_round_started: "Neue Runde gestartet!",
	error_starting: "Fehler beim Starten des Spiels. Bitte versuche es erneut.",
	welcome: "Willkommen! Rate ein Wort aus der Kategorie.",
	resumed: "Spiel fortgesetzt!",
	error_resuming: "Fehler beim Laden des Spiels. Starte neu.",
	game_ended: "Spiel beendet! Sieh dir deine Statistiken an.",
	error_ending: "Fehler beim Speichern der Spielergebnisse",
	multiplayer_setup: "Spiel mit {0} Spielern gestartet!",
	error_multiplayer: "Fehler beim Einrichten des Mehrspieler-Spiels",
	next_round: "Nächste Runde gestartet!",
	error_next_round: "Fehler beim Starten der nächsten Runde",
	enter_answer: "Bitte gib eine Antwort ein",
	no_player: "Kein aktiver Spieler gefunden",
	answer_submitted: "Antwort eingereicht für {0}",
	answer_skipped: "{0} hat seinen Zug übersprungen",
	correct_answer: "Richtig!",
	incorrect_answer: "Falsch",
	no_active_session: "Bitte starte zuerst ein Spiel",
	error_submitting: "Fehler beim Einreichen der Antwort",
	wait_for_players: "Bitte warte, bis alle Spieler geantwortet haben"
};
var players = {
	title: "Spieler",
	max_players: "Maximal {0} Spieler erlaubt",
	added: "{0} hinzugefügt!",
	removed: "{0} entfernt",
	need_players: "Füge mindestens einen Spieler hinzu, um zu starten",
	ready: "{0} Spieler bereit!",
	lets_start: "Lasst uns die Show beginnen! 🎉",
	good_luck: "Viel Glück an alle! 🍀",
	may_the_best_win: "Möge der Beste gewinnen! 🏆",
	game_on: "Spiel beginnt! 🎮",
	lets_play: "Lasst uns spielen! 😃",
	showtime: "Vorstellung beginnt! ⭐",
	ready_set_go: "Bereit, los, geht's! 🚀",
	error_start: "Fehler beim Starten des Spiels. Bitte versuche es erneut.",
	name_required: "Bitte gib einen Spielernamen ein",
	name_too_short: "Spielername muss mindestens 1 Zeichen lang sein",
	name_too_long: "Spielername darf maximal 20 Zeichen lang sein",
	duplicate_name: "Ein Spieler mit diesem Namen existiert bereits",
	invalid_names: "Bitte korrigiere ungültige Spielernamen vor dem Start",
	enter_name: "Spielernamen eingeben"
};
var menu = {
	title: "Menü",
	settings: "Einstellungen",
	end_game: "Spiel Beenden",
	home: "Zur Startseite",
	share_score: "Score Teilen",
	close: "Schließen",
	play: "Spielen",
	language: "Sprache",
	credits: "Credits"
};
var pause = {
	title: "Spiel pausiert",
	message: "Spiel ist pausiert, drücke Fortsetzen zum Weiterspielen",
	resume: "Fortsetzen",
	restart: "Neustart",
	home: "Startseite"
};
var share = {
	game_title: "Riddle Rush - Das ultimative Ratespiel",
	game_text: "Spiel mit mir Riddle Rush! Ein spannendes Wortratespiel.",
	score_title: "Mein Riddle Rush Score",
	score_text: "Ich habe {score} Punkte bei Riddle Rush erzielt! 🎯",
	not_supported: "Teilen wird auf diesem Gerät nicht unterstützt",
	success: "Punktestand erfolgreich geteilt!",
	error: "Fehler beim Teilen des Punktestands"
};
var categories = {
	female_name: "Weiblicher Vorname",
	male_name: "Männlicher Vorname",
	water_vehicle: "Wasser Fahrzeug",
	flowers: "Blumen",
	plants: "Pflanzen",
	profession: "Beruf oder Gewerbe",
	insect: "Insekt",
	animal: "Tier",
	city: "Stadt",
	country: "Land",
	food: "Essen",
	drink: "Getränk",
	sport: "Sport",
	music: "Musik",
	movie: "Film"
};
var offline = {
	warning: "Sie sind offline. Einige Funktionen funktionieren möglicherweise nicht."
};
var feedback = {
	button: "Feedback geben",
	title: "Wie gefällt dir das Spiel?",
	placeholder: "Dein Feedback (optional)...",
	submit: "Absenden",
	thanks: "Vielen Dank für dein Feedback!"
};
var leaderboard = {
	title: "Bestenliste",
	empty: "Noch keine Einträge. Spiel ein paar Runden!",
	clear: "Löschen",
	score: "Punkte",
	category: "Kategorie",
	time: "Zeit",
	game_complete: "Spiel beendet!",
	current_standings: "Aktuelle Platzierung",
	winner_title: "Endstand",
	no_players: "Noch keine Spieler",
	invalid_image: "Bitte wähle eine gültige Bilddatei",
	image_too_large: "Bild muss kleiner als 2MB sein",
	avatar_updated: "Avatar erfolgreich aktualisiert!",
	avatar_error: "Fehler beim Aktualisieren des Avatars. Bitte versuche es erneut."
};
var settings = {
	title: "Einstellungen",
	sound: "Sound",
	leaderboard: "Bestenliste anzeigen",
	debug: "Debug-Modus",
	maxPlayers: "Max. Spieler",
	reset: "Zurücksetzen",
	sound_enabled: "Sound aktiviert",
	sound_disabled: "Sound deaktiviert",
	leaderboard_enabled: "Bestenliste aktiviert",
	leaderboard_disabled: "Bestenliste deaktiviert",
	language_changed: "Sprache geändert",
	reset_success: "Einstellungen auf Standard zurückgesetzt"
};
var credits = {
	title: "CREDITS",
	game_design: "Spieldesign",
	programming: "Programmierung",
	art: "Art"
};
var language = {
	title: "SPRACHE"
};
var results = {
	your_score: "Dein Score",
	next: "Weiter",
	restart: "Neu starten",
	home: "Startseite",
	scores_saved: "Punktestände erfolgreich gespeichert!",
	error_saving: "Fehler beim Speichern der Punktestände. Bitte versuche es erneut."
};
const de = {
	app: app,
	common: common,
	home: home,
	features: features,
	game: game,
	players: players,
	menu: menu,
	pause: pause,
	share: share,
	categories: categories,
	offline: offline,
	feedback: feedback,
	leaderboard: leaderboard,
	settings: settings,
	credits: credits,
	language: language,
	results: results
};

export { app, categories, common, credits, de as default, features, feedback, game, home, language, leaderboard, menu, offline, pause, players, results, settings, share };
//# sourceMappingURL=de.mjs.map
