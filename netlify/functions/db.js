const { getStore } = require('@netlify/blobs');

function getDbStore() {
  return getStore({
    name: 'apna_madrasa_store',
    consistency: 'strong'
  });
}

module.exports = { getDbStore };
