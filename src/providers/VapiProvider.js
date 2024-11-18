import Vapi from "@vapi-ai/web";

class VapiProvider {
  constructor(apiKey) {
    this.vapi = new Vapi(apiKey);
  }

  start(options) {
    this.vapi.start(options);
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