import { Component } from 'react';
import PropTypes from 'prop-types';
import { p2pTrust } from 'mastodon/services/p2p_trust_service';

export default class EmbedWidget extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        hash: PropTypes.string,
      }),
    }).isRequired,
  };

  state = {
    url: null,
    votes: { truth: 0, fake: 0, total: 0 },
  };

  componentDidMount() {
    const { hash } = this.props.match.params;
    if (!hash) return;

    p2pTrust.gun.get('makai_links').get(hash).once((data) => {
      if (data && data.url) {
        this.setState({ url: data.url });
      }
    });

    this.unsubscribeVotes = p2pTrust.subscribeToLinkVotes(hash, (votes) => {
      this.setState({ votes });
    });
  }

  componentWillUnmount() {
    if (this.unsubscribeVotes) {
      this.unsubscribeVotes();
    }
  }

  render() {
    const { url, votes } = this.state;
    const total = votes.truth + votes.fake;
    const truthPerc = total > 0 ? (votes.truth / total) * 100 : 0;
    const fakePerc = total > 0 ? (votes.fake / total) * 100 : 0;
    
    // Default URL to show users where to click
    const truskingUrl = `${window.location.origin}/portal/${this.props.match.params.hash}`;

    return (
      <div style={{ 
        fontFamily: 'sans-serif', 
        background: '#15202b', 
        color: '#fff', 
        padding: '16px', 
        borderRadius: '8px', 
        border: '1px solid #38444d',
        margin: 0,
        height: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <div>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#8899a6', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '18px' }}>🛡️</span>
            Trusking Phân Tích Sự Thật
          </h3>
          <div style={{ fontSize: '12px', color: '#1da1f2', wordBreak: 'break-all', marginBottom: '16px', background: 'rgba(29, 161, 242, 0.1)', padding: '6px', borderRadius: '4px' }}>
            {url || 'Đang tải dữ liệu mạng P2P...'}
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', fontWeight: 'bold' }}>
            <span style={{ color: '#17bf63' }}>✅ Sự Thật ({truthPerc.toFixed(1)}%)</span>
            <span style={{ color: '#e0245e' }}>Giả Mạo ({fakePerc.toFixed(1)}%) ❌</span>
          </div>

          <div style={{ height: '12px', width: '100%', display: 'flex', borderRadius: '6px', overflow: 'hidden', marginBottom: '16px', background: '#38444d' }}>
             <div style={{ width: `${truthPerc}%`, background: '#17bf63', transition: 'width 0.5s' }} />
             <div style={{ width: `${fakePerc}%`, background: '#e0245e', transition: 'width 0.5s' }} />
          </div>
        </div>

        <a 
          href={truskingUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ 
            display: 'block', 
            textAlign: 'center', 
            background: '#ffac33', 
            color: '#000', 
            textDecoration: 'none', 
            padding: '10px', 
            borderRadius: '6px', 
            fontWeight: 'bold',
            fontSize: '14px'
          }}
        >
          Tham Gia Thẩm Định
        </a>
      </div>
    );
  }
}
