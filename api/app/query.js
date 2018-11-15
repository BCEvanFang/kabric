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

var helper = require("./helper");

async function query() {
  var fabric_client = await helper.getClient("user1");

  // Query chaincode
  let query_responses = await helper.query(
    fabric_client, 
    "mychannel",  // channel name
    "grpc://localhost:7051", // peer address
    "kcc", // chaincode name
    "", // chaincode function
    [] // chaincode arguments
  );

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
