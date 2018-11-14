"use strict";
/*
 * Copyright IBM Corp All Rights Reserved
 *
 * SPDX-License-Identifier: Apache-2.0
 */
/*
 * Chaincode Invoke
 */

var Fabric_Client = require("fabric-client");
var path = require("path");
var util = require("util");
var os = require("os");

async function invoke() {
  //
  var fabric_client = new Fabric_Client();

  // setup the fabric network
  var channel = fabric_client.newChannel("mychannel");
  var peer = fabric_client.newPeer("grpc://localhost:7051");
  var order = fabric_client.newOrderer("grpc://localhost:7050");
  
  channel.addPeer(peer);
  channel.addOrderer(order);

  //
  var member_user = null;
  var store_path = path.join(__dirname, "hfc-key-store");
  console.log("Store path:" + store_path);
  var tx_id = null;

  let state_store = await Fabric_Client.newDefaultKeyValueStore({
    path: store_path
  });

  // assign the store to the fabric client
  fabric_client.setStateStore(state_store);
  var crypto_suite = Fabric_Client.newCryptoSuite();

  var crypto_store = Fabric_Client.newCryptoKeyStore({ path: store_path });
  crypto_suite.setCryptoKeyStore(crypto_store);
  fabric_client.setCryptoSuite(crypto_suite);

  let user_from_store = await fabric_client.getUserContext("user1", true);

  if (user_from_store && user_from_store.isEnrolled()) {
    console.log("Successfully loaded user1 from persistence");
    member_user = user_from_store;
  } else {
    throw new Error("Failed to get user1.... run registerUser.js");
  }

  tx_id = fabric_client.newTransactionID();
  console.log("Assigning transaction_id: ", tx_id._transaction_id);

  var request = {
    chaincodeId: "kcc",
    fcn: "",
    args: [""],
    chainId: "mychannel",
    txId: tx_id
  };

  let results = await channel.sendTransactionProposal(request);

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

  let transactionResults = await Promise.all(promises);

  console.log("RESULT:");
  console.log(transactionResults);

  console.log(
    "Send transaction promise and event listener promise have completed"
  );
  // check the results in the order the promises were added to the promise all list
  if (transactionResults && transactionResults[0] && transactionResults[0].status === "SUCCESS") {
    console.log("Successfully sent transaction to the orderer.");
  } else {
    console.error(
      "Failed to order the transaction. Error code: " + transactionResults[0].status
    );
  }

  if (transactionResults && transactionResults[1] && transactionResults[1].event_status === "VALID") {
    console.log("Successfully committed the change to the ledger by the peer");
  } else {
    console.log(
      "Transaction failed to be committed to the ledger due to ::" +
      transactionResults[1].event_status
    );
  }
}

exports.invoke = invoke;
