// No need for interface declaration in JS
// Just export a comment documenting the expected shape
/**
 * @typedef {Object} IVoiceProvider
 * @property {function(any): void} start
 * @property {function(): void} stop
 * @property {function(any): void} send
 * @property {function(string, function): void} on
 */