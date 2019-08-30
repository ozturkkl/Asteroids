"use strict";

var config = 
{
    type: Phaser.AUTO,
    parent: Phaser.CANVAS,
    width: 1800,
    height: 700,
    state: {preload: preload, create: create, update: update}
};
var game = new Phaser.Game(config);
var player;
var playerRow;
var cursors;
var asteroidVelocity;
var asteroidGroup;
var currentMaxAsteroids;
var currentAsteroids;
var timer;
var scoreTimer;
var score;
var scoreLabel;
var stars;
var gameStarted = false;
var startLabel;

function preload()
{
    game.load.image('player','images/spaceship.png');
    game.load.image('asteroid','images/asteroid.png');    
    game.load.image('stars','images/stars.png');    
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
}

function create()
{
    startLabel = game.add.text(0, 0, 'Press ENTER To Start!', { fontFamily: "30px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "center" });
    startLabel.setTextBounds(0, 100, 1800, 700);

    asteroidGroup = game.add.physicsGroup();
    currentAsteroids = 0;
    currentMaxAsteroids = 0;
    asteroidVelocity = 500;

    cursors = game.input.keyboard.createCursorKeys();

    game.input.keyboard.addKey(Phaser.Keyboard.ENTER).onDown.add(startNewGame, this);
    //game.input.onDown.add(startNewGame, this);

    stars = create_stars();
    score = 0;
    scoreLabel = game.add.text(20, 20, `Score: ${score}`, {font: "30px Arial", fill: "#fff" });


    // INPUT FIELD CODE ---- MORE CODE BELOW AND ALSO IN index.html
    // myInput = createInput(game.world.centerX, 50);
    // myInput.anchor.set(0.5, 0.5);
    // myInput.canvasInput.value('Hello!');
    // myInput.canvasInput.focus();
}

function update()
{
    if (currentAsteroids < currentMaxAsteroids)
    {
        var laneNumber = Math.floor((Math.random() * 5) + 1);
        create_asteroid(laneNumber);
        currentAsteroids++;
    }

    if (cursors.up.justDown)
    {
        control_player(player, 0, -game.world.height / 5);
    }
    else if (cursors.down.justDown)
    {
        control_player(player, 0, +game.world.height / 5);
    }

    if (cursors.left.isDown)
    {
        control_player(player, -10, 0);
    }
    else if (cursors.right.isDown)
    {
            control_player(player, 10, 0);
    }

    if (game.physics.arcade.collide(player, asteroidGroup, collisionHandler, processHandler, this))
    {
        console.log('boom');
    }
    stars.angle += .01;
}

function create_stars()
{
    var stars = game.add.sprite(game.world.width / 2, -1000,'stars');
    stars.anchor.setTo(0.5, 0.5);
    stars.scale.setTo(2, 2);

    return stars;
}

function create_player(x,y)
{
    var player = game.add.sprite(x,y,'player');
    player.anchor.setTo(0.5,0.5);
    game.physics.arcade.enable(player);
    player.body.collideWorldBounds = true;
    player.body.immovable = true;
    player.scale.setTo(0.2,0.2);
    playerRow = 3;

    return player;
}

function create_asteroid(laneNumber)
{
    var adjustment = 0;
    if (laneNumber == 1 || laneNumber == 2)
    {
        adjustment = -game.world.height / 5;
    }
    else if (laneNumber == 5  || laneNumber == 4)
    {
        adjustment = game.world.height / 5;
    }

    if(laneNumber == 1 || laneNumber == 5)
    {
        adjustment = adjustment * 2;
    }

    var plusOrMinus = Math.round(Math.random());
    var randomAsteroidSpeed = Math.random() * 250;

    if (plusOrMinus == 0)
    {
        randomAsteroidSpeed = -randomAsteroidSpeed
    }
    
    var asteroid = game.add.sprite(game.world.width, game.world.centerY + adjustment,'asteroid');
    asteroid.anchor.setTo(0.5,0.5);
    game.physics.arcade.enable(asteroid);
    asteroid.scale.setTo(0.10 + Math.random() * .05 , 0.10 + Math.random() * .05);
    asteroid.angle += Math.random() * 360;
    asteroid.body.velocity.x = -asteroidVelocity + randomAsteroidSpeed;
    asteroid.checkWorldBounds = true;
    asteroid.events.onOutOfBounds.add(asteroidOut, this);

    asteroidGroup.add(asteroid);

    return asteroid;
}

function control_player(player, x, y)
{
    if (player == null)
        return;
        
    if (y < 0)
    {
        if(playerRow != 5)
        {
            game.add.tween(player).to({y: player.y + y}, 70, Phaser.Easing.Quadratic.InOut).start();
            playerRow += 1;
        }
    }
    else if (y > 0)
    {
        if(playerRow != 1)
        {
            game.add.tween(player).to({y: player.y + y}, 70, Phaser.Easing.Quadratic.InOut).start();
            playerRow -= 1;
        }
    }

    player.x += x;

    if(player.x < player.width / 2)
    {
        player.x = player.width / 2;
    }
    else if (player.x > game.world.width - player.width / 2)
    {
        player.x = game.world.width - player.width / 2;
    }
}

function processHandler (player, asteroid) {

    return true;

}

function collisionHandler (player, asteroid) {
    player.kill();
    asteroid.kill();
    currentMaxAsteroids = 0;
    gameStarted = false;
    startLabel.text = "Press ENTER To Start!";
    clearInterval(scoreTimer);
    clearInterval(timer);
}

function asteroidOut(asteroid){
    asteroid.kill();
    currentAsteroids--;
}

function increaseDifficulty(){
    asteroidVelocity += 50;
    if (currentMaxAsteroids != 20)
        currentMaxAsteroids += 1;
}

function increaseScore(){
    if (document.hasFocus()) score += 1;    
    scoreLabel.text = `Score: ${score}`;
}

function startNewGame(){
    if (!gameStarted)
    {
        player = create_player(150, game.world.centerY);
        score = 0;
        startLabel.text = "";
        currentAsteroids = 0;
        currentMaxAsteroids = 1;
        asteroidVelocity = 500;
        timer = setInterval(increaseDifficulty, 15000);
        scoreTimer = setInterval(increaseScore, 50);
        gameStarted = true;
    }
}


// INPUT CODE EXPERIMENT, CANT GET IT TO WORK

//var myInput;

// function  inputFocus(sprite){
//     sprite.canvasInput.focus();
// }

// function createInput(x, y){
//     var bmd = game.add.bitmapData(400, 50);    
//     var myInput = game.add.sprite(x, y, bmd);
    
//     myInput.canvasInput = new CanvasInput({
//       canvas: bmd.canvas,
//       fontSize: 30,
//       fontFamily: 'Arial',
//       fontColor: '#222',
//       fontWeight: 'bold',
//       width: 400,
//       padding: 8,
//       borderWidth: 1,
//       borderColor: '#000',
//       borderRadius: 3,
//       boxShadow: '1px 1px 0px #fff',
//       innerShadow: '0px 0px 5px rgba(0, 0, 0, 0.5)',
//       placeHolder: 'Enter name here...'
//     });
//     myInput.inputEnabled = true;
//     myInput.input.useHandCursor = true;    
//     myInput.events.onInputUp.add(inputFocus, this);
    
//     return myInput;
// }

  