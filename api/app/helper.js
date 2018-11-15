/*
TODO: Commemnts
*/
var util = require("util");

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

  // If username is passed in, try set identity to fabric client
  if(username) {
    let user = await fabric_client.getUserContext(username, true);
    
    if (!user || !user.isEnrolled()) {
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

async function invoke(
  fabric_client, 
  channelName, 
  peerUrl, 
  ordererUrl,
  chaincodeId,
  chaincodeFunc,
  chaincodeArgs) {
  //
  // setup the fabric network
  var channel = fabric_client.newChannel(channelName);
  var peer = fabric_client.newPeer(peerUrl);
  var order = fabric_client.newOrderer(ordererUrl);
  
  channel.addPeer(peer);
  channel.addOrderer(order);

  var tx_id = fabric_client.newTransactionID();

  console.log("Assigning transaction_id: ", tx_id._transaction_id);

  var request = {
    chaincodeId: chaincodeId,
    fcn: chaincodeFunc,
    args: chaincodeArgs,
    chainId: channelName,
    txId: tx_id
  };

  let results = await channel.sendTransactionProposal(request);

  // the returned object has both the endorsement results
	// and the actual proposal, the proposal will be needed
	// later when we send a transaction to the orderer
  var proposalResponses = results[0];
  var proposal = results[1];
  let isProposalGood = false;
  if (
    proposalResponses &&
    proposalResponses[0].response &&
    proposalResponses[0].response.status === 200
  ) {
    isProposalGood = true;
    console.log("Transaction proposal was good");
  } else {
    console.error("Transaction proposal was bad");
  }

  if (!isProposalGood) {
    console.error(
      "Failed to send Proposal or receive valid response. Response null or status is not 200. exiting..."
    );
    throw new Error(
      "Failed to send Proposal or receive valid response. Response null or status is not 200. exiting..."
    );
  }

  console.log(
    util.format(
      'Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s"',
      proposalResponses[0].response.status,
      proposalResponses[0].response.message
    )
  );

  var request = {
    proposalResponses: proposalResponses,
    proposal: proposal
  };

  var transaction_id_string = tx_id.getTransactionID();
  var promises = [];

  var sendPromise = channel.sendTransaction(request);
  promises.push(sendPromise);

  let event_hub = channel.newChannelEventHub(peer);

  let txPromise = new Promise((resolve, reject) => {
    let handle = setTimeout(() => {
      event_hub.unregisterTxEvent(transaction_id_string);
      event_hub.disconnect();
      resolve({ event_status: "TIMEOUT" });
    }, 3000);
    event_hub.registerTxEvent(
      transaction_id_string,
      (tx, code) => {
        clearTimeout(handle);

        var return_status = {
          event_status: code,
          tx_id: transaction_id_string
        };
        if (code !== "VALID") {
          console.error("The transaction was invalid, code = " + code);
          resolve(return_status);
        } else {
          console.log(
            "The transaction has been committed on peer " +
              event_hub.getPeerAddr()
          );
          resolve(return_status);
        }
      },
      err => {
        reject(new Error("There was a problem with the eventhub ::" + err));
      },
      { disconnect: true }
    );
    event_hub.connect();
  });
  promises.push(txPromise);

  let reuslt = await Promise.all(promises);

  return reuslt;
}

exports.getClient = getClient;
exports.getCAClient = getCAClient;
exports.query = query;
exports.invoke = invoke;
