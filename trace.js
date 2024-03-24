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
                                config.width, config.height, 0x00FF00);
        //const fillMask = this.composeMask(0, 0);
        //this.flllZone.setMask(fillMask);
                        
        this.traceArrow = this.add.image(437 * posRate, 144 * posRate, 'traceArrow')
                                .setScale(imgRate)
                                .setAngle(180);


        const elemBasePoints = [437, 144, 437, 455].map(x => x*posRate);  
        this.elemPath = new Phaser.Curves.Path(elemBasePoints[0], elemBasePoints[1]);
        this.elemPath.splineTo([elemBasePoints[2], elemBasePoints[3]]);

        const points = this.elemPath.getPoints();
        console.log(`*********path ${points.length}`)
        points.forEach(element => {
            console.log(`${element.x} ${element.y}`)
        });

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
        const rt = this.make.renderTexture({x: config.width/2, y: config.height/2, 
                                            width: config.width, height: config.height, add: false});
        const letter = this.make.image({x:config.width/2, y:config.height/2, add:false, key: 'mainMask'});
        letter.setScale(imgRate);

        const cont = this.make.container({x:config.width/2, y:config.height/2, add: false});
        cont.add(letter);           
        
        const deadGr = this.make.graphics();

        deadGr.fillStyle(0xFFFFFF, 1);
        // deadGr.fillRect(maskShift, maskShift, (393 + 4)* posRate + maskShift, 500 * posRate + maskShift);

        const tailPoints = [];
        for (let i = 0; i < endIndex; ++i) {
            const p = path[i];
            tailPoints.push(p.x);
            tailPoints.push(p.y);
        }
        const x0 = tailPoints[0];
        const y0 = tailPoints[1];

        if (endIndex != 0) {
            // beginning of the path
            deadGr.fillCircle(x0, y0, 40 * posRate);
        }

        if (endIndex == path.length - 1) {
            // not the end of the path
            const last = tailPoints.length - 2;
            deadGr.fillCircle(tailPoints[last], tailPoints[last + 1], 40 * posRate);
        }

        console.log(`++++++ 1 tail ${tailPoints[0]} ${tailPoints[1]}`)
        console.log(`-------- length ${path.length} ${tailPoints.length}`)
        path.forEach(p=>console.log(`path ${p}`));
        tailPoints.forEach(p=>console.log(`tailPoint ${p}`));
        console.log(`++++++ 1.1 tail ${tailPoints[0]} ${tailPoints[1]}`)
        const deadPath = new Phaser.Curves.Path(tailPoints[0], tailPoints[1]);
        console.log(`++++++ 1.1.1 tail ${tailPoints[0]} ${tailPoints[1]}`)
        deadPath.splineTo(tailPoints);
        console.log(`++++++ 1.2 tail ${tailPoints[0]} ${tailPoints[1]}`)

        deadGr.lineStyle(80 * posRate, 0xFF0000);
        //deadGr.fillRect(x0 + maskShift, y0 + maskShift, 50 * posRate + maskShift, 100 * posRate + maskShift);
        console.log(`++++++ 2 tail ${tailPoints[0]} ${tailPoints[1]}`)
        deadPath.draw(deadGr);

        const deadMask = new Phaser.Display.Masks.BitmapMask(this, deadGr);
        // deadMask.invertAlpha = true;

        cont.setMask(deadMask);        
        rt.draw(cont, maskShift, maskShift);
        const mask = rt.createBitmapMask();
        //mask.invertAlpha = true;
        return mask;
    }
}

const config = {
    width: 900,
    height: 900,
    basicWidth: 600,
    pullDist: 50000,
    type: Phaser.AUTO,
    backgroundColor: '#118eb3',
    /// parent: 'phaser-example',
    scene: Tracer
};

const game = new Phaser.Game(config);
