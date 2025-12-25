'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Megaphone, 
  ArrowLeft,
  Save,
  X,
  Eye,
  EyeOff,
  AlertTriangle,
  Info,
  Trophy,
  MessageCircle,
  Calendar,
  Type,
  FileText
} from 'lucide-react';

export default function NewAnnouncementPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'info' as 'info' | 'results' | 'important' | 'warning',
    published: true
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est obligatoire';
    } else if (formData.title.length < 5) {
      newErrors.title = 'Le titre doit contenir au moins 5 caractères';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Le contenu est obligatoire';
    } else if (formData.content.length < 20) {
      newErrors.content = 'Le contenu doit contenir au moins 20 caractères';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Simuler la création d'une annonce (dans un vrai projet, appel API)
      console.log('Création de l\'annonce:', formData);
      
      // Simuler un délai
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Rediriger vers la liste des annonces avec un message de succès
      alert(`Annonce "${formData.title}" créée avec succès !`);
      router.push('/admin/announcements');
      
    } catch (error) {
      console.error('Erreur création annonce:', error);
      alert('Erreur lors de la création de l\'annonce. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Effacer l'erreur du champ modifié
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
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
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'results': return 'bg-green-100 text-green-800 border-green-200';
      case 'important': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'warning': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeDescription = (type: string) => {
    switch (type) {
      case 'info': return 'Information générale pour les participants';
      case 'results': return 'Annonce des résultats et classements';
      case 'important': return 'Communication importante à ne pas manquer';
      case 'warning': return 'Avertissement ou attention particulière';
      default: return '';
    }
  };

  const exampleContent = {
    info: "La ligue reprend ses activités après une pause. Tous les clubs peuvent maintenant programmer leurs matchs pour la nouvelle saison.",
    results: "🏆 Résultats de la journée 5 :\n\nHOF 221 3-1 Dakar FC\nThiès United 2-0 Saint-Louis SC\n\nClassement mis à jour disponible sur la page principale !",
    important: "⚠️ ATTENTION : Nouvelle règle en vigueur dès maintenant :\n\nTous les matchs doivent être joués avant dimanche 23h59. Les matchs non joués seront considérés comme forfait.",
    warning: "🚨 Le club XYZ a reçu un avertissement pour non-respect des horaires. En cas de récidive, une pénalité de points sera appliquée."
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link 
                href="/admin/announcements"
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Megaphone className="w-7 h-7 text-purple-500 mr-3" />
                  Créer une Nouvelle Annonce
                </h1>
                <p className="text-gray-600">Rédiger une communication officielle pour la ligue</p>
              </div>
            </div>
            
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium"
            >
              {showPreview ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {showPreview ? 'Masquer Aperçu' : 'Voir Aperçu'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className={`grid gap-8 ${showPreview ? 'lg:grid-cols-2' : 'max-w-2xl mx-auto'}`}>
          
          {/* Formulaire */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Rédaction de l'Annonce</h2>
              <p className="text-sm text-gray-600 mt-1">
                Rédigez votre communication officielle pour tous les participants
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              
              {/* Type d'annonce */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Type d'Annonce
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'info', label: 'Information', icon: Info },
                    { value: 'results', label: 'Résultats', icon: Trophy },
                    { value: 'important', label: 'Important', icon: MessageCircle },
                    { value: 'warning', label: 'Avertissement', icon: AlertTriangle }
                  ].map((type) => {
                    const Icon = type.icon;
                    return (
                      <label key={type.value} className="cursor-pointer">
                        <input
                          type="radio"
                          name="type"
                          value={type.value}
                          checked={formData.type === type.value}
                          onChange={(e) => handleInputChange('type', e.target.value)}
                          className="sr-only"
                        />
                        <div className={`p-3 border-2 rounded-lg flex items-center space-x-2 transition-colors ${
                          formData.type === type.value 
                            ? getTypeColor(type.value)
                            : 'border-gray-200 hover:border-gray-300'
                        }`}>
                          <Icon className="w-4 h-4" />
                          <span className="text-sm font-medium">{type.label}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  {getTypeDescription(formData.type)}
                </p>
              </div>

              {/* Titre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Type className="w-4 h-4 inline mr-1" />
                  Titre de l'Annonce *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.title 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-purple-500'
                  }`}
                  placeholder="Ex: Résultats de la journée 5"
                  disabled={loading}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    {errors.title}
                  </p>
                )}
              </div>

              {/* Contenu */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    <FileText className="w-4 h-4 inline mr-1" />
                    Contenu de l'Annonce *
                  </label>
                  <button
                    type="button"
                    onClick={() => handleInputChange('content', exampleContent[formData.type])}
                    className="text-xs text-purple-600 hover:text-purple-800"
                  >
                    Utiliser un exemple
                  </button>
                </div>
                <textarea
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  rows={8}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 resize-y ${
                    errors.content 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-purple-500'
                  }`}
                  placeholder="Rédigez le contenu de votre annonce ici..."
                  disabled={loading}
                />
                {errors.content && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    {errors.content}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {formData.content.length} caractères • Vous pouvez utiliser des émojis 🏆⚽🎉
                </p>
              </div>

              {/* Options de publication */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="published"
                      type="checkbox"
                      checked={formData.published}
                      onChange={(e) => handleInputChange('published', e.target.checked)}
                      className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                      disabled={loading}
                    />
                  </div>
                  <div className="ml-3">
                    <label htmlFor="published" className="text-sm font-medium text-gray-700 flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      Publier Immédiatement
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.published 
                        ? 'L\'annonce sera visible publiquement dès la création' 
                        : 'L\'annonce sera sauvée en brouillon'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Création en cours...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {formData.published ? 'Publier l\'Annonce' : 'Sauvegarder en Brouillon'}
                    </>
                  )}
                </button>
                
                <Link
                  href="/admin/announcements"
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center"
                >
                  <X className="w-4 h-4 mr-2" />
                  Annuler
                </Link>
              </div>
            </form>
          </div>

          {/* Aperçu */}
          {showPreview && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <Eye className="w-5 h-5 mr-2" />
                  Aperçu de l'Annonce
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Voici comment l'annonce apparaîtra aux utilisateurs
                </p>
              </div>
              
              <div className="p-6">
                {formData.title || formData.content ? (
                  <div className={`border-2 rounded-lg p-4 ${getTypeColor(formData.type)}`}>
                    <div className="flex items-center space-x-2 mb-3">
                      {getTypeIcon(formData.type)}
                      <span className="text-xs font-medium uppercase tracking-wide">
                        {formData.type}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        formData.published 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {formData.published ? 'Publié' : 'Brouillon'}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold mb-2">
                      {formData.title || 'Titre de l\'annonce'}
                    </h3>
                    
                    <div className="whitespace-pre-wrap text-sm">
                      {formData.content || 'Le contenu de l\'annonce apparaîtra ici...'}
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-current border-opacity-20">
                      <div className="flex items-center text-xs opacity-75">
                        <Calendar className="w-3 h-3 mr-1" />
                        Publié le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Megaphone className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Remplissez les champs pour voir l'aperçu</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Conseils de Rédaction */}
        {!showPreview && (
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-purple-900 mb-3">
                ✍️ Conseils de Rédaction
              </h3>
              <div className="text-sm text-purple-800 space-y-2">
                <p><strong>Titre accrocheur :</strong> Résumez l'essentiel en quelques mots</p>
                <p><strong>Contenu clair :</strong> Allez à l'essentiel, utilisez des paragraphes courts</p>
                <p><strong>Émojis autorisés :</strong> 🏆 ⚽ 🎉 🚨 pour rendre vos annonces plus vivantes</p>
                <p><strong>Type approprié :</strong> Choisissez le bon type pour la bonne visibilité</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}