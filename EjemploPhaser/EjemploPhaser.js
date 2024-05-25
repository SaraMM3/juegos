var script = document.createElement("script");  // create a script DOM node
script.src = "https://cdnjs.cloudflare.com/ajax/libs/phaser/3.70.0/phaser.min.js";  // set its src to the provided URL

// Variable que guardara el personaje elegido, para poder usar el sprite adecuado
var personaje = ""
// Variables que fuardaran los callbacks de los eventos, para comunicarlos a la plataforma
var cambioPuntuacion
var gameOverEvento
var nuevaPartida

class Example extends Phaser.Scene{

    preload (){
        this.primeraPartida = true  // Para saber si debe emitir evento nuevaPartida o no (solo se emite tras nueva partida no inicial, no en la primera)
        this.menu = true // Si esta en menu

        // En este caso, accedemos a los sprites que estan con codigo plataforma, pero podria no ser el caso
        const directAssets = "https://saramm3.github.io/juegos/EjemploPhaser/assets"
        const directAssetsPersonajes = "https://saramm3.github.io/juegos/assetsPersonajes"

        //Cargar recursos
        this.load.image('sky', directAssets + '/sky.png');
        this.load.image('ground', directAssets + '/platform.png');
        this.load.image('star', directAssets + '/star.png');
        this.load.image('bomb', directAssets + '/bomb.png');

        // Boton menu
        this.load.spritesheet('botonJugar', directAssets + '/boton_jugar.png', { frameWidth: 344, frameHeight: 160 });

        //Fotogramas sprite jugador (se usaran para animacion)
        this.load.spritesheet('player', directAssetsPersonajes + personaje, { frameWidth: 45, frameHeight: 38 });
    }

    create (){
        //Mostramos imagen (cielo)
        this.add.image(400, 300, 'sky');

        //Creamos grupo de plataformas (elem estaticos) con fisica
        this.platforms = this.physics.add.staticGroup();

        //Creamos el suelo, escalado * 2 para que ocupe todo el ancho
        this.platforms.create(400,568, 'ground').setScale(2).refreshBody();

        //Creamos varias plataformas
        this.platforms.create(600, 400, 'ground');
        this.platforms.create(50, 250, 'ground');
        this.platforms.create(750, 220, 'ground');

        //Creamos las animaciones del jugador:
        this.anims.create({
            key: 'left',    //Al ir a la izquierda
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),  //Usa fotogramas 0-3
            frameRate: 6,  //Velocidad en fotogramas/segundo
            repeat: -1  //La animacion debe volver a empezar cuando termine
        });

        this.anims.create({
            key: 'turn',    //Al girar
            frames: this.anims.generateFrameNumbers('player', { start: 4, end: 8 }),
            frameRate: 6,
            repeat: -1  //La animacion debe volver a empezar cuando termine
        });

        this.anims.create({
            key: 'right',   //Al ir a la derecha
            frames: this.anims.generateFrameNumbers('player', { start: 9, end: 12 }),
            frameRate: 6,
            repeat: -1
        });

        // Ponemos el menu. El texto depende de si es la primera partida o no
        if (this.primeraPartida){
            this.crearMenu("De al boton para comenzar a jugar!")
        }
        else{
            this.crearMenu("Puntuación: " + this.score + ". De al boton para volver a jugar!")
        }

        //Añadimos gestor de teclado. Cursors tiene 4 propiedades (las 4 diercciones)
        this.cursors = this.input.keyboard.createCursorKeys();

        //Añadimos que se pueda con wasd tambien
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);

    } 

    update (){   

        if (!this.menu){
            //Comprueba si esta pulsando la tecla izquierda
            if (this.cursors.left.isDown || this.keyA.isDown){
                this.player.setVelocityX(-160); //Entonces aplica velocidad horizontal negativa
                this.player.anims.play('left', true);   //Ejecuta la animacion de moverse a la izquierda
            }

            //Comprueba si esta pulsando la tecla derecha
            else if (this.cursors.right.isDown || this.keyD.isDown){
                this.player.setVelocityX(160);
                this.player.anims.play('right', true);
            }

            //Si no esta pulsando nada
            else{
                this.player.setVelocityX(0);
                this.player.anims.play('turn', true);
            }

            //Para saltar. Solo puede si esta tocando el suelo
            if ( (this.cursors.up.isDown || this.keyW.isDown ) && this.player.body.touching.down){
                this.player.setVelocityY(-430);
                this.player.anims.play('turn', true);
            }  

        }
      
    }

    //Funciones para boton, segun la interaccion con el usuario (si hover, pulsa, ...)
    pulsarBotonPausa(){
        this.botonPausa.setStyle({ fill: '#BF2707'});
        this.game.isPaused = !this.game.isPaused    //Cambio entre pausado y no pausado
    }

    hoverBotonPausa(){
        this.botonPausa.setStyle({ fill: '#ff0'});
    }

    restBotonPausa(){
        this.botonPausa.setStyle({ fill: '#000'});
    }


    gameRestart(){
        this.scene.restart();
        this.gameOver = false

        //Emitimos evento de que se crea una nueva partida para avisar
        nuevaPartida()
    }


    //Cuando se recoge una estrella, se desactiva y desaparece (se elimina de la pantalla)
    collectStar (player, star){
        star.disableBody(true, true);

        //Aumentamos puntuacion
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);
        
        //Emitimos evento de cambio de puntuacion
        cambioPuntuacion(this.score)

        //Al recoger todas las estrellas
        if (this.stars.countActive(true) === 0) {
            this.stars.children.iterate(function (child) {
                //Se reactivan las estrellas para seguir jugando
                child.enableBody(true, child.x, 0, true, true);
            });

            //Spawn bomba (en lado opuesto del jugador, para darle una oportunidad)
            var x = (this.player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

            var bomb = this.bombs.create(x, 16, 'bomb');
            bomb.setBounce(1);
            bomb.setCollideWorldBounds(true);
            bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        }
        
    }


    //Cuando le da una bomba al jugador, ocurre game over
    hitBomb (player, bomb){
        this.physics.pause();
    
        player.setTint(0xff0000);
        player.anims.play('turn');

        // Destruimos sprites???
        this.gameOver = true;
        
        //Tras game over: Se emite evento game over
        gameOverEvento(this.score)

        this.gameRestart()
    };

    

    // Añadido al crear menu
    crearMenu(texto){
        this.menu = true    // Para saber si estamos en el menu o no
        this.textoMenu = this.add.text(80, 100, texto, { fontSize: '32px', fill: '#000' });

        // Creamos el boton 
        this.botonJugar = this.add.sprite(400, 300, 'botonJugar');  // Nota: Para que el boton este animado, debe ser sprite, no image
        this.botonJugar.setInteractive()

        // Asignamos eventos al boton creado
        this.botonJugar.on("pointerdown", () => {    // Cuando se hace click en el, comienza la partida 
            this.onClickBotonJugar()
        })

        this.botonJugar.on("pointerover", () => {    // Cuando se hace hover sobre el, se vuelve rosa
            this.botonJugar.anims.play('botonJugarRosa', true);
        })

        this.botonJugar.on("pointerout", () => {    // Cuando se sale del hover sobre el, vuelve a ser verde
            this.botonJugar.anims.play('botonJugarVerde', true);
        })
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


    /**
     * Funcion que destruye los elementos del menu
     */
    destruirMenu(){
        this.menu = false
        this.botonJugar.destroy()
        this.textoMenu.destroy()
    }

    partida(){
        this.primeraPartida = false

        //Creamos estrellas a recoger
        this.stars = this.physics.add.group({
            key: 'star',    //Clave de textura
            repeat: 11,     //Al repetir 11 veces, obtenemos 12 elementos
            setXY: { x: 12, y: 0, stepX: 70 }   //Establecer posicion de los 12 elementos
        });

        //Creamos sprite jugador
        this.player = this.physics.add.sprite(100, 450, 'player')
        this.player.setBounce(0.2);  //Al aterrizar tras saltar
        this.player.setCollideWorldBounds(true); //Para que colisione con limites del juego (no pueda salir de pantalla)
        this.player.body.setGravityY(300)

        this.stars.children.iterate(function (child) {
            //Para que reboten un numero aleatorio entre los dados
            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        });

        //Collider para que no se caigan del mundo
        this.physics.add.collider(this.stars, this.platforms);

        //Comprobar si el personaje se superpone con alguna (las recoge)
        //Entonces, ejecuta la funcion collectStar (presente mas abajo)
        this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this);

        //Añadimos puntuacion
        this.score = 0;
        this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });
    
        //Añadimos enemigos (bombas)
        this.bombs = this.physics.add.group();
        this.physics.add.collider(this.bombs, this.platforms);
        this.physics.add.collider(this.player, this.bombs, this.hitBomb, null, this);
    
                
        //Añadimos colliders para ver si hay colision/superposicion entre jugador y suelo. Asi no atraviesa el suelo
        this.physics.add.collider(this.player, this.platforms);


        //Creamos boton de pausa
        this.botonPausa = this.add.text(720, 10, 'PAUSA', { fill: '#000' })
        .setInteractive({ useHandCursor: true })             // UseHandCursor hace que se vea la manita tipica de links y demas
        .on('pointerdown', () => this.pulsarBotonPausa() )   // Al pulsar boton, se llama funcion (definida fuera de create)
        .on('pointerover', () => this.hoverBotonPausa() )    // Al hover sobre boton
        .on('pointerout', () => this.restBotonPausa() )      // Al sacar el raton de encima del boton
        .on('pointerup', () => this.hoverBotonPausa() )      // Al dejar de pulsar boton (al soltar)

    }

}


const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: Example,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 200 }
        }
    },
    parent: "phaser",

};

/**
 * Funcion que dado el nombre del personaje elegido devuelve el sprite
 * Esta funcion debe ser exclusiva de cada juego, por si el creador decide
 * usar sus propios sprites
 * @param personajeArg 
 */
function getSprite(personajeArg) {

    // Lista con los personajes para los cuales este juego tiene sprites
    let personajesSoportados = ["Monarca", "Artista"]

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
        // Inicializamos el juego
        let game =  new Phaser.Game(config);

        // Obtenemos el nombre del personaje elegido (tener en cuenta que puede no haberse elegido ninguno)
        personaje = getSprite(personajeArg)

        //Inicializamos las funciones que se llamaran para comunicar eventos que ocurran
        cambioPuntuacion = cambioPuntuacionEvento
        nuevaPartida = nuevaPartidaEvento
        gameOverEvento = gameOverEventoCall
        
        return game
    }
