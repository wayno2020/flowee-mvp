import { FlowClient } from "@speechmatics/flow-client";
import EventEmitter from 'events';

class FlowProvider extends EventEmitter {
  constructor(apiKey) {
    super();
    this.apiKey = apiKey;
    this.flowClient = new FlowClient('wss://flow.api.speechmatics.com', { appId: "flowee-mvp" });
  }

  async start(options) {
    try {
      const jwt = await this.fetchCredentials();
      await this.flowClient.startConversation(jwt, {
        config: {
          template_id: options.model?.templateId || "flow-service-assistant-amelia",
          template_variables: options.model?.templateVariables || {},
        },
        audioFormat: {
          type: 'raw',
          encoding: 'pcm_s16le',
          sample_rate: 16000,
        },
      });
    } catch (error) {
      this.emit('error', error);
    }
  }

  stop() {
    this.flowClient.endConversation();
  }

  send(message) {
    if (message.type === 'add-message') {
      // Convert message format from Vapi to Flow format
      this.flowClient.sendMessage(message.message.content);
    }
  }

  on(event, callback) {
    switch (event) {
      case 'call-start':
        this.flowClient.addEventListener("conversationStarted", callback);
        break;
      case 'call-end':
        this.flowClient.addEventListener("conversationEnded", callback);
        break;
      case 'speech-start':
        this.flowClient.addEventListener("responseStarted", callback);
        break;
      case 'speech-end':
        this.flowClient.addEventListener("responseCompleted", callback);
        break;
      case 'transcript':
        this.flowClient.addEventListener("addTranscript", (event) => {
          callback({ text: event.metadata.transcript });
        });
        break;
      case 'error':
        this.flowClient.addEventListener("error", callback);
        break;
    }
  }

  async fetchCredentials() {
    const resp = await fetch(
      'https://mp.speechmatics.com/v1/api_keys?type=flow',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          ttl: 3600,
        }),
      },
    );
    if (!resp.ok) {
      throw new Error('Failed to fetch Flow credentials');
    }
    return await resp.json();
  }
}

export default FlowProvider; 