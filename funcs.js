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

class LetterElem {
    #basePoints = [];
    #path = undefined;
    #totalPoints = [];
    #index = 0;

    constructor({basePoints = []}) {
        this.#basePoints = basePoints;
        if (this.#basePoints.length > 3) {
            this.#path = new Phaser.Curves.Path(this.#basePoints[0], this.#basePoints[1]);
            this.#path.splineTo(this.#basePoints.slice(2));

            const pathPoints = this.#path.getPoints();
            this.#totalPoints = [];
            pathPoints.forEach(pp => {
                this.#totalPoints.push(pp.x);
                this.#totalPoints.push(pp.y);                
            });

            this.#index = 0;
        }
    }

    get basePoints() {
        return this.#basePoints;
    }

    get totalPoints() {
        return this.#totalPoints;
    }

    get startPoints() {
        return this.#totalPoints.slice(0, this.#index * 2 + 1);
    }

    get path() {
        return this.#path;
    }

    get index() {
        return this.#index;
    }

    set index(value) {
        this.#index = value;
    }
}