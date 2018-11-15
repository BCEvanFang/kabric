"use strict";
/*
 * Copyright IBM Corp All Rights Reserved
 *
 * SPDX-License-Identifier: Apache-2.0
 */
/*
 * Enroll the admin user
 */

var Fabric_Client = require("fabric-client");
var Fabric_CA_Client = require("fabric-ca-client");

var path = require("path");
var util = require("util");
var os = require("os");

var helper = require("./helper");

async function registerUser() {

  var admin_user = null;
  var member_user = null;
  var store_path = path.join(__dirname, "hfc-key-store");
  console.log(" Store path:" + store_path);
  
  var fabric_client = await helper.getClient(store_path)

  let user_from_store = await fabric_client.getUserContext("admin", true);

  if (user_from_store && user_from_store.isEnrolled()) {
    console.log("Successfully loaded admin from persistence");
    admin_user = user_from_store;
  } else {
    throw new Error("Failed to get admin.... run enrollAdmin.js");
  }

  // TODO: 保存secret，以便再次enroll
  var fabric_ca_client = helper.getCAClient(store_path);

  let secret = await fabric_ca_client.register(
    {
      enrollmentID: "user1",
      affiliation: "org1.department1",
      role: "client"
    },
    admin_user
  );

  console.log("Successfully registered user1 - secret:" + secret);

  let enrollment = await fabric_ca_client.enroll({
    enrollmentID: "user1",
    enrollmentSecret: secret
  });

  console.log('Successfully enrolled member user "user1" ');

  let user = await fabric_client.createUser({
    username: "user1",
    mspid: "Org1MSP",
    cryptoContent: {
      privateKeyPEM: enrollment.key.toBytes(),
      signedCertPEM: enrollment.certificate
    }
  });

  console.log("Successfully createUser");

  member_user = user;

  await fabric_client.setUserContext(member_user);

  console.log(
    "User1 was successfully registered and enrolled and is ready to interact with the fabric network"
  );
}

exports.registerUser = registerUser;
