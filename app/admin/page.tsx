'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Trophy, 
  Calendar, 
  Settings,
  Plus,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  Target,
  Crown,
  Zap
} from 'lucide-react';

interface DashboardStats {
  totalClubs: number;
  activeClubs: number;
  totalMatches: number;
  validatedMatches: number;
  pendingMatches: number;
  lastSync?: string;
}

interface PendingMatch {
  id: string;
  homeClub: { name: string };
  awayClub: { name: string };
  homeScore: number;
  awayScore: number;
  playedAt: string;
  detectedAt: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pendingMatches, setPendingMatches] = useState<PendingMatch[]>([]);
  const [syncLoading, setSyncLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, pendingRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/matches?validated=false&limit=5')
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.data);
      }

      if (pendingRes.ok) {
        const pendingData = await pendingRes.json();
        setPendingMatches(pendingData.data || []);
      }
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSync = async () => {
    setSyncLoading(true);
    try {
      const response = await fetch('/api/admin/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await response.json();
      
      if (response.ok) {
        alert(`Sync terminée ! ${result.data.newMatches} nouveaux matchs détectés.`);
        fetchDashboardData(); // Rafraîchir les données
      } else {
        alert(`Erreur sync: ${result.error}`);
      }
    } catch (error) {
      console.error('Erreur sync manuelle:', error);
      alert('Erreur lors de la synchronisation');
    } finally {
      setSyncLoading(false);
    }
  };

  const validateMatch = async (matchId: string, validated: boolean) => {
    try {
      const response = await fetch(`/api/admin/matches/${matchId}/validate`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ validated })
      });

      if (response.ok) {
        fetchDashboardData(); // Rafraîchir
      }
    } catch (error) {
      console.error('Erreur validation match:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du dashboard admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Admin */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Crown className="w-7 h-7 text-yellow-500 mr-3" />
                Admin Dashboard
              </h1>
              <p className="text-gray-600">SenegalFC League • Gestion Centralisée</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link 
                href="/"
                className="text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                👁️ Vue Publique
              </Link>
              
              <button
                onClick={handleManualSync}
                disabled={syncLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${syncLoading ? 'animate-spin' : ''}`} />
                {syncLoading ? 'Sync...' : 'Sync Manuel'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Clubs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.activeClubs || 0}/{stats?.totalClubs || 0}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Matchs Validés</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.validatedMatches || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">En Attente</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.pendingMatches || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <div className="flex items-center">
              <Target className="w-8 h-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Matchs</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalMatches || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-indigo-500">
            <div className="flex items-center">
              <RefreshCw className="w-8 h-8 text-indigo-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Dernière Sync</p>
                <p className="text-sm font-bold text-gray-900">
                  {stats?.lastSync ? formatDate(stats.lastSync) : 'Jamais'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Rapides */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Link 
            href="/admin/clubs" 
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow border-2 border-transparent hover:border-blue-500"
          >
            <div className="text-center">
              <Users className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="font-bold text-gray-900 mb-2">Gestion des Clubs</h3>
              <p className="text-sm text-gray-600">Ajouter, modifier, activer/désactiver</p>
            </div>
          </Link>
          
          <Link 
            href="/admin/matches" 
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow border-2 border-transparent hover:border-green-500"
          >
            <div className="text-center">
              <Trophy className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="font-bold text-gray-900 mb-2">Gestion des Matchs</h3>
              <p className="text-sm text-gray-600">Valider, corriger, gérer</p>
            </div>
          </Link>
          
          <Link 
            href="/admin/ranking" 
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow border-2 border-transparent hover:border-yellow-500"
          >
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="font-bold text-gray-900 mb-2">Classement</h3>
              <p className="text-sm text-gray-600">Ajustements, recalculs</p>
            </div>
          </Link>
          
          <Link 
            href="/admin/announcements" 
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow border-2 border-transparent hover:border-purple-500"
          >
            <div className="text-center">
              <Calendar className="w-12 h-12 text-purple-500 mx-auto mb-4" />
              <h3 className="font-bold text-gray-900 mb-2">Annonces</h3>
              <p className="text-sm text-gray-600">Communication officielle</p>
            </div>
          </Link>
        </div>

        {/* Matchs en Attente */}
        {pendingMatches.length > 0 && (
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <AlertCircle className="w-6 h-6 text-yellow-500 mr-2" />
                Matchs en Attente de Validation
              </h2>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {pendingMatches.map((match) => (
                  <div key={match.id} className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">
                        {match.homeClub.name} {match.homeScore} - {match.awayScore} {match.awayClub.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        Joué le {formatDate(match.playedAt)} • Détecté le {formatDate(match.detectedAt)}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => validateMatch(match.id, true)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium"
                      >
                        ✓ Valider
                      </button>
                      <button
                        onClick={() => validateMatch(match.id, false)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium"
                      >
                        ✗ Rejeter
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 text-center">
                <Link 
                  href="/admin/matches"
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  Voir tous les matchs →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Liens Rapides */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Actions Rapides</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link 
              href="/admin/clubs/new"
              className="flex items-center p-3 text-blue-600 hover:bg-blue-50 rounded-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Ajouter un Club
            </Link>
            
            <button 
              onClick={handleManualSync}
              className="flex items-center p-3 text-green-600 hover:bg-green-50 rounded-lg"
            >
              <Zap className="w-5 h-5 mr-2" />
              Sync Immédiate
            </button>
            
            <Link 
              href="/admin/ranking"
              className="flex items-center p-3 text-yellow-600 hover:bg-yellow-50 rounded-lg"
            >
              <BarChart3 className="w-5 h-5 mr-2" />
              Recalculer Stats
            </Link>
            
            <Link 
              href="/admin/announcements/new"
              className="flex items-center p-3 text-purple-600 hover:bg-purple-50 rounded-lg"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Nouvelle Annonce
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}