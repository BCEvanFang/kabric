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

  var store_path = path.join(__dirname, "hfc-key-store");
  console.log(" Store path:" + store_path);

  // Get fabric client
  var fabric_client = await getClient(store_path);

  // Get admin user
  let admin_user = await fabric_client.getUserContext("admin", true);

  // user already exists
  if (admin_user && admin_user.isEnrolled()) {
    console.log("Successfully loaded admin from persistence");
    return null;
  }

  // be sure to change the http to https when the CA is running TLS enabled
  let fabric_ca_client = getCAClient(store_path);

  // Enroll admin user
  let enrollment = await fabric_ca_client.enroll({
    enrollmentID: "admin",
    enrollmentSecret: "adminpw"
  });

  // Set admin user to fabric client context
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

exports.enrollAdmin = enrollAdmin;
