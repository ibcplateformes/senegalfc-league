'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Megaphone, 
  Plus, 
  Edit, 
  Trash2, 
  ArrowLeft,
  Eye,
  EyeOff,
  Calendar,
  AlertTriangle,
  Info,
  Trophy,
  MessageCircle
} from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'results' | 'important' | 'warning';
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    type: 'info' as const,
    published: true
  });

  // Simulation des annonces (dans un vrai projet, ces données viendraient d'une API)
  useEffect(() => {
    setTimeout(() => {
      setAnnouncements([
        {
          id: '1',
          title: '🎉 Bienvenue dans la Ligue Sénégalaise FC !',
          content: `La Ligue Sénégalaise EA Sports FC est officiellement lancée ! 

Les clubs participants peuvent désormais suivre leur classement en temps réel. 

Les admins peuvent synchroniser automatiquement les résultats depuis EA Sports et gérer la compétition depuis le dashboard admin.

Que le meilleur club gagne ! 🏆`,
          type: 'important',
          published: true,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        }
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAnnouncement.title || !newAnnouncement.content) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const announcement: Announcement = {
      id: Date.now().toString(),
      ...newAnnouncement,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setAnnouncements([announcement, ...announcements]);
    setNewAnnouncement({ title: '', content: '', type: 'info', published: true });
    setShowCreateForm(false);
    alert('Annonce créée avec succès !');
  };

  const togglePublished = (announcementId: string) => {
    setAnnouncements(announcements.map(announcement => 
      announcement.id === announcementId 
        ? { ...announcement, published: !announcement.published }
        : announcement
    ));
  };

  const deleteAnnouncement = (announcementId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) {
      setAnnouncements(announcements.filter(a => a.id !== announcementId));
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'info': return <Info className="w-5 h-5" />;
      case 'results': return <Trophy className="w-5 h-5" />;
      case 'important': return <MessageCircle className="w-5 h-5" />;
      case 'warning': return <AlertTriangle className="w-5 h-5" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'info': return 'bg-blue-100 text-blue-800';
      case 'results': return 'bg-green-100 text-green-800';
      case 'important': return 'bg-purple-100 text-purple-800';
      case 'warning': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const publishedCount = announcements.filter(a => a.published).length;
  const draftCount = announcements.filter(a => !a.published).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des annonces...</p>
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
                  <Megaphone className="w-7 h-7 text-purple-500 mr-3" />
                  Gestion des Annonces
                </h1>
                <p className="text-gray-600">Créer et gérer les communications officielles</p>
              </div>
            </div>
            
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle Annonce
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <div className="flex items-center">
              <Megaphone className="w-8 h-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Annonces</p>
                <p className="text-2xl font-bold text-gray-900">{announcements.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center">
              <Eye className="w-8 h-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Publiées</p>
                <p className="text-2xl font-bold text-gray-900">{publishedCount}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
            <div className="flex items-center">
              <EyeOff className="w-8 h-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Brouillons</p>
                <p className="text-2xl font-bold text-gray-900">{draftCount}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Cette Semaine</p>
                <p className="text-2xl font-bold text-gray-900">
                  {announcements.filter(a => 
                    new Date(a.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                  ).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Formulaire de création */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow mb-8 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Créer une Nouvelle Annonce</h2>
            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titre de l'annonce *
                  </label>
                  <input
                    type="text"
                    value={newAnnouncement.title}
                    onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Ex: Résultats de la journée 5"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type d'annonce
                  </label>
                  <select
                    value={newAnnouncement.type}
                    onChange={(e) => setNewAnnouncement({...newAnnouncement, type: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="info">Information</option>
                    <option value="results">Résultats</option>
                    <option value="important">Important</option>
                    <option value="warning">Avertissement</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contenu de l'annonce *
                </label>
                <textarea
                  value={newAnnouncement.content}
                  onChange={(e) => setNewAnnouncement({...newAnnouncement, content: e.target.value})}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Rédigez votre annonce ici..."
                  required
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="published"
                  checked={newAnnouncement.published}
                  onChange={(e) => setNewAnnouncement({...newAnnouncement, published: e.target.checked})}
                  className="h-4 w-4 text-purple-600 rounded"
                />
                <label htmlFor="published" className="ml-2 block text-sm text-gray-700">
                  Publier immédiatement
                </label>
              </div>
              
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium"
                >
                  Créer l'Annonce
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Liste des Annonces */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              Toutes les Annonces ({announcements.length})
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {announcement.title}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(announcement.type)}`}>
                        {getTypeIcon(announcement.type)}
                        <span className="ml-1 capitalize">{announcement.type}</span>
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        announcement.published 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {announcement.published ? (
                          <>
                            <Eye className="w-3 h-3 mr-1" />
                            Publié
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3 mr-1" />
                            Brouillon
                          </>
                        )}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-3 line-clamp-3">
                      {announcement.content.substring(0, 150)}
                      {announcement.content.length > 150 ? '...' : ''}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Créé le {formatDate(announcement.createdAt)}
                      </span>
                      {announcement.updatedAt !== announcement.createdAt && (
                        <span className="flex items-center">
                          <Edit className="w-4 h-4 mr-1" />
                          Modifié le {formatDate(announcement.updatedAt)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => togglePublished(announcement.id)}
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        announcement.published
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {announcement.published ? (
                        <>
                          <EyeOff className="w-4 h-4 inline mr-1" />
                          Masquer
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4 inline mr-1" />
                          Publier
                        </>
                      )}
                    </button>
                    
                    <button className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded text-sm font-medium">
                      <Edit className="w-4 h-4 inline mr-1" />
                      Modifier
                    </button>
                    
                    <button
                      onClick={() => deleteAnnouncement(announcement.id)}
                      className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded text-sm font-medium"
                    >
                      <Trash2 className="w-4 h-4 inline mr-1" />
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {announcements.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Megaphone className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Aucune annonce</h3>
              <p className="text-sm mb-4">Créez votre première annonce pour communiquer avec les participants</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Créer une annonce
              </button>
            </div>
          )}
        </div>

        {/* Actions Rapides */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <button 
            onClick={() => setShowCreateForm(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white p-6 rounded-lg text-center"
          >
            <Plus className="w-8 h-8 mx-auto mb-2" />
            <h3 className="font-bold">Nouvelle Annonce</h3>
            <p className="text-sm opacity-90">Créer une communication officielle</p>
          </button>
          
          <Link 
            href="/admin/matches"
            className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-lg text-center block"
          >
            <Trophy className="w-8 h-8 mx-auto mb-2" />
            <h3 className="font-bold">Annoncer Résultats</h3>
            <p className="text-sm opacity-90">Publier les derniers résultats</p>
          </Link>
          
          <Link 
            href="/admin"
            className="bg-gray-600 hover:bg-gray-700 text-white p-6 rounded-lg text-center block"
          >
            <ArrowLeft className="w-8 h-8 mx-auto mb-2" />
            <h3 className="font-bold">Retour Dashboard</h3>
            <p className="text-sm opacity-90">Vue d'ensemble admin</p>
          </Link>
        </div>
      </div>
    </div>
  );
}