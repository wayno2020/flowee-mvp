import { promptExperiments } from "./prompt_experiments";
const promptToUse = promptExperiments[0].prompt;
console.log('Using prompt:', promptToUse.id);

export const assistantOptions = {
  name: "Demo assistant",
  firstMessage:
    "Hey I'm Flo. I'd love to show you Notion... Is there anything in particular you'd like to know about or should I dive right in and start with an overview?",
  responseDelaySeconds: 0.6,
  clientMessages: [
    "transcript",
    "hang",
    "function-call",
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
        content: promptToUse,
      },
      {
        role: "assistant",
        content:
          "Hey I'm Flo, I'd love to show you Notion. What do I call you?",
      },
    ],
    functions: [
      {
        name: "changeImage",
        description: "Changes the displayed image to the specified one.",
        parameters: {
          type: "object",
          properties: {
            datetime: {
              type: "string",
              description:
                "The URL or name of the image to display.",
            },
          },
        },
      },
    ],
    tools: [
      {
        type: "function",
        function: {
          name: "changeImage",
          description: "Changes the background image of the presentation",
          parameters: {
            type: "object",
            properties: {
              imageName: {
                type: "string",
                description: "The name of the image file to display",
              },
            },
            required: ["imageName"],
          },
        },
      },
    ],
  },
};
