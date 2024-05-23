//TODO: Ver si esto funciona para solucionar problema de phaser not defined. Pq en ejemplo funcionamiento estan estas lineas y no falla
//const Phaser = require('//cdn.jsdelivr.net/npm/phaser@3.55.2/dist/phaser.js')
var script = document.createElement("script");  // create a script DOM node
script.src = "https://cdnjs.cloudflare.com/ajax/libs/phaser/3.70.0/phaser.min.js";  // set its src to the provided URL

/* Variables para guardar funciones callback eventos y el personaje elegido por el usuario si ha elegido algo*/
var cambioPuntuacion
var gameOverEvento
var nuevaPartida
var personaje


/* Se puede cambiar nombre Example (si es coherente con el especificado en config posteriormente)*/
class Example extends Phaser.Scene {
    preload() {
        const directAssets = "https://saramm3.github.io/juegos/Pelota/assets"
        const directAssetsPersonajes = "https://saramm3.github.io/juegos/Pelota/assets/personajes"

        //Cargar recursos
        //this.load.image('sky', directAssets + '/sky.png');
        this.load.image('ground', directAssets + '/platform.png');  //Suelo

        this.load.image('ball', directAssets + '/ball.png') //Pelotita

        //Fotogramas sprite jugador (se usaran para animacion)
        this.load.spritesheet('dude',
            directAssetsPersonajes + personaje,
            { frameWidth: 90, frameHeight: 76 }
        );
        
    }

    create() {
        //Mostramos imagen (cielo)
        //this.add.image(400, 300, 'sky');

        //Creamos grupo de plataformas (elem estaticos) con fisica
        this.platforms = this.physics.add.staticGroup();

        //Creamos el suelo, escalado * 2 para que ocupe todo el ancho
        this.platforms.create(400, 568, 'ground').setScale(2).refreshBody()

        //Creamos sprite jugador
        this.player = this.physics.add.sprite(100, 450, 'dude')
        this.player.setBounce(0.2);  //Al aterrizar tras saltar
        this.player.setCollideWorldBounds(true); //Para que colisione con limites del juego (no pueda salir de pantalla)
        this.player.body.setGravityY(300)

        //Creamos pelotita
        // Para que comience desde un sitio aleatorio (en eje x, en y siempre en 0 porque si no no da tiempo llegar)
        var xPos = Phaser.Math.Between(0, 800)
        this.ball = this.physics.add.sprite(xPos, 0, 'ball')

        //Hacemos que inicialmente se acerque al jugador, si no no es justo
        var xVel = (xPos > 400) ? -150 : 150
        this.ball.setVelocityX(xVel);
        //this.ball.setVelocityY(150);
        this.ball.setCollideWorldBounds(true); //Para que colisione con limites del juego (no pueda salir de pantalla)
        this.ball.setBounce(1); //Hacemos que rebote mucho

        //Creamos las animaciones del jugador:
        this.anims.create({
            key: 'left',    //Al ir a la izquierda
            frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),  //Usa fotogramas 0-3
            frameRate: 6,  //Velocidad en fotogramas/segundo
            repeat: -1  //La animacion debe volver a empezar cuando termine
        });

        this.anims.create({
            key: 'turn',    //Al girar
            frames: this.anims.generateFrameNumbers('dude', { start: 4, end: 8 }),
            frameRate: 6,
            repeat: -1  //La animacion debe volver a empezar cuando termine

        });

        this.anims.create({
            key: 'right',   //Al ir a la derecha
            frames: this.anims.generateFrameNumbers('dude', { start: 9, end: 12 }),
            frameRate: 6,
            repeat: -1
        });

        //Añadimos puntuacion
        this.score = 0;
        this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });
        
        //Añadimos colliders para ver si hay colision/superposicion entre jugador y suelo
        //Asi no atraviesa el suelo
        this.physics.add.collider(this.player, this.platforms);

        //Para haya colision entre pelota y jugador (ver cuando consigue puntos)
        this.physics.add.collider(this.player, this.ball, hitBall, null, this);

        //Para cuando pelota toca el suelo (gameover)
        this.physics.add.collider(this.ball, this.platforms, this.hitFloor, null, this)

        //Añadimos gestor de teclado. Cursors tiene 4 propiedades (las 4 diercciones)
        this.cursors = this.input.keyboard.createCursorKeys();

        //Añadimos que se pueda con wasd tambien
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);


    }

    update() {

        //Comprueba si esta pulsando la tecla izquierda
        if (this.cursors.left.isDown || this.keyA.isDown) {
            //Entonces aplica velocidad horizontal negativa
            this.player.setVelocityX(-200);

            //Ejecuta la animacion de moverse a la izquierda
            this.player.anims.play('left', true);
            //console.log(this.ball.body.velocity.x)

        }

        //Comprueba si esta pulsando la tecla derecha
        else if (this.cursors.right.isDown || this.keyD.isDown) {
            this.player.setVelocityX(200);

            this.player.anims.play('right', true);
        }


        //Si no esta pulsando nada
        else {
            this.player.setVelocityX(0);
            this.player.anims.play('turn', true);
        }

        //Para saltar. Solo puede si esta tocando el suelo
        if ((this.cursors.up.isDown || this.keyW.isDown) && this.player.body.touching.down) {
            this.player.setVelocityY(-430);
            this.player.anims.play('turn', true);

        }

        //Para evitar que pelota se quede atascada botando en vertical todo el rato
        if (this.ball.body.velocity.x == 0){
            // console.log("Pelota en vertical")
            this.ball.setVelocityX(50) 

        }

    }

    gameRestart(){
      this.scene.restart();
      //console.log(this.gameOver);
      this.gameOver = false

      //Emitimos evento de que se crea una nueva partida para avisar
      nuevaPartida()
    }
  /**
   * Funcion que se ejecuta cuando la pelota toca el suelo
   */
  hitFloor(ball, platform) {
      gameOverEvento(this.score)
      //Reiniciamos tras muerte
      this.gameRestart()
      // this.physics.pause();
  
      //Perder 1 vida? Game over?    
  }
  
}


/**
 * Funcion que se ejecuta cuando el jugador da a la pelota
 */
function hitBall(player, ball){
    //Aumentamos puntuacion
    this.score += 10;
    cambioPuntuacion(this.score)

    this.scoreText.setText('Score: ' + this.score);
    var xVel    // Velocidad nueva de pelota
    var extra   // Lo que se suma a velocidad


    if (this.score % 20 == 0 || this.score % 50 == 0){
        extra = (this.score % 50 == 0) ? 75 : 20 // Aumentamos la velocidad segun si era multiplo (si de los 2, da igual, usamos 50)
        xVel = (this.ball.body.velocity.x > 0) ? this.ball.body.velocity.x + extra : this.ball.body.velocity.x - extra
        this.ball.setVelocityX(xVel) 
        // console.log(this.ball.body.velocity)
    }
}


const config = {
    /* Cambiar configuracion si fuera necesario */
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#CCCCFF', // Para color de fondo

    /* Cambiar nombre Example si fuera necesario */
    scene: Example,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 200 }
        }
    },
    parent: "phaser"
};


/**
 * Funcion que dado el nombre del personaje elegido devuelve el sprite
 * Esta funcion debe ser exclusiva de cada juego, por si el creador decide
 * usar sus propios sprites
 * @param personajeArg 
 */
function getSprite(personajeArg) {
    console.log("EN GETSPRITE " + personajeArg)

    // Lista con los personajes para los cuales este juego tiene sprites
    let personajesSoportados = ["Monarca"]

    if (personajesSoportados.includes(personajeArg)){
        return "/" + personajeArg + ".png"
    }

    // Si el jugador no tiene personaje o este no esta entre los personajes que tienen sprite diseñado
    else {
        return "/Default.png"  
    }
    
}

/**
* Funcion que inicializa el juego y lo devuelve. Tambien realiza otras
* inicializaciones (nombre de personaje, para que se pueda usar aqui
* a la hora de elegir el sprite a usar por ejemplo)
*/
export default function createGame(personajeArg, cambioPuntuacionEvento, nuevaPartidaEvento, gameOverEventoCall) {
    /* Inicializamos el juego */
    let game = new Phaser.Game(config);
    console.log("personajeArg: ", personajeArg)
    
    /* Aqui tambien se puede inicializar el personaje */
    personaje = getSprite(personajeArg)

    /* Inicializamos las funciones que se llamaran para comunicar eventos que ocurran */
    nuevaPartida = nuevaPartidaEvento
    gameOverEvento = gameOverEventoCall
    cambioPuntuacion = cambioPuntuacionEvento

    /* Devolvemos el juego creado */
    return game
}
