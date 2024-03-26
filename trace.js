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
                                .setScale(imgRate);
                                //////////.setAngle(45);


        this.elem1 = new LetterElem({basePoints: config.basePoints1.map(xy => xy*posRate)});
        this.elem1.width = 100;
        this.elem1.firstCircle = 50;
        this.elem1.lastCircle = 50;
        this.curElem = this.elem1;
        this.relocateTracer();

        //const points = this.elemPath.getPoints();
        const points = this.curElem.totalPoints;
        console.log(`*********path ${points.length} base ${this.curElem.basePoints[0]} ${this.curElem.basePoints[1]}`)
        let np = 0;
        points.forEach(element => {
            console.log(`${Math.floor(np/2)}: ${element}`);
            ++ np;
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
        this.curElem.path.draw(this.pathGr, 1024);

        this.input.on('pointermove', pointer => {
            /////////console.log(`pointer move ${pointer.x} ${pointer.y}`)
            if (pointer.isDown) {
                const arrowDist = Phaser.Math.Distance.Chebyshev(pointer.x, pointer.y, 
                                                            this.traceArrow.x, this.traceArrow.y);
                const findRes = findNearestPoint(pointer.x, pointer.y, this.curElem);
                //console.log(`nearest ${findRes.x} ${findRes.y}  ${findRes.dist} ${findRes.index}`)
                if (findRes.dist < config.pullDist && arrowDist < config.pullDist) {
                    this.curElem.index = findRes.index;
                    const mask = this.composeMask(this.curElem);
                    this.flllZone.setMask(mask);
                    this.relocateTracer();
                    console.log(`path pos ${findRes.x} ${findRes.y}`)
                }
                console.log(`mouse pos ${pointer.x} ${pointer.y}`)
            } 
        })       
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
            this.maskGraphics.fillCircle(startPoints[0], startPoints[1], elem.firstCircle * posRate);
        }

        if (elem.index == elem.totalPoints.length / 2 - 1) {
            // the end of the path
            const last = startPoints.length - 2;
            this.maskGraphics.fillCircle(startPoints[last], startPoints[last + 1], 
                                         elem.lastCircle * posRate);
            /////console.log(`++++++++++ end of path ${startPoints[last]} ${startPoints[last+1]} circle ${elem.lastCircle}`)
        }

        const maskPath = new Phaser.Curves.Path(startPoints[0], startPoints[1]);
        maskPath.splineTo(startPoints.slice(2));

        this.maskGraphics.lineStyle(elem.width * posRate, 0xFF0000);
        maskPath.draw(this.maskGraphics);

        const fillMask = new Phaser.Display.Masks.BitmapMask(this, this.maskGraphics);
        // deadMask.invertAlpha = true;

        this.maskContainer.setMask(fillMask);        
        this.maskTexture.draw(this.maskContainer, maskShift, maskShift);
        const mask = this.maskTexture.createBitmapMask();
        //mask.invertAlpha = true;
        return mask;
    }

    relocateTracer() {
        const {index, totalPoints, path, length: elemLen} = this.curElem;
        const xyi = index * 2;
        this.traceArrow.setPosition(totalPoints[xyi], totalPoints[xyi +1]);

        // rotate the traceArrow
        const tang = path.getTangent(this.curElem.indexDistance /  this.curElem.fullDistance);
        const tangAngle = Phaser.Math.RadToDeg(tang.angle());
        this.traceArrow.setAngle(tangAngle + 90);
    }


}

const config = {
    width: 600,
    height: 600,
    basicWidth: 600,
    pullDist: 50000,
    basePoints1: [437, 235,  397, 197,  381, 184,  359, 170,  344, 162,  322, 155,  302, 154,
                  284, 155,  259, 161,  236, 171,  229, 176,  216, 185,  197, 205,  188, 223,  
                  175, 255,  169, 293,  173, 338,  188, 378,  224, 422,  255, 437,  299, 444,  
                  341, 438,  367, 425,  387, 410,  410, 379,  423, 353,  429, 334,  437, 144],
    basePoints2: [437, 144,  437, 455],
    type: Phaser.AUTO,
    backgroundColor: '#118eb3',
    /// parent: 'phaser-example',
    scene: Tracer
};

const game = new Phaser.Game(config);
