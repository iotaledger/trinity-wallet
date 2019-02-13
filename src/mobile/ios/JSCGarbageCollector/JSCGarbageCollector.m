//
//  JSCGarbageCollector.m
//  iotaWallet
//
//  Created by Rajiv Shah on 12/5/18.
//  Copyright © 2018 IOTA Foundation. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_REMAP_MODULE(GarbageCollectorIOS, JSCGarbageCollector, NSObject)
// Export forceGC method to RN
RCT_EXTERN_METHOD(forceGC);


// Create a GCD queue for the GC
-(dispatch_queue_t)methodQueue
{
  return dispatch_queue_create("com.iota.trinity.JSCGarbageCollector", DISPATCH_QUEUE_SERIAL);
}

@end
