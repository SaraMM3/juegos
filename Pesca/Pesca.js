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
        this.primeraPartida = true  // Para saber si debe emitir evento nuevaPartida o no (solo se emite tras nueva partida no inicial, no en la primera)
        this.menu = true // Si esta en menu
        const directAssets = "https://saramm3.github.io/juegos/Pesca/assets"
        const directAssetsPersonajes = "https://saramm3.github.io/juegos/assetsPersonajes"

        this.load.image('ground', directAssets + '/platform.png');
        this.load.image('MarCapa1', directAssets + '/bg_mar1.png')
        this.load.image('MarCapa2', directAssets + '/bg_mar2.png')
        this.load.image('Arenabg', directAssets + '/bg_arena.png')

        // Boton menu
        this.load.spritesheet('botonJugar',
            directAssets + '/boton_jugar.png',
            { frameWidth: 344, frameHeight: 160 }
        );

        //Fotogramas sprite jugador (se usaran para animacion)
        this.load.spritesheet('player',
            directAssetsPersonajes + personaje,
            { frameWidth: 45, frameHeight: 38 }
        );

        //Fotogramas sprites peces
        this.load.spritesheet('pezRosa',
            directAssets + "/pez_comun_rosa.png",
            { frameWidth: 26, frameHeight: 20 }
        );

        this.load.spritesheet('pezAzul',
            directAssets + "/pez_comun_azul.png",
            { frameWidth: 26, frameHeight: 20 }
        );

        this.load.spritesheet('pezRaro',
            directAssets + "/pez_raro_dorado.png",
            { frameWidth: 26, frameHeight: 20 }
        );

        // Este no tiene animaciones, solo rebota
        this.load.image('pezGlobo', directAssets + '/pez_globo.png');

    }

    create() {
        //Mostramos imagen (mar)
        this.marCapa1 = this.add.tileSprite(400, 300, 800, 600, 'MarCapa1')
        this.marCapa2 = this.add.tileSprite(400, 300, 800, 600, 'MarCapa2')
        this.Arenabg = this.add.tileSprite(400, 300, 800, 600, 'Arenabg')

        //Creamos grupo de plataformas (elem estaticos) con fisica
        this.platforms = this.physics.add.staticGroup();

        //Creamos el suelo
        this.platforms.create(400, 585, 'ground').refreshBody()

        // Inicializamos las animaciones aparte para que no ocupe tanto espacio aqui
        this.animInit()

        //Añadimos gestor de teclado. Cursors tiene 4 propiedades (las 4 diercciones)
        this.cursors = this.input.keyboard.createCursorKeys();

        //Añadimos que se pueda con wasd tambien
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);

        // Ponemos el menu
        this.crearMenu("De al boton para comenzar a jugar!")

    }

    
    update() {

        this.marCapa1.tilePositionX += 0.3
        this.marCapa2.tilePositionX += 0.6

        // Si no estamos en menu, podemos movernos
        if (!this.menu){

            //Comprueba si esta pulsando la tecla izquierda
            if (this.cursors.left.isDown || this.keyA.isDown) {
                //Entonces aplica velocidad horizontal negativa
                this.player.setVelocityX(-200);

                //Ejecuta la animacion de moverse a la izquierda
                this.player.anims.play('playerLeft', true);

            }

            //Comprueba si esta pulsando la tecla derecha
            else if (this.cursors.right.isDown || this.keyD.isDown) {
                this.player.setVelocityX(200);
                this.player.anims.play('playerRight', true);

            }

            //Si no esta pulsando derecha o izquierda
            else {
                this.player.setVelocityX(0);
                this.player.anims.play('playerTurn', true);
            }

            //Para saltar, o en este caso, nadar hacia arriba
            if (this.cursors.up.isDown || this.keyW.isDown) {
                this.player.setVelocityY(-200);
            }

            //Para bajar mas rapido. Solo puede si esta tocando el suelo: Ahora puede siempre
            if (this.cursors.down.isDown || this.keyS.isDown) {
                this.player.setVelocityY(200);
            }
        }

    }


    /**
     * Funcion que se ejecuta cada cierto tiempo y determina que peces apareceran
     */
    eventoTempSpawnPez(repetir){

        //Generamos un numero para determinar que peces hacen spawn
        var numAleat = Phaser.Math.Between(0,100)

        // Cuando repetir es true, generamos el doble de peces cada vez
        var repeticiones = repetir ? 2 : 1

        for (let i = 0; i < repeticiones; i++ ){
            if (numAleat < 30){
            this.spawnPez("pezRosa")
            }

            else if (numAleat < 60){
                this.spawnPez("pezAzul")
            }

            else if (numAleat < 70){
                this.spawnPez("pezRaro")
            }

            else if (numAleat < 85){
                this.spawnPez("pezGlobo")
            }

            else if (numAleat < 95){
                this.spawnPez("pezRosa")
                this.spawnPez("pezAzul")        
            }

            else if (numAleat < 98){
                this.spawnPez("pezGlobo")
                this.spawnPez("pezGlobo")
                this.spawnPez("pezRaro")

            }

            else{
                this.spawnPez("pezRaro")
                this.spawnPez("pezRaro")
                this.spawnPez("pezRaro")
            }
        }
    }

    /**
     * Funcion que crea el menu
     */
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
     * Funcion que destruye los elementos del menu
     */
    destruirMenu(){
        this.menu = false
        this.botonJugar.destroy()
        this.textoMenu.destroy()
    }

    /**
     * Funcion que se ejecuta al pulsar el boton de jugar
     */
    onClickBotonJugar(){
        // Destruimos el menu
        this.destruirMenu()

        // Si fisica estaba parada
        this.physics.resume()

        // Si no es la primera partida, avisamos para poder guardarla en el historial
        if (!this.primeraPartida){
			nuevaPartida()
        }

        // Comenzamos la partida
        this.partida()
    }

    /**
     * Codigo de la partida en si
     */
    partida(){
        this.primeraPartida = false
        //Tiempo de partida
        this.tiempo = 10

        //Creamos sprite jugador
        this.player = this.physics.add.sprite(100, 450, 'player')
        this.player.setCollideWorldBounds(true); //Para que colisione con limites del juego (no pueda salir de pantalla)
        this.player.body.setGravityY(10)

        
        //Añadimos puntuacion
        this.score = 0;
        this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });
        this.timeLeft = this.add.text(300, 16, 'Tiempo: '+this.tiempo + ' s', { fontSize: '32px', fill: '#000' });
        
        //Añadimos colliders para ver si hay colision/superposicion entre jugador y suelo (asi no lo atraviesa)
        this.physics.add.collider(this.player, this.platforms);

        // Temporizador para ver cuando acaba la partida y que controla cuando aparecen peces. Se actualiza cada segundo
        this.actualizarTiempoJuego()

        // Hacemos que empiecen a aparecer peces
        this.eventoTempSpawnPez()

    }

    /**
     * Funcion que se encarga de crear el tipo de pez indicado
     */
    spawnPez(tipo){

        var ladoSpawn = Phaser.Math.Between(0,1)    // En que lado de la pantalla hace spawn, 0 izda 1 dcha
        var posY = Phaser.Math.Between(30, 550)     // Cuidado con el suelo, que no aparezca debajo
        var posX
        var velX = Phaser.Math.Between(50, 200)
        var animacion // Para saber si la animacion mira hacia la dcha o izda

        // Si aparece en la izquierda (posX = 0), debe moverse a la derecha
        if (ladoSpawn == 0){
            posX = 0

            if (tipo != "pezGlobo"){
                animacion = tipo + "Right"
            }

        }
        
        // Si aparece en la derecha (posX = maxWidth), debe moverse a la izquierda
        else{
            posX = 800
            velX *=(-1) //Para que vaya en la otra direccion
            if (tipo != "pezGlobo"){
                animacion = tipo + "Left"
            }
        }

        this.nuevoPez = this.physics.add.sprite(posX, posY, tipo)
        
        //El pez globo es diferente, si tiene gravedad, rebota y no tiene animacion
        if (tipo != "pezGlobo"){
            this.nuevoPez.body.setAllowGravity(false);
            this.nuevoPez.anims.play(animacion, true)
            this.nuevoPez.setImmovable(true)
        }
        else{
            this.physics.add.collider(this.nuevoPez, this.platforms);
            this.nuevoPez.setBounce(1)
        }

        this.nuevoPez.setVelocityX(velX);
        this.physics.add.overlap(this.player, this.nuevoPez, collectFish, null, this)
    }


    /**
     * Inicializacion de las animaciones
     */
    animInit(){

        //Creamos las animaciones del jugador:
        this.anims.create({
            key: 'playerLeft',    //Al ir a la izquierda
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),  //Usa fotogramas 0-3
            frameRate: 6,
            repeat: -1
        });

        this.anims.create({
            key: 'playerTurn',    //Al girar
            frames: this.anims.generateFrameNumbers('player', { start: 4, end: 8 }),
            frameRate: 6,
            repeat: -1

        });

        this.anims.create({
            key: 'playerRight',   //Al ir a la derecha
            frames: this.anims.generateFrameNumbers('player', { start: 9, end: 12 }),
            frameRate: 6,
            repeat: -1
        });


        //Animaciones peces
        this.anims.create({
            key: 'pezRosaRight',   //Al ir a la derecha
            frames: this.anims.generateFrameNumbers('pezRosa', { start: 0, end: 1 }),
            frameRate: 6,
            repeat: -1
        });
        this.anims.create({
            key: 'pezRosaLeft',    //Al ir a la izquierda
            frames: this.anims.generateFrameNumbers('pezRosa', { start: 2, end: 3 }),
            frameRate: 6, 
            repeat: -1
        });

        this.anims.create({
            key: 'pezAzulRight',   //Al ir a la derecha
            frames: this.anims.generateFrameNumbers('pezAzul', { start: 0, end: 1 }),
            frameRate: 6,
            repeat: -1
        });
        this.anims.create({
            key: 'pezAzulLeft',    //Al ir a la izquierda
            frames: this.anims.generateFrameNumbers('pezAzul', { start: 2, end: 3 }),
            frameRate: 6,
            repeat: -1  
        });

        this.anims.create({
            key: 'pezRaroRight',   //Al ir a la derecha
            frames: this.anims.generateFrameNumbers('pezRaro', { start: 0, end: 5 }),
            frameRate: 6,
            repeat: -1
        });
        this.anims.create({
            key: 'pezRaroLeft',    //Al ir a la izquierda
            frames: this.anims.generateFrameNumbers('pezRaro', { start: 6, end: 11 }), 
            frameRate: 6,
            repeat: -1
        });

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
    }

    /**
     * Funcion que se ejecuta cuando se acaba el tiempo y por lo tanto la partida.
     */
    actualizarTiempoJuego() {

        // Se llama cada segundo, asi que actualizamos el contador
        this.tiempo -= 1
        //Actualizamos el temporizador visible
        this.timeLeft.setText(`Tiempo: ${this.tiempo} s`)

        // Cuando el contador llega a 0
        if (this.tiempo <= 0){

            this.finTiempo()
        }

        else{
            // Volvemos a hacer que se llame (si no se ha acabado el tiempo, si no el temporizador se vuelve negativo))
            
            this.eventoTemporizadorJuego = this.time.delayedCall(1000, this.actualizarTiempoJuego, [], this)
            
            var repetir = (this.tiempo < 15) ? true : false   //Si se crean el doble de peces

            if (this.tiempo >=2){   // Si no ponemos >=2, habra peces que no se limpiaran al acabar la partida. Ademas de que no tiene sentido tan cerca del final invocar peces
                // Hacemos que se vuelva a llamar a que aparezcan peces
                this.timedEvent = this.time.delayedCall(1000, this.eventoTempSpawnPez, [repetir], this)
            }
        }
    }

    /**
     * Funcion que se ejecuta cuando se acaba el tiempo
     */
    finTiempo(){

        // Paramos la fisica
        this.physics.pause();

        // Elementos a eliminar
        let spritesReset = ["pezRosa", "pezAzul", "pezRaro", "player", "pezGlobo", null]

        // Destruimos todos los sprites para volver a iniciar
        let allSprites = this.children.list.filter(x => x instanceof Phaser.GameObjects.Sprite && spritesReset.includes(x.texture.key));
        let debug = []
        this.children.forEach( x => {
            debug.push(x.texture.key)
        });
        console.log("debug: " + debug)
	    console.log(allSprites)
	    console.log(this.children.list)
	    console.log(this.children.list[0].texture)
        allSprites.forEach(x =>{ x.destroy() 
			       console.log("Destruyendo " + x)} );

        // Quitamos el texto anterior
        this.scoreText.destroy()
        this.timeLeft.destroy()

        // Mostramos el menu de nuevo
        this.crearMenu("Fin de la partida! Puntuacion: " + this.score)

        // Emitimos gameover
		gameOverEvento(this.score)
    }

}

// Las puntuaciones que da cada pez
const puntuaciones={
    "pezRosa": 10,
    "pezAzul": 10,
    "pezRaro": 50,
    "pezGlobo": -20,
}


/**
 * Funcion al recoger pez
 */
function collectFish(player, pez){
    pez.disableBody(true, true)

    // Añadimos/quitamos puntuacion en funcion de pez
    this.score += puntuaciones[pez.texture.key]
    this.scoreText.setText('Score: ' + this.score);

    cambioPuntuacion(this.score)
}



const config = {
    /* Cambiar configuracion si fuera necesario */
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#90a5e6',
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
    /* Inicializamos el juego */
    let game = new Phaser.Game(config);
    
    /* Aqui tambien se puede inicializar el personaje */
    personaje = getSprite(personajeArg)

    /* Inicializamos las funciones que se llamaran para comunicar eventos que ocurran */
    nuevaPartida = nuevaPartidaEvento
    gameOverEvento = gameOverEventoCall
    cambioPuntuacion = cambioPuntuacionEvento

    /* Devolvemos el juego creado */
    return game
}


/* EJEMPLOS DE EMISION DE EVENTOS
La funcion createGame recibe por parametros las funciones de callback que a usar para
comunicar los eventos cuando ocurran. Para ello, basta con ejecutarlas como se muestra
a continuacion, siendo this.score un ejemplo de nombre para la puntuacion del usuario:

*******************************************
    //Emitimos evento de cambio de puntuacion
    cambioPuntuacion(this.score)

*******************************************
    //Emitimos evento de que se crea una nueva partida para avisar
    nuevaPartida()

*******************************************
    //Tras game over: Se emite evento game over
    gameOverEvento(this.score)

*******************************************/
