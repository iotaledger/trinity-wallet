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

// PoW
RCT_EXPORT_METHOD(doPoW:(NSArray *)trytes trunkTransaction:(NSString *)trunkTransaction branchTransaction:(NSString *)branchTransaction minWeightMagnitude:(int)minWeightMagnitude resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{
  dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
    int i = 0;
    NSUInteger sizeOfTrytes = [trytes count];
    NSMutableArray * finalTrytes = [NSMutableArray array];
    NSMutableArray * hashes = [NSMutableArray array];
    
    while (i < sizeOfTrytes) {
      NSString * trunk = (i == 0) ? trunkTransaction : hashes[i - 1];
      NSString * branch = (i == 0) ? branchTransaction : trunkTransaction;
      
      NSMutableString * thisTrytes = [NSMutableString stringWithString:trytes[i]];

      [thisTrytes replaceCharactersInRange:NSMakeRange(2430, trunkTransaction.length) withString:trunk];
      [thisTrytes replaceCharactersInRange:NSMakeRange(2511, branchTransaction.length) withString:branch];
      
      char * nonce = doPOW([thisTrytes cStringUsingEncoding:NSUTF8StringEncoding], minWeightMagnitude);
      NSString * nonceString = [NSString stringWithUTF8String:nonce];
      
      [thisTrytes replaceCharactersInRange:NSMakeRange(2673 - nonceString.length, nonceString.length) withString:nonceString];
     
      char * digest = getDigest([thisTrytes cStringUsingEncoding:NSUTF8StringEncoding]);
      NSString * digestString = [NSString stringWithFormat:@"%s", digest];

      [hashes addObject:digestString];
      [finalTrytes addObject:thisTrytes];
      
      ++i;
    }
    
    NSMutableDictionary * result = [NSMutableDictionary dictionary];
    [result setObject:hashes forKey:@"hashes"];
    [result setObject:finalTrytes forKey:@"trytes"];
    
    resolve(result);
  });
}

// Hashing
RCT_EXPORT_METHOD(getDigest:(NSString *)trytes resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{
  char * digest = getDigest([trytes cStringUsingEncoding:NSUTF8StringEncoding]);
  
  resolve([NSString stringWithUTF8String:digest]);
}


// Single address generation
RCT_EXPORT_METHOD(generateAddress:(NSString *)seed index:(int)index security:(int)security resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{
  char * seedChars = [seed cStringUsingEncoding:NSUTF8StringEncoding];
  char * address = generateAddress(seedChars, index, security);
  memset(seedChars, 0, strlen(seedChars));
  resolve([NSString stringWithFormat:@"%s", address]);
}

// Multi address generation
RCT_EXPORT_METHOD(generateAddresses:(NSString *)seed index:(int)index security:(int)security total:(int)total resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{
  char * seedChars = [seed cStringUsingEncoding:NSUTF8StringEncoding];
  NSMutableArray * addresses = [NSMutableArray array];
  int i = 0;

  do {
    char * address = generateAddress(seedChars, index, security);
    NSString * addressObj = [NSString stringWithFormat:@"%s", address];
    [addresses addObject:addressObj];
    i++;
    index++;
  } while (i < total);
  memset(seedChars, 0, strlen(seedChars));
  resolve(addresses);
}

// Signature generation
RCT_EXPORT_METHOD(generateSignature:(NSString *)seed index:(int)index security:(int)security bundleHash:(NSString *)bundleHash resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{
  char * seedChars = [seed cStringUsingEncoding:NSUTF8StringEncoding];
  char * bundleHashChars = [bundleHash cStringUsingEncoding:NSUTF8StringEncoding];

  char * signature = generateSignature(seedChars, index, security, bundleHashChars);
  memset(seedChars, 0, strlen(seedChars));
  resolve(@[[NSString stringWithFormat:@"%s", signature]]);
}

@end
