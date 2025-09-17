// Jest setup: polyfill TextEncoder/TextDecoder for Node test environment
// Some third-party libs (via supertest/formidable/noble-hashes) expect these globals.
const { TextEncoder, TextDecoder } = require('util');
if (typeof global.TextEncoder === 'undefined') global.TextEncoder = TextEncoder;
if (typeof global.TextDecoder === 'undefined') global.TextDecoder = TextDecoder;

// You can add other global test setup here if needed.
