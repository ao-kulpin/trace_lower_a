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


        this.elem2 = new LetterElem({basePoints: config.basePoints2.map(xy => xy*posRate)});
        this.curElem = this.elem2;

        //const points = this.elemPath.getPoints();
        const points = this.curElem.totalPoints;
        console.log(`*********path ${points.length} base ${this.curElem.basePoints[0]} ${this.curElem.basePoints[1]}`)
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

        const fillMask = this.composeMask(this.curElem);
        this.flllZone.setMask(fillMask);


        this.pathGr = this.add.graphics();

        this.pathGr.lineStyle(1, 0xFF);
        this.curElem.path.draw(this.pathGr);


        let pi = 0;
        let si = 0;
        let bp = "";
        let printed = false;
        let bx = -1;
        let by = -1;
        this.input.on('pointermove', pointer => {
            /////////console.log(`pointer move ${pointer.x} ${pointer.y}`)
            if (pointer.isDown) {
                this.traceArrow.setPosition(pointer.x, pointer.y);
                console.log(`point ${++pi}: ${Math.floor(pointer.x)}, ${Math.floor(pointer.y)}`)
                bx = pointer.x;
                by = pointer.y;
                printed = false;
            } 
        });
        this.input.on('pointerup', pointer => {
            if (!printed) {
                bp += `  ${Math.floor(bx)}, ${Math.floor(by)},`;
                console.log(`++++base points ${++si}: ${bp}`);
            }
            printed = true;
    });
      
    }

    composeMask(elem) {
        const imgRate = config.width/this.whiteLetter.width;
        const posRate = config.width/config.basicWidth;
        const maskShift = 0;
        this.maskTexture.clear();
        this.maskGraphics.clear();
        
        this.maskGraphics.fillStyle(0xFFFFFF, 1);

        const startPoints = elem.startPoints;

        if (elem.index != 0) {
            // not beginning of the path
            this.maskGraphics.fillCircle(startPoints[0], startPoints[1], 40 * posRate);
        }

        if (elem.index == elem.totalPoints.length / 2 - 1) {
            // the end of the path
            const last = startPoints.length - 2;
            this.maskGraphics.fillCircle(startPoints[last], startPoints[last + 1], 40 * posRate);
        }

        const maskPath = new Phaser.Curves.Path(startPoints[0], startPoints[1]);
        maskPath.splineTo(startPoints.slice(2));

        this.maskGraphics.lineStyle(83 * posRate, 0xFF0000);
        maskPath.draw(this.maskGraphics);

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
