-- Migration complète pour le système de statistiques automatiques - Comme ClubStats Pro
-- À exécuter dans Supabase SQL Editor ou votre outil de base de données

-- Table des joueurs avec TOUTES les statistiques EA Sports
CREATE TABLE IF NOT EXISTS "players" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "club_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" TEXT NOT NULL, -- 'GK', 'DEF', 'MID', 'ATT'
    "number" INTEGER,
    "ea_player_id" TEXT,
    
    -- Stats générales
    "matches_played" INTEGER NOT NULL DEFAULT 0,
    "minutes_played" INTEGER NOT NULL DEFAULT 0,
    "average_rating" REAL NOT NULL DEFAULT 0,
    
    -- Stats offensives complètes
    "goals" INTEGER NOT NULL DEFAULT 0,
    "assists" INTEGER NOT NULL DEFAULT 0,
    "shots" INTEGER NOT NULL DEFAULT 0,
    "shots_on_target" INTEGER NOT NULL DEFAULT 0,
    "shot_accuracy" REAL NOT NULL DEFAULT 0,
    "dribbles" INTEGER NOT NULL DEFAULT 0,
    "dribble_success" REAL NOT NULL DEFAULT 0,
    "crosses" INTEGER NOT NULL DEFAULT 0,
    "cross_accuracy" REAL NOT NULL DEFAULT 0,
    "corners" INTEGER NOT NULL DEFAULT 0,
    "freekicks" INTEGER NOT NULL DEFAULT 0,
    "penalties" INTEGER NOT NULL DEFAULT 0,
    "penalties_scored" INTEGER NOT NULL DEFAULT 0,
    
    -- Stats défensives complètes
    "tackles" INTEGER NOT NULL DEFAULT 0,
    "tackle_success" REAL NOT NULL DEFAULT 0,
    "interceptions" INTEGER NOT NULL DEFAULT 0,
    "clearances" INTEGER NOT NULL DEFAULT 0,
    "blocks" INTEGER NOT NULL DEFAULT 0,
    "aerial_duels_won" INTEGER NOT NULL DEFAULT 0,
    "aerial_duels_total" INTEGER NOT NULL DEFAULT 0,
    "fouls_committed" INTEGER NOT NULL DEFAULT 0,
    "fouls_won" INTEGER NOT NULL DEFAULT 0,
    
    -- Stats gardien complètes
    "saves" INTEGER NOT NULL DEFAULT 0,
    "goals_conceded" INTEGER NOT NULL DEFAULT 0,
    "clean_sheets" INTEGER NOT NULL DEFAULT 0,
    "catches" INTEGER NOT NULL DEFAULT 0,
    "punches" INTEGER NOT NULL DEFAULT 0,
    "distributions" INTEGER NOT NULL DEFAULT 0,
    "distribution_success" REAL NOT NULL DEFAULT 0,
    "penalties_saved" INTEGER NOT NULL DEFAULT 0,
    "penalties_faced" INTEGER NOT NULL DEFAULT 0,
    
    -- Stats physiques
    "distance_run" REAL NOT NULL DEFAULT 0,
    "top_speed" REAL NOT NULL DEFAULT 0,
    "sprints" INTEGER NOT NULL DEFAULT 0,
    
    -- Stats de passes complètes
    "passes_completed" INTEGER NOT NULL DEFAULT 0,
    "passes_attempted" INTEGER NOT NULL DEFAULT 0,
    "pass_accuracy" REAL NOT NULL DEFAULT 0,
    "long_passes" INTEGER NOT NULL DEFAULT 0,
    "long_pass_accuracy" REAL NOT NULL DEFAULT 0,
    "through_balls" INTEGER NOT NULL DEFAULT 0,
    "key_passes" INTEGER NOT NULL DEFAULT 0,
    
    -- Forme et performance
    "form" REAL NOT NULL DEFAULT 0,
    "consistency" REAL NOT NULL DEFAULT 0,
    "clutch_goals" INTEGER NOT NULL DEFAULT 0,
    
    -- Cartons et récompenses
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
CREATE INDEX IF NOT EXISTS "players_goals_idx" ON "players"("goals");
CREATE INDEX IF NOT EXISTS "players_assists_idx" ON "players"("assists");
CREATE INDEX IF NOT EXISTS "players_rating_idx" ON "players"("average_rating");

-- Table des statistiques par match pour chaque joueur (adaptée aux nouvelles stats)
CREATE TABLE IF NOT EXISTS "player_match_stats" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "player_id" TEXT NOT NULL,
    "match_id" TEXT NOT NULL,
    
    -- Infos générales du match
    "minutes_played" INTEGER NOT NULL DEFAULT 0,
    "rating" REAL,
    "starter" BOOLEAN NOT NULL DEFAULT false,
    
    -- Stats offensives match
    "goals" INTEGER NOT NULL DEFAULT 0,
    "assists" INTEGER NOT NULL DEFAULT 0,
    "shots" INTEGER NOT NULL DEFAULT 0,
    "shots_on_target" INTEGER NOT NULL DEFAULT 0,
    "dribbles" INTEGER NOT NULL DEFAULT 0,
    "crosses" INTEGER NOT NULL DEFAULT 0,
    "corners" INTEGER NOT NULL DEFAULT 0,
    "freekicks" INTEGER NOT NULL DEFAULT 0,
    
    -- Stats défensives match
    "tackles" INTEGER NOT NULL DEFAULT 0,
    "interceptions" INTEGER NOT NULL DEFAULT 0,
    "clearances" INTEGER NOT NULL DEFAULT 0,
    "blocks" INTEGER NOT NULL DEFAULT 0,
    "aerial_duels_won" INTEGER NOT NULL DEFAULT 0,
    "fouls_committed" INTEGER NOT NULL DEFAULT 0,
    "fouls_won" INTEGER NOT NULL DEFAULT 0,
    
    -- Stats gardien match
    "saves" INTEGER NOT NULL DEFAULT 0,
    "goals_conceded" INTEGER NOT NULL DEFAULT 0,
    "clean_sheet" BOOLEAN NOT NULL DEFAULT false,
    "catches" INTEGER NOT NULL DEFAULT 0,
    "punches" INTEGER NOT NULL DEFAULT 0,
    "distributions" INTEGER NOT NULL DEFAULT 0,
    
    -- Stats physiques match
    "distance_run" REAL NOT NULL DEFAULT 0,
    "top_speed" REAL NOT NULL DEFAULT 0,
    "sprints" INTEGER NOT NULL DEFAULT 0,
    
    -- Stats de passes match
    "passes_completed" INTEGER NOT NULL DEFAULT 0,
    "passes_attempted" INTEGER NOT NULL DEFAULT 0,
    "long_passes" INTEGER NOT NULL DEFAULT 0,
    "through_balls" INTEGER NOT NULL DEFAULT 0,
    "key_passes" INTEGER NOT NULL DEFAULT 0,
    
    -- Cartons et récompenses match
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
CREATE INDEX IF NOT EXISTS "player_match_stats_rating_idx" ON "player_match_stats"("rating");

-- Fonction pour recalculer TOUTES les stats de saison d'un joueur
CREATE OR REPLACE FUNCTION update_player_complete_stats(player_id_param TEXT)
RETURNS void AS $$
BEGIN
    UPDATE players SET
        -- Stats générales recalculées
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
        average_rating = (
            SELECT COALESCE(AVG(pms.rating), 0) FROM player_match_stats pms
            JOIN league_matches lm ON pms.match_id = lm.id
            WHERE pms.player_id = player_id_param AND lm.validated = true AND pms.rating IS NOT NULL
        ),
        
        -- Stats offensives recalculées
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
        shots = (
            SELECT COALESCE(SUM(pms.shots), 0) FROM player_match_stats pms
            JOIN league_matches lm ON pms.match_id = lm.id
            WHERE pms.player_id = player_id_param AND lm.validated = true
        ),
        shots_on_target = (
            SELECT COALESCE(SUM(pms.shots_on_target), 0) FROM player_match_stats pms
            JOIN league_matches lm ON pms.match_id = lm.id
            WHERE pms.player_id = player_id_param AND lm.validated = true
        ),
        
        -- Stats défensives recalculées
        tackles = (
            SELECT COALESCE(SUM(pms.tackles), 0) FROM player_match_stats pms
            JOIN league_matches lm ON pms.match_id = lm.id
            WHERE pms.player_id = player_id_param AND lm.validated = true
        ),
        interceptions = (
            SELECT COALESCE(SUM(pms.interceptions), 0) FROM player_match_stats pms
            JOIN league_matches lm ON pms.match_id = lm.id
            WHERE pms.player_id = player_id_param AND lm.validated = true
        ),
        clearances = (
            SELECT COALESCE(SUM(pms.clearances), 0) FROM player_match_stats pms
            JOIN league_matches lm ON pms.match_id = lm.id
            WHERE pms.player_id = player_id_param AND lm.validated = true
        ),
        
        -- Stats gardien recalculées
        saves = (
            SELECT COALESCE(SUM(pms.saves), 0) FROM player_match_stats pms
            JOIN league_matches lm ON pms.match_id = lm.id
            WHERE pms.player_id = player_id_param AND lm.validated = true
        ),
        goals_conceded = (
            SELECT COALESCE(SUM(pms.goals_conceded), 0) FROM player_match_stats pms
            JOIN league_matches lm ON pms.match_id = lm.id
            WHERE pms.player_id = player_id_param AND lm.validated = true
        ),
        clean_sheets = (
            SELECT COALESCE(SUM(CASE WHEN pms.clean_sheet THEN 1 ELSE 0 END), 0) FROM player_match_stats pms
            JOIN league_matches lm ON pms.match_id = lm.id
            WHERE pms.player_id = player_id_param AND lm.validated = true
        ),
        
        -- Stats de passes recalculées
        passes_completed = (
            SELECT COALESCE(SUM(pms.passes_completed), 0) FROM player_match_stats pms
            JOIN league_matches lm ON pms.match_id = lm.id
            WHERE pms.player_id = player_id_param AND lm.validated = true
        ),
        passes_attempted = (
            SELECT COALESCE(SUM(pms.passes_attempted), 0) FROM player_match_stats pms
            JOIN league_matches lm ON pms.match_id = lm.id
            WHERE pms.player_id = player_id_param AND lm.validated = true
        ),
        
        -- Cartons recalculés
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
        
        -- Calculs automatiques de ratios
        shot_accuracy = (
            CASE WHEN shots_on_target > 0 AND shots > 0 
                 THEN (shots_on_target::REAL / shots::REAL) * 100 
                 ELSE 0 END
        ),
        pass_accuracy = (
            CASE WHEN passes_completed > 0 AND passes_attempted > 0 
                 THEN (passes_completed::REAL / passes_attempted::REAL) * 100 
                 ELSE 0 END
        ),
        tackle_success = (
            CASE WHEN tackles > 0 
                 THEN (tackles::REAL / (tackles + fouls_committed)::REAL) * 100 
                 ELSE 0 END
        ),
        
        updated_at = CURRENT_TIMESTAMP
    WHERE id = player_id_param;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour recalculer les stats de TOUS les joueurs
CREATE OR REPLACE FUNCTION update_all_players_stats()
RETURNS void AS $$
DECLARE
    player_record RECORD;
BEGIN
    FOR player_record IN SELECT id FROM players LOOP
        PERFORM update_player_complete_stats(player_record.id);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Vue pour les statistiques avancées des joueurs
CREATE OR REPLACE VIEW player_advanced_stats AS
SELECT 
    p.*,
    c.name as club_name,
    c.ea_club_id,
    
    -- Ratios calculés
    CASE WHEN p.shots > 0 THEN (p.goals::REAL / p.shots::REAL) * 100 ELSE 0 END as goals_per_shot,
    CASE WHEN p.matches_played > 0 THEN p.goals::REAL / p.matches_played::REAL ELSE 0 END as goals_per_match,
    CASE WHEN p.matches_played > 0 THEN p.assists::REAL / p.matches_played::REAL ELSE 0 END as assists_per_match,
    CASE WHEN p.minutes_played > 0 THEN (p.goals::REAL / p.minutes_played::REAL) * 90 ELSE 0 END as goals_per_90min,
    CASE WHEN p.aerial_duels_total > 0 THEN (p.aerial_duels_won::REAL / p.aerial_duels_total::REAL) * 100 ELSE 0 END as aerial_success_rate,
    
    -- Rankings dans le club
    RANK() OVER (PARTITION BY c.id ORDER BY p.goals DESC) as goals_rank_in_club,
    RANK() OVER (PARTITION BY c.id ORDER BY p.assists DESC) as assists_rank_in_club,
    RANK() OVER (PARTITION BY c.id ORDER BY p.average_rating DESC) as rating_rank_in_club

FROM players p
JOIN league_clubs c ON p.club_id = c.id
WHERE p.matches_played > 0;

-- Commentaires pour documentation
COMMENT ON TABLE players IS 'Table des joueurs avec statistiques complètes synchronisées automatiquement depuis EA Sports FC - Système adapté de ClubStats Pro';
COMMENT ON TABLE player_match_stats IS 'Statistiques détaillées par match de chaque joueur - Synchronisation automatique depuis EA Sports FC';
COMMENT ON FUNCTION update_player_complete_stats IS 'Recalcule TOUTES les statistiques de saison d''un joueur basées sur ses stats de matchs validés';
COMMENT ON FUNCTION update_all_players_stats IS 'Recalcule les statistiques de TOUS les joueurs de la ligue - À utiliser après validation de matchs';
COMMENT ON VIEW player_advanced_stats IS 'Vue avec statistiques avancées et ratios calculés pour tous les joueurs - Prête pour dashboards';