//
//  NativeUtilsIOS.m
//  iotaWallet
//
//  Created by Rajiv Shah on 3/27/20.
//  Copyright © 2020 IOTA Foundation. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(NativeUtilsIOS, NSObject)

RCT_EXTERN_METHOD(getSystemUptime:resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject);

@end
