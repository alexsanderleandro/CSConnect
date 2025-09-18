// Jest setup: polyfill TextEncoder/TextDecoder for Node test environment
// Some third-party libs (via supertest/formidable/noble-hashes) expect these globals.
const { TextEncoder, TextDecoder } = require('util');
if (typeof global.TextEncoder === 'undefined') global.TextEncoder = TextEncoder;
if (typeof global.TextDecoder === 'undefined') global.TextDecoder = TextDecoder;

// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows: expect(element).toBeInTheDocument()
try {
	require('@testing-library/jest-dom/extend-expect');
} catch (e) {
	// ignore if not installed in this environment
}
