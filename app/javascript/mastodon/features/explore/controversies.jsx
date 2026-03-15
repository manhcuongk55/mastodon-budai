import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import { p2pTrust } from 'mastodon/services/p2p_trust_service';
import DashboardIcon from '@/material-icons/400-24px/dashboard.svg?react';

class Controversies extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
  };

  state = {
    controversies: [],
    loading: true,
  };

  componentDidMount() {
    this.unsubscribe = p2pTrust.exploreTrendingControversies((controversies) => {
      this.setState({ controversies, loading: false });
    });
  }

  componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  render() {
    const { controversies, loading } = this.state;

    return (
      <div className='explore__links' style={{ padding: '20px' }}>
        <div style={{ marginBottom: '24px', background: 'linear-gradient(135deg, rgba(255,172,51,0.1) 0%, rgba(224,36,94,0.1) 100%)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,172,51,0.2)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffac33', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <DashboardIcon style={{ width: 24, height: 24, fill: '#ffac33' }} /> 
            Bảng Vàng Tranh Cãi
          </h2>
          <p style={{ color: '#8899a6', fontSize: '14px', marginTop: '8px' }}>
            Đây là những đường link (Facebook, TikTok, Báo chí) đang nhận được nhiều sự chú ý và có tỉ lệ đánh giá "Sự Thật / Giả Mạo" giằng co nhất trên mạng lưới GunJS P2P. Hãy tham gia phá vỡ thế bế tắc!
          </p>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#8899a6' }}>Đang dò quét mạng lưới P2P...</div>
        )}
        
        {!loading && controversies.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#8899a6' }}>Chưa có tin tức nào đang bị tranh cãi.</div>
        )}

        {!loading && controversies.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {controversies.map((item, index) => {
              const total = item.truth + item.fake;
              const truthPerc = total > 0 ? (item.truth / total) * 100 : 0;
              const fakePerc = total > 0 ? (item.fake / total) * 100 : 0;
              
              return (
                <div key={item.hash} style={{ background: 'rgba(0,0,0,0.5)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '14px', fontFamily: 'monospace', color: '#8899a6', wordBreak: 'break-all', flex: 1, paddingRight: '16px' }}>
                      {item.url}
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: index === 0 ? '#ffac33' : '#e1e8ed' }}>
                      #{index + 1}
                    </div>
                  </div>

                  {/* Controversy Progress Bar */}
                  <div style={{ height: '8px', width: '100%', display: 'flex', borderRadius: '4px', overflow: 'hidden' }}>
                     <div style={{ width: `${truthPerc}%`, background: '#17bf63', transition: 'width 0.5s' }} />
                     <div style={{ width: `${fakePerc}%`, background: '#e0245e', transition: 'width 0.5s' }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 'bold' }}>
                    <span style={{ color: '#17bf63' }}>{item.truth} SỰ THẬT ({truthPerc.toFixed(1)}%)</span>
                    <span style={{ color: '#8899a6' }}>Điểm Tranh Cãi: {item.controversyScore.toFixed(2)}</span>
                    <span style={{ color: '#e0245e' }}>GIẢ MẠO ({fakePerc.toFixed(1)}%) {item.fake}</span>
                  </div>

                  <Link 
                    to={`/portal/${item.hash}`}
                    style={{ display: 'block', textAlign: 'center', padding: '12px', background: 'rgba(255,255,255,0.1)', color: 'white', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold', marginTop: '8px' }}
                  >
                    Tham Gia Phán Xử
                  </Link>

                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }
}

export default connect()(injectIntl(Controversies));
