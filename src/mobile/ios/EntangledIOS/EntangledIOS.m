//
//  EntangledIOS.m
//  iotaWallet
//
//  Created by Rajiv Shah on 4/6/18.
//

#import <Foundation/Foundation.h>
#import "EntangledIOS.h"

@implementation EntangledIOS

RCT_EXPORT_MODULE();

// Hashing
RCT_EXPORT_METHOD(getDigest:(NSString *)trytes resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{
  char * digest = getDigest([trytes cStringUsingEncoding:NSUTF8StringEncoding]);
  NSString * digestString = [NSString stringWithFormat:@"%s", digest];
  
  resolve(digestString);
}

// PoW
RCT_EXPORT_METHOD(doPoW:(NSString *)trytes minWeightMagnitude:(int)minWeightMagnitude resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{
  dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
    char * trytesChars = [trytes cStringUsingEncoding:NSUTF8StringEncoding];
    char * nonce = doPOW(trytesChars, minWeightMagnitude);
    NSString * nonceString = [NSString stringWithFormat:@"%s", nonce];
    resolve(nonceString);
  });
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
  dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
    char * seedChars = [seed cStringUsingEncoding:NSUTF8StringEncoding];
    NSMutableArray * addresses = [NSMutableArray array];
    int i = 0;
    int addressIndex = index;
    
    do {
      char * address = generateAddress(seedChars, addressIndex, security);
      NSString * addressObj = [NSString stringWithFormat:@"%s", address];
      [addresses addObject:addressObj];
      i++;
      addressIndex++;
    } while (i < total);
    memset(seedChars, 0, strlen(seedChars));
    resolve(addresses);
  });
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
