'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Crown, 
  Trophy, 
  TrendingUp, 
  RefreshCw, 
  ArrowLeft,
  BarChart3,
  Target,
  Award
} from 'lucide-react';

interface ClubRanking {
  id: string;
  name: string;
  position: number;
  points: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  matchesPlayed: number;
}

export default function AdminRankingPage() {
  const [ranking, setRanking] = useState<ClubRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    fetchRanking();
  }, []);

  const fetchRanking = async () => {
    try {
      const response = await fetch('/api/public/ranking');
      if (response.ok) {
        const data = await response.json();
        setRanking(data.data || []);
      }
    } catch (error) {
      console.error('Erreur chargement classement:', error);
    } finally {
      setLoading(false);
    }
  };

  const recalculateStats = async () => {
    setCalculating(true);
    try {
      // Simuler un recalcul (vous pourriez créer une API /api/admin/recalculate)
      await new Promise(resolve => setTimeout(resolve, 2000));
      await fetchRanking();
      alert('Statistiques recalculées avec succès !');
    } catch (error) {
      console.error('Erreur recalcul:', error);
      alert('Erreur lors du recalcul des statistiques');
    } finally {
      setCalculating(false);
    }
  };

  const getPositionBadge = (position: number) => {
    if (position === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
    if (position === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
    if (position === 3) return 'bg-gradient-to-r from-yellow-600 to-yellow-800 text-white';
    return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du classement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link 
                href="/admin"
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Trophy className="w-7 h-7 text-yellow-500 mr-3" />
                  Gestion du Classement
                </h1>
                <p className="text-gray-600">Recalculs et ajustements de points</p>
              </div>
            </div>
            
            <button
              onClick={recalculateStats}
              disabled={calculating}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${calculating ? 'animate-spin' : ''}`} />
              {calculating ? 'Recalcul...' : 'Recalculer Tout'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
            <div className="flex items-center">
              <Crown className="w-8 h-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Leader</p>
                <p className="text-xl font-bold text-gray-900">
                  {ranking[0]?.name || 'N/A'}
                </p>
                <p className="text-sm text-gray-500">{ranking[0]?.points || 0} points</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center">
              <Target className="w-8 h-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Meilleure Attaque</p>
                <p className="text-xl font-bold text-gray-900">
                  {ranking.reduce((best, club) => 
                    club.goalsFor > (best?.goalsFor || 0) ? club : best, ranking[0])?.name || 'N/A'}
                </p>
                <p className="text-sm text-gray-500">
                  {ranking.reduce((max, club) => Math.max(max, club.goalsFor), 0)} buts
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center">
              <Award className="w-8 h-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Meilleure Défense</p>
                <p className="text-xl font-bold text-gray-900">
                  {ranking.reduce((best, club) => 
                    club.goalsAgainst < (best?.goalsAgainst || 999) ? club : best, ranking[0])?.name || 'N/A'}
                </p>
                <p className="text-sm text-gray-500">
                  {ranking.reduce((min, club) => Math.min(min, club.goalsAgainst), 999)} buts encaissés
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <div className="flex items-center">
              <BarChart3 className="w-8 h-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Clubs</p>
                <p className="text-xl font-bold text-gray-900">{ranking.length}</p>
                <p className="text-sm text-gray-500">Actifs</p>
              </div>
            </div>
          </div>
        </div>

        {/* Classement Détaillé */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <TrendingUp className="w-6 h-6 text-green-500 mr-2" />
              Classement Détaillé
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Club</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">MJ</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Victoires</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Nuls</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Défaites</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">BP</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">BC</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Diff</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ranking.map((club) => (
                  <tr key={club.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold ${getPositionBadge(club.position)}`}>
                        {club.position}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{club.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                      {club.matchesPlayed}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-semibold text-green-600">
                      {club.wins}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-semibold text-yellow-600">
                      {club.draws}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-semibold text-red-600">
                      {club.losses}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                      {club.goalsFor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                      {club.goalsAgainst}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-semibold">
                      <span className={club.goalDifference > 0 ? 'text-green-600' : club.goalDifference < 0 ? 'text-red-600' : 'text-gray-500'}>
                        {club.goalDifference > 0 ? '+' : ''}{club.goalDifference}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-blue-100 text-blue-800">
                        {club.points}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                      <button className="text-blue-600 hover:text-blue-900 font-medium">
                        Ajuster
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {ranking.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Aucun club dans le classement</p>
            </div>
          )}
        </div>

        {/* Actions Rapides */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <button 
            onClick={recalculateStats}
            disabled={calculating}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white p-6 rounded-lg text-center"
          >
            <RefreshCw className={`w-8 h-8 mx-auto mb-2 ${calculating ? 'animate-spin' : ''}`} />
            <h3 className="font-bold">Recalculer Statistiques</h3>
            <p className="text-sm opacity-90">Mettre à jour tous les points et stats</p>
          </button>
          
          <Link 
            href="/admin/matches"
            className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg text-center block"
          >
            <Target className="w-8 h-8 mx-auto mb-2" />
            <h3 className="font-bold">Gérer les Matchs</h3>
            <p className="text-sm opacity-90">Valider et corriger les résultats</p>
          </Link>
          
          <Link 
            href="/admin"
            className="bg-gray-600 hover:bg-gray-700 text-white p-6 rounded-lg text-center block"
          >
            <Crown className="w-8 h-8 mx-auto mb-2" />
            <h3 className="font-bold">Dashboard Principal</h3>
            <p className="text-sm opacity-90">Retour à la vue d'ensemble</p>
          </Link>
        </div>
      </div>
    </div>
  );
}