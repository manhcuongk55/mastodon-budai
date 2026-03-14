import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { injectIntl, defineMessages } from 'react-intl';
import api from 'mastodon/api';
import Column from 'mastodon/features/ui/components/column';
import ColumnHeader from 'mastodon/components/column_header';
import { Link } from 'react-router-dom';

const messages = defineMessages({
  title: { id: 'truth_map.title', defaultMessage: 'Truth Map' },
});

class TruthMap extends PureComponent {
  state = {
    signals: [],
    loading: true,
  };

  componentDidMount() {
    api().get('/api/v1/truth_map/global')
      .then(res => {
        this.setState({ signals: res.data.signals || [], loading: false });
      })
      .catch(err => {
        console.error('Failed to load Truth Map signals', err);
        this.setState({ loading: false });
      });
  }

  render() {
    const { intl } = this.props;
    const { signals, loading } = this.state;

    return (
      <Column>
        <ColumnHeader
          icon='compass'
          title={intl.formatMessage(messages.title)}
          multiColumn={false}
        />
        <div className='truth-map-container' style={{ position: 'relative', width: '100%', height: 'calc(100vh - 60px)', backgroundColor: '#0a0d14', overflow: 'hidden' }}>
          {loading && <div style={{ color: 'white', padding: '20px' }}>Loading the Sea of Truth...</div>}
          
          {!loading && signals.map(signal => {
            // Pseudo-random plot points for visual layout until geo is available
            const size = Math.max(30, signal.wave_strength * 15);
            
            // Neon colors based on truth category
            const colors = {
              truth: 'rgba(0, 255, 170, 0.8)',
              safe: 'rgba(0, 191, 255, 0.8)',
              investigating: 'rgba(255, 215, 0, 0.8)',
              real_estate: 'rgba(255, 215, 0, 1.0)' // Golden Node
            };

            const backgroundColor = colors[signal.category] || colors.investigating;
            const isRealEstate = signal.category === 'real_estate';

            return (
              <Link 
                to={`/statuses/${signal.id}`} 
                key={signal.id}
                className='truth-island-node animate-float'
                style={{
                  position: 'absolute',
                  left: `${signal.x}%`,
                  top: `${signal.y}%`,
                  width: `${size}px`,
                  height: `${size}px`,
                  borderRadius: '50%',
                  backgroundColor,
                  boxShadow: `0 0 ${size/2}px ${backgroundColor}`,
                  transform: 'translate(-50%, -50%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  textDecoration: 'none'
                }}
                title={signal.description}
              >
                {isRealEstate && <span style={{ fontSize: `${size/2}px` }}>🏠</span>}
                <span className='truth-island-tooltip' style={{
                  position: 'absolute',
                  opacity: 0,
                  pointerEvents: 'none',
                  whiteSpace: 'nowrap',
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  top: '-30px',
                  transition: 'opacity 0.2s'
                }}>{signal.description}</span>
              </Link>
            )
          })}
        </div>
      </Column>
    );
  }
}

export default connect()(injectIntl(TruthMap));
