//
//  NativeUtilsIOS.swift
//  iotaWallet
//
//  Created by Rajiv Shah on 3/27/20.
//  Copyright © 2020 IOTA Foundation. All rights reserved.
//

import Foundation

@objc(NativeUtilsIOS)
class NativeUtilsIOS: NSObject {

  /// Gets value of monotonic clock starting at an arbitrary point (usually the time of boot)
  /// See https://opensource.apple.com/source/Libc/Libc-1353.11.2/gen/clock_gettime.c.auto.html for more information
  /// - Returns: Monotonic clock value in milliseconds
  func getMonotonicClockTime() -> Double? {
    let result = clock_gettime_nsec_np(CLOCK_MONOTONIC_RAW_APPROX)
    guard result > 0 else {
      return nil
    }
    return Double(result / 1_000_000)
  }

  /// Gets a value that can be used as the system uptime in milliseconds
  /// - Parameters:
  ///   - resolve: A JS Promise resolve block
  ///   - reject: A JS Promise reject block
  @objc func getSystemUptime(resolver resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
    guard let uptime = getMonotonicClockTime() else {
      reject("NativeUtils getSystemUptime", "Failed to get monoclonic clock time", nil)
      return
    }

    resolve(uptime)
  }

  @objc static func requiresMainQueueSetup() -> Bool {
    return false
  }

}
