class Tracer extends Phaser.Scene
{
    preload ()
    {
        this.load.image('mainMask', 'assets/a_detail.webp');
        this.load.image('traceArrow', 'assets/tracing-arrow.png');
        this.load.image('playButton', 'assets/play-button.webp');
        this.load.image('pattern1', 'assets/pattern1.webp');
        this.load.image('pattern2', 'assets/pattern2.webp');
        this.load.image('pattern3', 'assets/pattern3.webp');
        this.load.image('pattern4', 'assets/pattern4.webp');
    }

    create ()
    {
        const posRate = config.width/config.basicWidth;

        this.whiteLetter = this.add.image(config.width/2, config.height/2, 'mainMask');
        const imgRate = config.width/this.whiteLetter.width;
        this.whiteLetter.setScale(imgRate);

        this.playButton = this.add.image(config.width/2, config.height*9/10, 'playButton')
                                .setInteractive()
                                .setScale(imgRate / 2)
                                .setVisible(false);

        this.fillRect = this.add.rectangle(config.width/2, config.height/2, 
                                config.width, config.height, 0x007F00)
                                   .setVisible(false);

        this.fillPattern1 = this.add.image(config.width/2, config.height/2, 'pattern1')
                                   .setScale(imgRate)
                                   .setVisible(false);
        this.fillPattern2 = this.add.image(config.width/2, config.height/2, 'pattern2')
                                   .setScale(imgRate)
                                   .setVisible(false);
        this.fillPattern3 = this.add.image(config.width/2, config.height/2, 'pattern3')
                                   .setScale(imgRate)
                                   .setVisible(false);
        this.fillPattern4 = this.add.image(config.width/2, config.height/2, 'pattern4')
                                   .setScale(imgRate)
                                   .setVisible(false);
        this.fillPatterns = [this.fillPattern1, this.fillPattern2, this.fillPattern3, this.fillPattern4];                                   
                        
        this.traceArrow = this.add.image(437 * posRate, 144 * posRate, 'traceArrow')
                                .setScale(imgRate);        

        this.elem1 = new LetterElem({basePoints: config.basePoints1.map(xy => xy*posRate)});
        this.elem1.width = 100;
        this.elem1.firstCircle = 50;
        this.elem1.lastCircle = 50;

        this.elem2 = new LetterElem({basePoints: config.basePoints2.map(xy => xy*posRate)});
        //////this.curElem = this.elem2;

        this.elems = [this.elem1, this.elem2]

        this.curElem = undefined;
        this.pathGraphics = this.add.graphics();

        // objects for composing the filling mask
        this.maskTexture = this.make.renderTexture({x: config.width/2, y: config.height/2, 
                                            width: config.width, height: config.height, add: false});
        this.maskLetter = this.make.image({x:config.width/2, y:config.height/2, add:false, key: 'mainMask'});
        this.maskLetter.setScale(imgRate);
        this.maskContainer = this.make.container({x:config.width/2, y:config.height/2, add: false});
        this.maskContainer.add(this.maskLetter); 
        this.maskGraphics = this.make.graphics();                              

        this.waitForPlay = false;
        this.fillZone = null;
        this.nextPattern();
        this.nextElem(true);

        this.input.on('pointermove', pointer => {
            /////////console.log(`pointer move ${pointer.x} ${pointer.y}`)
            if (this.waitForPlay)
                return;
            if (pointer.isDown) {
                const arrowDist = Phaser.Math.Distance.Chebyshev(pointer.x, pointer.y, 
                                                            this.traceArrow.x, this.traceArrow.y);
                const findRes = findNearestPoint(pointer.x, pointer.y, this.curElem);
                //console.log(`nearest ${findRes.x} ${findRes.y}  ${findRes.dist} ${findRes.index}`)
                if (findRes.dist < config.pullDist && arrowDist < config.pullDist) {
                    this.curElem.index = findRes.index;
                    this.redraw();
                    this.nextElem();
                    console.log(`path pos ${findRes.x} ${findRes.y}`)
                }
                console.log(`mouse pos ${pointer.x} ${pointer.y}`)
            } 
        })
        let ip = 0;
        this.playButton.on('pointerdown', () =>{
            console.log(`>>>>>>>>>> play ${++ip}`);
            this.nextPattern();
            this.playButton.setVisible(false);

            this.waitForPlay = false;
            this.nextElem(true);
        });       
    }

    composeMask() {
        const imgRate = config.width/this.whiteLetter.width;
        const posRate = config.width/config.basicWidth;
        const maskShift = 0;
        this.maskTexture.clear();
        this.maskGraphics.clear();
        
        this.maskGraphics.fillStyle(0xFFFFFF, 1);
            this.elems.forEach(elem => {
            const startPoints = elem.startPoints;

            if (elem.index != 0) {
                // not beginning of the path
                this.maskGraphics.fillCircle(startPoints[0], startPoints[1], elem.firstCircle * posRate);
            }

            if (elem.index == elem.length - 1) {
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
        });

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

    drawPath() {
        this.pathGraphics.clear();
        this.pathGraphics.lineStyle(1, 0xFF);
        this.curElem.path.draw(this.pathGraphics, 1024);
    }
    
    nextElem(newPattern = false) {
        if (this.curElem !== undefined && this.curElem.index !== this.curElem.length - 1) 
            return;

        if (this.curElem === undefined || this.curElem === this.elem2) {
            if (!newPattern) {
                this.waitPattern();
                return;
            }
            this.curElem = this.elem1;
            this.elem1.index = this.elem2.index = 0;
        }
        else
            this.curElem = this.elem2
        this.drawPath();
        this.redraw();
    }

    waitPattern () {
        this.playButton.setVisible(true);
        this.waitForPlay = true;
    }

    nextPattern () {
        if (this.fillZone) {
            this.fillZone.setVisible(false);
        }

        if (this.fillZone === this.fillRect) {
            this.fillZone = this.fillPatterns
                    [Math.floor(Math.random() * this.fillPatterns.length)]
        }
        else {
            this.fillZone = this.fillRect;
            this.fillZone.fillColor = config.fillColors
                                [Math.floor(Math.random() * config.fillColors.length)]
        }
        this.fillZone.setVisible(true);
    }

    redraw() {
        this.fillZone.setMask(this.composeMask());
        this.relocateTracer();
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
                  341, 438,  367, 425,  387, 410,  415, 382,  429, 334,  437, 144],
    basePoints2: [437, 144,  437, 455],
    fillColors: [0xff0000, 0xfc6a03, 0x63d840, 0x468638, 0x1e4a41, 0x13345e, 0x131e57, 0x330066, 
                 0xa80af5, 0x4c2714, 0x000000],
    type: Phaser.AUTO,
    backgroundColor: '#118eb3',
    /// parent: 'phaser-example',
    scene: Tracer
};

const game = new Phaser.Game(config);
