import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';
import Column from 'mastodon/components/column';
import ColumnHeader from 'mastodon/components/column_header';
import { p2pTrust } from 'mastodon/services/p2p_trust_service';
import { truskingIdentityService } from 'mastodon/services/trusking_identity_service';

class GuildsDashboard extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
  };

  state = {
    guilds: [],
    nodeId: null,
    newGuildName: '',
    newGuildDesc: '',
  };

  async componentDidMount() {
    await truskingIdentityService.ensureInitialized();
    const nodeId = truskingIdentityService.getNodeId();
    this.setState({ nodeId });

    this.unsubscribe = p2pTrust.subscribeToGuilds((guilds) => {
      this.setState({ guilds });
    });
  }

  componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  handleCreateGuild = (e) => {
    e.preventDefault();
    const { newGuildName, newGuildDesc, nodeId } = this.state;
    if (newGuildName.trim()) {
      p2pTrust.createGuild(newGuildName, newGuildDesc, nodeId);
      this.setState({ newGuildName: '', newGuildDesc: '' });
    }
  };

  handleJoinGuild = (guildId) => {
    const { nodeId } = this.state;
    if (nodeId) {
      p2pTrust.joinGuild(guildId, nodeId);
      alert('Đã tham gia bang hội thành công!');
    }
  };

  render() {
    const { guilds, newGuildName, newGuildDesc } = this.state;

    return (
      <Column>
        <ColumnHeader icon='shield' title="Bang Hội Săn Sự Thật" />
        
        <div style={{ padding: '20px', background: '#1c1f24', height: '100%', overflowY: 'auto' }}>
          
          <div style={{ background: 'linear-gradient(135deg, rgba(88,101,242,0.1) 0%, rgba(224,36,94,0.1) 100%)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff', marginBottom: '16px' }}>
              🛡️ Khai Tông Lập Phái
            </h2>
            <form onSubmit={this.handleCreateGuild}>
              <input 
                type="text" 
                placeholder="Tên Bang Hội (vd: Hiệp Sĩ Chống Lừa Đảo Crypto)"
                value={newGuildName}
                onChange={e => this.setState({ newGuildName: e.target.value })}
                style={{ width: '100%', padding: '12px', marginBottom: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.5)', color: 'white' }}
                required
              />
              <textarea 
                placeholder="Tôn chỉ hoạt động..."
                value={newGuildDesc}
                onChange={e => this.setState({ newGuildDesc: e.target.value })}
                style={{ width: '100%', padding: '12px', marginBottom: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.5)', color: 'white', minHeight: '80px', resize: 'vertical' }}
              />
              <button 
                type="submit"
                style={{ background: '#5865F2', color: 'white', padding: '12px 24px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Lập Nhóm Mới
              </button>
            </form>
          </div>

          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', marginBottom: '16px', textTransform: 'uppercase' }}>
            🏆 Bảng Vàng Tranh Bá
          </h3>

          {guilds.length === 0 ? (
            <p style={{ color: '#8899a6' }}>Chưa có bang hội nào được thành lập. Hãy là người đầu tiên!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '40px' }}>
              {guilds.map((guild, index) => (
                <div key={guild.id} style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.5)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', borderRight: '1px solid rgba(255,255,255,0.1)', paddingRight: '16px', marginRight: '16px', color: index === 0 ? '#ffac33' : (index === 1 ? '#e1e8ed' : (index === 2 ? '#cd7f32' : '#8899a6')), width: '40px', textAlign: 'center' }}>
                    #{index + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', marginBottom: '4px' }}>{guild.name}</h4>
                    <p style={{ fontSize: '13px', color: '#8899a6', margin: 0 }}>{guild.description}</p>
                  </div>
                  <div style={{ textAlign: 'right', paddingRight: '16px' }}>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#17bf63' }}>{Math.floor(guild.collective_truth_score || 0)}</div>
                    <div style={{ fontSize: '11px', color: '#8899a6', textTransform: 'uppercase' }}>Uy Tín 🔰</div>
                  </div>
                  <button 
                    onClick={() => this.handleJoinGuild(guild.id)}
                    style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s' }}
                    onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
                    onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                  >
                    Gia Nhập
                  </button>
                </div>
              ))}
            </div>
          )}

        </div>
      </Column>
    );
  }
}

export default connect()(injectIntl(GuildsDashboard));
