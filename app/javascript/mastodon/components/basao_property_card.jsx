import React from 'react';
import PropTypes from 'prop-types';

export default class BasaoPropertyCard extends React.PureComponent {
  static propTypes = {
    price: PropTypes.string,
    area: PropTypes.string,
    legalStatus: PropTypes.string,
    zoning: PropTypes.string,
  };

  render () {
    const { price, area, legalStatus, zoning } = this.props;

    if (!price && !area && !legalStatus && !zoning) {
      return null;
    }

    return (
      <div className='basao-property-card' style={{
        marginTop: '12px',
        padding: '16px',
        background: 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.4)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        color: '#2d3748',
      }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#1a202c', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🏠</span> Basao Property Report
        </h4>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '12px', color: '#718096', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Price</span>
            <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{price || 'N/A'}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '12px', color: '#718096', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Area</span>
            <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{area || 'N/A'}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '12px', color: '#718096', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Legal ⚖️</span>
            <span style={{ fontSize: '14px', fontWeight: 'bold', color: legalStatus ? '#2b6cb0' : 'inherit' }}>{legalStatus || 'Unverified'}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '12px', color: '#718096', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Zoning 🗺️</span>
            <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{zoning || 'Unknown'}</span>
          </div>
        </div>

        <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '12px', color: '#4a5568', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#48bb78', display: 'inline-block' }}></span>
            7 Layers of Truth: Pending Community Verification
          </div>
        </div>
      </div>
    );
  }
}
