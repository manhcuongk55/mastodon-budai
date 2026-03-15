import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, FormattedMessage } from 'react-intl';
import Column from 'mastodon/components/column';
import ColumnHeader from 'mastodon/components/column_header';
import { me } from 'mastodon/initial_state';

class ReferralDashboard extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    account: PropTypes.object,
  };

  handleCopyLink = () => {
    const { account } = this.props;
    if (!account || !account.get('referral_code')) return;

    // The user's viral joining link
    const inviteLink = `${window.location.origin}/invite/${account.get('referral_code')}`;
    
    navigator.clipboard.writeText(inviteLink).then(() => {
      alert('Đã copy link mời! Hãy gửi cho bạn bè để cùng nhận Trái Ác Quỷ nhé!');
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  render() {
    const { account } = this.props;

    if (!account) return null;

    const referralCode = account.get('referral_code') || 'PENDING';
    const truthBerries = account.get('truth_berries') || 0;

    return (
      <Column>
        <ColumnHeader icon='gift' title="Trạm Chiêu Mộ (Mời Bạn Bè)" />
        
        <div className='scrollable' style={{ padding: '20px', background: '#15202b' }}>
          
          <div style={{ background: 'linear-gradient(45deg, #1da1f2, #17bf63)', padding: '24px', borderRadius: '12px', color: 'white', marginBottom: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>🏴‍☠️🎁</div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
              Xây Dựng Băng Đảng Sự Thật
            </h2>
            <p style={{ fontSize: '15px', lineHeight: '1.5', opacity: 0.9 }}>
              Khi bạn bè đăng ký qua link của bạn, cả hai sẽ nhận được <strong>10 Trái Ác Quỷ (Truth Berries)</strong> dùng để treo thưởng xác minh sự thật hoặc vote tin tức.
            </p>
          </div>

          <div style={{ background: '#192734', padding: '20px', borderRadius: '12px', border: '1px solid #38444d', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '14px', color: '#8899a6', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '12px' }}>
              Mã chia sẻ của bạn
            </h3>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1, background: '#000', padding: '12px', borderRadius: '6px', fontSize: '16px', color: '#1da1f2', fontFamily: 'monospace', fontWeight: 'bold', userSelect: 'all' }}>
                {window.location.origin}/invite/{referralCode}
              </div>
              <button 
                onClick={this.handleCopyLink}
                style={{ background: '#1da1f2', color: 'white', border: 'none', padding: '0 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}
                onMouseOver={(e) => e.target.style.background = '#1a91da'}
                onMouseOut={(e) => e.target.style.background = '#1da1f2'}
              >
                Copy Link
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ background: '#192734', padding: '20px', borderRadius: '12px', border: '1px solid #38444d', textAlign: 'center' }}>
              <div style={{ fontSize: '30px', fontWeight: 'bold', color: '#ffad1f', marginBottom: '8px' }}>
                {truthBerries}
              </div>
              <div style={{ fontSize: '13px', color: '#8899a6' }}>Số Dư Trái Ác Quỷ</div>
            </div>
            
            <div style={{ background: '#192734', padding: '20px', borderRadius: '12px', border: '1px solid #38444d', textAlign: 'center' }}>
              <div style={{ fontSize: '30px', fontWeight: 'bold', color: '#17bf63', marginBottom: '8px' }}>
                N/A
              </div>
              <div style={{ fontSize: '13px', color: '#8899a6' }}>Thuyền viên đã mời</div>
            </div>
          </div>

        </div>
      </Column>
    );
  }
}

const mapStateToProps = state => ({
  account: state.accounts.get(me),
});

export default connect(mapStateToProps)(injectIntl(ReferralDashboard));
