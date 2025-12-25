-- Migration manuelle pour ajouter les statistiques individuelles
-- À exécuter dans Supabase SQL Editor ou votre outil de base de données

-- Table des joueurs
CREATE TABLE IF NOT EXISTS "players" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "club_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" TEXT NOT NULL, -- 'GK', 'DEF', 'MID', 'ATT'
    "number" INTEGER,
    "ea_player_id" TEXT,
    
    -- Stats de saison (calculées automatiquement)
    "matches_played" INTEGER NOT NULL DEFAULT 0,
    "minutes_played" INTEGER NOT NULL DEFAULT 0,
    
    -- Stats offensives
    "goals" INTEGER NOT NULL DEFAULT 0,
    "assists" INTEGER NOT NULL DEFAULT 0,
    "shots" INTEGER NOT NULL DEFAULT 0,
    "shots_on_target" INTEGER NOT NULL DEFAULT 0,
    "dribbles" INTEGER NOT NULL DEFAULT 0,
    "crosses" INTEGER NOT NULL DEFAULT 0,
    
    -- Stats défensives  
    "tackles" INTEGER NOT NULL DEFAULT 0,
    "interceptions" INTEGER NOT NULL DEFAULT 0,
    "clearances" INTEGER NOT NULL DEFAULT 0,
    "aerial_duels_won" INTEGER NOT NULL DEFAULT 0,
    "fouls_committed" INTEGER NOT NULL DEFAULT 0,
    
    -- Stats gardien
    "saves" INTEGER NOT NULL DEFAULT 0,
    "goals_conceded" INTEGER NOT NULL DEFAULT 0,
    "clean_sheets" INTEGER NOT NULL DEFAULT 0,
    "catches" INTEGER NOT NULL DEFAULT 0,
    "penalties_saved" INTEGER NOT NULL DEFAULT 0,
    
    -- Divers
    "average_rating" REAL NOT NULL DEFAULT 0,
    "yellow_cards" INTEGER NOT NULL DEFAULT 0,
    "red_cards" INTEGER NOT NULL DEFAULT 0,
    "man_of_the_match" INTEGER NOT NULL DEFAULT 0,
    
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Contraintes
    CONSTRAINT "players_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "league_clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "players_ea_player_id_key" UNIQUE ("ea_player_id"),
    CONSTRAINT "players_club_number_unique" UNIQUE ("club_id", "number")
);

-- Index pour les joueurs
CREATE INDEX IF NOT EXISTS "players_club_id_idx" ON "players"("club_id");
CREATE INDEX IF NOT EXISTS "players_position_idx" ON "players"("position");
CREATE INDEX IF NOT EXISTS "players_name_idx" ON "players"("name");

-- Table des statistiques par match pour chaque joueur
CREATE TABLE IF NOT EXISTS "player_match_stats" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "player_id" TEXT NOT NULL,
    "match_id" TEXT NOT NULL,
    
    -- Infos générales du match
    "minutes_played" INTEGER NOT NULL DEFAULT 0,
    "rating" REAL,
    "starter" BOOLEAN NOT NULL DEFAULT false,
    
    -- Stats offensives
    "goals" INTEGER NOT NULL DEFAULT 0,
    "assists" INTEGER NOT NULL DEFAULT 0,
    "shots" INTEGER NOT NULL DEFAULT 0,
    "shots_on_target" INTEGER NOT NULL DEFAULT 0,
    "dribbles" INTEGER NOT NULL DEFAULT 0,
    "crosses" INTEGER NOT NULL DEFAULT 0,
    
    -- Stats défensives
    "tackles" INTEGER NOT NULL DEFAULT 0,
    "interceptions" INTEGER NOT NULL DEFAULT 0,
    "clearances" INTEGER NOT NULL DEFAULT 0,
    "aerial_duels_won" INTEGER NOT NULL DEFAULT 0,
    "fouls_committed" INTEGER NOT NULL DEFAULT 0,
    
    -- Stats gardien
    "saves" INTEGER NOT NULL DEFAULT 0,
    "goals_conceded" INTEGER NOT NULL DEFAULT 0,
    "clean_sheet" BOOLEAN NOT NULL DEFAULT false,
    "catches" INTEGER NOT NULL DEFAULT 0,
    
    -- Cartons
    "yellow_card" BOOLEAN NOT NULL DEFAULT false,
    "red_card" BOOLEAN NOT NULL DEFAULT false,
    "man_of_the_match" BOOLEAN NOT NULL DEFAULT false,
    
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Contraintes
    CONSTRAINT "player_match_stats_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "player_match_stats_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "league_matches"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "player_match_stats_player_id_match_id_key" UNIQUE ("player_id", "match_id")
);

-- Index pour les stats par match
CREATE INDEX IF NOT EXISTS "player_match_stats_player_id_idx" ON "player_match_stats"("player_id");
CREATE INDEX IF NOT EXISTS "player_match_stats_match_id_idx" ON "player_match_stats"("match_id");
CREATE INDEX IF NOT EXISTS "player_match_stats_goals_idx" ON "player_match_stats"("goals");
CREATE INDEX IF NOT EXISTS "player_match_stats_assists_idx" ON "player_match_stats"("assists");

-- Fonction pour mettre à jour les stats de saison d'un joueur
CREATE OR REPLACE FUNCTION update_player_season_stats(player_id_param TEXT)
RETURNS void AS $$
BEGIN
    UPDATE players SET
        matches_played = (
            SELECT COUNT(*) FROM player_match_stats pms
            JOIN league_matches lm ON pms.match_id = lm.id
            WHERE pms.player_id = player_id_param AND lm.validated = true
        ),
        minutes_played = (
            SELECT COALESCE(SUM(pms.minutes_played), 0) FROM player_match_stats pms
            JOIN league_matches lm ON pms.match_id = lm.id
            WHERE pms.player_id = player_id_param AND lm.validated = true
        ),
        goals = (
            SELECT COALESCE(SUM(pms.goals), 0) FROM player_match_stats pms
            JOIN league_matches lm ON pms.match_id = lm.id
            WHERE pms.player_id = player_id_param AND lm.validated = true
        ),
        assists = (
            SELECT COALESCE(SUM(pms.assists), 0) FROM player_match_stats pms
            JOIN league_matches lm ON pms.match_id = lm.id
            WHERE pms.player_id = player_id_param AND lm.validated = true
        ),
        saves = (
            SELECT COALESCE(SUM(pms.saves), 0) FROM player_match_stats pms
            JOIN league_matches lm ON pms.match_id = lm.id
            WHERE pms.player_id = player_id_param AND lm.validated = true
        ),
        clean_sheets = (
            SELECT COALESCE(SUM(CASE WHEN pms.clean_sheet THEN 1 ELSE 0 END), 0) FROM player_match_stats pms
            JOIN league_matches lm ON pms.match_id = lm.id
            WHERE pms.player_id = player_id_param AND lm.validated = true
        ),
        yellow_cards = (
            SELECT COALESCE(SUM(CASE WHEN pms.yellow_card THEN 1 ELSE 0 END), 0) FROM player_match_stats pms
            JOIN league_matches lm ON pms.match_id = lm.id
            WHERE pms.player_id = player_id_param AND lm.validated = true
        ),
        red_cards = (
            SELECT COALESCE(SUM(CASE WHEN pms.red_card THEN 1 ELSE 0 END), 0) FROM player_match_stats pms
            JOIN league_matches lm ON pms.match_id = lm.id
            WHERE pms.player_id = player_id_param AND lm.validated = true
        ),
        man_of_the_match = (
            SELECT COALESCE(SUM(CASE WHEN pms.man_of_the_match THEN 1 ELSE 0 END), 0) FROM player_match_stats pms
            JOIN league_matches lm ON pms.match_id = lm.id
            WHERE pms.player_id = player_id_param AND lm.validated = true
        ),
        average_rating = (
            SELECT COALESCE(AVG(pms.rating), 0) FROM player_match_stats pms
            JOIN league_matches lm ON pms.match_id = lm.id
            WHERE pms.player_id = player_id_param AND lm.validated = true AND pms.rating IS NOT NULL
        ),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = player_id_param;
END;
$$ LANGUAGE plpgsql;