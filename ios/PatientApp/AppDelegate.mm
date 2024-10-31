#import "AppDelegate.h"
#import <Firebase.h> //firebase push notification
//#import "Orientation.h" //add this line for orientation
#import <React/RCTBundleURLProvider.h>
#import "RNSplashScreen.h" //add this line for splash screen
// #import <FBSDKCoreKit/FBSDKCoreKit.h> // <- Add This for FB SDK
// #import <React/RCTLinkingManager.h> // <- Add This for FB SDK


@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  [FIRApp configure]; // add for firsebase push notification
  self.moduleName = @"PatientApp";
  // You can add your custom initial props in the dictionary below.
  //[FBSDKApplicationDelegate.sharedInstance initializeSDK]; // add for FB SDK
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};
//  [RNSplashScreen show]; //add this line for splash screen
//  return [super application:application didFinishLaunchingWithOptions:launchOptions];
  BOOL ret = [super application:application didFinishLaunchingWithOptions:launchOptions]; if (ret == YES) { [RNSplashScreen show];  } return ret;
  
}

//for FB SDK
// - (BOOL)application:(UIApplication *)app
//             openURL:(NSURL *)url
//             options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
// {
//   if ([[FBSDKApplicationDelegate sharedInstance] application:app openURL:url options:options]) {
//     return YES;
//   }

//   if ([RCTLinkingManager application:app openURL:url options:options]) {
//     return YES;
//   }

//   return NO;
// }

//- (UIInterfaceOrientationMask)application:(UIApplication *)application supportedInterfaceOrientationsForWindow:(UIWindow *)window {
//  return [Orientation getOrientation];
//}//add this line for Orientation

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end
