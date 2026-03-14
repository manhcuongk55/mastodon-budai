import classNames from 'classnames';

export const WordmarkLogo: React.FC = () => (
  <div className='logo logo--wordmark' style={{ fontSize: '24px', fontWeight: 'bold', fontFamily: 'Inter, sans-serif', letterSpacing: '-1px', color: 'currentcolor', display: 'flex', alignItems: 'center', gap: '8px' }}>
    <span style={{ fontSize: '28px' }}>🏴‍☠️</span>
    MAKAI
  </div>
);

export const IconLogo: React.FC<{ className?: string }> = ({ className }) => (
  <div className={classNames('logo logo--icon', className)} style={{ fontSize: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    🏴‍☠️
  </div>
);

export const SymbolLogo: React.FC = () => (
  <div className='logo logo--icon' style={{ fontSize: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    🏴‍☠️
  </div>
);
