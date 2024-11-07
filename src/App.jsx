import React, { useEffect, useState } from "react";
import ActiveCallDetail from "./components/ActiveCallDetail";
import Button from "./components/base/Button";
import Vapi from "@vapi-ai/web";
import { isPublicKeyMissingError } from "./utils";

const vapi = new Vapi("848dc521-b0c2-4390-9abf-9ecdec635942");

const App = () => {
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [assistantIsSpeaking, setAssistantIsSpeaking] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [backgroundImage, setBackgroundImage] = useState(""); // Initialize as empty
  const { showPublicKeyInvalidMessage, setShowPublicKeyInvalidMessage } = usePublicKeyInvalid();
  const [functionCallInfo, setFunctionCallInfo] = useState(null);

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

    vapi.on('message', (message) => {
      if (message.type === 'function-call') {
        console.log('Received function call:', message);
        const { name, parameters } = message.functionCall;
        handleFunctionCall(name, parameters);
      }
    });

    vapi.on("error", (error) => {
      console.error(error);
      setConnecting(false);
      if (isPublicKeyMissingError({ vapiError: error })) {
        setShowPublicKeyInvalidMessage(true);
      }
    });

    // Clean up function
    return () => {
      // Remove event listeners here if necessary
    };
  }, [setShowPublicKeyInvalidMessage]); // Add setShowPublicKeyInvalidMessage to the dependency array

  const handleFunctionCall = (name, parameters) => {
    console.log('Handling function call:', name, parameters);
    // if (name === 'changeImage') {
    //   // Construct the image path
    //   const imagePath = `/images/${parameters.imageName}`;
      
    //   // Optional: Check if image exists before setting
    //   fetch(imagePath)
    //     .then(response => {
    //       if (response.ok) {
    //         setBackgroundImage(imagePath);
    //       } else {
    //         console.error('Image not found:', imagePath);
    //       }
    //     })
    //     .catch(error => {
    //       console.error('Error loading image:', error);
    //     });
    // }
    setFunctionCallInfo({ name, parameters });
  };

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
          functionCallInfo={functionCallInfo}
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
  firstMessage: "Hey, I'd love to show you how to use Notion. Ready?",
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
        content: `Your primary function is to showcase Notion using only the content provided below, and the finite list of images you have. When you change the topic to the next topic, call a function to change the image.

        Here is the content you can use to showcase Notion:

        Available functions:
        - changeImage(imageName: string): Changes the displayed image to the specified one. This function should be called every time the user asks a question about the product.

        Section 1:
        - Topic: What is notion?
        - Content:
        We like to describe Notion as a set of building blocks for creating things you love to use on your computer, such as:
        Documents
        Databases
        Public websites
        Knowledge bases
        Project management systems
        The world's most beautiful notes... 😉
        Notion is different from other software in a few ways. And once you master these basics, you can pretty much build whatever you want.
        Most importantly, don't worry about not knowing everything you can do right away. We'll discover it together. Click below to dive right in!
        - Image: 1.notion_overview.png

        Section 2:
        - Topic: What is a block?
        - Content:
        Think of Notion as a bottomless bin of building blocks. Build whatever you want, however you want! Every page you create in Notion will be composed of many "blocks," in the same way a LEGO castle is composed of many LEGO bricks 🧱
        - Image: 2.what_is_a_block.png
        Everything in Notion is a "block"
        When you create your first page in Notion and begin typing, you've started with a text block. But Notion pages can contain a lot more than plain text!
        Imagine every piece of content you add to a page — whether it's text, an image, or a table — as a single building block. Every page is a stack of blocks combined however you want.

        Section 3:
        Topic: What is a page
        Content:
        Every page you create in Notion is a fresh canvas where you can add whatever content you want. Follow these steps to create your first one.
        There are a few ways to add a new page in Notion.
        Click 📝 at the top of your left sidebar.
        If you’re on the desktop app, use the shortcut cmd/ctrl + N.
        If you’re on mobile, tap 📝 at the bottom of your screen.
        Need some inspiration or structure? On desktop or web, select any of the options at the bottom of the page to get started. You can import from an app or file, use a template, create a table, and more — select an option you like, and your page will be formatted accordingly!
        As you write, highlight any text on your page to bring up a menu of options. You can change the color or style of your text, add a comment or hyperlink, and more.
        - Image: 3.what_is_a_page.png

        Key points to remember in general:
        1. Always be informative and enthusiastic about the product.
        2. Keep your points concise and engaging.
        3. Whenever possible, refer to visual elements in the current image to enhance the demo experience.
        4. If a user asks about a feature that doesn't have a corresponding image, still provide information but mention that you can't show a visual for that specific aspect.

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

export default App;