#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
@interface RCT_EXTERN_MODULE(Iota, NSObject)
RCT_EXTERN_METHOD(addEvent:(NSString *)name location:(NSString *)location callback: (RCTResponseSenderBlock)callback);
RCT_EXTERN_METHOD(address:(NSString *)seed index:(int)index security:(int)security checksum:(BOOL)checksum multithreaded:(BOOL)multithreaded resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject);
@end

//RCT_EXTERN_METHOD(address:(NSString *)seed index:(int)index security:(int)security checksum:(BOOL)checksum);
