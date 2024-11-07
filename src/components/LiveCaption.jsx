import React from 'react';

const LiveCaption = ({ text }) => {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '50px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '20px 40px',
        borderRadius: '10px',
        fontSize: '24px',
        maxWidth: '80%',
        textAlign: 'center',
        zIndex: 1000,
        minHeight: '40px',
      }}
    >
      {text || "Waiting for speech..."}
    </div>
  );
};

export default LiveCaption; 