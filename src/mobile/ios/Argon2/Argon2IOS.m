//
//  Argon2IOS.m
//  iotaWallet
//
//  Created by Rajiv Shah on 7/31/18.
//  Copyright © 2018 IOTA Foundation. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(Argon2IOS, NSObject)
// Export hash method to RN
RCT_EXTERN_METHOD(hash:(NSDictionary *)params password:(NSString *)password resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject);

// Export verify method to RN
RCT_EXTERN_METHOD(verify:(NSDictionary *)params hash:(NSString *)hash password:(NSString *)password resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject);

// Create a GCD queue for Argon2
-(dispatch_queue_t)methodQueue
{
  return dispatch_queue_create("com.iota.trinity.Argon2IOS", DISPATCH_QUEUE_SERIAL);
}

@end
