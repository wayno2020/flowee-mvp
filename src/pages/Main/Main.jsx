import React, { useEffect, useState } from "react";
import { assistantOptions } from "./assistantConfig";
import ActiveCallDetail from "../../components/ActiveCallDetail";
import Button from "../../components/Button";
import Vapi from "@vapi-ai/web";
import { isPublicKeyMissingError } from "../../utils/helpers";
import LiveCaption from "../../components/LiveCaption";
import FunctionCallInfo from "../../components/FunctionCallInfo";
import AssistantSpeechIndicator from "../../components/AssistantSpeechIndicator";
import "./Main.css";
import logo from "../../assets/images/logo.svg";

const vapi = new Vapi("848dc521-b0c2-4390-9abf-9ecdec635942");

const presentationContent = [{
  title: "What is notion?",
  question: "What is notion?",
  description: "A high level overview",
  image_name: "1.notion-overview.png"
}, {
  title: "What is a block?",
  question: "What is a block?",
  description: "An introduction to blocks",
  image_name: "2.what_is_a_block.png"
  }, {
    title: "What is a page?",
    question: "What is a page?",
    description: "An introduction to pages",
    image_name: "3.what_is_a_page.png"
  }, {
    title: "Using pages",
    question: "What can I do with pages?",
    description: "What you can do with pages",
    image_name: "4.notion-using-pages.png"
  }, {
    title: "Tables",
    question: "What are tables?",
    description: "Tables are a powerful way to display data",
    image_name: "5.notion-tables.png"
  }, {
    title: "Formatting",
    question: "What are the formatting options?",
    description: "Notion formatting options",
    image_name: "6.notion-formatting.png"
  }
]

const Main = () => {
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [assistantIsSpeaking, setAssistantIsSpeaking] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [backgroundImage, setBackgroundImage] = useState(""); // Initialize as empty
  const { showPublicKeyInvalidMessage, setShowPublicKeyInvalidMessage } =
    usePublicKeyInvalid();
  const [functionCallInfo, setFunctionCallInfo] = useState(null);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [activeNavItem, setActiveNavItem] = useState(0);

  useEffect(() => {
    // Fetch a random image from Unsplash
    const fetchRandomImage = async () => {
      try {
        const response = await fetch(
          "https://images.unsplash.com/photo-1728755833852-2c138c84cfb1?q=80&w=2972&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        );
      } catch (error) {
        console.error("Error fetching background image:", error);
      }
    };
    fetchRandomImage();

    // #region Vapi events
    vapi.on("call-start", () => {
      console.log("Call started");
      setConnecting(false);
      setConnected(true);
      setShowPublicKeyInvalidMessage(false);
    });
    vapi.on("call-end", () => {
      console.log("Call ended");
      setConnecting(false);
      setConnected(false);
      setShowPublicKeyInvalidMessage(false);
    });
    vapi.on("speech-start", () => {
      console.log("Speech started");
      setAssistantIsSpeaking(true);
    });
    vapi.on("speech-end", () => {
      console.log("Speech stopped");
      setAssistantIsSpeaking(false);
    });
    vapi.on("volume-level", (level) => {
      setVolumeLevel(level);
    });
    vapi.on("message", (message) => {
      console.log("Message: ", message.type);
      if (message.type === "function-call" && message.functionCall) {
        console.log("Message / Received function call:", message.functionCall);
        const { name, parameters } = message.functionCall;
        if (name === "changeImage") {
          changeImage(parameters.imageName || parameters.image_name);
        }
      }
    });
    vapi.on("error", (error) => {
      console.error("Error: ", error);
      setConnecting(false);
      if (isPublicKeyMissingError({ vapiError: error })) {
        setShowPublicKeyInvalidMessage(true);
      }
    });
    vapi.on("transcript", (transcript) => {
      // console.log("Received transcript:", transcript.text);
      if (transcript.text?.trim()) {
        setCurrentTranscript(transcript.text);
      }
    });
    vapi.on("transcript-end", () => {
      // console.log("Transcript ended");
      setCurrentTranscript("");
    });
    vapi.on("function-call", (functionCall) => {
      console.log("Function call / Function call: ", functionCall);
      if (functionCall.name === "changeImage") {
        changeImage(functionCall.parameters.image_name);
      }
    });
    // #endregion

    // Clean up function
    return () => {
      // Remove event listeners here if necessary
    };
  }, [setShowPublicKeyInvalidMessage]); // Add setShowPublicKeyInvalidMessage to the dependency array

  const changeImage = (imageName) => {
    console.log("Change Image function handling:", imageName);
      // Construct the image path
      // const imagePath = `/images/${imageName}`;
    const imagePath = `url(../../assets/images/${imageName})`;
      console.log("Attempting to change image to:", imagePath);

      // Optional: Check if image exists before setting
      fetch(imagePath)
        .then((response) => {
          console.log("Image fetch response:", response);
          if (response.ok) {
            console.log(
              "Image fetch successful, updating background to:",
              imagePath
            );
            setBackgroundImage(imagePath);
          } else {
            console.error("Image fetch failed with status:", response.status);
            console.error("Image not found:", imagePath);
          }
        })
        .catch((error) => {
          console.error("Error loading image:", error);
        });
    // setFunctionCallInfo({ parameters });
  };

  // call start handler
  const startCallInline = () => {
    setConnecting(true);
    vapi.start(assistantOptions);
  };
  const endCall = () => {
    vapi.stop();
  };

  const handleNavClick = (index) => {
    setActiveNavItem(index);
    // Optional: Send a message to the assistant about the navigation change
    console.log("Navigating to section:", index + 1);
    console.log(presentationContent[index].title);
    vapi.send({
      type: "add-message",
      message: {
        role: "user",
        content: `I have a question - ${presentationContent[index].title}. Please navigate to section ${index + 1} and show me the image.`
      }
    });
  };

  return (
    <div class="outerContainer">
      {/* Add SVG definition */}
      <svg style={{ position: "absolute", width: 0, height: 0 }}>
        <defs>
          <clipPath id="myClip" clipPathUnits="objectBoundingBox">
            <path
              transform="scale(0.05, 0.07)"
              d="M18.3751 1.91239C18.1542 1.73647 17.8901 1.63808 17.6997 1.57806C17.4851 1.51041 17.2393 1.4546 16.9799 1.40708C16.4595 1.31174 15.8079 1.23611 15.084 1.17697C13.6315 1.05832 11.8103 1 10.0001 1C8.18998 1 6.36865 1.05832 4.91624 1.17697C4.19231 1.2361 3.54065 1.31174 3.02027 1.40708C2.76089 1.4546 2.5151 1.51041 2.30047 1.57806C2.11007 1.63808 1.846 1.73647 1.62513 1.91238C1.40957 2.08407 1.2847 2.29928 1.214 2.44347C1.13629 2.60197 1.07772 2.77214 1.03175 2.93418C0.939618 3.25891 0.871378 3.64765 0.819918 4.05684C0.716218 4.88131 0.666748 5.9039 0.666748 6.9173C0.666748 7.9315 0.716298 8.9683 0.819288 9.8223C0.870568 10.2475 0.937648 10.6493 1.02564 10.9896C1.10115 11.2815 1.23104 11.696 1.497 11.9986C1.73752 12.2723 2.07043 12.3907 2.22577 12.4424C2.43443 12.5118 2.67629 12.5666 2.92713 12.6119C3.43309 12.7034 4.08336 12.7755 4.81173 12.8317C6.27482 12.9445 8.14318 13 10.0001 13C11.857 13 13.7254 12.9445 15.1884 12.8317C15.9168 12.7755 16.5671 12.7034 17.073 12.6119C17.3239 12.5666 17.5658 12.5118 17.7744 12.4424C17.9297 12.3907 18.2627 12.2723 18.5032 11.9986C18.7691 11.696 18.899 11.2815 18.9745 10.9896C19.0625 10.6493 19.1296 10.2475 19.1809 9.8223C19.2839 8.9683 19.3334 7.9315 19.3334 6.9173C19.3334 5.9039 19.284 4.88132 19.1803 4.05685C19.1288 3.64766 19.0606 3.25891 18.9684 2.93418C18.9225 2.77214 18.8639 2.60197 18.7862 2.44347C18.7155 2.29928 18.5906 2.08407 18.3751 1.91239Z"
            />
          </clipPath>
        </defs>
      </svg>

      <div className="slideNavOuterContainer">
        <div className="slideNavContainer">
          <div className="slideNavWrapper">
            <div className="slideNav">
              <div 
                className={`navItem ${activeNavItem === 0 ? 'active' : ''}`}
                onClick={() => handleNavClick(0)}
              >
                <h2>What is notion?</h2>
                <p>A high level overview</p>
              </div>
              <div 
                className={`navItem ${activeNavItem === 1 ? 'active' : ''}`}
                onClick={() => handleNavClick(1)}
              >
                <h2>What is a block?</h2>
                <p>An introduction to blocks</p>
              </div>
              <div 
                className={`navItem ${activeNavItem === 2 ? 'active' : ''}`}
                onClick={() => handleNavClick(2)}
              >
                <h2>What is a page?</h2>
                <p>An introduction to pages</p>
              </div>
              <div 
                className={`navItem ${activeNavItem === 3 ? 'active' : ''}`}
                onClick={() => handleNavClick(3)}
              >
                <h2>Using pages</h2>
                <p>What you can do with pages</p>
              </div>
              <div 
                className={`navItem ${activeNavItem === 4 ? 'active' : ''}`}
                onClick={() => handleNavClick(4)}
              >
                <h2>Tables</h2>
                <p>Tables are a powerful way to display data</p>
              </div>
              <div 
                className={`navItem ${activeNavItem === 5 ? 'active' : ''}`}
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
                    transition: 'all 0.05s ease'
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
        <div class="slideContent"
          style={{
            backgroundImage: backgroundImage,
          }}
        >
            <div class="callButtonContainer">
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
            <div class="functionCallInfo" id="function-call-container">
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
