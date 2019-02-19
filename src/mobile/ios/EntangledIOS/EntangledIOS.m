//
//  EntangledIOS.m
//  iotaWallet
//
//  Created by Rajiv Shah on 4/6/18.
//

#import <Foundation/Foundation.h>
#import "EntangledIOS.h"
#import "EntangledIOSUtils.h"

@implementation EntangledIOS

RCT_EXPORT_MODULE();


// Hashing
RCT_EXPORT_METHOD(getDigest:(NSString *)trytes resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{
  NSString * digest = [EntangledIOSBindings iota_ios_digest:trytes];
  resolve(digest);
}

// Trytes String Proof of Work
RCT_EXPORT_METHOD(trytesPow:(NSString *)trytes minWeightMagnitude:(int)minWeightMagnitude resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{
  dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
    NSString * nonce = [EntangledIOSBindings iota_ios_pow_trytes:trytes mwm:minWeightMagnitude];
    resolve(nonce);
  });
}

// Bundle Proof of Work
RCT_EXPORT_METHOD(bundlePow:(NSArray *)trytes trunk:(NSString*)trunk branch:(NSString*)branch minWeightMagnitude:(int)minWeightMagnitude resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{
  dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
    NSArray * attachedTrytes = [EntangledIOSBindings iota_ios_pow_bundle:trytes trunk:trunk branch:branch mwm:minWeightMagnitude];
    resolve(attachedTrytes);
  });
}

// Single address generation
RCT_EXPORT_METHOD(generateAddress:(NSArray<NSNumber*>*)seed index:(int)index security:(int)security resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{
  int8_t* seedTrits_ptr = NULL;
  int8_t * address = NULL;
  
  seedTrits_ptr = [EntangledIOSUtils NSMutableArrayTritsToInt8:[NSMutableArray arrayWithArray:seed]];
  
  address = [EntangledIOSBindings iota_ios_sign_address_gen_trits:seedTrits_ptr index:index security:security];
  
  memset_s(seedTrits_ptr, 243, 0, 243);
  free(seedTrits_ptr);
  
  NSMutableArray<NSNumber*>* addressTrits = [EntangledIOSUtils Int8TritsToNSMutableArray:address count:243];
  
  free(address);
  
  resolve(addressTrits);
}

// Multi address generation
RCT_EXPORT_METHOD(generateAddresses:(NSArray<NSNumber*>*)seed index:(int)index security:(int)security total:(int)total resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{
  dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
    NSMutableArray<NSMutableArray*>* addresses = [NSMutableArray array];
    int i = 0;
    int addressIndex = index;
    
    int8_t* seedTrits_ptr = NULL;
    int8_t* address = NULL;
    
    seedTrits_ptr = [EntangledIOSUtils NSMutableArrayTritsToInt8:[NSMutableArray arrayWithArray:seed]];
    
    do {
      address = [EntangledIOSBindings iota_ios_sign_address_gen_trits:seedTrits_ptr index:addressIndex security:security];
      
      NSMutableArray<NSNumber*>* addressTrits = [EntangledIOSUtils Int8TritsToNSMutableArray:address count:243];
      [addresses addObject:addressTrits];
      
      free(address);
      address = NULL;
      i++;
      addressIndex++;
    } while (i < total);
    
    memset_s(seedTrits_ptr, 243, 0, 243);
    free(seedTrits_ptr);
    resolve(addresses);
  });
}

// Signature generation
RCT_EXPORT_METHOD(generateSignature:(NSArray *)seed index:(int)index security:(int)security bundleHash:(NSArray *)bundleHash resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{
  int8_t* seedTrits_ptr = NULL;
  int8_t* bundleHash_ptr = NULL;
  NSMutableArray * signatureTrits = [NSMutableArray array];
  
  seedTrits_ptr = [EntangledIOSUtils NSMutableArrayTritsToInt8:[NSMutableArray arrayWithArray:seed]];
  bundleHash_ptr = [EntangledIOSUtils NSMutableArrayTritsToInt8:[NSMutableArray arrayWithArray:bundleHash]];
  
  int8_t * signature = [EntangledIOSBindings iota_ios_sign_signature_gen_trits:seedTrits_ptr index:index security:security bundleHash:bundleHash_ptr];
  
  memset_s(seedTrits_ptr, 243, 0, 243);
  free(seedTrits_ptr);
  free(bundleHash_ptr);
  
  signatureTrits = [EntangledIOSUtils Int8TritsToNSMutableArray:signature count:6561 * security];
  free(signature);
  
  resolve(signatureTrits);
}

@end
