const canvasWidth = 640;
const canvasHeight = 480;
const tileSize = 64;

let game;
let gameState;

let font;
let sprite = {};
let sound = {};

let dbArr = [];

class Entity {
    constructor(x, y, w, h, spd) {
        this.x = x; 
        this.y = y;
        this.w = w;
        this.h = h;
        this.spd = spd;
    }
}

class Game {
    constructor() {
        this.nickname;
        this.score;

        this.temperature;
        this.wetness;
        this.goodies;
        this.baddies;
        this.cooldown;
        this.time;

        this.temperatureColor;
        this.wetnessColor;
        this.goodiesColor;
        this.baddiesColor;

        this.temperatureState;
        this.wetnessState;
        this.goodiesState;
        this.baddiesState;

        this.nicknameArr = []
        this.tomatoArr = [];
        this.waterArr = [];
        this.goodiesArr = [];
        this.baddiesArr = [];

        this.recLoading;
    }

    initMenu() {
        this.nicknameArr = ['a', 'a', 'a']
        this.nickname = this.nicknameArr[0] + this.nicknameArr[1] + this.nicknameArr[2];
        gameState = 'menu';
    }

    initGame() {
        sound.ost.play();

        this.tomatoArr = [];
        this.waterArr = [];
        this.goodiesArr = [];
        this.baddiesArr = [];

        this.temperature = floor(random(20, 26));
        this.wetness = floor(random(70, 73));
        this.goodies = floor(random(0, 4));
        this.baddies = 0;
        this.time = 30; //timer
        this.score = 0;
        
        this.cooldown = {
            dowater: 2,
            dogoodies: 2,
            dobaddies: 3,

            determinatebaddies: 1,
            changetemperature: 2,
            changewater: 2,
            changegoodies: 2
        }

        let everysec;
        everysec = setInterval(() => {
            if (this.time > 0) {
                this.time--;
            } else {
                clearInterval(everysec);
                this.initRecords();
            }
        }, 1000);

        let timerTick;
        timerTick = setInterval(() => {
            if (this.time > 0) {
                this.onTimerTick();
            } else {
                clearInterval(timerTick);
            }
        }, 500);

        gameState = 'game';
    }

    onTimerTick() {
        // [buttons cooldown]
        if (this.cooldown.dowater > 0) this.cooldown.dowater --;
        if (this.cooldown.dogoodies > 0) this.cooldown.dogoodies --;
        if (this.cooldown.dobaddies > 0) this.cooldown.dobaddies --;
        if (this.cooldown.tomatos > 0) this.cooldown.tomatos --;

        if (this.cooldown.determinatebaddies > 0) this.cooldown.determinatebaddies --;
        if (this.cooldown.changetemperature > 0) this.cooldown.changetemperature --;
        if (this.cooldown.changewater > 0) this.cooldown.changewater --;
        if (this.cooldown.changegoodies > 0) this.cooldown.changegoodies --;

        //[every]
        if (this.cooldown.changetemperature <= 0) {
            this.temperature += floor(random(-2, 2));
            this.cooldown.changetemperature = 3;
        }

        if (this.cooldown.changewater <= 0) {
            if (this.temperature > 27) {
                this.wetness -= 2
                this.cooldown.changewater = 1;
            } else if (this.temperature < 18) {
                this.wetness += 0;
                this.cooldown.changewater = 1;
            } else {
                this.wetness += floor(random(-2, 2));
                this.cooldown.changewater = 2;
            }
        }

        if (this.cooldown.changegoodies <= 0) {
            if (this.goodies > 0) this.goodies--;
            this.cooldown.changegoodies = 3;
        }

        //[spawn cats]
        if (this.cooldown.dobaddies <= 0) {
            this.doBaddies();
            this.cooldown.dobaddies = floor(random(20, 25));
        }
        
        //[spawn tomatos]
        if (this.temperatureState === 'good' && this.wetnessState === 'good' && this.goodiesState === 'good' && this.baddiesState === 'good') {
            this.doTomato();
        }
    }

    async dbInit() {
        if (this.score > 0) {
            await saveData(this.nickname.toUpperCase(), this.score);    
        }
        await loadData();
    }

    initRecords() {
        sound.ost.stop();

        this.dbInit();
        
        this.recLoading = 180;
        
        gameState = 'records';
    }

    updateMenu() {}

    updateRecords() {
        if (this.recLoading > 0) this.recLoading -= 1
    }

    updateGame() {
        if (this.temperature > 27 || this.temperature < 18) {
            this.temperatureState = 'bad';
            this.temperatureColor = 'red';
        } else {
            this.temperatureState = 'good';
            this.temperatureColor = 'white';
        }
        
        if (this.wetness > 80 || this.wetness < 70) {
            this.wetnessState = 'bad';
            this.wetnessColor = 'red';
        } else {
            this.wetnessState = 'good';
            this.wetnessColor = 'white';
        }

        if (this.goodies > 10 || this.goodies < 1) {
            this.goodiesState = 'bad';
            this.goodiesColor = 'red';
        } else {
            this.goodiesState = 'good';
            this.goodiesColor = 'green';
        }

        if (this.baddies >= 1) {
            this.baddiesState = 'bad';
            this.baddiesColor = 'purple';
        } else {
            this.baddiesState = 'good';
            this.baddiesColor = 'green';
        }
        
        this.waterArr.forEach((water) => {
            water.y += water.spd * deltaTime;
            if (water.y > 6.5 * tileSize) {
                this.waterArr.shift();
                this.wetness += 2;
                this.temperature --;
                if (this.goodies > 0) {
                    this.goodies --;
                }
            }
        });

        this.goodiesArr.forEach((goods) => {
            goods.y += goods.spd * deltaTime;
            if (goods.y > 6.5 * tileSize) {
                this.goodiesArr.shift();
                this.goodies ++;
            }
        });

        this.baddiesArr.forEach((cat) => {
            cat.y += cat.spd * deltaTime;
            if (cat.y > 6.5 * tileSize) {
                this.baddiesArr.shift();
                this.baddies ++;
            }
        });

        for (let i = game.tomatoArr.length - 1; i >= 0; i--) {
            let tomato = game.tomatoArr[i];
            if (tomato.lifetime <= 0) {
                game.tomatoArr.splice(i, 1);
                break;
            } else {
                tomato.lifetime -= 1;
            }
        }
    }

    drawMenu() {
        background(sprite.sky);
        drawText("Тепличный менеджер", canvasWidth/2, 1*tileSize, 32);
        drawText("Твое имя: " + `${this.nickname.toUpperCase()}`, canvasWidth/2, 5*tileSize, 18);
        drawText("Нажми ПРОБЕЛ, чтобы играть", canvasWidth/2, 7*tileSize);
    }

    drawGame() {
        background(sprite.sky);

        //[LAYER 1]
        for (let i = 0; i < canvasWidth/tileSize; i++) {
            image(sprite.vine, i*tileSize, 4*tileSize, 64, 64);
            image(sprite.vine, i*tileSize, 5*tileSize, 64, 64);
        }
        // drawRect(0, 5.5*tileSize, canvasWidth, 64, 'green');

        //[LAYER 2]
        this.tomatoArr.forEach((tomato) => {
            image(tomato.img, tomato.x, tomato.y, tomato.w, tomato.h);
        });

        this.waterArr.forEach((water) => {
            image(sprite.water, water.x, water.y, water.w, water.h);
        });

        this.goodiesArr.forEach((goods) => {
            image(sprite.goodies, goods.x, goods.y, goods.w, goods.h);
        });

        this.baddiesArr.forEach((cat) => {
            image(sprite.catterpillar, cat.x, cat.y, cat.w, cat.h);
        });

        //[LAYER 3]
        for (let i = 0; i < canvasWidth/tileSize; i++) {
            image(sprite.grass, i*tileSize, 6*tileSize, 64, 64);
            image(sprite.dirt, i*tileSize, 7*tileSize, 64, 64);
        }
        // drawRect(0, 6.5*tileSize, canvasWidth, 64, 'brown');
        
        //[PANEL]
        drawRect(0, 0, canvasWidth, 1.5*tileSize, color(0, 0, 0, 128));
        drawText(`Температура: ${this.temperature}°`, 8, 22, 14, this.temperatureColor, LEFT);
        drawText(`Влажность: ${this.wetness}%`, 8, 2*22, 14, this.wetnessColor, LEFT);
        drawText(`Удобрения: ${this.goodies}`, 8, 3*22, 14, this.goodiesColor, LEFT);
        drawText(`Вредители: ${this.baddies}`, 8, 4*22, 14, this.baddiesColor, LEFT);

        drawText(`Время: ${this.time}`, canvasWidth-8, 22, 14, 'white', RIGHT);
        drawText(`Очки: ${this.score}`, canvasWidth-8, 2*22, 14, 'white', RIGHT);
    }

    drawRecords() {
        background(sprite.sky);
        drawText("Твой рекорд:", canvasWidth/2, 1*tileSize, 48);
        drawText(`${this.score}`, canvasWidth/2, 2*tileSize, 48);

        if (this.recLoading === 0) {
            for (let i = 0; i < 5; i++) {
                try {
                    drawText(`${i+1}: ${dbArr[i]['nickname']} ${dbArr[i]['score']}`, canvasWidth/2 - tileSize, (i+7)*tileSize/2, 14, 'white', LEFT);    
                } catch (error) {
                    drawText("Нет интернета", canvasWidth/2, canvasHeight/2 + 32, 18);        
                }
            }
        } else {
            drawText("Загрузка", canvasWidth/2, canvasHeight/2 + 32, 18);
        }
        
        drawText("Нажми ПРОБЕЛ, чтобы вернуться в меню", canvasWidth/2, 7*tileSize);
    }

    doWater() {
        if (this.cooldown.dowater <= 0) {
            let water = new Entity(floor(random(tileSize, canvasWidth)), 0, 32, 32, 0.6);
            this.waterArr.push(water);
        }
    }

    doGoodies() {
        if (this.cooldown.dogoodies <= 0) {
            let goods = new Entity(floor(random(16, canvasWidth - 16)), -16, 40, 40, 0.6);
            this.goodiesArr.push(goods);
        }
    }

    doBaddies() {
        let cat = new Entity(floor(random(16, canvasWidth - 16)), -16, 48, 48, 0.7);
        this.baddiesArr.push(cat);
    }

    doTomato() {
        let tomato = new Entity(floor(random(32, canvasWidth - 32)), floor(random(3.5*tileSize, 5*tileSize)), 48, 48);

        tomato.type = floor(random(1, 3));

        switch (tomato.type) {
            case 1:
                tomato.cost = 20;
                tomato.img = sprite.tomato;
                tomato.lifetime = 300;    
                break;
            case 2:
                tomato.cost = 40;
                tomato.img = sprite.tomatoGolden;
                tomato.lifetime = 200;    
                break;
        
            default:
                break;
        }

        this.tomatoArr.push(tomato);
    }

    determinateBaddies() {
        if (this.baddies > 0 && this.cooldown.determinatebaddies <= 0) {
            this.baddies --;
            this.cooldown.determinatebaddies = 1;
        }
    }
}

function preload() {
    sprite.tomato = loadImage('./res/img/tomato.png');
    sprite.tomatoGolden = loadImage('./res/img/tomato_golden.png');
    sprite.water = loadImage('./res/img/water.png');
    sprite.goodies = loadImage('./res/img/goodie.png');
    sprite.catterpillar = loadImage('./res/img/cat.png');

    sprite.vine = loadImage('./res/img/vine.png');
    sprite.dirt = loadImage('./res/img/dirt.png');
    sprite.grass = loadImage('./res/img/grass_block_side.png');
    sprite.sky = loadImage('./res/img/skybox_sideClouds.png');

    sound.pick = loadSound('./res/sound/drop_004.ogg');
    sound.select = loadSound('./res/sound/glass_001.ogg');
    sound.typing = loadSound('./res/sound/glass_006.ogg');
    sound.ost = loadSound('./res/sound/soundtrack.mp3');

    font = loadFont('./res/PressStart2P-Regular.ttf');
}

function setup() {
    setupCanvas(canvasWidth, canvasHeight);
    frameRate(60);
    noSmooth();
    setupAssets();
    setupGame();
}

function setupCanvas(w, h) {
    let canvas = createCanvas(w, h, P2D);
    canvas.parent('tomato-manager');
}

function setupAssets () {
    soundFormats('mp3', 'ogg');
    sound.pick.setVolume(0.3);
    sound.select.setVolume(0.5);
    sound.typing.setVolume(0.5);
    sound.ost.setVolume(0.1);
    textFont(font);
}

function setupGame() {
    game = new Game();
    game.initMenu();
}

function draw() {
    if (gameState === 'menu') {
        game.updateMenu();
        game.drawMenu();
    } else if (gameState === 'game') {
        game.updateGame();
        game.drawGame();
    } else if (gameState === 'records') {
        game.updateRecords();
        game.drawRecords();
    }

    // drawGrid();
}

function drawGrid() {
    for (let i = 0; i <= canvasWidth/tileSize; i++) {
        line(i * tileSize, 0, i * tileSize, canvasHeight);
    }
    for (let i = 0; i <= canvasHeight/tileSize; i++) {
        line(0, i * tileSize, canvasWidth, i * tileSize);
    }
}

function drawText(t, x, y, s = 14, c = 'white', a = CENTER) {
    stroke(0);
    strokeWeight(3);
    fill(c);
    textSize(s);
    textAlign(a);
    text(t, x, y);
}

function drawRect(x, y, w, h, c = 'white') {
    fill(c);
    rect(x, y, w, h);
}

function keyPressed() {
    if (gameState === 'menu') {
        if (keyIsDown(32)) {
            game.initGame();
            sound.select.play();   
        }
        if (keyCode >= 65 && keyCode <= 90) {
            game.nicknameArr.push(key);
            if (game.nicknameArr.length > 3) {
                game.nicknameArr.shift();
            }
            game.nickname = game.nicknameArr[0] + game.nicknameArr[1] + game.nicknameArr[2];
            sound.typing.play();
        }
    }
    if (gameState === 'records' && keyIsDown(32)) {
        game.initMenu();
        sound.select.play();
    }
    if (gameState === 'game') {
        if (keyIsDown(87)) {
            game.temperature ++;
            // console.log(key + keyCode + ": температура +");
        }
        if (keyIsDown(83)) {
            game.temperature --;
            // console.log(key + keyCode + ": температура -");
        }
        if (keyIsDown(81)) {
            game.doWater();
            // console.log(key + keyCode + ": влажность +");
        }
        if (keyIsDown(69)) {
            game.doGoodies();
            // console.log(key + keyCode + ": удобрение +");
        }
        if (keyIsDown(68)) {
            game.determinateBaddies();
            // console.log(key + keyCode + ": вредители +");
        }
    }
}

function mousePressed() {
    if (gameState === 'game') {
        for (let i = game.tomatoArr.length - 1; i >= 0; i--) {
            let tomato = game.tomatoArr[i];
            if (mouseX > tomato.x && mouseX < tomato.x + tomato.w && mouseY > tomato.y && mouseY < tomato.y + tomato.h) {
                game.score += tomato.cost;
                game.tomatoArr.splice(i, 1);
                sound.pick.play();
                break;
            }
        }
    }
}