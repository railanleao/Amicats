const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// expo-sqlite's web worker imports its wa-sqlite engine as a .wasm file; Metro's default
// asset extensions don't include it, so the web bundle fails to resolve it without this.
config.resolver.assetExts.push('wasm');

module.exports = config;
