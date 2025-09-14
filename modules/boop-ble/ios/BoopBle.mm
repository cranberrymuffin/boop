#import "BoopBle.h"
#import "BoopBle-Swift.h"

@implementation BoopBle
{
    BoopBleImpl *_impl;
}

RCT_EXPORT_MODULE()

- (instancetype)init
{
    self = [super init];
    if (self) {
        _impl = [[BoopBleImpl alloc] init];
    }
    return self;
}

- (NSNumber *)multiply:(double)a b:(double)b {
    return [_impl multiply:a b:b];
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeBoopBleSpecJSI>(params);
}

@end
