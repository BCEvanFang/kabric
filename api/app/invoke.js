"use strict";
/*
 * Copyright IBM Corp All Rights Reserved
 *
 * SPDX-License-Identifier: Apache-2.0
 */
/*
 * Chaincode Invoke
 */
var helper = require("./helper");

async function invoke(fcn, args) {
  //
  var fabric_client = await helper.getClient("user1");

  if(!fcn) {
    fcn = "";
  }
  if(!args) {
    args = []
  }
  
  let transactionResults = await helper.invoke(
    fabric_client, 
    "mychannel", // channel name
    "grpc://localhost:7051", // peer
    "grpc://localhost:7050", // orderer
    "kcc", // chaincode name
    fcn, // chaincode funciton
    args // chaincode arguments
  );

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

  return transactionResults;
}

exports.invoke = invoke;
