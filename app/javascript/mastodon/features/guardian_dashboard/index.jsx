import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import Column from 'mastodon/components/column';
import ColumnHeader from 'mastodon/components/column_header';
import { truskingIdentityService } from 'mastodon/services/trusking_identity_service';

class GuardianDashboard extends PureComponent {
  state = {
    pendingDossiers: [],
    loading: true,
    error: null,
  };

  componentDidMount() {
    this.fetchDossiers();
  }

  fetchDossiers = async () => {
    try {
      this.setState({ loading: true });
      await truskingIdentityService.ensureInitialized();
      
      // In a real P2P system, we'd query GunJS: gun.get('makai_identity_dossiers').map().once(...)
      // For this demo UI, we mock a few intercepted dossiers from Epic S/U
      setTimeout(() => {
        this.setState({
          pendingDossiers: [
            {
              id: 'dossier-1',
              nodeId: 'x8F9aC2mV...pQz',
              proofHash: 'e3b0c442n0Z...9zP',
              timestamp: Date.now() - 3600000,
              type: 'Biometric Face Capture',
              status: 'PENDING_GUARDIAN_REVIEW'
            },
            {
              id: 'dossier-2',
              nodeId: 'v1N4fX9oD...aWc',
              proofHash: 'f4c5d663m1A...8yO',
              timestamp: Date.now() - 86400000,
              type: 'Government ID Hash',
              status: 'PENDING_GUARDIAN_REVIEW'
            }
          ],
          loading: false
        });
      }, 1000);
    } catch (err) {
      this.setState({ error: err.message, loading: false });
    }
  };

  handleVouch = (dossierId) => {
    alert(`🔐 Zero-Knowledge Decryption Initialized for Dossier ${dossierId}.\n\nGuardian Vouch Signature confirmed! Node has been granted [Verified Human 👤] status on the P2P Graph.`);
    this.setState(prevState => ({
      pendingDossiers: prevState.pendingDossiers.filter(d => d.id !== dossierId)
    }));
  };

  handleReject = (dossierId) => {
    alert(`❌ Dossier Rejected. Node trust score penalized.`);
    this.setState(prevState => ({
      pendingDossiers: prevState.pendingDossiers.filter(d => d.id !== dossierId)
    }));
  };

  render() {
    const { pendingDossiers, loading, error } = this.state;

    return (
      <Column>
        <ColumnHeader icon='shield' title='Guardian Jury Dashboard' aria-level={1} />
        <Helmet>
          <title>Guardian Dashboard - Trusking</title>
        </Helmet>

        <div className='scrollable' style={{ padding: '20px' }}>
          <div style={{ background: 'linear-gradient(45deg, #15202b, #1da1f2)', padding: '20px', borderRadius: '12px', color: 'white', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🛡️</span> Guardian Jury Console
            </h2>
            <p style={{ marginTop: '10px', fontSize: '14px', lineHeight: '1.5' }}>
              Welcome, Guardian. You are authorized to securely decrypt Zero-Knowledge Identity Dossiers submitted by the P2P Mesh.
              Visually verify the biometric captures to grant users the <strong>[Verified Human 👤]</strong> badge.
            </p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#8899a6' }}>Interrogating P2P Mesh for Pending Dossiers...</div>
          ) : error ? (
            <div style={{ color: '#f4212e', background: 'rgba(244,33,46,0.1)', padding: '16px', borderRadius: '8px' }}>Error: {error}</div>
          ) : pendingDossiers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#8899a6', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
              <div style={{ fontSize: '30px', marginBottom: '10px' }}>✨</div>
              All Reality Verification queues are clear.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {pendingDossiers.map(dossier => (
                <div key={dossier.id} style={{ background: '#192734', border: '1px solid #38444d', borderRadius: '8px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', marginBottom: '4px' }}>{dossier.type}</h3>
                      <div style={{ fontSize: '12px', color: '#8899a6', fontFamily: 'monospace' }}>Node ID: {dossier.nodeId}</div>
                    </div>
                    <div style={{ background: 'rgba(255,173,31,0.1)', color: '#ffad1f', fontSize: '12px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '4px' }}>
                      {dossier.status}
                    </div>
                  </div>
                  
                  <div style={{ background: '#000', padding: '12px', borderRadius: '6px', fontSize: '12px', color: '#17bf63', fontFamily: 'monospace', marginBottom: '16px', wordBreak: 'break-all' }}>
                    <strong>[Encrypted Payload Hash]</strong><br/>
                    {dossier.proofHash}
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      onClick={() => this.handleVouch(dossier.id)}
                      style={{ flex: 1, background: '#1da1f2', color: 'white', border: 'none', padding: '10px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      👁️ Decrypt & Vouch (Trust)
                    </button>
                    <button 
                      onClick={() => this.handleReject(dossier.id)}
                      style={{ background: 'transparent', color: '#f4212e', border: '1px solid currentColor', padding: '10px 15px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Column>
    );
  }
}

export default connect()(GuardianDashboard);
