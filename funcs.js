function findNearestPoint(point, path) {
    let minDist = 1e6;
    let bestPoint = undefined;
    let index = 0;
    for(let i = 0; i < path.length; ++i) {
        const pathPoint = path[i];
        const dist = Phaser.Math.Distance.BetweenPointsSquared(point, pathPoint);
        if (dist < minDist){
            minDist = dist;
            bestPoint = pathPoint;
            index = i;
        }
    }
    return {point: bestPoint, dist: minDist, index: index}
}