function findNearestPoint(x, y, path) {
    let minDist = 1e6;
    let bestX = 0;
    let bestY = 0;
    let index = 0;
    for(let i = 0; i < path.length; i += 2) {
        const px = path[i];
        const py = path[i + 1];
        const dist = Phaser.Math.Distance.Chebyshev(x, y, px, py);
        if (dist < minDist){
            minDist = dist;
            bestX = px;
            bestY = py;
            index = i / 2;
        }
    }
    return {x: bestX, y:bestY, dist: minDist, index: index}
}

class LetterElem {
    #basePoints = [];
    #path = undefined;
    #totalPoints = [];
    #index = 0;
    #width = 83;
    #firstCircle = 40;
    #lastCircle = 40;

    constructor({basePoints = []}) {
        this.#basePoints = basePoints;
        if (this.#basePoints.length > 3) {
            this.#path = new Phaser.Curves.Path(this.#basePoints[0], this.#basePoints[1]);
            this.#path.splineTo(this.#basePoints.slice(2));

            const pathPoints = this.#path.getPoints();
            this.#totalPoints = []; //[this.#basePoints[0], this.#basePoints[1]];
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
        return this.#totalPoints.slice(0, this.#index * 2 + 2);
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

    get width() {
        return this.#width;
    }

    set width(value) {
        this.#width = value;
    }

    get firstCircle() {
        return this.#firstCircle;
    }

    set firstCircle(value) {
        this.#firstCircle = value;
    }

    get lastCircle() {
        return this.#lastCircle;
    }

    set lastCircle(value) {
        this.#lastCircle = value;
    }


}