// Esto parece prevenir un error de importacion que sucede a veces
var script = document.createElement("script"); 
script.src = "https://cdnjs.cloudflare.com/ajax/libs/phaser/3.70.0/phaser.min.js";

/* Variables para guardar funciones callback eventos y el personaje elegido por el usuario si ha elegido algo*/
var cambioPuntuacion
var gameOverEvento
var nuevaPartida
var personaje

var spritesABorrar = [] // Lista de objetos a borrar al finalizar la partida, para limpiar de frente a una nueva ejecucion

/* Se puede cambiar nombre Example (si es coherente con el especificado en config posteriormente)*/
class Example extends Phaser.Scene {
    preload() {
        this.primeraPartida = true  // Para saber si debe emitir evento nuevaPartida o no (solo se emite tras nueva partida no inicial, no en la primera)
        this.menu = true // Si esta en menu

        const directAssets = "https://saramm3.github.io/juegos/Pesca/assets"
        const directAssetsPersonajes = "https://saramm3.github.io/juegos/assetsPersonajes"

        // Cargamos fondo
        this.load.image('ground', directAssets + '/platform.png');
        this.load.image('MarCapa1', directAssets + '/bg_mar1.png')
        this.load.image('MarCapa2', directAssets + '/bg_mar2.png')
        this.load.image('Arenabg', directAssets + '/bg_arena.png')

        // Boton menu
        this.load.spritesheet('botonJugar', directAssets + '/boton_jugar.png', { frameWidth: 344, frameHeight: 160 });

        // Fotogramas sprite jugador (se usaran para animacion)
        this.load.spritesheet('player', directAssetsPersonajes + personaje, { frameWidth: 45, frameHeight: 38 });

        // Fotogramas sprites peces
        this.load.spritesheet('pezRosa', directAssets + "/pez_comun_rosa.png", { frameWidth: 26, frameHeight: 20 });
        this.load.spritesheet('pezAzul', directAssets + "/pez_comun_azul.png", { frameWidth: 26, frameHeight: 20 });
        this.load.spritesheet('pezRaro', directAssets + "/pez_raro_dorado.png", { frameWidth: 26, frameHeight: 20 });
        this.load.image('pezGlobo', directAssets + '/pez_globo.png'); // Este no tiene animaciones, solo rebota

        // Para movil- Botones de movimiento
        this.load.image('botonIzda', directAssets + '/izquierda.png');
        this.load.image('botonDcha', directAssets + '/derecha.png');
        this.load.image('botonArriba', directAssets + '/arriba.png');
        this.load.image('botonAbajo', directAssets + '/abajo.png');

    }

    create() {
        // Para ver si se esta pulsando algo en movil
        this.pulsadoIzda = false
        this.pulsadoDcha = false
        this.pulsadoArriba = false
        this.pulsadoAbajo = false

        // Mostramos fondo
        this.marCapa1 = this.add.tileSprite(400, 300, 800, 600, 'MarCapa1')
        this.marCapa2 = this.add.tileSprite(400, 300, 800, 600, 'MarCapa2')
        this.Arenabg = this.add.tileSprite(400, 300, 800, 600, 'Arenabg')

        // Creamos grupo de plataformas (elem estaticos) con fisica
        this.platforms = this.physics.add.staticGroup();

        // Creamos el suelo
        this.platforms.create(400, 585, 'ground').refreshBody()

        // Inicializamos las animaciones aparte para que no ocupe tanto espacio aqui
        this.animInit()

        // Añadimos gestor de teclado. Cursors tiene 4 propiedades (las 4 diercciones)
        this.cursors = this.input.keyboard.createCursorKeys();

        // Añadimos que se pueda con wasd tambien
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);

        // Ponemos el menu
        this.crearMenu("De al boton para comenzar a jugar!")
    }

    
    update() {
        // Hacemos que olas del fondo se vayan moviendo
        this.marCapa1.tilePositionX += 0.3
        this.marCapa2.tilePositionX += 0.6

        // Si no estamos en menu, podemos movernos
        if (!this.menu){

            // Comprueba si esta pulsando la tecla izquierda
            if (this.cursors.left.isDown || this.keyA.isDown || this.pulsadoIzda) {
                this.player.setVelocityX(-200); //Entonces aplica velocidad horizontal negativa (hacia izda)
                this.player.anims.play('playerLeft', true); //Ejecuta la animacion de moverse a la izquierda
            }

            //Comprueba si esta pulsando la tecla derecha
            else if (this.cursors.right.isDown || this.keyD.isDown || this.pulsadoDcha) {
                this.player.setVelocityX(200);
                this.player.anims.play('playerRight', true);
            }

            //Si no esta pulsando derecha o izquierda
            else {
                this.player.setVelocityX(0);
                this.player.anims.play('playerTurn', true);
            }

            //Para saltar, o en este caso, nadar hacia arriba
            if (this.cursors.up.isDown || this.keyW.isDown || this.pulsadoArriba) {
                this.player.setVelocityY(-200);
            }

            //Para bajar mas rapido
            if (this.cursors.down.isDown || this.keyS.isDown || this.pulsadoAbajo) {
                this.player.setVelocityY(200);
            }
        }

    }


    /**
     * Funcion que se debe llamar cada cierto tiempo y determina que peces apareceran
     */
    eventoTempSpawnPez(repetir){

        //Generamos un numero para determinar que tipo de peces hacen spawn
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
        
        // Mostramos opcion habilitar movil (solo en la primera partida)
        if (this.primeraPartida){
            this.botonActivarMovil = this.add.text(80, 150, 'Pulse aqui primero para controles móviles', { fontSize: '25px', fill: '#000' })
            .setInteractive({ useHandCursor: true })             // UseHandCursor hace que se vea la manita tipica de links y demas
            .on('pointerdown', () => {
                this.habilitarControlesMoviles() 
                this.botonActivarMovil.destroy()
            })   // Al pulsar boton, se llama funcion
        }
    }

    habilitarControlesMoviles(){
        this.input.addPointer(1);

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

        this.botonIzda.on("pointerout", () => {
            if (!this.menu){
                this.pulsadoIzda = false
            }
        })


        // Boton derecha
        this.botonDcha = this.add.sprite(200, 550, 'botonDcha'); 
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

        this.botonDcha.on("pointerout", () => {
            if (!this.menu){
                this.pulsadoDcha = false
            }
        })


        // Boton arriba
        this.botonArriba = this.add.sprite(600, 550, 'botonArriba'); 
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

        this.botonArriba.on("pointerout", () => {
            if (!this.menu){
                this.pulsadoArriba = false
            }
        })


        // Boton abajo
        this.botonAbajo = this.add.sprite(720, 550, 'botonAbajo'); 
        this.botonAbajo.setInteractive()
        this.botonAbajo.on("pointerdown", () => {    
            if (!this.menu){
                this.pulsadoAbajo = true
            }
        })

        this.botonAbajo.on("pointerup", () => {
            if (!this.menu){
                this.pulsadoAbajo = false
            }
        })

        this.botonAbajo.on("pointerout", () => {
            if (!this.menu){
                this.pulsadoAbajo = false
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


    /**
     * Codigo de la partida en si
     */
    partida(){
        this.primeraPartida = false
        this.tiempo = 60    //Tiempo de partida

        // Creamos sprite jugador
        this.player = this.physics.add.sprite(100, 450, 'player')
        this.player.setCollideWorldBounds(true); //Para que colisione con limites del juego (no pueda salir de pantalla)
        this.player.body.setGravityY(10)

        // Ponemos sprite en lista objetos a borrar al acabar
        spritesABorrar.push(this.player)
        
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

        spritesABorrar.push(this.nuevoPez)
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
     * Funcion que se ejecuta cada segundo y por ello, detecta cuando se acaba el tiempo y por lo tanto la partida.
     */
    actualizarTiempoJuego() {

        this.tiempo -= 1    // Se llama cada segundo, asi que actualizamos el tiempo de partida
        this.timeLeft.setText(`Tiempo: ${this.tiempo} s`)   //Actualizamos el temporizador visible

        // Cuando el contador llega a 0
        if (this.tiempo <= 0){
            this.finTiempo()
        }

        // Volvemos a hacer que se llame esta funcion (si no se ha acabado el tiempo, si no el temporizador se vuelve negativo))
        else{   
            this.eventoTemporizadorJuego = this.time.delayedCall(1000, this.actualizarTiempoJuego, [], this)
            
            var repetir = (this.tiempo < 15) ? true : false   //Si se crean el doble de peces

            if (this.tiempo >=2){   // Si no ponemos >=2, habra peces que no se limpiaran al acabar la partida. Ademas de que no tiene sentido tan cerca del final invocar peces
                this.timedEvent = this.time.delayedCall(1000, this.eventoTempSpawnPez, [repetir], this) // Hacemos que se vuelva a llamar a que aparezcan peces
            }
        }
    }


    /**
     * Funcion que se ejecuta cuando se acaba el tiempo de partida
     */
    finTiempo(){
        // Paramos la fisica
        this.physics.pause();

        // Destruimos todos los sprites para volver a iniciar. Despues, vaciamos la lista de sprites
        spritesABorrar.forEach( x => { x.destroy() });
        spritesABorrar = []

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
    pez.disableBody(true, true) // Al recoger un pez, desaparece

    // Añadimos/quitamos puntuacion en funcion de pez
    this.score += puntuaciones[pez.texture.key]
    this.scoreText.setText('Score: ' + this.score);

    cambioPuntuacion(this.score)    // Emitimos evento de cambio de puntuacion
}


const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#90a5e6',
    scale: {
        mode: Phaser.Scale.FIT, // Ajustar a tam ventana
        autoCenter: Phaser.Scale.CENTER_BOTH    // Centrar en horiz y vert
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
 * Funcion que dado el nombre del personaje elegido devuelve su sprite
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

