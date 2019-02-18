//
//  EntangledIOSUtils.h
//  iotaWallet
//
//  Created by Rajiv Shah on 2/18/19.
//  Copyright © 2019 IOTA Foundation. All rights reserved.
//

#ifndef EntangledIOSUtils_h
#define EntangledIOSUtils_h

#import <Foundation/Foundation.h>
#import <stddef.h>

@interface EntangledIOSUtils : NSObject

/**
 Converts a NSMutableArray representation of trits into an int8_t representation
 
 @param trits NSMutableArray representation of trits
 @return Pointer to int8_t representation of trits
 */
+ (int8_t*)NSMutableArrayTritsToInt8:(NSMutableArray<NSNumber*>*)trits;

/**
 Converts an int8_t representation of trits into a NSMutableArray representation
 
 @param trits Pointer to int8_t representation of trits
 @param count Number of trits
 @return NSMutableArray representation of trits
 */
+ (NSMutableArray<NSNumber*>*)Int8TritsToNSMutableArray:(int8_t*)trits count:(int)count;

@end

#endif /* EntangledIOSUtils_h */
