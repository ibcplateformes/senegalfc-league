'use client';

import { useState } from 'react';

export default function DebugSyncPage() {
  const [diagnostic, setDiagnostic] = useState<any>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [eaApiResult, setEaApiResult] = useState<any>(null);
  const [exploreResult, setExploreResult] = useState<any>(null);
  const [realLibResult, setRealLibResult] = useState<any>(null);
  const [fixResult, setFixResult] = useState<any>(null);
  const [syncResult, setSyncResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [matchId, setMatchId] = useState('');
  const [clubId, setClubId] = useState('40142'); // HOF 221 par défaut
  const [platform, setPlatform] = useState('ps5');

  const runDiagnostic = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/debug/sync-status');
      const result = await response.json();
      setDiagnostic(result);
    } catch (error) {
      console.error('Erreur diagnostic:', error);
    } finally {
      setLoading(false);
    }
  };

  const testSync = async () => {
    if (!matchId.trim()) {
      alert('Veuillez entrer un ID de match');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('/api/admin/debug/test-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId: matchId.trim() })
      });
      const result = await response.json();
      setTestResult(result);
    } catch (error) {
      console.error('Erreur test sync:', error);
      setTestResult({ success: false, error: 'Erreur réseau' });
    } finally {
      setLoading(false);
    }
  };

  const testEaApi = async () => {
    if (!clubId.trim()) {
      alert('Veuillez entrer un Club ID');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('/api/admin/debug/test-ea-api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          clubId: clubId.trim(),
          platform: platform
        })
      });
      const result = await response.json();
      setEaApiResult(result);
    } catch (error) {
      console.error('Erreur test EA API:', error);
      setEaApiResult({ success: false, error: 'Erreur réseau' });
    } finally {
      setLoading(false);
    }
  };

  const exploreFC25 = async () => {
    if (!clubId.trim()) {
      alert('Veuillez entrer un Club ID');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('/api/admin/debug/explore-fc25', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          clubId: clubId.trim(),
          platform: platform
        })
      });
      const result = await response.json();
      setExploreResult(result);
    } catch (error) {
      console.error('Erreur exploration FC25:', error);
      setExploreResult({ success: false, error: 'Erreur réseau' });
    } finally {
      setLoading(false);
    }
  };

  const testRealLib = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/debug/test-real-lib');
      const result = await response.json();
      setRealLibResult(result);
    } catch (error) {
      console.error('Erreur test vraie librairie:', error);
      setRealLibResult({ success: false, error: 'Erreur réseau' });
    } finally {
      setLoading(false);
    }
  };

  const fixMissingEaMatchIds = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/debug/fix-missing-ea-match-ids', {
        method: 'POST'
      });
      const result = await response.json();
      setFixResult(result);
    } catch (error) {
      console.error('Erreur récupération EA Match IDs:', error);
      setFixResult({ success: false, error: 'Erreur réseau' });
    } finally {
      setLoading(false);
    }
  };

  const syncAllPlayers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/debug/sync-all-players', {
        method: 'POST'
      });
      const result = await response.json();
      setSyncResult(result);
    } catch (error) {
      console.error('Erreur synchronisation joueurs:', error);
      setSyncResult({ success: false, error: 'Erreur réseau' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>
        Debug Synchronisation Joueurs
      </h1>

      {/* Diagnostic général */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '1.5rem', 
        borderRadius: '0.5rem', 
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        marginBottom: '2rem'
      }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          Diagnostic Général
        </h2>
        <button
          onClick={runDiagnostic}
          disabled={loading}
          style={{
            backgroundColor: loading ? '#9ca3af' : '#2563eb',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.375rem',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: '1rem'
          }}
        >
          {loading ? 'Analyse...' : 'Analyser la base de données'}
        </button>

        {diagnostic && (
          <div style={{ 
            backgroundColor: '#f9fafb', 
            padding: '1rem', 
            borderRadius: '0.375rem',
            fontFamily: 'monospace',
            fontSize: '0.875rem'
          }}>
            <div><strong>Matchs validés:</strong> {diagnostic.diagnostic?.validatedMatches || 0}</div>
            <div><strong>Joueurs en base:</strong> {diagnostic.diagnostic?.totalPlayers || 0}</div>
            <div><strong>Stats de match:</strong> {diagnostic.diagnostic?.matchStats || 0}</div>
            
            {diagnostic.diagnostic?.matchDetails && diagnostic.diagnostic.matchDetails.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <strong>Matchs validés:</strong>
                {diagnostic.diagnostic.matchDetails.map((match: any, index: number) => (
                  <div key={index} style={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
                    • {match.homeClub} {match.score} {match.awayClub}
                    <br />
                    &nbsp;&nbsp;ID: <code>{match.id}</code>
                    <br />
                    &nbsp;&nbsp;EA Match ID: <code>{match.eaMatchId || 'MANQUANT'}</code>
                  </div>
      
      {/* Script de Migration - Récupération EA Match IDs */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '1.5rem', 
        borderRadius: '0.5rem', 
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        marginBottom: '2rem'
      }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          ÉTAPE 1: Récupération EA Match IDs Manquants
        </h2>
        
        <p style={{ marginBottom: '1rem', color: '#6b7280' }}>
          Ce script va chercher les EA Match IDs manquants pour vos matchs validés en fouillant dans l'API EA Sports.
        </p>
        
        <button
          onClick={fixMissingEaMatchIds}
          disabled={loading}
          style={{
            backgroundColor: loading ? '#9ca3af' : '#dc2626',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.375rem',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: '1rem'
          }}
        >
          {loading ? 'Recherche en cours...' : 'ÉTAPE 1: Récupérer les EA Match IDs'}
        </button>
        
        {fixResult && (
          <div style={{ 
            backgroundColor: fixResult.success ? '#dcfce7' : '#fef2f2', 
            border: `1px solid ${fixResult.success ? '#16a34a' : '#ef4444'}`,
            padding: '1rem', 
            borderRadius: '0.375rem',
            fontFamily: 'monospace',
            fontSize: '0.875rem'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
              {fixResult.success ? 'RÉCUPÉRATION TERMINÉE !' : 'ÉCHEC RÉCUPÉRATION'}
            </div>
            
            <div><strong>Message:</strong> {fixResult.message}</div>
            
            {fixResult.data && (
              <div style={{ marginTop: '1rem' }}>
                <div><strong>Résultat:</strong> {fixResult.data.fixed}/{fixResult.data.total} EA Match IDs récupérés</div>
                
                {fixResult.data.results && fixResult.data.results.length > 0 && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <strong>Détails:</strong>
                    <div style={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
                      {fixResult.data.results.map((result: any, index: number) => (
                        <div key={index} style={{ marginBottom: '0.5rem', padding: '0.5rem', backgroundColor: '#f9fafb', borderRadius: '0.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>
                              {result.status === 'fixed' ? '✅' : 
                               result.status === 'found_but_mismatch' ? '⚠️' : 
                               result.status === 'not_found' ? '❌' : '⚠️'}
                            </span>
                            <strong>{result.homeClub} vs {result.awayClub}</strong>
                          </div>
                          {result.status === 'fixed' && result.eaMatchId && (
                            <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.25rem' }}>
                              EA Match ID ajouté: {result.eaMatchId}
                            </div>
                          )}
                          {result.status === 'found_but_mismatch' && result.details && (
                            <div style={{ fontSize: '0.75rem', color: '#f59e0b', marginTop: '0.25rem' }}>
                              Match trouvé mais scores différents: DB({result.details.dbScore}) vs EA({result.details.eaScore})
                            </div>
                          )}
                          {result.status === 'not_found' && (
                            <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem' }}>
                              Aucun match correspondant trouvé dans l'API EA Sports
                            </div>
                          )}
                          {result.error && (
                            <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem' }}>
                              Erreur: {result.error}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Script de Migration - Synchronisation Joueurs */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '1.5rem', 
        borderRadius: '0.5rem', 
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        marginBottom: '2rem'
      }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          ÉTAPE 2: Synchronisation Complète des Stats Joueurs
        </h2>
        
        <p style={{ marginBottom: '1rem', color: '#6b7280' }}>
          Ce script va synchroniser automatiquement tous les joueurs pour tous les matchs qui ont un EA Match ID.
        </p>
        
        <button
          onClick={syncAllPlayers}
          disabled={loading}
          style={{
            backgroundColor: loading ? '#9ca3af' : '#059669',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.375rem',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: '1rem'
          }}
        >
          {loading ? 'Synchronisation en cours...' : 'ÉTAPE 2: Synchroniser tous les joueurs'}
        </button>
        
        {syncResult && (
          <div style={{ 
            backgroundColor: syncResult.success ? '#dcfce7' : '#fef2f2', 
            border: `1px solid ${syncResult.success ? '#16a34a' : '#ef4444'}`,
            padding: '1rem', 
            borderRadius: '0.375rem',
            fontFamily: 'monospace',
            fontSize: '0.875rem'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
              {syncResult.success ? 'SYNCHRONISATION TERMINÉE !' : 'ÉCHEC SYNCHRONISATION'}
            </div>
            
            <div><strong>Message:</strong> {syncResult.message}</div>
            
            {syncResult.data && (
              <div style={{ marginTop: '1rem' }}>
                <div><strong>Matchs traités:</strong> {syncResult.data.processed}/{syncResult.data.total}</div>
                <div><strong>Joueurs créés:</strong> {syncResult.data.playersCreated}</div>
                <div><strong>Joueurs mis à jour:</strong> {syncResult.data.playersUpdated}</div>
                
                {syncResult.data.results && syncResult.data.results.length > 0 && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <strong>Détails par match:</strong>
                    <div style={{ marginLeft: '1rem', marginTop: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
                      {syncResult.data.results.slice(0, 10).map((result: any, index: number) => (
                        <div key={index} style={{ marginBottom: '0.5rem', padding: '0.5rem', backgroundColor: '#f9fafb', borderRadius: '0.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>
                              {result.status === 'synced' ? '✅' : 
                               result.status === 'already_synced' ? 'ℹ️' : '❌'}
                            </span>
                            <strong>{result.homeClub} vs {result.awayClub}</strong>
                          </div>
                          {result.status === 'synced' && (
                            <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.25rem' }}>
                              {result.playersCreated} créés, {result.playersUpdated} mis à jour
                            </div>
                          )}
                          {result.status === 'already_synced' && (
                            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                              Déjà synchronisé ({result.existingStats} stats)
                            </div>
                          )}
                          {result.error && (
                            <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem' }}>
                              Erreur: {result.error}
                            </div>
                          )}
                        </div>
                      ))}
                      {syncResult.data.results.length > 10 && (
                        <div style={{ fontSize: '0.75rem', color: '#6b7280', textAlign: 'center', marginTop: '0.5rem' }}>
                          ... et {syncResult.data.results.length - 10} autres matchs
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Test Vraie Librairie EA Sports */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '1.5rem', 
        borderRadius: '0.5rem', 
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        marginBottom: '2rem'
      }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          Test Vraie Librairie EA Sports (eafc-clubs-api)
        </h2>
        
        <p style={{ marginBottom: '1rem', color: '#6b7280' }}>
          Test direct de la librairie eafc-clubs-api utilisée par ClubStats Pro.
        </p>
        
        <button
          onClick={testRealLib}
          disabled={loading}
          style={{
            backgroundColor: loading ? '#9ca3af' : '#10b981',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.375rem',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: '1rem'
          }}
        >
          {loading ? 'Test en cours...' : 'Tester la vraie librairie EA Sports'}
        </button>
        
        {realLibResult && (
          <div style={{ 
            backgroundColor: realLibResult.success ? '#dcfce7' : '#fef2f2', 
            border: `1px solid ${realLibResult.success ? '#16a34a' : '#ef4444'}`,
            padding: '1rem', 
            borderRadius: '0.375rem',
            fontFamily: 'monospace',
            fontSize: '0.875rem'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
              {realLibResult.success ? 'VRAIE LIBRAIRIE FONCTIONNE !' : 'ÉCHEC VRAIE LIBRAIRIE'}
            </div>
            
            {realLibResult.success ? (
              <div>
                <div><strong>Message:</strong> {realLibResult.message}</div>
                {realLibResult.data && (
                  <div style={{ marginTop: '1rem' }}>
                    <div><strong>Club testé:</strong> {realLibResult.data.clubId}</div>
                    <div><strong>Plateforme:</strong> {realLibResult.data.platform}</div>
                    
                    {realLibResult.data.summary && (
                      <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#f0fdf4', borderRadius: '0.25rem' }}>
                        <strong>Résumé:</strong> {realLibResult.data.summary.successful}/{realLibResult.data.summary.total} tests réussis
                      </div>
                    )}
                    
                    <div style={{ marginTop: '0.5rem' }}>
                      <strong>Résultats des tests:</strong>
                      <div style={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
                        {realLibResult.data.tests?.map((test: any, index: number) => (
                          <div key={index} style={{ marginBottom: '0.5rem', padding: '0.5rem', backgroundColor: '#f9fafb', borderRadius: '0.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span>{test.success ? '✅' : '❌'}</span>
                              <strong>{test.name}</strong>
                            </div>
                            {test.success && test.data && (
                              <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.25rem' }}>
                                {test.name === 'Club Info' && test.data.name && (
                                  <div>• Club: {test.data.name}</div>
                                )}
                                {test.name === 'Member Stats' && test.data.memberCount && (
                                  <div>• {test.data.memberCount} membres avec stats</div>
                                )}
                                {test.name === 'Matches' && test.data.matchCount && (
                                  <div>• {test.data.matchCount} matchs récupérés</div>
                                )}
                              </div>
                            )}
                            {test.error && (
                              <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem' }}>
                                Erreur: {test.error}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                {realLibResult.success && (
                  <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#fef3c7', borderRadius: '0.25rem', border: '1px solid #f59e0b' }}>
                    <strong>EXCELLENTE NOUVELLE !</strong>
                    <div style={{ marginTop: '0.25rem', fontSize: '0.875rem' }}>
                      La vraie librairie fonctionne ! Vos stats de joueurs peuvent maintenant être synchronisées.
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div><strong>Erreur:</strong> {realLibResult.error}</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Test API EA Sports */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '1.5rem', 
        borderRadius: '0.5rem', 
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        marginBottom: '2rem'
      }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          Test API EA Sports
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
              Club ID EA Sports:
            </label>
            <input
              type="text"
              value={clubId}
              onChange={(e) => setClubId(e.target.value)}
              placeholder="40142 (HOF 221)"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.875rem'
              }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
              Plateforme:
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.875rem'
              }}
            >
              <option value="ps5">PlayStation 5</option>
              <option value="ps4">PlayStation 4</option>
              <option value="xboxseriesxs">Xbox Series X/S</option>
              <option value="xboxone">Xbox One</option>
              <option value="pc">PC</option>
            </select>
          </div>
        </div>

        <button
          onClick={testEaApi}
          disabled={loading || !clubId.trim()}
          style={{
            backgroundColor: loading || !clubId.trim() ? '#9ca3af' : '#f59e0b',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.375rem',
            border: 'none',
            cursor: loading || !clubId.trim() ? 'not-allowed' : 'pointer',
            marginBottom: '1rem',
            marginRight: '1rem'
          }}
        >
          {loading ? 'Test en cours...' : 'Tester endpoints actuels'}
        </button>
        
        <button
          onClick={exploreFC25}
          disabled={loading || !clubId.trim()}
          style={{
            backgroundColor: loading || !clubId.trim() ? '#9ca3af' : '#dc2626',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.375rem',
            border: 'none',
            cursor: loading || !clubId.trim() ? 'not-allowed' : 'pointer',
            marginBottom: '1rem'
          }}
        >
          {loading ? 'Exploration...' : 'Explorer nouveaux endpoints FC25'}
        </button>

        {eaApiResult && (
          <div style={{ 
            backgroundColor: eaApiResult.success ? '#f0f9ff' : '#fef2f2', 
            border: `1px solid ${eaApiResult.success ? '#3b82f6' : '#ef4444'}`,
            padding: '1rem', 
            borderRadius: '0.375rem',
            fontFamily: 'monospace',
            fontSize: '0.875rem'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
              {eaApiResult.success ? 'TESTS API EA SPORTS' : 'ÉCHEC API EA SPORTS'}
            </div>
            
            {eaApiResult.success ? (
              <div>
                <div><strong>Message:</strong> {eaApiResult.message}</div>
                {eaApiResult.data && (
                  <div style={{ marginTop: '1rem' }}>
                    <div><strong>Club testé:</strong> {eaApiResult.data.clubId}</div>
                    <div><strong>Plateforme:</strong> {eaApiResult.data.platform}</div>
                    <div style={{ marginTop: '0.5rem' }}>
                      <strong>Résultats des tests:</strong>
                      <div style={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
                        {eaApiResult.data.tests?.map((test: any, index: number) => (
                          <div key={index} style={{ marginBottom: '0.5rem', padding: '0.5rem', backgroundColor: '#f9fafb', borderRadius: '0.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span>{test.success ? '✅' : '❌'}</span>
                              <strong>{test.name}</strong>
                              <span style={{ color: '#6b7280' }}>({test.status})</span>
                            </div>
                            {test.success && test.hasData && (
                              <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.25rem' }}>
                                • Données présentes: {test.dataKeys ? test.dataKeys.join(', ') : 'Oui'}
                                {test.arrayLength !== undefined && (
                                  <span> ({test.arrayLength} éléments)</span>
                                )}
                              </div>
                            )}
                            {test.sample && (
                              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem', maxWidth: '100%', overflow: 'hidden' }}>
                                Aperçu: {test.sample}
                              </div>
                            )}
                            {test.error && (
                              <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem' }}>
                                Erreur: {test.error}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {eaApiResult.data.summary && (
                      <div style={{ marginTop: '1rem', padding: '0.5rem', backgroundColor: '#f0f9ff', borderRadius: '0.25rem' }}>
                        <strong>Résumé:</strong> {eaApiResult.data.summary.successful}/{eaApiResult.data.summary.total} endpoints fonctionnels
                        {eaApiResult.data.summary.workingEndpoints.length > 0 && (
                          <div style={{ marginTop: '0.25rem', fontSize: '0.75rem' }}>
                            Endpoints qui marchent: {eaApiResult.data.summary.workingEndpoints.map((ep: any) => ep.name).join(', ')}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div><strong>Erreur:</strong> {eaApiResult.error}</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Test de synchronisation */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '1.5rem', 
        borderRadius: '0.5rem', 
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        marginBottom: '2rem'
      }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          Test de Synchronisation
        </h2>
        
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
            ID du match à tester:
          </label>
          <input
            type="text"
            value={matchId}
            onChange={(e) => setMatchId(e.target.value)}
            placeholder="Entrez l'ID du match"
            style={{
              width: '100%',
              maxWidth: '400px',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '0.875rem'
            }}
          />
        </div>

        <button
          onClick={testSync}
          disabled={loading || !matchId.trim()}
          style={{
            backgroundColor: loading || !matchId.trim() ? '#9ca3af' : '#10b981',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.375rem',
            border: 'none',
            cursor: loading || !matchId.trim() ? 'not-allowed' : 'pointer',
            marginBottom: '1rem'
          }}
        >
          {loading ? 'Test en cours...' : 'Tester la synchronisation'}
        </button>

        {testResult && (
          <div style={{ 
            backgroundColor: testResult.success ? '#f0f9ff' : '#fef2f2', 
            border: `1px solid ${testResult.success ? '#3b82f6' : '#ef4444'}`,
            padding: '1rem', 
            borderRadius: '0.375rem',
            fontFamily: 'monospace',
            fontSize: '0.875rem'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
              {testResult.success ? 'SUCCÈS' : 'ÉCHEC'}
            </div>
            
            {testResult.success ? (
              <div>
                <div><strong>Message:</strong> {testResult.message}</div>
                {testResult.debug && (
                  <div style={{ marginTop: '1rem' }}>
                    <div><strong>Match:</strong> {testResult.debug.match?.homeClub} vs {testResult.debug.match?.awayClub}</div>
                    <div><strong>Score:</strong> {testResult.debug.match?.score}</div>
                    <div><strong>EA Match ID:</strong> {testResult.debug.match?.eaMatchId}</div>
                    <div><strong>Platform:</strong> {testResult.debug.match?.platform}</div>
                    <div style={{ marginTop: '0.5rem' }}>
                      <strong>Réponse EA Sports:</strong>
                      <div style={{ marginLeft: '1rem' }}>
                        • Clubs: {testResult.debug.eaApiResponse?.hasClubs ? '✅' : '❌'}
                        <br />
                        • Joueurs: {testResult.debug.eaApiResponse?.hasPlayers ? '✅' : '❌'}
                        <br />
                        • Total joueurs trouvés: {testResult.debug.eaApiResponse?.totalPlayersFound || 0}
                        <br />
                        • Clubs avec joueurs: {testResult.debug.eaApiResponse?.clubsWithPlayers?.join(', ') || 'Aucun'}
                      </div>
                    </div>
                    <div><strong>Stats existantes:</strong> {testResult.debug.existingPlayerStats} entrées</div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div><strong>Erreur:</strong> {testResult.error}</div>
                {testResult.debug && (
                  <div style={{ marginTop: '1rem' }}>
                    <strong>Debug:</strong>
                    <pre style={{ whiteSpace: 'pre-wrap', marginTop: '0.5rem' }}>
                      {JSON.stringify(testResult.debug, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions recommandées */}
      <div style={{ 
        backgroundColor: '#fef3c7', 
        border: '1px solid #f59e0b',
        padding: '1rem', 
        borderRadius: '0.375rem',
        fontSize: '0.875rem'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Actions recommandées:</div>
        <ol style={{ marginLeft: '1rem' }}>
          <li><strong>NOUVEAU - Testez d'abord la vraie librairie EA Sports</strong> (bouton vert ci-dessus)</li>
          <li>Lancez le <strong>diagnostic général</strong> pour voir l'état de la base</li>
          <li><strong>Testez l'API EA Sports</strong> avec le Club ID 40142 pour voir quels endpoints actuels marchent</li>
          <li>Si des endpoints fonctionnels sont trouvés, nous corrigerons le code pour les utiliser</li>
          <li>Une fois l'API fixée, testez la synchronisation d'un match spécifique</li>
        </ol>
        
        <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#dcfce7', borderRadius: '0.25rem', border: '1px solid #16a34a' }}>
          <strong>NOUVELLE SOLUTION IMPLÉMENTÉE :</strong>
          <br />Nous avons implémenté la vraie librairie <code>eafc-clubs-api</code> utilisée par ClubStats Pro.
          <br />Cette librairie devrait résoudre tous les problèmes de synchronisation des stats !
        </div>
        
        <div style={{ marginTop: '0.75rem', padding: '0.75rem', backgroundColor: '#fee2e2', borderRadius: '0.25rem', border: '1px solid #fecaca' }}>
          <strong>Problème identifié:</strong>
          <br />1. EA Match IDs manquants dans les matchs validés
          <br />2. Endpoints EA Sports obsolètes (seul 1/5 fonctionne)
          <br />3. Solution: Vraie librairie eafc-clubs-api comme ClubStats Pro
        </div>
      </div>
    </div>
  );
}
