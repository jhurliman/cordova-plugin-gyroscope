
#import <CoreMotion/CoreMotion.h>
#import "CDVGyroscope.h"

@interface CDVGyroscope () {}
@property (readwrite, assign) BOOL isRunning;
@property (readwrite, assign) BOOL haveReturnedResult;
@property (readwrite, strong) CMMotionManager* motionManager;
@end

@implementation CDVGyroscope

@synthesize callbackId, isRunning;

- (CDVGyroscope*)init
{
    self = [super init];
    if (self) {
        alpha = 0;
        beta = 0;
        gamma = 0;
        self.callbackId = nil;
        self.isRunning = NO;
        self.haveReturnedResult = YES;
        self.motionManager = nil;
    }
    return self;
}

- (void)dealloc
{
    [self stop:nil];
}

- (void)start:(CDVInvokedUrlCommand*)command
{
    self.haveReturnedResult = NO;
    self.callbackId = command.callbackId;

    if (!self.motionManager)
    {
        self.motionManager = [[CMMotionManager alloc] init];
    }

    if ([self.motionManager isGyroAvailable] == YES) {
        // Assign the update interval to the motion manager and start updates
        [self.motionManager setGyroUpdateInterval:0.5f];
        __weak CDVGyroscope* weakSelf = self;
        [self.motionManager startGyroUpdatesToQueue:[NSOperationQueue mainQueue] withHandler:^(CMGyroData *gyroData, NSError *error) {
            alpha = gyroData.rotationRate.z;
            beta = gyroData.rotationRate.x;
            gamma = gyroData.rotationRate.y;
            [weakSelf returnGyroInfo];
        }];

        if (!self.isRunning) {
            self.isRunning = YES;
        }
    }
    
}

- (void)onReset
{
    [self stop:nil];
}

- (void)stop:(CDVInvokedUrlCommand*)command
{
    if ([self.motionManager isGyroAvailable] == YES) {
        if (self.haveReturnedResult == NO) {
            // block has not fired before stop was called, return whatever result we currently have
            [self returnGyroInfo];
        }
        [self.motionManager stopGyroUpdates];
    }
    self.isRunning = NO;
}

- (void)returnGyroInfo
{
    // Create an orientation object
    NSMutableDictionary* orientationProps = [NSMutableDictionary dictionaryWithCapacity:4];

    [orientationProps setValue:[NSNumber numberWithDouble:alpha] forKey:@"alpha"];
    [orientationProps setValue:[NSNumber numberWithDouble:beta] forKey:@"beta"];
    [orientationProps setValue:[NSNumber numberWithDouble:gamma] forKey:@"gamma"];

    CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:orientationProps];
    [result setKeepCallback:[NSNumber numberWithBool:YES]];
    [self.commandDelegate sendPluginResult:result callbackId:self.callbackId];
    self.haveReturnedResult = YES;
}

@end
