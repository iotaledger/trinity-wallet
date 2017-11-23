/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import "AppDelegate.h"
#import <Fabric/Fabric.h>
#import <Crashlytics/Crashlytics.h>


#import <React/RCTBundleURLProvider.h>
#import "RCCManager.h"

#import <React/RCTRootView.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  NSURL *jsCodeLocation;

  jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index.ios" fallbackResource:nil];

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  self.window.backgroundColor = [UIColor whiteColor];
  [[RCCManager sharedInstance] initBridgeWithBundleURL:jsCodeLocation launchOptions:launchOptions];
  [Fabric with:@[[Crashlytics class]]];
  // TODO: Move this to where you establish a user session
  [self logUser];
  return YES;
}

- (void) logUser {
  // TODO: Use the current user's information
  // You can call any combination of these three methods
  [CrashlyticsKit setUserIdentifier:@"12345"];
  [CrashlyticsKit setUserEmail:@"user@fabric.io"];
  [CrashlyticsKit setUserName:@"Test User"];
}


@end
