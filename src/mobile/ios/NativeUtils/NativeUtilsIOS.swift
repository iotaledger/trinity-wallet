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

  /// Gets kernel boot time
  /// - Returns: Kernel boot time in milliseconds
  func getBootTime() -> Double? {
    // Based on https://forums.developer.apple.com/thread/101874#309633
    var bootTime = timeval()
    var size = MemoryLayout<timeval>.size

    let rc = sysctlbyname("kern.boottime", &bootTime, &size, nil, 0)
    guard rc == 0, size == MemoryLayout<timeval>.size else {
      return nil
    }
    return Double(bootTime.tv_usec / 1000)
  }

  /// Gets value of monotonic clock starting at an arbitrary point (usually the time of boot)
  /// See https://opensource.apple.com/source/Libc/Libc-1353.11.2/gen/clock_gettime.c.auto.html for more information
  /// - Returns: Monotonic clock value in milliseconds
  func getMonotonicClockTime() -> Double? {
    var time = timespec()
    let rc = clock_gettime(CLOCK_MONOTONIC_RAW_APPROX, &time)
    guard rc == 0 else {
      return nil
    }
    return Double(time.tv_nsec / 1_000_000)
  }

  /// Gets a value that can be used as the system uptime in milliseconds
  /// Calculated by subtracting the time of boot from the monoclonic time value
  /// - Parameters:
  ///   - resolve: A JS Promise resolve block
  ///   - reject: A JS Promise reject block
  @objc func getSystemUptime(resolver resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
    guard let bootTime = getBootTime() else {
      reject("NativeUtils getSystemUptime", "Failed to get boot time", nil)
      return
    }
    guard let monotonicTime = getMonotonicClockTime() else {
      reject("NativeUtils getSystemUptime", "Failed to get monoclonic clock time", nil)
      return
    }

    let uptime = monotonicTime - bootTime
    resolve(uptime)
  }
  
  @objc static func requiresMainQueueSetup() -> Bool {
    return false
  }

}
