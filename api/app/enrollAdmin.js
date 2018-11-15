"use strict";
/*
 * Copyright IBM Corp All Rights Reserved
 *
 * SPDX-License-Identifier: Apache-2.0
 */
/*
 * Enroll the admin user
 */

var helper = require("./helper");

async function enrollAdmin() {

  // Get fabric client
  var fabric_client = await helper.getClient();

  // Get admin user
  let admin_user = await fabric_client.getUserContext("admin", true);

  // user already exists
  if (admin_user && admin_user.isEnrolled()) {
    console.log("Successfully loaded admin from persistence");
    return null;
  }

  // be sure to change the http to https when the CA is running TLS enabled
  let fabric_ca_client = helper.getCAClient();

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

exports.enrollAdmin = enrollAdmin;
