#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
@interface RCT_EXTERN_MODULE(Iota, NSObject)
RCT_EXTERN_METHOD(addEvent:(NSString *)name location:(NSString *)location callback: (RCTResponseSenderBlock)callback);
RCT_EXTERN_METHOD(generateAddress:(NSString *)seed index:(int)index security:(int)security resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject);
RCT_EXTERN_METHOD(generateAddresses:(NSString *)seed index:(int)index security:(int)security total:(int)total resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject);
RCT_EXTERN_METHOD(doPoW:(NSString *)trytes minWeightMagnitude:(int)minWeightMagnitude resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject);
@end

//RCT_EXTERN_METHOD(address:(NSString *)seed index:(int)index security:(int)security checksum:(BOOL)checksum);
