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
  ///   - iterations: Desired number of iterations
  ///   - salt: Desired string to use as a salt
  ///   - hashLength: Desired hash length
  ///   - parallelism: Number of threads to use
  /// - Returns: Initialized argon2Crypto instance
  static func initialize(iterations: Int, salt: String, hashLength: Int, parallelism: Int) -> CatArgon2Crypto {
    let argon2Crypto = CatArgon2Crypto()
    // Set mode to Argon2id
    argon2Crypto.context.mode = .argon2id
    // Set parameters
    argon2Crypto.context.iterations = iterations
    argon2Crypto.context.salt = salt
    argon2Crypto.context.hashLength = hashLength
    argon2Crypto.context.parallelism = parallelism

    return argon2Crypto
  }

  /// Hashes a given password
  ///
  /// - Parameters:
  ///   - params: Parameters to initialize Argon2 with
  ///   - password: Password to hash
  /// - Returns: Hashed password
  static func argon2Hash(params: [String: Any], password: String) -> String {
    // Initialize Argon2
    let argon2Crypto = initialize(iterations: params["iterations"] as! Int, salt: params["salt"] as! String, hashLength: params["hashLength"] as! Int, parallelism: params["parallelism"] as! Int)
    // Return the hash of the password
    let hash = argon2Crypto.hash(password: password)
    return hash.value!
  }

  /// Verifies a hash and password
  ///
  /// - Parameters:
  ///   - params: Parameters to initialize Argon2 with
  ///   - hash: Hash to verify
  ///   - password: Password to verify
  /// - Returns: Result of verification
  static func argon2Verify(params: [String: Any], hash: String, password: String) -> Bool {
    // Initialize Argon2
    let argon2Crypto = initialize(iterations: params["iterations"] as! Int, salt: params["salt"] as! String, hashLength: params["hashLength"] as! Int, parallelism: params["parallelism"] as! Int)
    // Verify the hash and password, then return the result
    let result = argon2Crypto.verify(hash: hash, password: password)
    return result.value
  }
}
