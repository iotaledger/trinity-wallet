//
//  Argon2Core.swift
//  iotaWallet
//
//  Created by Rajiv Shah on 7/31/18.
//  Copyright © 2018 IOTA Foundation. All rights reserved.
//

import Foundation
import CatCrypto

struct Argon2Core {

  /// Initializes Argon2
  ///
  /// - Parameters:
  ///   - t_cost: Time cost, desired number of iterations
  ///   - m_cost: Memory cost, measured in KiB
  ///   - parallelism: Number of threads to use
  ///   - hashLength: Desired hash length
  /// - Returns: Initialized argon2Crypto instance
  static func initialize(t_cost: Int, m_cost: Int, parallelism: Int, hashLength: Int) -> CatArgon2Crypto {
    let argon2Crypto = CatArgon2Crypto()
    // Set mode to Argon2d
    argon2Crypto.context.mode = .argon2d
    // Set parameters
    argon2Crypto.context.iterations = t_cost
    argon2Crypto.context.memory = m_cost
    argon2Crypto.context.parallelism = parallelism
    argon2Crypto.context.hashLength = hashLength

    return argon2Crypto
  }

  /// Hashes a given password
  ///
  /// - Parameters:
  ///   - password: Password to hash
  ///   - salt: Salt to be used
  ///   - params: Parameters to initialize Argon2 with
  /// - Returns: Hashed password
  static func argon2Hash(password: String, salt: String, params: [String: Any]) -> [UInt8] {
    // Initialize Argon2
    let argon2Crypto = initialize(t_cost: params["t_cost"] as! Int, m_cost: params["m_cost"] as! Int, parallelism: params["parallelism"] as! Int, hashLength: params["hashLength"] as! Int)
    // Add salt to the context
    argon2Crypto.context.salt = salt
    // Get the hash of the password
    let hash = argon2Crypto.hash(password: password, encoded: false).raw
    return hash as! [UInt8]
  }

}
