import ScaleLoader from "react-spinners/ScaleLoader";

const Button = ({ label, onClick, isLoading, disabled }) => {
  const opacity = disabled ? 0.5 : 0.8;
  const cursor = disabled ? "not-allowed" : "pointer";

  const Contents = isLoading ? (
    <ScaleLoader
      color="#fff"
      height={20}
      width={5}
      margin={2}
      loading={true}
      css={{ display: "block", margin: "0 auto" }}
    />
  ) : (
    <p style={{ margin: 0, padding: 0, fontSize: "24px", fontWeight: "bold" }}>{label}</p>
  );

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.6)", // Semi-transparent black
        color: "white",
        border: "4px solid white", // Bold white border
        borderRadius: "0", // Remove rounded corners
        padding: "20px 60px",
        fontSize: "24px",
        fontWeight: "bold",
        outline: "none",
        boxShadow: "0px 8px 15px rgba(0, 0, 0, 0.1)",
        transition: "all 0.3s ease",
        opacity,
        cursor,
        position: "relative",
        overflow: "hidden",
        backdropFilter: "blur(5px)", // Add blur effect
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.3) 100%)",
          transition: "all 0.3s ease",
          transform: "translateY(100%)",
        }}
      />
      <div style={{ position: "relative", zIndex: 1 }}>{Contents}</div>
    </button>
  );
};

export default Button;
