
var rootZone = Zone.current;
var appZone = rootZone.fork({
    name: 'App Zone',
    onFork: (parentZoneDelegate, currentZone, targetZone, zoneSpec) => {
        console.group('App');
        console.log('App Zone OnFork invoked');
        console.log({ currentZone: currentZone, targetZone: targetZone });
        console.groupEnd();
        return parentZoneDelegate.fork(targetZone, zoneSpec);
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
    }
});
var homeZone = dashboardZone.fork({
    name: 'Dashboard home Zone'
});
var productsZone = dashboardZone.fork({
    name: 'Dashboard products Zone'
});