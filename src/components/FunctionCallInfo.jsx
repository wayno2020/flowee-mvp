import React from 'react';

const FunctionCallInfo = ({ info }) => {
  if (!info) return null;

  return (
    <div style={{
      marginTop: '20px',
      padding: '10px',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      color: 'white',
      borderRadius: '5px',
      maxWidth: '400px',
    }}>
      <h3 style={{ margin: '0 0 10px 0' }}>Function Call Info:</h3>
      <p><strong>Name:</strong> {info.name}</p>
      <p><strong>Parameters:</strong></p>
      <pre style={{
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word',
        maxHeight: '100px',
        overflowY: 'auto',
      }}>
        {JSON.stringify(info.parameters, null, 2)}
      </pre>
    </div>
  );
};

export default FunctionCallInfo;
