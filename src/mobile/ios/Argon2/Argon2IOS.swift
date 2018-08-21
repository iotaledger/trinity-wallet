//
//  Argon2.swift
//  iotaWallet
//
//  Created by Rajiv Shah on 7/31/18.
//  Copyright © 2018 IOTA Foundation. All rights reserved.
//

import Foundation

@objc(Argon2IOS)
class Argon2IOS: NSObject {

  /// Hashes a given password
  ///
  /// - Parameters:
  ///   - params: Parameters to initialize Argon2 with
  ///   - password: Password to hash
  ///   - resolve: A JS Promise resolve block
  ///   - reject: A JS Promise reject block
  @objc func hash(_ password: String, salt: String, params: [String: Any], resolver resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
    // Validate parameters
    if params["t_cost"] is Int && params["m_cost"] is Int && params["parallelism"] is Int && params["hashLength"] is Int {
      // Resolve the hash
      let h = Argon2Core.argon2Hash(password: password, salt: salt, params: params)
      resolve(h)
    } else {
      // Reject with an error message containing the parameters passed
      reject("Argon2 hash", "Invalid parameters provided: " + params.debugDescription, nil)
    }
  }
}
