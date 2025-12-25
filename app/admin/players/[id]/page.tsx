'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  User, 
  Trophy, 
  Target, 
  Activity, 
  Shield, 
  Clock,
  TrendingUp,
  Award,
  Zap,
  Eye,
  Calendar,
  MapPin,
  ArrowLeft,
  BarChart3
} from 'lucide-react';

interface PlayerDetailedStats {
  // Infos générales
  id: string;
  name: string;
  position: string;
  number?: number;
  eaPlayerId?: string;
  
  // Club
  club: {
    name: string;
    eaClubId: string;
  };
  
  // Stats générales
  matchesPlayed: number;
  minutesPlayed: number;
  averageRating: number;
  
  // Stats offensives
  goals: number;
  assists: number;
  shots: number;
  shotsOnTarget: number;
  dribbles: number;
  crosses: number;
  corners: number;
  freekicks: number;
  penalties: number;
  penaltiesScored: number;
  
  // Stats défensives
  tackles: number;
  interceptions: number;
  clearances: number;
  aerialDuelsWon: number;
  foulsCommitted: number;
  foulsWon: number;
  
  // Stats gardien
  saves: number;
  goalsConceded: number;
  cleanSheets: number;
  catches: number;
  penaltiesSaved: number;
  penaltiesFaced: number;
  
  // Cartons et récompenses
  yellowCards: number;
  redCards: number;
  manOfTheMatch: number;
  
  // Stats de passes
  passesCompleted: number;
  passesAttempted: number;
  longPasses: number;
  throughBalls: number;
  keyPasses: number;
  
  // Stats physiques
  distanceRun: number;
  topSpeed: number;
  sprints: number;
  
  // Stats de performance
  form: number;
  consistency: number;
  clutchGoals: number;
}

export default function PlayerStatsPage() {
  const params = useParams();
  const router = useRouter();
  const [player, setPlayer] = useState<PlayerDetailedStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (params?.id) {
      fetchPlayerStats(params.id as string);
    }
  }, [params?.id]);

  const fetchPlayerStats = async (playerId: string) => {
    try {
      const response = await fetch(`/api/admin/players/${playerId}/stats`);
      if (response.ok) {
        const data = await response.json();
        setPlayer(data.data);
      } else {
        setError('Joueur non trouvé');
      }
    } catch (error) {
      console.error('Erreur chargement stats:', error);
      setError('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const getPositionIcon = (position: string) => {
    const icons: Record<string, string> = {
      'GK': '🥅',
      'DEF': '🛡️',
      'MID': '⚙️',
      'ATT': '⚽'
    };
    return icons[position] || '👤';
  };

  const getPositionBadge = (position: string) => {
    const badges: Record<string, string> = {
      'GK': 'bg-yellow-100 text-yellow-800 border border-yellow-300',
      'DEF': 'bg-blue-100 text-blue-800 border border-blue-300',
      'MID': 'bg-green-100 text-green-800 border border-green-300',
      'ATT': 'bg-red-100 text-red-800 border border-red-300'
    };
    return badges[position] || 'bg-gray-100 text-gray-800 border border-gray-300';
  };

  const calculateAccuracy = (completed: number, attempted: number) => {
    if (attempted === 0) return 0;
    return Math.round((completed / attempted) * 100);
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Joueur non trouvé</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link 
            href="/admin/players"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Retour à la liste
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/admin/players" 
            className="text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux joueurs
          </Link>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="text-6xl mr-6">
                  {getPositionIcon(player.position)}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {player.name}
                  </h1>
                  <div className="flex items-center space-x-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPositionBadge(player.position)}`}>
                      {player.position}
                    </span>
                    <span className="text-gray-600 font-medium">
                      {player.club.name}
                    </span>
                    {player.number && (
                      <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-bold">
                        #{player.number}
                      </span>
                    )}
                  </div>
                  {player.eaPlayerId && (
                    <p className="text-xs text-gray-500 font-mono mt-1">
                      EA Player ID: {player.eaPlayerId}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">
                  {player.averageRating > 0 ? player.averageRating.toFixed(1) : '-'}
                </div>
                <div className="text-sm text-gray-600">Note moyenne</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats principales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Matchs Joués</p>
                <p className="text-2xl font-bold text-gray-900">{player.matchesPlayed}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Temps de jeu</p>
                <p className="text-2xl font-bold text-gray-900">{formatTime(player.minutesPlayed)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <div className="flex items-center">
              <Trophy className="w-8 h-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Buts</p>
                <p className="text-2xl font-bold text-gray-900">{player.goals}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center">
              <Target className="w-8 h-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Passes Décisives</p>
                <p className="text-2xl font-bold text-gray-900">{player.assists}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques détaillées */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Stats Offensives */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-red-500" />
                Statistiques Offensives
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Buts marqués</span>
                  <span className="font-bold text-red-600">{player.goals}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Passes décisives</span>
                  <span className="font-bold text-blue-600">{player.assists}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tirs tentés</span>
                  <span className="font-bold">{player.shots}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tirs cadrés</span>
                  <span className="font-bold">{player.shotsOnTarget}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Précision tirs</span>
                  <span className="font-bold text-green-600">
                    {player.shots > 0 ? `${calculateAccuracy(player.shotsOnTarget, player.shots)}%` : '-'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Dribbles réussis</span>
                  <span className="font-bold">{player.dribbles}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Centres</span>
                  <span className="font-bold">{player.crosses}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Corners</span>
                  <span className="font-bold">{player.corners}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Coups francs</span>
                  <span className="font-bold">{player.freekicks}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Pénaltys (marqués/tentés)</span>
                  <span className="font-bold">{player.penaltiesScored}/{player.penalties}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Défensives */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-blue-500" />
                Statistiques Défensives
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tacles réussis</span>
                  <span className="font-bold text-blue-600">{player.tackles}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Interceptions</span>
                  <span className="font-bold">{player.interceptions}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Dégagements</span>
                  <span className="font-bold">{player.clearances}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Duels aériens gagnés</span>
                  <span className="font-bold">{player.aerialDuelsWon}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Fautes commises</span>
                  <span className="font-bold text-red-500">{player.foulsCommitted}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Fautes subies</span>
                  <span className="font-bold text-green-500">{player.foulsWon}</span>
                </div>
                {player.position === 'GK' && (
                  <>
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-3">Stats Gardien</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Arrêts</span>
                          <span className="font-bold text-green-600">{player.saves}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Buts encaissés</span>
                          <span className="font-bold text-red-500">{player.goalsConceded}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Matchs sans encaisser</span>
                          <span className="font-bold text-blue-600">{player.cleanSheets}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Captations</span>
                          <span className="font-bold">{player.catches}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Pénaltys arrêtés</span>
                          <span className="font-bold text-green-600">{player.penaltiesSaved}/{player.penaltiesFaced}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Stats de Passes */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <Target className="w-5 h-5 mr-2 text-green-500" />
                Statistiques de Passes
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Passes réussies</span>
                  <span className="font-bold text-green-600">{player.passesCompleted}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Passes tentées</span>
                  <span className="font-bold">{player.passesAttempted}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Précision passes</span>
                  <span className="font-bold text-blue-600">
                    {player.passesAttempted > 0 ? `${calculateAccuracy(player.passesCompleted, player.passesAttempted)}%` : '-'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Passes longues</span>
                  <span className="font-bold">{player.longPasses}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Passes décisives</span>
                  <span className="font-bold text-yellow-600">{player.throughBalls}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Passes clés</span>
                  <span className="font-bold text-purple-600">{player.keyPasses}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Physiques & Discipline */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-purple-500" />
                Physique & Discipline
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Distance parcourue</span>
                  <span className="font-bold">{player.distanceRun.toFixed(1)} km</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Vitesse maximale</span>
                  <span className="font-bold">{player.topSpeed.toFixed(1)} km/h</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Sprints</span>
                  <span className="font-bold">{player.sprints}</span>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">Discipline</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Cartons jaunes</span>
                      <span className="font-bold text-yellow-500">{player.yellowCards}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Cartons rouges</span>
                      <span className="font-bold text-red-500">{player.redCards}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">Récompenses</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Homme du match</span>
                      <span className="font-bold text-gold">{player.manOfTheMatch}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Forme</span>
                      <span className="font-bold text-green-600">{player.form.toFixed(1)}/10</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Régularité</span>
                      <span className="font-bold text-blue-600">{player.consistency.toFixed(1)}/10</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Buts décisifs</span>
                      <span className="font-bold text-red-600">{player.clutchGoals}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex justify-center space-x-4">
          <Link 
            href="/admin/players"
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium"
          >
            Retour à la liste
          </Link>
          <Link 
            href={`/admin/players/${player.id}/edit`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Modifier les stats
          </Link>
        </div>
      </div>
    </div>
  );
}
