//
//  Argon2.swift
//  iotaWallet
//
//  Created by Rajiv Shah on 7/31/18.
//  Copyright © 2018 IOTA Foundation. All rights reserved.
//

import Foundation

@objc class Argon2IOS: NSObject {

  /// Hashes a given password
  ///
  /// - Parameters:
  ///   - params: Parameters to initialize Argon2 with
  ///   - password: Password to hash
  ///   - resolve: A JS Promise resolve block
  ///   - reject: A JS Promise reject block
  @objc func hash(params: [String: Any], password: String, resolver resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
    // Validate parameters
    if params["iterations"] is Int && params["salt"] is String && params["hashLength"] is Int && params["parallelism"] is Int {
      // Resolve the hash
      let h = Argon2Core.argon2Hash(params: params, password: password)
      resolve(h)
    } else {
      // Reject with an error message containing the parameters passed
      reject("Argon2 hash", "Invalid parameters provided: " + params.debugDescription, nil)
    }
  }

  /// Verifies a hash and password
  ///
  /// - Parameters:
  ///   - params: Parameters to initialize Argon2 with
  ///   - hash: Hash to verify
  ///   - password: Password to verify
  ///   - resolve: A JS Promise resolve block
  ///   - reject: A JS Promise reject block
  @objc func verify(params: [String: Any], hash: String, password: String, resolver resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
    if params["iterations"] is Int && params["salt"] is String && params["hashLength"] is Int && params["parallelism"] is Int {
      let r = Argon2Core.argon2Verify(params: params, hash: hash, password: password)
      resolve(r)
    } else {
      reject("Argon2 verify", "Invalid parameters provided: " + params.debugDescription, nil)
    }
  }
}
