'use client';

import { useState } from 'react';

export default function DebugSyncPage() {
  const [diagnostic, setDiagnostic] = useState<any>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [eaApiResult, setEaApiResult] = useState<any>(null);
  const [exploreResult, setExploreResult] = useState<any>(null);
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

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>
        🧪 Debug Synchronisation Joueurs
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
          📊 Diagnostic Général
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
          {loading ? 'Analyse...' : '🔍 Analyser la base de données'}
        </button>

        {diagnostic && (
          <div style={{ 
            backgroundColor: '#f9fafb', 
            padding: '1rem', 
            borderRadius: '0.375rem',
            fontFamily: 'monospace',
            fontSize: '0.875rem'
          }}>
            <div><strong>✅ Matchs validés:</strong> {diagnostic.diagnostic?.validatedMatches || 0}</div>
            <div><strong>👥 Joueurs en base:</strong> {diagnostic.diagnostic?.totalPlayers || 0}</div>
            <div><strong>📈 Stats de match:</strong> {diagnostic.diagnostic?.matchStats || 0}</div>
            
            {diagnostic.diagnostic?.matchDetails && diagnostic.diagnostic.matchDetails.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <strong>📋 Matchs validés:</strong>
                {diagnostic.diagnostic.matchDetails.map((match: any, index: number) => (
                  <div key={index} style={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
                    • {match.homeClub} {match.score} {match.awayClub}
                    <br />
                    &nbsp;&nbsp;ID: <code>{match.id}</code>
                    <br />
                    &nbsp;&nbsp;EA Match ID: <code>{match.eaMatchId || 'MANQUANT ❌'}</code>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Exploration FC25 Results */}
      {exploreResult && (
        <div style={{ 
          backgroundColor: 'white', 
          padding: '1.5rem', 
          borderRadius: '0.5rem', 
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          marginBottom: '2rem'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            🔍 Exploration Endpoints EA FC 25
          </h2>
          
          <div style={{ 
            backgroundColor: exploreResult.success ? '#f0f9ff' : '#fef2f2', 
            border: `1px solid ${exploreResult.success ? '#3b82f6' : '#ef4444'}`,
            padding: '1rem', 
            borderRadius: '0.375rem',
            fontFamily: 'monospace',
            fontSize: '0.875rem'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
              {exploreResult.success ? '✅ EXPLORATION FC25 RÉUSSIE' : '❌ ÉCHEC EXPLORATION FC25'}
            </div>
            
            {exploreResult.success ? (
              <div>
                <div><strong>Message:</strong> {exploreResult.message}</div>
                {exploreResult.data && (
                  <div style={{ marginTop: '1rem' }}>
                    <div><strong>🎮 Club exploré:</strong> {exploreResult.data.clubId}</div>
                    <div><strong>🎮 Plateforme:</strong> {exploreResult.data.platform}</div>
                    
                    {exploreResult.data.summary && (
                      <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#f0f9ff', borderRadius: '0.25rem' }}>
                        <strong>📈 Résumé:</strong> {exploreResult.data.summary.successful}/{exploreResult.data.summary.total} endpoints fonctionnels
                        <br />
                        <strong>⚽ Endpoints matchs potentiels:</strong> {exploreResult.data.summary.potentialMatches}
                        <br />
                        <strong>👥 Endpoints joueurs potentiels:</strong> {exploreResult.data.summary.potentialPlayers}
                      </div>
                    )}
                    
                    <div style={{ marginTop: '0.5rem' }}>
                      <strong>📈 Résultats détaillés:</strong>
                      <div style={{ marginLeft: '1rem', marginTop: '0.5rem', maxHeight: '400px', overflowY: 'auto' }}>
                        {exploreResult.data.tests?.map((test: any, index: number) => (
                          <div key={index} style={{ marginBottom: '0.75rem', padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.25rem', border: `1px solid ${test.success ? '#d1fae5' : '#fecaca'}` }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                              <span>{test.success ? '✅' : '❌'}</span>
                              <strong style={{ color: test.success ? '#10b981' : '#ef4444' }}>{test.name}</strong>
                              <span style={{ color: '#6b7280' }}>({test.status})</span>
                            </div>
                            
                            {test.success && test.hasData && (
                              <div>
                                <div style={{ fontSize: '0.75rem', color: '#10b981', marginBottom: '0.25rem' }}>
                                  • Type: {test.isArray ? `Array[${test.arrayLength}]` : 'Object'}
                                  <br />
                                  • Clés: {test.dataKeys.slice(0, 8).join(', ')}{test.dataKeys.length > 8 ? '...' : ''}
                                </div>
                                
                                {test.sample && (
                                  <details style={{ marginTop: '0.25rem' }}>
                                    <summary style={{ cursor: 'pointer', fontSize: '0.75rem', color: '#6b7280' }}>Voir l'aperçu des données</summary>
                                    <div style={{ fontSize: '0.6rem', color: '#6b7280', marginTop: '0.25rem', padding: '0.5rem', backgroundColor: 'white', borderRadius: '0.25rem', maxHeight: '100px', overflowY: 'auto', fontFamily: 'monospace' }}>
                                      {test.sample}
                                    </div>
                                  </details>
                                )}
                              </div>
                            )}
                            
                            <div style={{ fontSize: '0.6rem', color: '#6b7280', marginTop: '0.25rem' }}>
                              URL: {test.url}
                            </div>
                            
                            {test.error && (
                              <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem' }}>
                                Erreur: {test.error}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {exploreResult.data.recommendations && (
                      <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#fef3c7', borderRadius: '0.25rem', border: '1px solid #f59e0b' }}>
                        <strong>📝 Recommandations:</strong>
                        <div style={{ marginTop: '0.25rem', fontSize: '0.875rem' }}>
                          {exploreResult.data.recommendations.nextSteps}
                        </div>
                        
                        {exploreResult.data.recommendations.bestMatchEndpoints?.length > 0 && (
                          <div style={{ marginTop: '0.5rem' }}>
                            <strong>Meilleurs endpoints pour les matchs:</strong>
                            <ul style={{ marginLeft: '1rem', marginTop: '0.25rem' }}>
                              {exploreResult.data.recommendations.bestMatchEndpoints.map((endpoint: any, index: number) => (
                                <li key={index} style={{ fontSize: '0.75rem' }}>{endpoint.name}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {exploreResult.data.recommendations.bestPlayerEndpoints?.length > 0 && (
                          <div style={{ marginTop: '0.5rem' }}>
                            <strong>Meilleurs endpoints pour les joueurs:</strong>
                            <ul style={{ marginLeft: '1rem', marginTop: '0.25rem' }}>
                              {exploreResult.data.recommendations.bestPlayerEndpoints.map((endpoint: any, index: number) => (
                                <li key={index} style={{ fontSize: '0.75rem' }}>{endpoint.name}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div><strong>Erreur:</strong> {exploreResult.error}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Test API EA Sports */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '1.5rem', 
        borderRadius: '0.5rem', 
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        marginBottom: '2rem'
      }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          🎮 Test API EA Sports
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
          {loading ? 'Test en cours...' : '🎮 Tester endpoints actuels'}
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
          {loading ? 'Exploration...' : '🔍 Explorer nouveaux endpoints FC25'}
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
              {eaApiResult.success ? '✅ TESTS API EA SPORTS' : '❌ ÉCHEC API EA SPORTS'}
            </div>
            
            {eaApiResult.success ? (
              <div>
                <div><strong>Message:</strong> {eaApiResult.message}</div>
                {eaApiResult.data && (
                  <div style={{ marginTop: '1rem' }}>
                    <div><strong>🎮 Club testé:</strong> {eaApiResult.data.clubId}</div>
                    <div><strong>🎮 Plateforme:</strong> {eaApiResult.data.platform}</div>
                    <div style={{ marginTop: '0.5rem' }}>
                      <strong>📈 Résultats des tests:</strong>
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
                        <strong>📈 Résumé:</strong> {eaApiResult.data.summary.successful}/{eaApiResult.data.summary.total} endpoints fonctionnels
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
          🧪 Test de Synchronisation
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
          {loading ? 'Test en cours...' : '🔄 Tester la synchronisation'}
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
              {testResult.success ? '✅ SUCCÈS' : '❌ ÉCHEC'}
            </div>
            
            {testResult.success ? (
              <div>
                <div><strong>Message:</strong> {testResult.message}</div>
                {testResult.debug && (
                  <div style={{ marginTop: '1rem' }}>
                    <div><strong>🏆 Match:</strong> {testResult.debug.match?.homeClub} vs {testResult.debug.match?.awayClub}</div>
                    <div><strong>📊 Score:</strong> {testResult.debug.match?.score}</div>
                    <div><strong>🆔 EA Match ID:</strong> {testResult.debug.match?.eaMatchId}</div>
                    <div><strong>🎮 Platform:</strong> {testResult.debug.match?.platform}</div>
                    <div style={{ marginTop: '0.5rem' }}>
                      <strong>📡 Réponse EA Sports:</strong>
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
                    <div><strong>💾 Stats existantes:</strong> {testResult.debug.existingPlayerStats} entrées</div>
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
        <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>💡 Actions recommandées:</div>
        <ol style={{ marginLeft: '1rem' }}>
          <li>Lancez d'abord le <strong>diagnostic général</strong> pour voir l'état de la base</li>
          <li><strong>🎮 Testez l'API EA Sports</strong> avec le Club ID 40142 pour voir quels endpoints actuels marchent</li>
          <li><strong>🔍 🆕 Explorez les nouveaux endpoints FC25</strong> - Ceci va tester 12 endpoints différents pour trouver les nouveaux</li>
          <li>Si des endpoints fonctionnels sont trouvés, nous corrigerons le code pour les utiliser</li>
          <li>Une fois l'API fixée, testez la synchronisation d'un match spécifique</li>
        </ol>
        
        <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#fee2e2', borderRadius: '0.25rem', border: '1px solid #fecaca' }}>
          <strong>🎯 Problème principal identifié:</strong>
          <br />1. EA Match IDs manquants dans les matchs validés
          <br />2. Endpoints EA Sports obsolètes (seul 1/5 fonctionne)
          <br />3. L'exploration FC25 va nous dire quels nouveaux endpoints utiliser
        </div>
        
        <div style={{ marginTop: '0.75rem', padding: '0.75rem', backgroundColor: '#dcfce7', borderRadius: '0.25rem', border: '1px solid #16a34a' }}>
          <strong>✅ Solution identifiée:</strong>
          <br />L'exploration des nouveaux endpoints FC25 va révéler les vraies APIs à utiliser pour récupérer les matchs et stats de joueurs.
        </div>
      </div>
    </div>
  );
}
