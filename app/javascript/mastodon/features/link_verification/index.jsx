import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';
import Column from 'mastodon/components/column';
import ColumnHeader from 'mastodon/components/column_header';
import { p2pTrust } from 'mastodon/services/p2p_trust_service';
import { truskingIdentityService } from 'mastodon/services/trusking_identity_service';

class LinkVerificationDashboard extends Component {
  static propTypes = {
    params: PropTypes.shape({
      hash: PropTypes.string,
    }),
    intl: PropTypes.object.isRequired,
  };

  state = {
    url: null,
    votes: { truth: 0, fake: 0, total: 0 },
    hasVoted: false,
    myVote: null,
    nodeId: null,
    bounty: 0,
  };

  async componentDidMount() {
    const { hash } = this.props.params;
    if (!hash) return;

    await truskingIdentityService.ensureInitialized();
    const nodeId = truskingIdentityService.getNodeId();
    this.setState({ nodeId });

    // Fetch the URL for this hash from the P2P Graph
    p2pTrust.gun.get('makai_links').get(hash).once((data) => {
      if (data && data.url) {
        this.setState({ url: data.url });
      }
    });

    // Subscribe to votes
    this.unsubscribeVotes = p2pTrust.subscribeToLinkVotes(hash, (votes) => {
      this.setState({ votes });
    });
    
    // Subscribe to bounty changes
    this.unsubscribeBounty = p2pTrust.subscribeToLinkBounty(hash, (bounty) => {
      this.setState({ bounty });
    });

    // Check if I already voted
    p2pTrust.gun.get('makai_links').get(hash).get('votes').get(nodeId).once((data) => {
      if (data && data.vote) {
        this.setState({ hasVoted: true, myVote: data.vote });
      }
    });
  }

  componentWillUnmount() {
    if (this.unsubscribeVotes) {
      this.unsubscribeVotes();
    }
    if (this.unsubscribeBounty) {
      this.unsubscribeBounty();
    }
  }

  handleVote = (type) => {
    const { hash } = this.props.params;
    const { nodeId } = this.state;
    if (!hash || !nodeId) return;

    p2pTrust.voteCanonicalLink(hash, type, nodeId);
    
    // Reward Truth Hunter Guild (Epic W)
    p2pTrust.gun.get('trusking_anonymous_nodes').get(nodeId).get('active_guild').once((guildId) => {
      if (guildId) {
        // Give 1 reputation point to the guild for active verification
        p2pTrust.rewardGuildTruthPoints(guildId, 1);
      }
    });

    this.setState({ hasVoted: true, myVote: type });
  };

  handleAddBounty = (amount) => {
    const { hash } = this.props.params;
    if (!hash) return;
    p2pTrust.addBountyToLink(hash, amount);
  };

  handleCopyEmbed = () => {
    const { hash } = this.props.params;
    if (!hash) return;
    
    const embedCode = `<iframe src="${window.location.origin}/embed/${hash}" width="300" height="200" style="border:none;border-radius:8px;" allowtransparency="true"></iframe>`;
    navigator.clipboard.writeText(embedCode);
    alert('Đã copy mã nhúng iFrame vào clipboard!');
  };

  render() {
    const { intl, params } = this.props;
    const { url, votes, hasVoted, myVote } = this.state;

    return (
      <Column>
        <ColumnHeader icon='link' title="Cổng Xác Minh Tin Tức P2P" />
        
        <div style={{ padding: '20px', background: '#1c1f24', height: '100%', overflowY: 'auto' }}>
          
          <div style={{ background: 'rgba(0,0,0,0.5)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff', marginBottom: '12px' }}>
              📡 URL Hash: {params.hash.substring(0, 12)}...
            </h2>
            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', wordBreak: 'break-all', fontFamily: 'monospace', color: '#8899a6', marginBottom: '20px' }}>
              {url || 'Đang tải URL từ mạng lưới P2P...'}
            </div>

            {url && (
              <a href={url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', padding: '8px 16px', background: 'rgba(88,101,242,0.2)', color: '#5865F2', borderRadius: '4px', fontWeight: 'bold', textDecoration: 'none', border: '1px solid #5865F2' }}>
                🔗 Mở liên kết gốc
              </a>
            )}
          </div>

          <div style={{ background: 'rgba(0,0,0,0.5)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', marginBottom: '16px', textAlign: 'center' }}>
              Cộng Đồng P2P Đánh Giá
            </h3>
            
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '30px' }}>
              <div style={{ textAlign: 'center', flex: 1, padding: '16px', background: 'rgba(23,191,99,0.1)', borderRadius: '8px', border: '1px solid rgba(23,191,99,0.3)' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#17bf63' }}>{votes.truth}</div>
                <div style={{ fontSize: '13px', color: '#8899a6', textTransform: 'uppercase', mt: 1 }}>Sự Thật ✅</div>
              </div>
              <div style={{ textAlign: 'center', flex: 1, padding: '16px', background: 'rgba(224,36,94,0.1)', borderRadius: '8px', border: '1px solid rgba(224,36,94,0.3)' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#e0245e' }}>{votes.fake}</div>
                <div style={{ fontSize: '13px', color: '#8899a6', textTransform: 'uppercase', mt: 1 }}>Giả Mạo ❌</div>
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              {hasVoted ? (
                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', color: '#1da1f2', fontWeight: 'bold' }}>
                  Bạn đã bỏ phiếu: {myVote === 'truth' ? '✅ SỰ THẬT' : '❌ GIẢ MẠO'}
                </div>
              ) : (
                <>
                  <p style={{ color: '#8899a6', marginBottom: '16px' }}>Quyết định của bạn sẽ được lưu trên mạngưới blockchain GunJS và không thể thay đổi.</p>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <button 
                      onClick={() => this.handleVote('truth')}
                      style={{ flex: 1, padding: '12px', background: '#17bf63', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      Xác Nhận Sự Thật
                    </button>
                    <button 
                      onClick={() => this.handleVote('fake')}
                      style={{ flex: 1, padding: '12px', background: '#e0245e', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      Báo Cáo Giả Mạo
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div style={{ background: 'linear-gradient(135deg, rgba(255,172,51,0.1) 0%, rgba(224,36,94,0.1) 100%)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255,172,51,0.2)', marginTop: '24px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffac33', marginBottom: '8px' }}>
              🍓 Quỹ Thưởng Sự Thật (Bounty Sandbox)
            </h3>
            <p style={{ color: '#8899a6', fontSize: '14px', marginBottom: '16px' }}>
              Treo thưởng để thu hút các Chuyên Gia Thẩm Định (Guardian) vào xác minh link này nhanh hơn.
            </p>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#fff', marginBottom: '20px' }}>
              {this.state.bounty} <span style={{ fontSize: '20px', color: '#8899a6' }}>Berries</span>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button 
                onClick={() => this.handleAddBounty(10)}
                style={{ padding: '8px 16px', background: 'rgba(255,172,51,0.2)', color: '#ffac33', border: '1px solid #ffac33', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                +10 Berries
              </button>
              <button 
                onClick={() => this.handleAddBounty(50)}
                style={{ padding: '8px 16px', background: 'rgba(255,172,51,0.4)', color: '#fff', border: '1px solid #ffac33', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                +50 Berries
              </button>
              <button 
                onClick={() => this.handleAddBounty(100)}
                style={{ padding: '8px 16px', background: '#ffac33', color: '#000', border: 'none', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                +100 Berries
              </button>
            </div>
          </div>

          <div style={{ background: 'rgba(29, 161, 242, 0.1)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(29, 161, 242, 0.3)', marginTop: '24px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1da1f2', marginBottom: '8px' }}>
              🌐 Tạo Mã Nhúng Widget
            </h3>
            <p style={{ color: '#8899a6', fontSize: '14px', marginBottom: '16px' }}>
              Nhúng khung Đánh Giá Sự Thật này lên bài báo hoặc Blog cá nhân của bạn để chứng minh độ tin cậy.
            </p>
            <button 
              onClick={this.handleCopyEmbed}
              style={{ padding: '12px 24px', background: '#1da1f2', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              📋 Copy Mã iFrame
            </button>
          </div>
        </div>
      </Column>
    );
  }
}

export default connect()(injectIntl(LinkVerificationDashboard));
