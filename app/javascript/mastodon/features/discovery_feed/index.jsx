import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, FormattedMessage } from 'react-intl';
import ColumnHeader from 'mastodon/components/column_header';
import DiscoveryPost from './components/discovery_post';
import { expandPublicTimeline } from 'mastodon/actions/timelines';
import { makeGetStatus } from 'mastodon/selectors';

class DiscoveryFeed extends Component {
  static propTypes = {
    statusIds: ImmutablePropTypes.list.isRequired,
    dispatch: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
    hasMore: PropTypes.bool,
  };

  componentDidMount() {
    this.props.dispatch(expandPublicTimeline({ maxId: null }));
  }

  handleScroll = (e) => {
    const { target } = e;
    const scrollBottom = target.scrollHeight - target.scrollTop - target.clientHeight;
    
    // Load more when user swipes near the bottom
    if (scrollBottom < 400 && this.props.hasMore && !this.props.isLoading) {
      const lastId = this.props.statusIds.last();
      this.props.dispatch(expandPublicTimeline({ maxId: lastId }));
    }
  };

  render() {
    const { statusIds, isLoading } = this.props;

    return (
      <div 
        className="discovery-feed-container"
        style={{
          height: '100%',
          width: '100%',
          overflowY: 'scroll',
          scrollSnapType: 'y mandatory',
          scrollBehavior: 'smooth',
          background: '#000', // True black for theater mode
          color: '#fff',
          position: 'relative'
        }}
        onScroll={this.handleScroll}
      >
        <ColumnHeader 
          icon='play-circle' 
          title="Khám Phá Sự Thật" 
          style={{ position: 'absolute', top: 0, width: '100%', zIndex: 100, background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)', border: 'none' }}
        />
        
        {statusIds.map((statusId) => (
          <DiscoveryPost key={statusId} statusId={statusId} />
        ))}

        {isLoading && (
          <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', scrollSnapAlign: 'start' }}>
            <div className='spinner' />
          </div>
        )}
        
        {statusIds.size === 0 && !isLoading && (
          <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '20px' }}>
            <div>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>🕵️</div>
              <h3>Không có tin tức nào</h3>
              <p style={{ color: '#8899a6' }}>Hãy quay lại sau để xem thêm các bằng chứng sự thật.</p>
            </div>
          </div>
        )}
      </div>
    );
  }
}

const makeMapStateToProps = () => {
  const getStatus = makeGetStatus();

  return (state) => {
    const allStatusIds = state.getIn(['timelines', 'public', 'items'], []);
    
    // Filter to only show posts that have media or rich cards for the visual feed
    const visualStatusIds = allStatusIds.filter(statusId => {
      const status = getStatus(state, { id: statusId });
      if (!status) return false;
      return status.get('media_attachments').size > 0 || !!status.get('card');
    });

    return {
      statusIds: visualStatusIds,
      isLoading: state.getIn(['timelines', 'public', 'isLoading']),
      hasMore: state.getIn(['timelines', 'public', 'hasMore']),
    };
  };
};

export default connect(makeMapStateToProps)(injectIntl(DiscoveryFeed));
