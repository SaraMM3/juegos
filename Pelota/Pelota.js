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
        this.primeraPartida = true  // Para saber si debe emitir evento nuevaPartida o no (solo se emite tras nueva partida no inicial, no en la primera)
        this.menu = true // Si esta en menu

        const directAssets = "https://saramm3.github.io/juegos/Pelota/assets"
        const directAssetsPersonajes = "https://saramm3.github.io/juegos/Pelota/assets/personajes"

        // Suelo
        this.load.image('ground', directAssets + '/platform.png');

        // Pelotita
        this.load.image('ball', directAssets + '/ball.png') 
        
        // Boton menu
        this.load.spritesheet('botonJugar', directAssets + '/boton_jugar.png', { frameWidth: 344, frameHeight: 160 });

        // Fotogramas sprite jugador (se usaran para animacion)
        this.load.spritesheet('dude', directAssetsPersonajes + personaje, { frameWidth: 90, frameHeight: 76 });

        // Para movil- Botones de movimiento
        this.load.image('botonIzda', directAssets + '/izquierda.png');
        this.load.image('botonDcha', directAssets + '/derecha.png');
        this.load.image('botonArriba', directAssets + '/arriba.png');

    }

    create() {
        // Para ver si se esta pulsando algo en movil
        this.pulsadoIzda = false
        this.pulsadoDcha = false
        this.pulsadoArriba = false

        // Creamos grupo de plataformas (elem estaticos) con fisica
        this.platforms = this.physics.add.staticGroup();

        // Creamos el suelo, escalado * 2 para que ocupe todo el ancho
        this.platforms.create(400, 568, 'ground').setScale(2).refreshBody()

        // Animaciones boton
        this.anims.create({
            key: 'botonJugarVerde',
            frames: this.anims.generateFrameNumbers('botonJugar', { start: 0, end: 0 }), 
            frameRate: 1,
            repeat: 1
        });

        this.anims.create({
            key: 'botonJugarRosa',
            frames: this.anims.generateFrameNumbers('botonJugar', { start: 1, end: 1 }), 
            frameRate: 1,
            repeat: 1
        });

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

        // Ponemos el menu
        this.crearMenu("De al boton para comenzar a jugar!", true)


        //Añadimos gestor de teclado. Cursors tiene 4 propiedades (las 4 diercciones)
        this.cursors = this.input.keyboard.createCursorKeys();

        //Añadimos que se pueda con wasd tambien
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    }

    update() {

        if (!this.menu){
            //Comprueba si esta pulsando la tecla izquierda
            if (this.cursors.left.isDown || this.keyA.isDown || this.pulsadoIzda) {
                this.player.setVelocityX(-200);
                this.player.anims.play('left', true);
            }

            //Comprueba si esta pulsando la tecla derecha
            else if (this.cursors.right.isDown || this.keyD.isDown || this.pulsadoDcha) {
                this.player.setVelocityX(200);
                this.player.anims.play('right', true);
            }

            //Si no esta pulsando nada
            else {
                this.player.setVelocityX(0);
                this.player.anims.play('turn', true);
            }

            //Para saltar. Solo puede si esta tocando el suelo
            if ((this.cursors.up.isDown || this.keyW.isDown || this.pulsadoArriba) && this.player.body.touching.down) {
                this.player.setVelocityY(-430);
                this.player.anims.play('turn', true);
            }

            //Para evitar que pelota se quede atascada botando en vertical todo el rato
            if (this.ball.body.velocity.x == 0){
                this.ball.setVelocityX(50)
            }            
        }


    }

    gameRestart(){
      this.scene.restart();
      this.gameOver = false
      //Emitimos evento de que se crea una nueva partida para avisar
      nuevaPartida()
    }


  /**
   * Funcion que se ejecuta cuando la pelota toca el suelo
   */
  hitFloor(ball, platform) {
    this.physics.pause();

    this.gameOver = true;

    gameOverEvento(this.score)
  
    //Perder 1 vida? Game over? TODO

    this.crearMenu("Pulse para reiniciar la partida!", false)

  }

    /**
     * Funcion que se ejecuta cuando el jugador da a la pelota
     */
    hitBall(player, ball){
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
        }
    }


    /**
     * Funcion que crea el menu, tanto inicial como el que aparece al perder
     * @param texto Texto del menu
     * @param onClick Funcion a ejecutar al dar a boton
     */
    crearMenu(texto, inicio){
        this.menu = true    // Para saber si estamos en el menu o no
        this.textoMenu = this.add.text(80, 100, texto, { fontSize: '32px', fill: '#000' });

        // Creamos el boton 
        this.botonJugar = this.add.sprite(400, 300, 'botonJugar');  // Nota: Para que el boton este animado, debe ser sprite, no image
        this.botonJugar.setInteractive()

        this.botonJugar.on("pointerover", () => {    // Cuando se hace hover sobre el, se vuelve rosa
            this.botonJugar.anims.play('botonJugarRosa', true);
        })

        this.botonJugar.on("pointerout", () => {    // Cuando se sale del hover sobre el, vuelve a ser verde
            this.botonJugar.anims.play('botonJugarVerde', true);
        })

        // Asignamos eventos al boton creado segun si es el menu inicial o el que se muestra tras gameover
        if (inicio){
            this.botonJugar.on("pointerdown", () => {    // Cuando se hace click en el, comienza la partida 
                this.onClickBotonJugar()
            })

            // Mostramos opcion habilitar movil
            this.botonActivarMovil = this.add.text(80, 150, 'Pulse aqui primero para controles móviles', { fontSize: '25px', fill: '#000' })
            .setInteractive({ useHandCursor: true })             // UseHandCursor hace que se vea la manita tipica de links y demas
            .on('pointerdown', () => {
                this.habilitarControlesMoviles() 
                this.botonActivarMovil.destroy()
            })   // Al pulsar boton, se llama funcion
        }

        // Si era menu tras muerte
        else{
            this.botonJugar.on("pointerdown", () => {    // Cuando se hace click en el, reinicia la partida 
                this.gameRestart()
            })
        }
    }

    habilitarControlesMoviles(){
        // Boton izquierda
        this.botonIzda = this.add.sprite(80, 550, 'botonIzda'); 
        this.botonIzda.setInteractive()
        this.botonIzda.on("pointerdown", () => {  
            if (!this.menu){
                this.pulsadoIzda = true
            }
        })

        this.botonIzda.on("pointerup", () => {
            if (!this.menu){
                this.pulsadoIzda = false
            }
        })


        // Boton derecha
        this.botonDcha = this.add.sprite(160, 550, 'botonDcha'); 
        this.botonDcha.setInteractive()
        this.botonDcha.on("pointerdown", () => {    
            if (!this.menu){
                this.pulsadoDcha = true
            }
        })

        this.botonDcha.on("pointerup", () => {
            if (!this.menu){
                this.pulsadoDcha = false
            }
        })



        // Boton arriba
        this.botonArriba = this.add.sprite(640, 550, 'botonArriba'); 
        this.botonArriba.setInteractive()
        this.botonArriba.on("pointerdown", () => {    
            if (!this.menu){
                this.pulsadoArriba = true
            }
        })

        this.botonArriba.on("pointerup", () => {
            if (!this.menu){
                this.pulsadoArriba = false
            }
        })

    }

    /**
     * Funcion que destruye los elementos del menu
     */
    destruirMenu(){
        this.menu = false
        this.botonJugar.destroy()
        this.textoMenu.destroy()
        if (this.botonActivarMovil)
            this.botonActivarMovil.destroy()
    }


    /**
     * Funcion que se ejecuta al pulsar el boton de jugar
     */
    onClickBotonJugar(){
        this.destruirMenu() // Destruimos el menu

        this.physics.resume()   // Si fisica estaba parada, la reanudamos

        // Si no es la primera partida, avisamos para poder guardarla en el historial
        if (!this.primeraPartida){
			nuevaPartida()
        }

        // Comenzamos la partida
        this.partida()
    }


    partida(){

        // Creamos jugador
        this.player = this.physics.add.sprite(400, 450, 'dude')
        this.player.setBounce(0.2);  //Al aterrizar tras saltar
        this.player.setCollideWorldBounds(true); //Para que colisione con limites del juego (no pueda salir de pantalla)
        this.player.body.setGravityY(300)


        // Creamos pelotita
        // Para que comience desde un sitio aleatorio (en eje x, en y siempre en 0 porque si no no da tiempo llegar)
        var xPos = Phaser.Math.Between(0, 600)
        this.ball = this.physics.add.sprite(xPos, 0, 'ball')

        //Hacemos que inicialmente se acerque al jugador, si no no es justo
        var xVel = (xPos > 400) ? -150 : 150
        this.ball.setVelocityX(xVel);
        this.ball.setCollideWorldBounds(true); //Para que colisione con limites del juego (no pueda salir de pantalla)
        this.ball.setBounce(1); //Hacemos que rebote mucho

        //Añadimos puntuacion
        this.score = 0;
        this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });
        
        //Añadimos colliders para ver si hay colision/superposicion entre jugador y suelo. Asi no atraviesa el suelo
        this.physics.add.collider(this.player, this.platforms);

        //Para haya colision entre pelota y jugador (ver cuando consigue puntos)
        this.physics.add.collider(this.player, this.ball, this.hitBall, null, this);

        //Para cuando pelota toca el suelo (gameover)
        this.physics.add.collider(this.ball, this.platforms, this.hitFloor, null, this)

    }
  
}


const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#CCCCFF', // Para color de fondo
    scale: {
        // Fit to window
        mode: Phaser.Scale.FIT,
        // Center vertically and horizontally
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
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
