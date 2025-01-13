#import "AppDelegate.h"
#import <Firebase.h> //firebase push notification
//#import "Orientation.h" //add this line for orientation
#import <React/RCTBundleURLProvider.h>
#import "RNSplashScreen.h" //add this line for splash screen
#import <AuthenticationServices/AuthenticationServices.h> // <- add for FB SDK
#import <SafariServices/SafariServices.h> // <- add for FB SDK
#import <FBSDKCoreKit/FBSDKCoreKit-Swift.h> // <- add for FB SDK
#import <React/RCTLinkingManager.h> // <- add for FB SDK


@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  [FIRApp configure]; // add for firsebase push notification
  self.moduleName = @"patientapp";
  // You can add your custom initial props in the dictionary below.
  [FBSDKApplicationDelegate.sharedInstance initializeSDK]; // add for FB SDK
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};
//  [RNSplashScreen show]; //add this line for splash screen
//  return [super application:application didFinishLaunchingWithOptions:launchOptions];
  BOOL ret = [super application:application didFinishLaunchingWithOptions:launchOptions]; if (ret == YES) { [RNSplashScreen show];  } return ret;
  
}

//for FB SDK
// Add this line if it's missing:
- (BOOL)application:(UIApplication *)application
            openURL:(NSURL *)url
            options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {
  return [[FBSDKApplicationDelegate sharedInstance] application:application
                                                       openURL:url
                                               sourceApplication:options[UIApplicationOpenURLOptionsSourceApplicationKey]
                                                      annotation:options[UIApplicationOpenURLOptionsAnnotationKey]];
}

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
