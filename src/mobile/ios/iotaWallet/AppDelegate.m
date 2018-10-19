/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import "AppDelegate.h"
#import "SplashScreen.h"
#import <BugsnagReactNative/BugsnagReactNative.h>



#import <React/RCTBundleURLProvider.h>
#import <ReactNativeNavigation/ReactNativeNavigation.h>
#import <React/RCTRootView.h>
#import <React/RCTLinkingManager.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url
  sourceApplication:(NSString *)sourceApplication annotation:(id)annotation
{
  return [RCTLinkingManager application:application openURL:url
                      sourceApplication:sourceApplication annotation:annotation];
}

// Only if your app is using [Universal Links](https://developer.apple.com/library/prerelease/ios/documentation/General/Conceptual/AppSearch/UniversalLinks.html).
- (BOOL)application:(UIApplication *)application continueUserActivity:(NSUserActivity *)userActivity
 restorationHandler:(void (^)(NSArray * _Nullable))restorationHandler
{
 return [RCTLinkingManager application:application
                  continueUserActivity:userActivity
                    restorationHandler:restorationHandler];
}
- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  NSURL *jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
  [ReactNativeNavigation bootstrap:jsCodeLocation launchOptions:launchOptions];

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  self.window.backgroundColor = [UIColor whiteColor];
  [BugsnagReactNative start];
  [self excludeManifestFromBackup];
  [SplashScreen show];
  return YES;
}

/**
 Excludes the manifest.json from iCloud backup
 */
- (void) excludeManifestFromBackup {
  NSFileManager * fileManager = [NSFileManager defaultManager];
  NSString * manifestPath = [self getManifestPath];
  if ([fileManager fileExistsAtPath:manifestPath]) {
    NSURL* manifestURL= [NSURL fileURLWithPath: manifestPath];
    
    NSError *error = nil;
    BOOL success = [manifestURL setResourceValue: @(YES)
                                          forKey: NSURLIsExcludedFromBackupKey error: &error];
    if(!success){
      NSLog(@"Error excluding %@ from backup %@", [manifestURL lastPathComponent], error);
    } else {
      NSLog(@"Successfully disabled backup for %@", [manifestURL lastPathComponent]);
    }
  } else {
    NSLog(@"%@ does not exist", manifestPath);
  }
}

/**
 Gets the path of the manifest.json created by RCTAsyncLocalStorage

 @return Manifest path
 */
- (NSString *) getManifestPath {
  // From https://github.com/facebook/react-native/blob/master/React/Modules/RCTAsyncLocalStorage.m#L69
  static NSString *const RCTStorageDirectory = @"RCTAsyncLocalStorage_V1";
  static NSString *const RCTManifestFileName = @"manifest.json";
  static NSString *manifestPath = nil;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    manifestPath = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES).firstObject;
    manifestPath = [manifestPath stringByAppendingPathComponent:RCTStorageDirectory];
    manifestPath = [manifestPath stringByAppendingPathComponent:RCTManifestFileName];
  });
  return manifestPath;
}


@end
