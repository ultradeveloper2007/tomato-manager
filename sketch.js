const canvasWidth = 640;
const canvasHeight = 480;
const tileSize = 64;

let game;
let gameState;

let font;
let spriteSheet;

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

        this.everysec;

        this.farmer;

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
        this.nickname = this.nicknameArr[0] + this.nicknameArr[1] + this.nicknameArr[2]
        gameState = 'menu';
    }

    initGame() {
        this.temperature = floor(random(26, 33));
        this.wetness = floor(random(39, 54));
        this.goodies = floor(random(0, 4));
        this.baddies = 0;
        this.time = 180;
        this.score = 0;
        
        this.cooldown = {
            water: 2,
            goodies: 1,
            baddies: 3,

            determinatebaddies: 1,
            
            changetemperature: 2,
            changewater: 2,
            changegoodies: 2
        }

        this.farmer = new Entity(canvasWidth/2, 4.5*tileSize, tileSize, 2*tileSize, 4);

        this.everysec = setInterval(() => {
            if (this.time > 0) {
                this.time--;
                this.onTimerTick();
            } else {
                clearInterval(this.everysec);
                this.initRecords();
            }
        }, 1000);

        gameState = 'game';
    }

    onTimerTick() {
        // [buttons cooldown]
        if (this.cooldown.water > 0) this.cooldown.water --;
        if (this.cooldown.goodies > 0) this.cooldown.goodies --;
        if (this.cooldown.baddies > 0) this.cooldown.baddies --;
        if (this.cooldown.tomatos > 0) this.cooldown.tomatos --;

        if (this.cooldown.determinatebaddies > 0) this.cooldown.determinatebaddies --;
        if (this.cooldown.changetemperature > 0) this.cooldown.changetemperature --;
        if (this.cooldown.changewater > 0) this.cooldown.changewater --;
        if (this.cooldown.changegoodies > 0) this.cooldown.changegoodies --;

        //[every second]
        if (this.cooldown.changetemperature <= 0) {
            this.temperature += floor(random(-3, 3));
            this.cooldown.changetemperature = 2;
        }

        if (this.cooldown.changewater <= 0) {
            if (this.temperatureState === 'good') {
                this.wetness += floor(random(-3, 3));
                this.cooldown.changewater = 1;
            } else if (this.temperatureState === 'good' && this.temperature > 35) {
                this.wetness -= 2;
                this.cooldown.changewater = 1;
            } else if (this.temperatureState === 'good' && this.temperature < 24) {
                this.wetness -= 0;
                this.cooldown.changewater = 1;
            }
        }

        if (this.cooldown.changegoodies <= 0) {
            if (this.goodies > 0) this.goodies--;
            this.cooldown.changegoodies = 2;
        }

        //[spawn cats]
        let spawnCatChance = random(0, 1);
        if (spawnCatChance > 0.80) this.doBaddies();

        //[spawn tomatos]
        if (this.temperatureState === 'good' && this.wetnessState === 'good' && this.goodiesState === 'good' && this.baddiesState === 'good') {
            this.doTomato();
        }
    }

    initRecords() {
        if (this.score > 0) {
            saveData(this.nickname.toUpperCase(), this.score);
        }

        loadData();
        this.recLoading = 180;
        
        gameState = 'records';
    }

    updateMenu() {}

    updateRecords() {
        if (this.recLoading > 0) this.recLoading -= 1
    }

    updateGame() {
        if (this.temperature > 35 || this.temperature < 24) {
            this.temperatureState = 'bad';
            this.temperatureColor = 'red';
        } else {
            this.temperatureState = 'good';
            this.temperatureColor = 'white';
        }
        
        if (this.wetness > 80 || this.wetness < 40) {
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

        if (this.farmer.x + this.farmer.w >= canvasWidth || this.farmer.x <= 0) {
            this.farmer.spd = -this.farmer.spd;
        }
        this.farmer.x -= this.farmer.spd;

        this.waterArr.forEach((water) => {
            water.y += water.spd;
            if (water.y > 6.5 * tileSize) {
                this.waterArr.shift();
                this.wetness ++;
                if (this.goodies > 0) {
                    this.goodies --;
                }
            }
        });

        this.goodiesArr.forEach((goods) => {
            goods.y += goods.spd;
            if (goods.y > 6.5 * tileSize) {
                this.goodiesArr.shift();
                this.goodies ++;
            }
        });

        this.baddiesArr.forEach((cat) => {
            cat.y += cat.spd;
            if (cat.y > 6.5 * tileSize) {
                this.baddiesArr.shift();
                this.baddies ++;
            }
        });

        for (let i = this.tomatoArr.length - 1; i >= 0; i--) {
            let tomato = this.tomatoArr[i];
            if (collisionCheck(this.farmer, tomato)) {
                this.score += 10;
                this.tomatoArr.splice(i, 1);
            }
        } //TOMATO
    }

    drawMenu() {
        background('green');
        drawText("Тепличный менеджер", canvasWidth/2, 1*tileSize, 32);
        drawText("Твое имя: " + `${this.nickname.toUpperCase()}`, canvasWidth/2, 5*tileSize, 18);
        drawText("Нажми ПРОБЕЛ, чтобы играть", canvasWidth/2, 7*tileSize);
    }

    drawGame() {
        background('cornflowerblue');

        //[LAYER 1]
        for (let i = 0; i < canvasWidth/tileSize; i++) {
            image(spriteSheet, i*tileSize, 4.5*tileSize, 64, 64, 0, 32, 32, 32);
            image(spriteSheet, i*tileSize, 5.5*tileSize, 64, 64, 0, 32, 32, 32);
        } // VINE
        // drawRect(0, 5.5*tileSize, canvasWidth, 64, 'green');

        //[LAYER 2]
        this.tomatoArr.forEach((tomato) => {
            image(spriteSheet, tomato.x, tomato.y, tomato.w, tomato.h, 0, 0, 32, 32);
        }); //TOMATO

        image(spriteSheet, this.farmer.x, this.farmer.y, this.farmer.w, this.farmer.h, 64, 32, 32, 64); //DUDE
        // drawRect(this.farmer.x, this.farmer.y, this.farmer.w, this.farmer.h, 'tan');

        this.waterArr.forEach((water) => {
            image(spriteSheet, water.x, water.y, water.w, water.h, 32, 0, 32, 32);
        }); //WATER

        this.goodiesArr.forEach((goods) => {
            image(spriteSheet, goods.x, goods.y, goods.w, goods.h, 96, 0, 32, 32)
        }); //GOODIES

        this.baddiesArr.forEach((cat) => {
            image(spriteSheet, cat.x, cat.y, cat.w, cat.h, 64, 0, 32, 32)
        }); //CATTERPILLAR

        //[LAYER 3]
        for (let i = 0; i < canvasWidth/tileSize; i++) {
            image(spriteSheet, i*tileSize, 6.5*tileSize, 64, 64, 32, 32, 32, 32);
        } // DIRT
        // drawRect(0, 6.5*tileSize, canvasWidth, 64, 'brown');
        
        //[PANEL]
        drawRect(0, 0, canvasWidth, 1.5*tileSize, color(0, 0, 0, 128));
        drawText(`Температура: ${this.temperature}`, 8, 22, 14, this.temperatureColor, LEFT);
        drawText(`Влажность: ${this.wetness}`, 8, 2*22, 14, this.wetnessColor, LEFT);
        drawText(`Удобрения: ${this.goodies}`, 8, 3*22, 14, this.goodiesColor, LEFT);
        drawText(`Вредители: ${this.baddies}`, 8, 4*22, 14, this.baddiesColor, LEFT);

        drawText(`Время: ${this.time}`, canvasWidth-8, 22, 14, 'white', RIGHT);
        drawText(`Очки: ${this.score}`, canvasWidth-8, 2*22, 14, 'white', RIGHT);
    }

    drawRecords() {
        background('black');
        drawText("Твой рекорд:", canvasWidth/2, 1*tileSize, 48);
        drawText(`${this.score}`, canvasWidth/2, 2*tileSize, 48);

        if (this.recLoading === 0) {
            for (let i = 0; i < 5; i++) {
                drawText(`${i+1}: ${dbArr[i]['nickname']} ${dbArr[i]['score']}`, canvasWidth/2 - tileSize, (i+7)*tileSize/2, 14, 'white', LEFT);
            }
        }
        
        drawText("Нажми ПРОБЕЛ, чтобы вернуться в меню", canvasWidth/2, 7*tileSize);
    }

    doWater() {
        if (this.cooldown.water <= 0) {
            for (let i = 0; i < 10; i++) {
                let water = new Entity(i * tileSize + 16, 0, 32, 32, 8);
                this.waterArr.push(water);
            }
            this.cooldown.water = 2;
        }
    }

    doGoodies() {
        if (this.cooldown.goodies <= 0) {
            let goods = new Entity(floor(random(16, canvasWidth - 16)), -16, 32, 32, 8);
            this.goodiesArr.push(goods);
        }
    }

    doBaddies() {
        if (this.cooldown.baddies <= 0) {
            let cat = new Entity(floor(random(16, canvasWidth - 16)), -16, 32, 32, 8);
            this.baddiesArr.push(cat);
        }
    }

    doTomato() {
        let tomato = new Entity(floor(random(16, canvasWidth - 16)), floor(random(4.5*tileSize, 5.5*tileSize)), 32, 32, 8);
        this.tomatoArr.push(tomato);
    }

    determinateBaddies() {
        if (this.baddies > 0 && this.cooldown.determinatebaddies <= 0) {
            this.baddies --;
            this.cooldown.determinatebaddies = 1;
        }
    }
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

function setupGame() {
    game = new Game();
    game.initMenu();
}

function setupAssets () {
    spriteSheet = loadImage('./res/spritesheet.png');
    font = loadFont('./res/PressStart2P-Regular.ttf');
    textFont(font);
}

function draw() {
    clear();
    
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

function collisionCheck(a, b) {
    return a.x + a.w >= b.x &&
    a.x <= b.x + b.w &&
    a.y + a.h >= b.y &&
    a.y <= b.y + b.h;
}

function keyPressed() {
    if (gameState === 'menu') {
        if (keyIsDown(32)) {
            game.initGame();   
        }
        if (keyCode >= 65 && keyCode <= 90) {
            game.nicknameArr.push(key);
            if (game.nicknameArr.length > 3) {
                game.nicknameArr.shift();
            }
            game.nickname = game.nicknameArr[0] + game.nicknameArr[1] + game.nicknameArr[2];
        }
    }
    if (gameState === 'records' && keyIsDown(32)) {
        game.initMenu();
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
        if (keyIsDown(49)) {
            game.doWater();
            // console.log(key + keyCode + ": влажность +");
        }
        if (keyIsDown(50)) {
            game.doGoodies();
            // console.log(key + keyCode + ": удобрение +");
        }
        if (keyIsDown(51)) {
            game.determinateBaddies();
            // console.log(key + keyCode + ": вредители +");
        }
    }
}