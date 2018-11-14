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

async function registerUser() {
  var fabric_client = new Fabric_Client();
  var fabric_ca_client = null;
  var admin_user = null;
  var member_user = null;
  var store_path = path.join(__dirname, "hfc-key-store");
  console.log(" Store path:" + store_path);

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
  var tlsOptions = {
    trustedRoots: [],
    verify: false
  };
  // be sure to change the http to https when the CA is running TLS enabled
  fabric_ca_client = new Fabric_CA_Client(
    "http://localhost:7054",
    null,
    "",
    crypto_suite
  );

  let user_from_store = await fabric_client.getUserContext("admin", true);

  if (user_from_store && user_from_store.isEnrolled()) {
    console.log("Successfully loaded admin from persistence");
    admin_user = user_from_store;
  } else {
    throw new Error("Failed to get admin.... run enrollAdmin.js");
  }

  // TODO: 保存secret，以便再次enroll
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
