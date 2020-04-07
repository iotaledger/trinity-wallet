//
//  ClockEventEmitterIOS.swift
//  iotaWallet
//
//  Created by Rajiv Shah on 4/7/20.
//  Copyright © 2020 IOTA Foundation. All rights reserved.
//

import Foundation

@objc(ClockEventEmitterIOS)
class ClockEventEmitterIOS: RCTEventEmitter {

  /// Describes supported events that listeners can be registered for
  /// - Returns: Supported events
  override func supportedEvents() -> [String]! {
    return ["clockChanged"]
  }

  /// Called when first listener is added
  /// Notifications for NSSystemClockDidChange will not be received if there are no listeners
  override func startObserving() {
    NotificationCenter.default.addObserver(self, selector: #selector(receivedClockChangedNotification(_:)), name: .NSSystemClockDidChange, object: nil)
  }

  /// Called when last listener is removed
  override func stopObserving() {
    NotificationCenter.default.removeObserver(self, name: .NSSystemClockDidChange, object: nil)
  }

  /// Sends clockChanged event to JS
  /// - Parameter notification
  @objc func receivedClockChangedNotification(_ notification: NSNotification) {
    sendEvent(withName: "clockChanged", body: nil)
  }

  override class func requiresMainQueueSetup() -> Bool {
    return false
  }
}
