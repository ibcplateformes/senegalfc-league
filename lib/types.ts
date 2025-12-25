// Types pour les clubs
export interface Club {
  id: string;
  name: string;
  eaClubId: string;
  platform: string;
  active: boolean;
  points: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  createdAt: Date;
  updatedAt: Date;
}

// Types pour les matchs
export interface Match {
  id: string;
  homeClubId: string;
  awayClubId: string;
  homeScore: number;
  awayScore: number;
  playedAt: Date;
  validated: boolean;
  notes?: string;
  eaMatchId?: string;
  detectedAt: Date;
  homeClub?: Club;
  awayClub?: Club;
}

// Types pour les annonces
export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'results' | 'important' | 'warning';
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Types pour la configuration de la ligue
export interface LeagueConfig {
  id: string;
  leagueName: string;
  season: string;
  autoSync: boolean;
  syncInterval: number;
  lastSync?: Date;
  pointsWin: number;
  pointsDraw: number;
  pointsLoss: number;
  createdAt: Date;
  updatedAt: Date;
}

// Types pour les réponses API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface SyncResponse {
  scannedClubs: number;
  newMatches: number;
  leagueMatchesDetected: number;
  errors: string[];
  lastSync: Date;
}

export interface ClubValidation {
  valid: boolean;
  clubInfo?: {
    id: string;
    name: string;
    platform: string;
  };
  error?: string;
}

// Types pour les formulaires
export interface CreateClubForm {
  name: string;
  eaClubId: string;
  platform: 'ps5' | 'xbox' | 'pc';
}

export interface CreateAnnouncementForm {
  title: string;
  content: string;
  type: 'info' | 'results' | 'important' | 'warning';
  published: boolean;
}

export interface MatchCorrectionForm {
  homeScore: number;
  awayScore: number;
  notes?: string;
}

// Types pour les statistiques
export interface LeagueStats {
  totalClubs: number;
  totalMatches: number;
  pendingMatches: number;
  lastMatch?: {
    homeTeam: string;
    awayTeam: string;
    score: string;
    date: Date;
  };
  topScorer?: {
    name: string;
    goals: number;
  };
}

export interface ClubStats {
  points: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  matchesPlayed: number;
}

// Types pour les événements admin
export interface AdminAction {
  action: 'club_added' | 'club_updated' | 'match_validated' | 'match_corrected' | 'sync_manual' | 'announcement_created';
  details: string;
  timestamp: Date;
}

// Types pour les notifications
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

// Enum pour les plateformes
export enum Platform {
  PS5 = 'ps5',
  XBOX = 'xbox',
  PC = 'pc'
}

// Enum pour les types d'annonces
export enum AnnouncementType {
  INFO = 'info',
  RESULTS = 'results',
  IMPORTANT = 'important',
  WARNING = 'warning'
}

// Enum pour les résultats de match
export enum MatchResult {
  WIN = 'win',
  DRAW = 'draw',
  LOSS = 'loss'
}