var Fabric_Client = require("fabric-client");
var Fabric_CA_Client = require("fabric-ca-client");

/// Get fabric CA Client
function getCAClient(store_path) {
  let crypto_suite = Fabric_Client.newCryptoSuite();

  // use the same location for the state store (where the users' certificate are kept)
  // and the crypto store (where the users' keys are kept)
  let crypto_store = Fabric_Client.newCryptoKeyStore({ path: store_path });
  crypto_suite.setCryptoKeyStore(crypto_store);

  let tlsOptions = {
    trustedRoots: [],
    verify: false
  };

  // be sure to change the http to https when the CA is running TLS enabled
  return new Fabric_CA_Client(
    "http://localhost:7054",
    tlsOptions,
    "ca.example.com",
    crypto_suite
  );
}

async function getClient(store_path) {
  var fabric_client = new Fabric_Client();

  // create the key value store as defined in the fabric-client/config/default.json 'key-value-store' setting
  let state_store = await Fabric_Client.newDefaultKeyValueStore({
    path: store_path
  });

  fabric_client.setStateStore(state_store);
  var crypto_suite = Fabric_Client.newCryptoSuite();

  // use the same location for the state store (where the users' certificate are kept)
  // and the crypto store (where the users' keys are kept)
  var crypto_store = Fabric_Client.newCryptoKeyStore({ path: store_path });
  crypto_suite.setCryptoKeyStore(crypto_store);
  fabric_client.setCryptoSuite(crypto_suite);

  return fabric_client;
}

exports.getClient = getClient;
exports.getCAClient = getCAClient;