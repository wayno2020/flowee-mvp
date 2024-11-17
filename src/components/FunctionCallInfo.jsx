import React from 'react';
import Button from './Button';

const FunctionCallInfo = ({ info, id }) => {
  return (
    <div 
      id={id}
      style={{
        marginTop: '20px',
        padding: '10px',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        color: 'white',
        borderRadius: '5px',
        width: '100%',
      }}
    >
      <h3 style={{ margin: '0 0 10px 0' }}>Function Call Info:</h3>
      {info ? (
        <>
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
        </>
      ) : (
        <>
          <p><strong>Status:</strong> Waiting for function calls...</p>
        </>
      )}
    </div>
  );
};

export default FunctionCallInfo;
