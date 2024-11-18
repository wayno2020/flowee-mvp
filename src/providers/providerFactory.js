import VapiProvider from './VapiProvider';
import FlowProvider from './FlowProvider';

const createProvider = (type, config) => {
  switch (type) {
    case 'vapi':
      return new VapiProvider(config.apiKey);
    case 'flow':
      return new FlowProvider(config.apiKey);
    default:
      throw new Error(`Provider ${type} not supported`);
  }
};

export { createProvider };