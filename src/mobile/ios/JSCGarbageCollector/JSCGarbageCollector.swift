//
//  JSCGarbageCollector.swift
//  iotaWallet
//
//  Created by Rajiv Shah on 12/5/18.
//  Copyright © 2018 IOTA Foundation. All rights reserved.
//

import Foundation
import JavaScriptCore

@objc(JSCGarbageCollector)
class JSCGarbageCollector: NSObject {
  
  @objc func forceGC() {
    let context = RCTBridge.current().jsContextRef
    if context != nil {
      JSGarbageCollect(context)
      print("Ran GC successfully")
    } else {
      print("Could not run GC")
    }
  }
  
  @objc static func requiresMainQueueSetup() -> Bool {
    return false
  }
  
}
