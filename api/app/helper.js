/*
TODO: Commemnts
*/

var Fabric_Client = require("fabric-client");
var Fabric_CA_Client = require("fabric-ca-client");

var path = require("path");

// Identity key store path
var store_path = path.join(__dirname, "hfc-key-store");

/// Get fabric CA Client
function getCAClient() {
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

async function getClient(username) {
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

  if(username) {
    // Try set user identity to fabric client
    let user = await fabric_client.getUserContext(username, true);
    
    if (user && user.isEnrolled()) {
      console.log("Successfully loaded user: ", username);
    } else {
      throw new Error("Failed to get user: ", username);
    }
  }

  return fabric_client;
}

async function query(fabric_client, channelName, peerUrl, chaincodeId, chaincodeFunc, chaincodeArgs) {

  var channel = fabric_client.newChannel(channelName);

  //var peer = fabric_client.newPeer("grpc://localhost:7051");
  var peer = fabric_client.newPeer(peerUrl);

  channel.addPeer(peer);

  const request = {
    //targets : --- letting this default to the peers assigned to the channel
    chaincodeId: chaincodeId,
    fcn: chaincodeFunc,
    args: chaincodeArgs
  };

  let query_responses = await channel.queryByChaincode(request);

  return query_responses;
}

exports.getClient = getClient;
exports.getCAClient = getCAClient;
exports.query = query;
