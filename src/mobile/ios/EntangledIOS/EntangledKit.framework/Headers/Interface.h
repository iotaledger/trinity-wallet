//
//  Interface.h
//  EntangledKit
//
//
//  Copyright © 2019 IOTA Foundation. All rights reserved.
//

#ifndef __MOBILE__IOS_INTERFACE_H_
#define __MOBILE__IOS_INTERFACE_H_

#import <Foundation/Foundation.h>
#include <stddef.h>

@interface EntangledIOSBindings : NSObject

+ (NSString*)iota_ios_digest:(NSString*)trytes;
+ (NSString*)iota_ios_pow_trytes:(NSString*)trytes mwm:(NSNumber*)mwm;
+ (int8_t*)iota_ios_sign_address_gen_trits:(int8_t*)seed index:(const int)index security:(const int)security;
+ (int8_t*)iota_ios_sign_signature_gen_trits:(int8_t*)seed
                                       index:(const int)index
                                    security:(const int)security
                                  bundleHash:(int8_t*)bundleHash;
+ (NSArray*)iota_ios_pow_bundle:(NSArray*)txsTrytes trunk:(NSString*)trunk branch:(NSString*)branch mwm:(NSNumber*)mwm;
+ (NSNumber*)bundle_miner_mine:(int8_t*)bundleNormalizedMax
                      security:(NSNumber*)security
                       essence:(int8_t*)essence
                 essenceLength:(NSNumber*)essenceLength
                         count:(NSNumber*)count
                        nprocs:(NSNumber*)nprocs
               miningThreshold:(NSNumber*)miningThreshold;

@end

#endif  // __MOBILE__IOS_INTERFACE_H_
