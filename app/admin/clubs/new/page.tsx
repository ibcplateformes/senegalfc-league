'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NewClubPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    eaClubId: '',
    platform: 'ps5',
    active: true
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [autoFillResult, setAutoFillResult] = useState<string>('');

  const handleInputChange = (field: string, value: string | boolean) => {
    console.log(`🔥 Changement ${field}: ${value}`);
    
    setFormData(prev => ({
      ...prev, 
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    if (field === 'eaClubId' || field === 'name') {
      setAutoFillResult('');
    }
  };

  const autoFillFromId = async () => {
    const clubId = formData.eaClubId.trim();
    
    if (!clubId) {
      setErrors({ ...errors, eaClubId: 'Entrez un EA Club ID d\'abord' });
      return;
    }

    console.log('🔍 Recherche EA Club ID:', clubId);
    setSearching(true);
    setAutoFillResult('🔍 Recherche en cours...');
    
    try {
      const response = await fetch('/api/admin/clubs/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: clubId, 
          type: 'id' 
        })
      });

      const result = await response.json();
      console.log('📊 Résultat recherche:', result);
      
      if (result.success && result.data?.found) {
        console.log('✅ Auto-remplissage réussi !');
        setFormData(prev => ({
          ...prev,
          name: result.data.name,
          platform: result.data.platform || 'ps5'
        }));
        setAutoFillResult(`✅ Club trouvé: "${result.data.name}" sur ${result.data.detectedPlatform || 'EA Sports'} !`);
        setErrors({});
      } else {
        const proposedName = result.data?.proposedName || `Club ${clubId}`;
        setFormData(prev => ({
          ...prev,
          name: proposedName
        }));
        setAutoFillResult(`⚠️ ${result.message || 'API indisponible'} → Mode manuel activé`);
        setErrors({});
      }
      
    } catch (error) {
      console.error('Erreur auto-remplissage:', error);
      const fallbackName = `Club ${clubId}`;
      setFormData(prev => ({
        ...prev,
        name: fallbackName
      }));
      setAutoFillResult('⚠️ Erreur réseau → Mode manuel activé');
      setErrors({});
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setErrors({ ...errors, name: 'Le nom du club est obligatoire' });
      return;
    }
    
    if (!formData.eaClubId.trim()) {
      setErrors({ ...errors, eaClubId: 'L\'EA Club ID est obligatoire' });
      return;
    }

    console.log('🏆 Création du club:', formData);
    setLoading(true);

    try {
      const response = await fetch('/api/admin/clubs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        alert(`✅ SUCCÈS !\n\nClub "${result.data.name}" créé !\n\n🆔 EA Club ID: ${result.data.eaClubId}\n🎮 Plateforme: ${result.data.platform}`);
        router.push('/admin/clubs');
      } else {
        alert(`❌ Erreur:\n${result.message}`);
      }
      
    } catch (error) {
      alert('❌ Erreur technique lors de la création.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="max-w-2xl mx-auto mb-8">
          <Link href="/admin/clubs" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Retour à la gestion des clubs
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🇸🇳 Nouveau Club Sénégalais
          </h1>
          <p className="text-gray-600">Auto-remplissage intelligent depuis EA Sports FC</p>
        </div>

        {/* Instructions */}
        <div className="max-w-2xl mx-auto mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-blue-900 mb-3">🚀 Auto-Remplissage Intelligent</h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p><strong>🎯 Workflow :</strong> Tapez l'EA Club ID → Chercher → Nom automatique → Créer</p>
            <p><strong>🧪 Testez :</strong> 24000 (BUUR MFC), 40142 (HOF 221), 29739, 460504, 46871, 1039553</p>
          </div>
        </div>

        {/* Formulaire Principal */}
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Informations du Club</h2>
          </div>
          
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* EA Club ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  # EA Club ID * (Auto-remplissage depuis EA Sports)
                </label>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={formData.eaClubId}
                    onChange={(e) => handleInputChange('eaClubId', e.target.value)}
                    style={{ 
                      backgroundColor: '#ffffff', 
                      color: '#1f2937',
                      border: '2px solid #d1d5db'
                    }}
                    className="flex-1 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-mono"
                    placeholder="Ex: 24000, 40142, 29739..."
                    disabled={loading || searching}
                  />
                  <button
                    type="button"
                    onClick={autoFillFromId}
                    disabled={!formData.eaClubId.trim() || searching || loading}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium"
                  >
                    {searching ? '🔄 Recherche...' : '🔍 Chercher'}
                  </button>
                </div>
                {errors.eaClubId && (
                  <p className="mt-2 text-sm text-red-600">❌ {errors.eaClubId}</p>
                )}
                {autoFillResult && (
                  <div className={`mt-3 p-3 rounded-lg border ${
                    autoFillResult.includes('✅') 
                      ? 'bg-green-50 border-green-200 text-green-800' 
                      : autoFillResult.includes('⚠️') 
                      ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}>
                    <p className="text-sm font-medium">{autoFillResult}</p>
                  </div>
                )}
              </div>

              {/* Nom du Club */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📛 Nom du Club *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  style={{ 
                    backgroundColor: '#ffffff', 
                    color: '#1f2937',
                    border: '2px solid #d1d5db'
                  }}
                  className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: BUUR MFC (auto-rempli via EA Club ID)"
                  disabled={loading}
                />
                {errors.name && (
                  <p className="mt-2 text-sm text-red-600">❌ {errors.name}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Se remplit automatiquement via EA Club ID, modifiable si nécessaire
                </p>
              </div>

              {/* Plateforme */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🎮 Plateforme de Jeu
                </label>
                <select
                  value={formData.platform}
                  onChange={(e) => handleInputChange('platform', e.target.value)}
                  style={{ 
                    backgroundColor: '#ffffff', 
                    color: '#1f2937',
                    border: '2px solid #d1d5db'
                  }}
                  className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                >
                  <option value="ps5" style={{ backgroundColor: '#ffffff', color: '#1f2937' }}>
                    🎮 PlayStation 5
                  </option>
                  <option value="ps4" style={{ backgroundColor: '#ffffff', color: '#1f2937' }}>
                    🎮 PlayStation 4
                  </option>
                  <option value="switch" style={{ backgroundColor: '#ffffff', color: '#1f2937' }}>
                    🎮 Nintendo Switch
                  </option>
                  <option value="pc" style={{ backgroundColor: '#ffffff', color: '#1f2937' }}>
                    💻 PC (Steam/Epic)
                  </option>
                  <option value="xbox" style={{ backgroundColor: '#ffffff', color: '#1f2937' }}>
                    🎮 Xbox Series X/S
                  </option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Sélectionnée automatiquement si détectée par l'API EA Sports
                </p>
              </div>

              {/* Club Actif */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <input
                    id="active"
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => handleInputChange('active', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={loading}
                  />
                  <label htmlFor="active" className="ml-3 text-sm font-medium text-gray-700">
                    ✅ Club Actif (participe aux synchronisations automatiques et au classement)
                  </label>
                </div>
              </div>

              {/* Boutons */}
              <div className="flex space-x-4 pt-6">
                <button
                  type="submit"
                  disabled={loading || searching || !formData.name.trim() || !formData.eaClubId.trim()}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium text-lg"
                >
                  {loading ? '⏳ Création en cours...' : '🏆 Créer le Club Sénégalais'}
                </button>
                
                <Link
                  href="/admin/clubs"
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium text-lg text-center"
                >
                  ❌ Annuler
                </Link>
              </div>
            </form>
          </div>
        </div>

        {/* Test Rapide */}
        <div className="max-w-2xl mx-auto mt-8">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="font-bold text-green-900 mb-3">🧪 Test Rapide :</h3>
            <p className="text-sm text-green-800 mb-4">Cliquez pour tester l'auto-remplissage :</p>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  handleInputChange('eaClubId', '24000');
                  setTimeout(() => autoFillFromId(), 300);
                }}
                className="bg-green-100 hover:bg-green-200 border border-green-300 px-4 py-3 rounded-lg text-green-800"
                disabled={loading || searching}
              >
                <div className="font-bold">24000</div>
                <div className="text-sm">→ BUUR MFC</div>
              </button>
              
              <button
                onClick={() => {
                  handleInputChange('eaClubId', '40142');
                  setTimeout(() => autoFillFromId(), 300);
                }}
                className="bg-blue-100 hover:bg-blue-200 border border-blue-300 px-4 py-3 rounded-lg text-blue-800"
                disabled={loading || searching}
              >
                <div className="font-bold">40142</div>
                <div className="text-sm">→ HOF 221</div>
              </button>
            </div>
            
            <p className="text-xs text-green-700 mt-3">
              ⚡ Auto-recherche : Cliquez → EA Club ID se remplit → Recherche automatique !
            </p>
          </div>
        </div>

        {/* Aide */}
        <div className="max-w-2xl mx-auto mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-bold text-yellow-900 mb-2">💡 Guide d'utilisation :</h4>
          <div className="text-sm text-yellow-800 space-y-1">
            <p><strong>✅ Auto-remplissage :</strong> Entrez l'EA Club ID, cliquez "Chercher"</p>
            <p><strong>🎮 Plateforme :</strong> Détectée automatiquement ou sélectionnez manuellement</p>
            <p><strong>🏆 Création :</strong> Vérifiez les informations puis créez le club</p>
          </div>
        </div>
      </div>
    </div>
  );
}