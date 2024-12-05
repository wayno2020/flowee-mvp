import Vapi from "@vapi-ai/web";

class VapiProvider {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('API key is required');
    }
    this.vapi = new Vapi(apiKey);
  }

  async start(options) {
    try {
      // Ensure we have audio permissions first
      await navigator.mediaDevices.getUserMedia({ audio: true });
      this.vapi.start(options);
    } catch (error) {
      throw new Error('Microphone access is required to start the call');
    }
  }

  stop() {
    this.vapi.stop();
  }

  send(message) {
    this.vapi.send(message);
  }

  on(event, callback) {
    this.vapi.on(event, callback);
  }
}

export default VapiProvider;