class Tracer extends Phaser.Scene
{
    preload ()
    {
        this.load.image('mainMask', 'assets/a_detail.webp');
        this.load.image('traceArrow', 'assets/tracing-arrow.png');
    }

    create ()
    {
        const posRate = config.width/config.basicWidth;

        this.whiteLetter = this.add.image(config.width/2, config.height/2, 'mainMask');
        const imgRate = config.width/this.whiteLetter.width;
        this.whiteLetter.setScale(imgRate);

        this.flllZone = this.add.rectangle(config.width/2, config.height/2, 
                                config.width, config.height, 0x007F00);
                        
        this.traceArrow = this.add.image(437 * posRate, 144 * posRate, 'traceArrow')
                                .setScale(imgRate)
                                .setAngle(180);


        const elemBasePoints = [437, 144, 437, 455].map(x => x*posRate);  
        this.elemPath = new Phaser.Curves.Path(elemBasePoints[0], elemBasePoints[1]);
        this.elemPath.splineTo([elemBasePoints[2], elemBasePoints[3]]);

        this.elem2 = new LetterElem({basePoints: config.basePoints2.map(xy => xy*posRate)});

//        const points = this.elemPath.getPoints();
        const points = this.elem2.totalPoints;
        console.log(`*********path ${points.length}`)
        points.forEach(element => {
            console.log(`${element}`)
        });

        // objects for composing the filling mask
        this.maskTexture = this.make.renderTexture({x: config.width/2, y: config.height/2, 
                                            width: config.width, height: config.height, add: false});
        this.maskLetter = this.make.image({x:config.width/2, y:config.height/2, add:false, key: 'mainMask'});
        this.maskLetter.setScale(imgRate);
        this.maskContainer = this.make.container({x:config.width/2, y:config.height/2, add: false});
        this.maskContainer.add(this.maskLetter); 
        this.maskGraphics = this.make.graphics();                              

        const fillMask = this.composeMask(this.elemPath.getPoints(), 0);
        this.flllZone.setMask(fillMask);


        this.pathGr = this.add.graphics();

        this.pathGr.lineStyle(1, 0xFF);
        this.elemPath.draw(this.pathGr);



        this.input.on('pointermove', pointer => {
            if (pointer.isDown) {
                const ptr = new Phaser.Math.Vector2(pointer.x, pointer.y);
                const arrowPtr = new Phaser.Math.Vector2(this.traceArrow.x, this.traceArrow.y);
                const arrowDist =Phaser.Math.Distance.BetweenPointsSquared(ptr, arrowPtr);
                const findRes = findNearestPoint(ptr, this.elemPath.getPoints());
                /////console.log(`nearest ${findRes.point.x} ${findRes.point.y}  ${findRes.dist}`)
                Phaser.Math.Distance.BetweenPointsSquared
                if (findRes.dist < config.pullDist && arrowDist < config.pullDist) {
                    this.traceArrow.setPosition(findRes.point.x, findRes.point.y);
                    const mask = this.composeMask(this.elemPath.getPoints(), findRes.index);
                    this.flllZone.setMask(mask);
                    console.log(`path pos ${findRes.point.x} ${findRes.point.x}`)
                }
                console.log(`mouse pos ${pointer.x} ${pointer.y}`)
            } 
        })       
    }

    composeMask(path, endIndex) {
        const imgRate = config.width/this.whiteLetter.width;
        const posRate = config.width/config.basicWidth;
        const maskShift = 0;
        this.maskTexture.clear();
        this.maskGraphics.clear();
        
        this.maskGraphics.fillStyle(0xFFFFFF, 1);

        const startPoints = [];
        for (let i = 0; i < endIndex; ++i) {
            const p = path[i];
            startPoints.push(p.x);
            startPoints.push(p.y);
        }
        const x0 = startPoints[0];
        const y0 = startPoints[1];

        if (endIndex != 0) {
            // beginning of the path
            this.maskGraphics.fillCircle(x0, y0, 40 * posRate);
        }

        if (endIndex == path.length - 1) {
            // not the end of the path
            const last = startPoints.length - 2;
            this.maskGraphics.fillCircle(startPoints[last], startPoints[last + 1], 40 * posRate);
        }

        const deadPath = new Phaser.Curves.Path(startPoints[0], startPoints[1]);
        deadPath.splineTo(startPoints);

        this.maskGraphics.lineStyle(83 * posRate, 0xFF0000);
        deadPath.draw(this.maskGraphics);

        const fillMask = new Phaser.Display.Masks.BitmapMask(this, this.maskGraphics);
        // deadMask.invertAlpha = true;

        this.maskContainer.setMask(fillMask);        
        this.maskTexture.draw(this.maskContainer, maskShift, maskShift);
        const mask = this.maskTexture.createBitmapMask();
        //mask.invertAlpha = true;
        return mask;
    }
}

const config = {
    width: 600,
    height: 600,
    basicWidth: 600,
    pullDist: 50000,
    basePoints2: [437, 144, 437, 455],
    type: Phaser.AUTO,
    backgroundColor: '#118eb3',
    /// parent: 'phaser-example',
    scene: Tracer
};

const game = new Phaser.Game(config);
