//
//  EntangledIOS.m
//  iotaWallet
//
//  Created by Rajiv Shah on 4/6/18.
//  Copyright © 2018 IOTA Foundation. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "EntangledIOS.h"

@implementation EntangledIOS

RCT_EXPORT_MODULE();

// Single address generation
RCT_EXPORT_METHOD(generateAddress:(NSString *)seed index:(int)index security:(int)security resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{
  char * seedChars = [seed cStringUsingEncoding:NSUTF8StringEncoding];
  char * address = generate_address(seedChars, index, security);
  resolve([NSString stringWithFormat:@"%s", address]);
}

// Multi address generation
RCT_EXPORT_METHOD(generateAddresses:(NSString *)seed index:(int)index security:(int)security total:(nonnull NSNumber *)total resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{
  int idx = index;
  char * seedChars = [seed cStringUsingEncoding:NSUTF8StringEncoding];
  NSMutableArray* addresses = [NSMutableArray array];
  for (int i = 0; i < total; ++ i, ++ idx) {
    char * address = generate_address(seedChars, idx, security);
    NSString * addressObj = @[[NSString stringWithFormat:@"%s", address]];
    [addresses addObject:addressObj];
  }
  resolve(addresses);
}

// Signature generation
RCT_EXPORT_METHOD(generateSignature:(NSString *)seed index:(int)index security:(int)security bundleHash:(NSString *)bundleHash resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{
  char * seedChars = [seed cStringUsingEncoding:NSUTF8StringEncoding];
  char * bundleHashChars = [bundleHash cStringUsingEncoding:NSUTF8StringEncoding];
  
  char * signature = generate_signature(seedChars, index, security, bundleHashChars);
  resolve(@[[NSString stringWithFormat:@"%s", signature]]);
}

@end
