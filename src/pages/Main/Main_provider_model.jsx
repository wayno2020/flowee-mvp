import React, { useEffect, useState, useRef } from "react";
import { assistantOptions } from "./assistantConfig";
import ActiveCallDetail from "../../components/ActiveCallDetail";
import Button from "../../components/Button";
import { isPublicKeyMissingError } from "../../utils/helpers";
import LiveCaption from "../../components/LiveCaption";
import FunctionCallInfo from "../../components/FunctionCallInfo";
import AssistantSpeechIndicator from "../../components/AssistantSpeechIndicator";
import "./Main.css";
import { createProvider } from "../../providers/providerFactory";
import logo from "../../assets/images/logo.svg";

// Vapi provider
const provider = createProvider('vapi', {
  // Dustin: "848dc521-b0c2-4390-9abf-9ecdec635942",
  // Wayne: "da9e7c55-8b90-4dcf-8a8b-d69fa2d20e7f" // Possibly waynesilbermann@gmail.com
  apiKey: "848dc521-b0c2-4390-9abf-9ecdec635942"
});

// #region Presentation content
const presentationContent = [
  {
    title: "What is notion?",
    question: "What is notion?",
    description: "A high level Notion overview",
    image_name: "1.notion_overview.png",
  },
  {
    title: "What is a block?",
    question: "What is a block?",
    description: "An introduction to blocks",
    image_name: "2.what_is_a_block.png",
  },
  {
    title: "What is a page?",
    question: "What is a page?",
    description: "An introduction to pages",
    image_name: "3.what_is_a_page.png",
  },
  {
    title: "Using pages",
    question: "What can I do with pages?",
    description: "What you can do with pages",
    image_name: "4.using_pages.png",
  },
  {
    title: "Tables",
    question: "What are tables?",
    description: "Tables are a powerful way to display data",
    image_name: "5.using_tables.png",
  },
  {
    title: "Formatting",
    question: "What are the formatting options?",
    description: "Notion formatting options",
    image_name: "6.formatting.png",
  },
];
// #endregion

const getImagePath = (imageName) => {
  try {
    // Using CRA's way of importing assets
    return require(`../../assets/images/${imageName}`);
  } catch (error) {
    console.error(`Failed to load image: ${imageName}`, error);
    return null;
  }
};

const Main = () => {
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [assistantIsSpeaking, setAssistantIsSpeaking] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [backgroundImage, setBackgroundImage] = useState(""); // Initialize as empty
  const {showPublicKeyInvalidMessage, setShowPublicKeyInvalidMessage } =
    usePublicKeyInvalid();
  const [functionCallInfo, setFunctionCallInfo] = useState(null);
  const [activeNavItem, setActiveNavItem] = useState(null);
  // const [lastActivityTimestamp, setLastActivityTimestamp] = useState(new Date());

  let lastActivityTimestamp = new Date();
  let started = false;

  const checkForSilenceAndAdvanceConversation = () => {
    const currentTime = new Date();
    const timeSilent = lastActivityTimestamp ? currentTime - lastActivityTimestamp : 0;
    console.log("Time silent:", timeSilent);
    
    if (timeSilent >= 0) {
      console.log('1s of silence: Sending message to continue');
      // Select the first slide when the presentation starts
      if (started === false && activeNavItem === null) {
        console.log("Asking for first slide (semi-disabled)");
        setTimeout(() => {
          // setActiveNavItem(0);
          // changeImage(presentationContent[0].image_name);
          started = true;
        }, 1000);
      }
      provider.send({
        type: "add-message",
        message: {
          role: "user",
          content: "Please continue and show me the image."
        },
      });
    } else {
      // Otherwise check again in 1 second
      // setTimeout(() => checkForSilenceAndAdvanceConversation(), 5000);
    }
  };

  useEffect(() => {
    provider.on("call-start", () => {
      console.log("Call started");
      setConnecting(false);
      setConnected(true);
      setShowPublicKeyInvalidMessage(false);
    });

    provider.on("message", (message) => {
      switch (message.type) {

        case "speech-update":
          console.log("Speech update:", message.status);
          if (message.status === 'started') {
            setAssistantIsSpeaking(true);
          }
          if (message.status === 'stopped') {
            setAssistantIsSpeaking(false);
            const newTimestamp = new Date();
            lastActivityTimestamp = newTimestamp;
            // checkForSilenceAndAdvanceConversation();            
          }
          break;

        case "transcript":
          if (message.transcriptType === 'final') {
            
            const newTimestamp = new Date();
            lastActivityTimestamp = newTimestamp;
            console.log("Transcript:", message.transcript);
            // checkForSilenceAndAdvanceConversation();
          }
          break;
                
        case "volume-level":
          setVolumeLevel(message.level);
          break;
        
        case "tool-calls":
          let tools = message.toolCallList;
          let firstTool = tools[0]; 
          let functionName = firstTool.function.name;
          let args = firstTool.function.arguments;
          let imageName = args.imageName;
          console.log("Tool call:", functionName, args, imageName);
          if (functionName === "changeImage") {
            setTimeout(() => {
              changeImage(imageName);
            }, 500);
          }
          break;
      }
    });

    provider.on("call-end", () => {
      setConnecting(false);
      setConnected(false);
      setShowPublicKeyInvalidMessage(false);
    });

    provider.on("error", (message) => {
      console.error("Error: ", message);
      setConnecting(false);
      if (isPublicKeyMissingError({ vapiError: message })) {
        setShowPublicKeyInvalidMessage(true);
      }
    });

    // Clean up function
    return () => {
      // Remove event listeners here if necessary
    };
  }, [setShowPublicKeyInvalidMessage]);

  // call start handler
  const startCallInline = () => {
    setConnecting(true);
    // provider.start("4d2824b2-b030-451a-a289-819b7f395a5d");
    provider.start(assistantOptions);
  };
  const endCall = () => {
    provider.stop();
  };

  // changeImage function
  const changeImage = (imageName) => {
    const imageUrl = getImagePath(imageName);
    if (imageUrl) {
      console.log("Changing image to:", imageName);
      setBackgroundImage(`url(${imageUrl})`);
      const index = presentationContent.findIndex(item => item.image_name === imageName);
      if (index !== -1) {
        setActiveNavItem(index);
      }
    } else {
      console.error("Image not found:", imageName);
    }
  };

  const handleNavClick = (index) => {
    setActiveNavItem(index);
    // Optional: Send a message to the assistant about the navigation change
    console.log("Navigating to section:", index + 1);
    console.log(presentationContent[index].title);
    provider.send({
      type: "add-message",
      message: {
        role: "user",
        content: `I have a question - ${
          presentationContent[index].title
        }. Please navigate to section ${index + 1} and show me the image.`,
      },
    });
  };

  return (
    <div className="outerContainer">
      {/* Add SVG definition */}
     {/* <svg style={{ position: "absolute", width: 0, height: 0 }}>
        <defs>
          <clipPath id="myClip" clipPathUnits="objectBoundingBox">
            <path
              transform="scale(0.05, 0.07)"
              d="M18.3751 1.91239C18.1542 1.73647 17.8901 1.63808 17.6997 1.57806C17.4851 1.51041 17.2393 1.4546 16.9799 1.40708C16.4595 1.31174 15.8079 1.23611 15.084 1.17697C13.6315 1.05832 11.8103 1 10.0001 1C8.18998 1 6.36865 1.05832 4.91624 1.17697C4.19231 1.2361 3.54065 1.31174 3.02027 1.40708C2.76089 1.4546 2.5151 1.51041 2.30047 1.57806C2.11007 1.63808 1.846 1.73647 1.62513 1.91238C1.40957 2.08407 1.2847 2.29928 1.214 2.44347C1.13629 2.60197 1.07772 2.77214 1.03175 2.93418C0.939618 3.25891 0.871378 3.64765 0.819918 4.05684C0.716218 4.88131 0.666748 5.9039 0.666748 6.9173C0.666748 7.9315 0.716298 8.9683 0.819288 9.8223C0.870568 10.2475 0.937648 10.6493 1.02564 10.9896C1.10115 11.2815 1.23104 11.696 1.497 11.9986C1.73752 12.2723 2.07043 12.3907 2.22577 12.4424C2.43443 12.5118 2.67629 12.5666 2.92713 12.6119C3.43309 12.7034 4.08336 12.7755 4.81173 12.8317C6.27482 12.9445 8.14318 13 10.0001 13C11.857 13 13.7254 12.9445 15.1884 12.8317C15.9168 12.7755 16.5671 12.7034 17.073 12.6119C17.3239 12.5666 17.5658 12.5118 17.7744 12.4424C17.9297 12.3907 18.2627 12.2723 18.5032 11.9986C18.7691 11.696 18.899 11.2815 18.9745 10.9896C19.0625 10.6493 19.1296 10.2475 19.1809 9.8223C19.2839 8.9683 19.3334 7.9315 19.3334 6.9173C19.3334 5.9039 19.284 4.88132 19.1803 4.05685C19.1288 3.64766 19.0606 3.25891 18.9684 2.93418C18.9225 2.77214 18.8639 2.60197 18.7862 2.44347C18.7155 2.29928 18.5906 2.08407 18.3751 1.91239Z"
            />
          </clipPath>
        </defs>
      </svg> */}

      <div className="slideNavOuterContainer">
        <div className="slideNavContainer">
          <div className="slideNavWrapper">
            <div className="slideNav">
              <div
                className={`navItem ${activeNavItem === 0 ? "active" : ""}`}
                onClick={() => handleNavClick(0)}
              >
                <h2>What is notion?</h2>
                <p>A high level overview</p>
              </div>
              <div
                className={`navItem ${activeNavItem === 1 ? "active" : ""}`}
                onClick={() => handleNavClick(1)}
              >
                <h2>What is a block?</h2>
                <p>An introduction to blocks</p>
              </div>
              <div
                className={`navItem ${activeNavItem === 2 ? "active" : ""}`}
                onClick={() => handleNavClick(2)}
              >
                <h2>What is a page?</h2>
                <p>An introduction to pages</p>
              </div>
              <div
                className={`navItem ${activeNavItem === 3 ? "active" : ""}`}
                onClick={() => handleNavClick(3)}
              >
                <h2>Using pages</h2>
                <p>What you can do with pages</p>
              </div>
              <div
                className={`navItem ${activeNavItem === 4 ? "active" : ""}`}
                onClick={() => handleNavClick(4)}
              >
                <h2>Tables</h2>
                <p>Tables are a powerful way to display data</p>
              </div>
              <div
                className={`navItem ${activeNavItem === 5 ? "active" : ""}`}
                onClick={() => handleNavClick(5)}
              >
                <h2>Formatting</h2>
                <p>Notion formatting options</p>
              </div>
            </div>

            <div className="bottomNav">
              <div className="bottomNavContent">
                <div
                  className="brandContainer"
                  style={{
                    opacity: Math.max(0.6, volumeLevel),
                    transition: "all 0.05s ease",
                  }}
                >
                  <img src={logo} alt="Logo" style={{ width: "100%" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="slideContentContainer">
        <div
          className="slideContent"
          style={{
            backgroundImage: backgroundImage,
          }}
        >
          <div className="callButtonContainer">
            {!connected ? (
              <Button
                label="Start Demo!"
                onClick={startCallInline}
                isLoading={connecting}
              />
            ) : (
              <ActiveCallDetail
                assistantIsSpeaking={assistantIsSpeaking}
                volumeLevel={volumeLevel}
                onEndCallClick={endCall}
              />
            )}
          </div>
          <div className="functionCallInfo" id="function-call-container">
            <FunctionCallInfo id="function-call-info" info={functionCallInfo} />
          </div>
        </div>
      </div>
    </div>
  );
};

const usePublicKeyInvalid = () => {
  const [showPublicKeyInvalidMessage, setShowPublicKeyInvalidMessage] =
    useState(false);

  // close public key invalid message after delay
  useEffect(() => {
    if (showPublicKeyInvalidMessage) {
      setTimeout(() => {
        setShowPublicKeyInvalidMessage(false);
      }, 3000);
    }
  }, [showPublicKeyInvalidMessage]);

  return {
    showPublicKeyInvalidMessage,
    setShowPublicKeyInvalidMessage,
  };
};

const PleaseSetYourPublicKeyMessage = () => {
  return (
    <div
      style={{
        position: "fixed",
        bottom: "25px",
        left: "25px",
        padding: "10px",
        color: "#fff",
        backgroundColor: "#f03e3e",
        borderRadius: "5px",
        boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
      }}
    >
      Is your Vapi Public Key missing? (recheck your code)
    </div>
  );
};

export default Main;