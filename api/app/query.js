"use strict";
/*
 * Copyright IBM Corp All Rights Reserved
 *
 * SPDX-License-Identifier: Apache-2.0
 */
/*
 * Chaincode query
 */

var Fabric_Client = require("fabric-client");
var path = require("path");
var util = require("util");
var os = require("os");

async function query() {
  //
  var fabric_client = new Fabric_Client();

  // setup the fabric network
  var channel = fabric_client.newChannel("mychannel");
  var peer = fabric_client.newPeer("grpc://localhost:7051");
  channel.addPeer(peer);

  //
  var member_user = null;
  var store_path = path.join(__dirname, "hfc-key-store");
  console.log("Store path:" + store_path);

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

  let user_from_store = await fabric_client.getUserContext("user1", true);

  if (user_from_store && user_from_store.isEnrolled()) {
    console.log("Successfully loaded user1 from persistence");
    member_user = user_from_store;
  } else {
    throw new Error("Failed to get user1.... run registerUser.js");
  }

  const request = {
    //targets : --- letting this default to the peers assigned to the channel
    chaincodeId: "kcc",
    fcn: "",
    args: [""]
  };

  let query_responses = await channel.queryByChaincode(request);

  console.log("Query has completed, checking results");
  // query_responses could have more than one  results if there multiple peers were used as targets
  if (query_responses && query_responses.length == 1) {
    if (query_responses[0] instanceof Error) {
      console.error("error from query = ", query_responses[0]);
    } else {
      console.log("Response is ", query_responses[0].toString());

      // Return query result
      return query_responses[0];
    }
  } else {
    console.log("No payloads were returned from query");

    return null;
  }
}

exports.query = query;
