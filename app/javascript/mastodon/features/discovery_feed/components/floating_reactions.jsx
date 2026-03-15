import React from 'react';
import PropTypes from 'prop-types';

const FloatingReactions = ({ reactions }) => {
  return (
    <div 
      style={{ 
        position: 'absolute', 
        bottom: '80px', 
        right: '25px', 
        width: '50px', 
        height: '300px', 
        pointerEvents: 'none', 
        zIndex: 100 
      }}
    >
      {reactions.map(reaction => (
        <div 
          key={reaction.id} 
          className={`floating-reaction floating-reaction--${reaction.type}`}
        >
          {reaction.type === 'trust' ? '🌟' : '🚫'}
        </div>
      ))}
    </div>
  );
};

FloatingReactions.propTypes = {
  reactions: PropTypes.array.isRequired,
};

export default FloatingReactions;
