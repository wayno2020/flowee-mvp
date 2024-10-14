import { useEffect, useState } from "react";

import ActiveCallDetail from "./components/ActiveCallDetail";
import Button from "./components/base/Button";
import Vapi from "@vapi-ai/web";
import { isPublicKeyMissingError } from "./utils";

// Put your Vapi Public Key below.
const vapi = new Vapi("848dc521-b0c2-4390-9abf-9ecdec635942");

const App = () => {
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [assistantIsSpeaking, setAssistantIsSpeaking] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [backgroundImage, setBackgroundImage] = useState(""); // Initialize as empty

  const { showPublicKeyInvalidMessage, setShowPublicKeyInvalidMessage } = usePublicKeyInvalid();

  useEffect(() => {
    // Fetch a random image from Unsplash
    const fetchRandomImage = async () => {
      try {
        console.log("Fetching image...");
        const response = await fetch("https://images.unsplash.com/photo-1728755833852-2c138c84cfb1?q=80&w=2972&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D");
        console.log("Fetch response:", response);
        console.log("Fetched image URL:", response.url);
        setBackgroundImage(response.url);
        console.log("Background image set to:", response.url);
      } catch (error) {
        console.error("Error fetching image:", error);
      }
    };

    fetchRandomImage();

    // hook into Vapi events
    vapi.on("call-start", () => {
      setConnecting(false);
      setConnected(true);

      setShowPublicKeyInvalidMessage(false);
    });

    vapi.on("call-end", () => {
      setConnecting(false);
      setConnected(false);

      setShowPublicKeyInvalidMessage(false);
    });

    vapi.on("speech-start", () => {
      setAssistantIsSpeaking(true);
    });

    vapi.on("speech-end", () => {
      setAssistantIsSpeaking(false);
    });

    vapi.on("volume-level", (level) => {
      setVolumeLevel(level);
    });

    vapi.on("error", (error) => {
      console.error(error);

      setConnecting(false);
      if (isPublicKeyMissingError({ vapiError: error })) {
        setShowPublicKeyInvalidMessage(true);
      }
    });

    vapi.on('message', (message) => {
      // if (message.type !== 'transcript' && message.type !== 'speech-update') {
      //   console.log('Received message:', message);
      // }
      if (message.type === 'function-call') {
        console.log('Received function call:', message);
        const { name, parameters } = message.functionCall;
        handleFunctionCall(name, parameters);
      }
    });

    // we only want this to fire on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // call start handler
  const startCallInline = () => {
    setConnecting(true);
    vapi.start(assistantOptions);
  };
  const endCall = () => {
    vapi.stop();
  };

  return (
    <div
      style={{
        display: "flex",
        width: "100vw",
        height: "100vh",
        justifyContent: "center",
        alignItems: "center",
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none", // Set to none if no image
        backgroundColor: backgroundImage ? "transparent" : "#ffffff", // Default to white if no image
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {!connected ? (
        <Button
          label="Jump on an Instant Demo!"
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

      {showPublicKeyInvalidMessage ? <PleaseSetYourPublicKeyMessage /> : null}
      {/* Remove the ReturnToDocsLink component */}
      {/* <ReturnToDocsLink /> */}
    </div>
  );
};

const assistantOptions = {
  name: "Demo assistant",
  firstMessage: "Hey, I'd love to show you around. What do you want to know?",
  transcriber: {
    provider: "deepgram",
    model: "nova-2",
    language: "en-US",
  },
  voice: {
    provider: "playht",
    voiceId: "melissa",
  },
  model: {
    provider: "openai",
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `You are an expert SaaS demo AI assistant.

Your primary function is to showcase the product and adapt your presentation based on user questions.

When the caller asks a question about the product, analyze it and call the appropriate function to change the displayed image.

Available functions:
- changeImage(imageName: string): Changes the displayed image to the specified one. This function should be called every time the user asks a question about the product.

Key points to remember:
1. Always be informative and enthusiastic about the product.
2. Keep your responses concise and engaging.
3. Whenever possible, refer to visual elements in the current image to enhance the demo experience.
4. If a user asks about a feature that doesn't have a corresponding image, still provide information but mention that you can't show a visual for that specific aspect.
5. Be proactive in suggesting related features or aspects of the product that might interest the user based on their questions.

Remember, your goal is to provide an interactive and visually appealing demonstration of the product. Use the image-changing capability to its fullest to create an engaging and informative experience.

- Maintain a professional yet friendly tone.
- Use clear and simple language to explain complex features.
- This is a voice conversation, so keep your responses relatively short and natural-sounding.`,
      },
    ],
    functions: [
      {
        name: "changeImage",
        description: "Changes the displayed image to the specified one.",
        parameters: {
          type: "object",
          properties: {
            imageName: {
              type: "string",
              description: "The URL or name of the image to display."
            }
          },
          required: ["imageName"]
        }
      }
    ]
  },
};

const usePublicKeyInvalid = () => {
  const [showPublicKeyInvalidMessage, setShowPublicKeyInvalidMessage] = useState(false);

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

function handleFunctionCall(name, parameters) {
  switch (name) {
    case 'sendEmail':
      sendEmail(JSON.parse(parameters));
      break;
    case 'updateUI':
      updateUI(JSON.parse(parameters));
      break;
    // Add more cases for other functions
    default:
      console.log(`Unknown function: ${name}`);
  }
}

function sendEmail(params) {
  // Implement email sending logic
  console.log(`Sending email to ${params.to} with subject "${params.subject}"`);
}

function updateUI(params) {
  // Implement UI update logic
  console.log(`Updating UI with: ${JSON.stringify(params)}`);
}

export default App;
