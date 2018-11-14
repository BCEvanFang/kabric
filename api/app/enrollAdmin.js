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

async function enrollAdmin() {
  //
  var fabric_client = new Fabric_Client();
  var fabric_ca_client = null;
  var admin_user = null;
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
    tlsOptions,
    "ca.example.com",
    crypto_suite
  );

  ///
  let user_from_store = await fabric_client.getUserContext("admin", true);

  if (user_from_store && user_from_store.isEnrolled()) {
    console.log("Successfully loaded admin from persistence");
    admin_user = user_from_store;
    return null;
  }

  let enrollment = await fabric_ca_client.enroll({
    enrollmentID: "admin",
    enrollmentSecret: "adminpw"
  });

  let user = await fabric_client.createUser({
    username: "admin",
    mspid: "Org1MSP",
    cryptoContent: {
      privateKeyPEM: enrollment.key.toBytes(),
      signedCertPEM: enrollment.certificate
    }
  });

  admin_user = user;

  await fabric_client.setUserContext(admin_user);

  console.log(
    "Assigned the admin user to the fabric client ::" + admin_user.toString()
  );
}

exports.enrollAdmin = enrollAdmin;
