import { promptExperiments } from "./prompt_experiments";
const promptToUse = promptExperiments[0];
console.log("Using prompt:", promptToUse.id);

export const assistantOptions = {
  name: "Demo assistant",

  firstMessage:
    "Hey I'm Flo. I'd love to show you Notion... Is there anything you'd like to know about or should I dive into the demo?",

  clientMessages: [
    "transcript",
    "hang",
    "function-call",
    "tool-calls",
    "tool-calls-result",
    "speech-update",
    "metadata",
    "conversation-update",
  ],

  serverMessages: [
    "end-of-call-report",
    "status-update",
    "hang",
    "function-call",
  ],

  transcriber: {
    provider: "deepgram",
    model: "nova-2",
    language: "en-US",
    // options: {}, // Provider-specific options
    // profanityFilter: false,
    // redact: [], // Array of strings to redact from transcription
    // diarization: false,
    // interim: false,
    // endpointing: false,
    // keywords: [], // Array of keywords to detect
    // replacements: {}, // Word replacement dictionary
  },

  voice: {
    provider: "11labs",
    voiceId: "9wWG6XK636azXXRTG0Im",
    // options: {}, // Provider-specific options
    // stability: 0.5,
    // similarityBoost: 0.5,
    // style: 0.5,
    // useSSML: false,
  },

  model: {
    provider: "openai",
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: promptToUse.prompt,
      }
    ],
    // startSpeakingPlan: {
    //   waitSeconds: 0.4,
    //   smartEndpointingEnabled: false,
    //   customEndpointingRules: [
    //     {
    //       type: "both",
    //       assistantRegex: "customEndpointingRules",
    //       customerRegex: "customEndpointingRules",
    //       timeoutSeconds: 1.1,
    //     },
    //   ],
    //   // transcriptionEndpointingPlan: {
    //   //   onPunctuationSeconds: 0.1,
    //   //   onNoPunctuationSeconds: 1.5,
    //   //   onNumberSeconds: 0.5,
    //   // }
    // },
    // stopSpeakingPlan: {
    //   numWords: 0,
    //   voiceSeconds: 0.8,
    //   backoffSeconds: 1,
    // },
    // monitorPlan: {
    //   listenEnabled: false,
    //   controlEnabled: false,
    // },

    // functions: [
    //   {
    //     name: "changeImage",
    //     description: "Changes the displayed image to the specified one.",
    //     parameters: {
    //       type: "object",
    //       properties: {
    //         datetime: {
    //           type: "string",
    //           description: "The URL or name of the image to display.",
    //         },
    //       },
    //     },
    //   },
    // ],

    tools: [
      {
        type: "function",
        messages: [
          // {
          //   type: "request-start",
          //   content: "Ok one sec...",
          // },
          // {
          //   type: "request-complete",
          //   content: "Here you go!",
          // },
          // {
          //   type: "request-failed",
          //   content: "Hmmm...I couldn't find what I was looking for.",
          // },
          // {
          //   type: "request-response-delayed",
          //   content:
          //     "Um...  this is taking a while, sorry.",
          //   timingMilliseconds: 2000,
          // },
        ],
        function: {
          name: "changeImage",
          description: "Changes the image of the presentation to show the user a feature or explain a key concept",
          parameters: {
            type: "object",
            properties: {
              imageName: {
                type: "string",
                description: "The name of the image file to display",
              },
            },
            required: ["imageName"]
          },
        },
        async: true,
      },
    ],
    // temperature: 0.7,
    // topP: 1,
    // frequencyPenalty: 0,
    // presencePenalty: 0,
    // maxTokens: 1000,
    // options: {}, // Provider-specific options
  },
  silenceTimeoutSeconds: 30,
  maxDurationSeconds: 600,
  backgroundSound: "off",
  backgroundDenoisingEnabled: false,
  modelOutputInMessagesEnabled: false,
  voicemailMessage: "Please leave a message after the beep.",
  endCallMessage: "Thank you for your time. Goodbye!",
  endCallPhrases: ["goodbye", "end call"],
  // recordingEnabled: true,
  // webhookUrl: "https://example.com/webhook",
  // webhookAuth: { /* authentication details */ },
  // fillerAudioEnabled: true,
  // introAudioUrl: "https://example.com/intro.mp3",
  // outroAudioUrl: "https://example.com/outro.mp3",
  // transferPhoneNumber: "+1234567890",
  // transferMessage: "Transferring you to an agent...",
  // voicemailEnabled: true,
  // maxVoicemailDurationSeconds: 120,
  // endCallOnPhrasesEnabled: true,
  // audioConfig: {
  //   sampleRate: 16000,
  //   encoding: "linear16",
  //   channels: 1
  // },

  metadata: {
    // Custom key-value pairs
  },
};
