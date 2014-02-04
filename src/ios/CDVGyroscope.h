
#import <UIKit/UIKit.h>
#import <Cordova/CDVPlugin.h>

@interface CDVGyroscope : CDVPlugin
{
    double alpha;
    double beta;
    double gamma;
}

@property (readonly, assign) BOOL isRunning;
@property (nonatomic, strong) NSString* callbackId;

- (CDVGyroscope*)init;

- (void)start:(CDVInvokedUrlCommand*)command;
- (void)stop:(CDVInvokedUrlCommand*)command;

@end
