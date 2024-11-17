import AssistantSpeechIndicator from "./AssistantSpeechIndicator";
import Button from "./Button";
import VolumeLevel from "./VolumeLevel";

const ActiveCallDetail = ({ assistantIsSpeaking, volumeLevel, onEndCallClick }) => {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: 'white',
          boxShadow: '0px 4px 12px rgba(0,0,0,0.15)',
          cursor: 'pointer',
        }}
        onClick={onEndCallClick}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 18L18 6M6 6L18 18" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        {/* <VolumeLevel volume={volumeLevel} /> */}
      </div>
    </div>
  );
};

export default ActiveCallDetail;