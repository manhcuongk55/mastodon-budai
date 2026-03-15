import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { makeGetStatus } from 'mastodon/selectors';
import Avatar from 'mastodon/components/avatar';
import DisplayName from 'mastodon/components/display_name';
import IconButton from 'mastodon/components/icon_button';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import Bundle from 'mastodon/features/ui/components/bundle';
import { Video } from 'mastodon/features/ui/util/async-components';
import { RealityDashboard } from 'mastodon/components/reality_dashboard';
import { truthVote } from 'mastodon/actions/interactions';
import FloatingReactions from './floating_reactions';

const makeMapStateToProps = () => {
  const getStatus = makeGetStatus();

  const mapStateToProps = (state, { statusId }) => {
    const status = getStatus(state, { id: statusId });
    return {
      status,
      account: status ? status.get('account') : null,
    };
  };

  return mapStateToProps;
};

class DiscoveryPost extends Component {
  static propTypes = {
    statusId: PropTypes.string.isRequired,
    status: ImmutablePropTypes.map,
    account: ImmutablePropTypes.map,
    dispatch: PropTypes.func.isRequired,
  };

  state = {
    showDossier: false,
    reactions: [],
    doubleTapParticle: null,
  };

  toggleDossier = () => {
    this.setState(prevState => ({ showDossier: !prevState.showDossier }));
  };

  handleClick = (e) => {
    if (this.clickTimeout) {
      clearTimeout(this.clickTimeout);
      this.clickTimeout = null;
      this.handleDoubleTap(e);
    } else {
      this.clickTimeout = setTimeout(() => {
        this.clickTimeout = null;
        this.toggleDossier();
      }, 250);
    }
  };

  handleDoubleTap = (e) => {
    const { status, dispatch } = this.props;

    // Dispatch Truth Vote
    dispatch(truthVote(status, 'trust'));
    
    // Spawn massive central particle
    const doubleTapElement = { id: Date.now(), x: e.clientX, y: e.clientY };
    this.setState({ doubleTapParticle: doubleTapElement });
    setTimeout(() => {
      this.setState({ doubleTapParticle: null });
    }, 1000);
  };

  spawnReaction = (type) => {
    const id = Date.now() + Math.random();
    this.setState(prevState => ({
      reactions: [...prevState.reactions, { id, type }]
    }));
    setTimeout(() => {
      this.setState(prevState => ({
        reactions: prevState.reactions.filter(r => r.id !== id)
      }));
    }, 2000);
  };

  handleTrustVote = (e) => {
    e.stopPropagation();
    this.props.dispatch(truthVote(this.props.status, 'trust'));
    this.spawnReaction('trust');
  };

  handleFakeVote = (e) => {
    e.stopPropagation();
    this.props.dispatch(truthVote(this.props.status, 'fake'));
    this.spawnReaction('fake');
  };

  renderMedia() {
    const { status } = this.props;
    const mediaAttachments = status.get('media_attachments');
    
    if (mediaAttachments.size === 0) {
      return (
        <div style={{ padding: '60px 20px', fontSize: '24px', lineHeight: '1.4', textAlign: 'center', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span dangerouslySetInnerHTML={{ __html: status.get('contentHtml') }} />
        </div>
      );
    }

    const firstAttachment = mediaAttachments.first();

    if (firstAttachment.get('type') === 'video' || firstAttachment.get('type') === 'gifv') {
      return (
        <Bundle fetchComponent={Video} loading={() => <div className="spinner" />}>
          {Component => (
            <Component
              preview={firstAttachment.get('preview_url')}
              src={firstAttachment.get('url')}
              width="100%"
              height="100%"
              inline
              autoPlay
              loop
              muted={false}
              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
            />
          )}
        </Bundle>
      );
    }

    // Default image fallback
    return (
      <img 
        src={firstAttachment.get('preview_url')} 
        style={{ objectFit: 'cover', width: '100%', height: '100%' }} 
        alt="" 
      />
    );
  }

  render() {
    const { status, account } = this.props;
    const { showDossier } = this.state;

    if (!status || !account) {
      return null;
    }

    return (
      <div 
        className="discovery-post" 
        style={{ 
          height: '100dvh', 
          width: '100%', 
          position: 'relative',
          scrollSnapAlign: 'start',
          backgroundColor: '#000',
          borderBottom: '1px solid #222'
        }}
        onClick={this.handleClick}
      >
        {/* Full Screen Media Background */}
        <div className="discovery-post__media" style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
          {this.renderMedia()}
        </div>

        {/* Floating Reactions Overlay */}
        <FloatingReactions reactions={this.state.reactions} />

        {/* Double Tap Particle */}
        {this.state.doubleTapParticle && (
          <div 
            className="double-tap-particle animate-pop"
            style={{ 
              position: 'fixed', 
              left: this.state.doubleTapParticle.x, 
              top: this.state.doubleTapParticle.y, 
              transform: 'translate(-50%, -50%)',
              fontSize: '120px',
              zIndex: 200,
              pointerEvents: 'none',
              filter: 'drop-shadow(0 0 20px rgba(244, 197, 66, 0.8))'
            }}
          >
            🌸
          </div>
        )}

        {/* Gradient Overlay for Text Readability */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '50%', background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', pointerEvents: 'none' }} />

        {/* Content Overlay */}
        <div className="discovery-post__overlay" style={{ position: 'absolute', bottom: '20px', left: '15px', right: '70px', color: '#fff' }}>
          
          {/* HCRAB Truth Advertising Badge */}
          {status.get('crab_score') > 0 && (
            <div style={{ display: 'inline-block', background: 'rgba(244, 197, 66, 0.15)', color: '#F4C542', padding: '6px 10px', borderRadius: '12px', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px', border: '1px solid #F4C542', width: 'fit-content' }}>
              🦀 CRAB Verification: {Math.min(100, (status.get('crab_score') * 10).toFixed(0))}% Trusted | Verified by {status.get('crab_verified_users') || Math.floor(status.get('crab_score') * 3)} real users
            </div>
          )}

          {/* Truth Badge (if high score) */}
          {(status.get('truth_score') > 0.8 && !status.get('crab_score')) && (
            <div style={{ display: 'inline-block', background: 'rgba(74, 222, 128, 0.2)', color: '#4ADE80', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', border: '1px solid #4ADE80' }}>
              ✓ Sự Thật Đã Kiểm Chứng ({(status.get('truth_score') * 100).toFixed(0)}%)
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
            <Link to={`/@${account.get('acct')}`} style={{ textDecoration: 'none', color: '#fff', display: 'flex', alignItems: 'center' }} onClick={e => e.stopPropagation()}>
              <Avatar account={account} size={36} />
              <div style={{ marginLeft: '10px' }}>
                <DisplayName account={account} />
              </div>
            </Link>
          </div>
          
          <div 
            className="discovery-post__text" 
            style={{ fontSize: '15px', lineHeight: '1.4', maxHeight: '100px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' }}
            dangerouslySetInnerHTML={{ __html: status.get('contentHtml') }}
          />
        </div>

        {/* Right Action Bar (TikTok Style) */}
        <div className="discovery-post__actions" style={{ position: 'absolute', bottom: '50px', right: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          
          {/* Trust Vote Button */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '50%', padding: '10px', backdropFilter: 'blur(5px)', cursor: 'pointer' }} onClick={this.handleTrustVote}>
              <IconButton icon="check-circle" title="An tâm" style={{ color: '#F4C542' }} />
            </div>
            <span style={{ fontSize: '12px', marginTop: '4px', fontWeight: 'bold' }}>{status.get('safe_count') || 0}</span>
          </div>

          {/* Fake Vote Button */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '50%', padding: '10px', backdropFilter: 'blur(5px)', cursor: 'pointer' }} onClick={this.handleFakeVote}>
              <IconButton icon="times-circle" title="Cẩn trọng" style={{ color: '#FF6B6B' }} />
            </div>
            <span style={{ fontSize: '12px', marginTop: '4px', fontWeight: 'bold' }}>{status.get('fake_count') || 0}</span>
          </div>

          {/* Dossier Toggle Button */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '50%', padding: '10px', backdropFilter: 'blur(5px)', border: showDossier ? '2px solid #fff' : 'none', cursor: 'pointer' }}>
              <IconButton icon="search-plus" title="Xem Hồ Sơ Sự Thật" style={{ color: '#fff' }} onClick={(e) => { e.stopPropagation(); this.toggleDossier(); }} />
            </div>
          </div>
        </div>

        {/* Slide-up Reality Dossier */}
        {showDossier && (
          <div 
            style={{ 
              position: 'absolute', 
              top: '50%', 
              left: 0, 
              width: '100%', 
              height: '50%', 
              background: 'rgba(20, 25, 30, 0.95)', 
              backdropFilter: 'blur(10px)',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              padding: '20px',
              overflowY: 'auto',
              zIndex: 50,
              boxShadow: '0 -5px 15px rgba(0,0,0,0.5)',
              animation: 'slideUp 0.3s ease-out'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ width: '40px', height: '4px', background: 'rgba(255,255,255,0.3)', borderRadius: '2px', margin: '0 auto 15px' }} />
            <h3 style={{ marginBottom: '15px', color: '#fff' }}>Hồ Sơ Sự Thật (Truth Dossier)</h3>
            <RealityDashboard status={status} />
          </div>
        )}
      </div>
    );
  }
}

export default connect(makeMapStateToProps)(DiscoveryPost);
