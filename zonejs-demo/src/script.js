
var rootZone = Zone.current;
var appZone = rootZone.fork({
    name: 'App Zone',
    onFork: (parentZoneDelegate, currentZone, targetZone, zoneSpec) => {
        console.group('App');
        console.log('App Zone OnFork invoked');
        console.log({ currentZone: currentZone, targetZone: targetZone });
        console.groupEnd();
        return parentZoneDelegate.fork(targetZone, zoneSpec);
    },
    onInvoke: (parentZoneDelegate, currentZone, targetZone, delegate,
        applyThis, applyArgs, source) => {
        console.log(`${currentZone.name} invoked`);
        return parentZoneDelegate.invoke(targetZone, delegate,
            applyThis, applyArgs, source);
    }
});
var errorZone = appZone.fork({
    name: 'Error Zone'
});
var dashboardZone = appZone.fork({
    name: 'Dashboard Zone',
    onFork: (parentZoneDelegate, currentZone, targetZone, zoneSpec) => {
        console.group('Dashboard');
        console.log('Dashboard Zone OnFork invoked');
        console.log({ currentZone: currentZone, targetZone: targetZone });
        console.groupEnd();
        return parentZoneDelegate.fork(targetZone, zoneSpec);
    },
    onInvoke: (parentZoneDelegate, currentZone, targetZone, delegate,
        applyThis, applyArgs, source) => {
        console.log(`${currentZone.name} invoked`);
        return parentZoneDelegate.invoke(targetZone, delegate,
            applyThis, applyArgs, source);
    },
    onIntercept: (parentZoneDelegate, currentZone, targetZone, delegate,
        source) => {
        const _delegate = function () {
            console.log('Before callback');
            delegate();
            console.log('after callback');
        }
        return parentZoneDelegate.intercept(targetZone, _delegate, source);
    }
});
var homeZone = dashboardZone.fork({
    name: 'Dashboard home Zone'
});
var productsZone = dashboardZone.fork({
    name: 'Dashboard products Zone'
});

const cb = homeZone.wrap(() => {
    console.log(`${Zone.current.name} started`);
    setTimeout(() => {
        console.log('Hello');
    })
});
cb();