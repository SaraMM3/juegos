
/* Variables para guardar funciones callback eventos y el personaje elegido por el usuario si ha elegido algo*/
var cambioPuntuacion
var gameOverEvento
var nuevaPartida
var personaje = ""

const ingredientes = ["tomate", "queso", "pepperoni", "aceituna", "pez", "bacon"]
const xObjetivo = 400
const yObjetivo = 50
const puntuacionVictoria = 15

var spritesABorrar = []   // Para poder borrarlos cuando haga falta

/* Se puede cambiar nombre Example (si es coherente con el especificado en config posteriormente)*/
class Example extends Phaser.Scene {
    preload() {
        this.primeraPartida = true  // Para saber si debe emitir evento nuevaPartida o no (solo se emite tras nueva partida no inicial, no en la primera)
        this.menu = true // Si esta en menu
        this.gameOver = false

        const directAssets = "https://saramm3.github.io/juegos/Michipizzeria/assets"
        const directAssetsPersonajes = "https://saramm3.github.io/juegos/assetsPersonajes"

        //Cargar recursos
        this.load.image('cocina', directAssets + '/cocina.png');
        this.load.image('ground', directAssets + '/platform.png');

        // Boton menu
        this.load.spritesheet('botonJugar', directAssets + '/boton_jugar.png', { frameWidth: 344, frameHeight: 160 });

        // Fotogramas sprite jugador 1
        this.load.spritesheet('j1', directAssetsPersonajes + personaje, { frameWidth: 45, frameHeight: 38 });
        // Fotogramas sprite jugador 2
        this.load.spritesheet('j2', directAssetsPersonajes + '/Marron.png', { frameWidth: 45, frameHeight: 38 });

        //Ingredientes
        for (let ingr of ingredientes){
            this.load.image(ingr, directAssets + '/' + ingr + '.png');
            this.load.image(ingr + 'Grande', directAssets + '/' + ingr + 'Grande.png');
        }


    }

    create() {
        //Mostramos imagen (cielo)
        this.add.image(400, 300, 'cocina');

        // Creamos grupo de plataformas (elem estaticos) con fisica
        this.platforms = this.physics.add.staticGroup();

        // Creamos el suelo, escalado * 2 para que ocupe todo el ancho
        this.platforms.create(400, 568, 'ground').setScale(2).refreshBody()

        //Creamos varias plataformas
        this.platforms.create(400, 250, 'ground').setScale(0.65).refreshBody();
        this.platforms.create(0, 375, 'ground').setScale(0.65).refreshBody();
        this.platforms.create(780, 375, 'ground').setScale(0.65).refreshBody();
        
        
        this.animInit()

        // Ponemos el menu
        this.crearMenu("Bienvenidos a la Michipizzeria!", true)


        //Añadimos gestor de teclado. Cursors tiene 4 propiedades (las 4 diercciones)
        this.cursors = this.input.keyboard.createCursorKeys();

        //Añadimos que se pueda wasd tambien
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);

    }

    update() {

        if (!this.menu){

            // Comprobamos movimientos j1
            if (this.keyA.isDown){
                this.j1.setVelocityX(-160); //Entonces aplica velocidad horizontal negativa
                this.j1.anims.play('j1Left', true);   //Ejecuta la animacion de moverse a la izquierda
            }

            //Comprueba si esta pulsando la tecla derecha
            else if (this.keyD.isDown){
                this.j1.setVelocityX(160);
                this.j1.anims.play('j1Right', true);
            }

            //Si no esta pulsando nada
            else{
                this.j1.setVelocityX(0);
                this.j1.anims.play('j1Turn', true);
            }

            //Para saltar. Solo puede si esta tocando el suelo
            if (this.keyW.isDown && this.j1.body.touching.down){
                this.j1.setVelocityY(-430);
                this.j1.anims.play('j1Turn', true);
            }  



            // Comprobamos movimientos j2
            if (this.cursors.left.isDown){
                this.j2.setVelocityX(-160); //Entonces aplica velocidad horizontal negativa
                this.j2.anims.play('j2Left', true);   //Ejecuta la animacion de moverse a la izquierda
            }

            //Comprueba si esta pulsando la tecla derecha
            else if (this.cursors.right.isDown){
                this.j2.setVelocityX(160);
                this.j2.anims.play('j2Right', true);
            }

            //Si no esta pulsando nada
            else{
                this.j2.setVelocityX(0);
                this.j2.anims.play('j2Turn', true);
            }

            //Para saltar. Solo puede si esta tocando el suelo
            if (this.cursors.up.isDown && this.j2.body.touching.down){
                this.j2.setVelocityY(-430);
                this.j2.anims.play('j2Turn', true);
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

        }

        // Si era menu tras muerte
        else{
            this.botonJugar.on("pointerdown", () => {    // Cuando se hace click en el, reinicia la partida 
                this.gameRestart()
            })
        }
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
        // Creamos jugador1
        this.j1 = this.physics.add.sprite(100, 450, 'j1')
        this.j1.setBounce(0.2);  //Al aterrizar tras saltar
        this.j1.setCollideWorldBounds(true); //Para que colisione con limites del juego (no pueda salir de pantalla)
        this.j1.body.setGravityY(300)
        this.j1.depth = 5   // Para que no aparezca detras de ingrediente objetivo
        // spritesABorrar.push(this.j1)


        // Creamos jugador2
        this.j2 = this.physics.add.sprite(700, 450, 'j2')
        this.j2.setBounce(0.2);  //Al aterrizar tras saltar
        this.j2.setCollideWorldBounds(true); //Para que colisione con limites del juego (no pueda salir de pantalla)
        this.j2.body.setGravityY(300)
        this.j2.depth = 5   // Para que no aparezca detras de ingrediente objetivo
        // spritesABorrar.push(this.j2)


        //Añadimos colliders para ver si hay colision/superposicion entre jugadores y suelo. Asi no atraviesan el suelo
        this.physics.add.collider(this.j1, this.platforms);
        this.physics.add.collider(this.j2, this.platforms);


        // Inicializamos primer ingrediente a buscar, lo mostramos
        var numAleat = Phaser.Math.Between(0,5)
        this.objetivo = ingredientes[numAleat]
        this.objetivoSprite = this.physics.add.sprite(xObjetivo, yObjetivo, this.objetivo +'Grande')
        this.objetivoSprite.body.setAllowGravity(false);
        this.objetivoSprite.setImmovable(true)
        spritesABorrar.push(this.objetivoSprite)

    
        // Puntuaciones
        this.scoreJ1 = 0
        this.scoreJ2 = 0
        this.scoreJ1Text = this.add.text(16, 16, 'Score J1: 0', { fontSize: '32px', fill: '#000' });
        this.scoreJ2Text = this.add.text(550, 16, 'Score J2: 0', { fontSize: '32px', fill: '#000' });

        
        // Temporizador para que comencen a aparecer ingredientes
        this.timedEvent = this.time.delayedCall(1000, this.eventoSpawnIngr, [], this) // Hacemos que se vuelva a llamar a que aparezcan peces

    }


    eventoSpawnIngr(){

        var repetir = 0

        if (this.scoreJ1 > puntuacionVictoria/2 || this.scoreJ2 > puntuacionVictoria/2){
            repetir = 1
        }

        for (let i=0; i<=repetir; i++){

            var numAleat = Phaser.Math.Between(0,5)
            var tipoNuevoIngr = ingredientes[numAleat]

            var posX = Phaser.Math.Between(25, 775)
            this.nuevoIngr = this.physics.add.sprite(posX, 0, tipoNuevoIngr)    // Añadimos ingrediente nuevo
            this.physics.add.collider(this.nuevoIngr, this.platforms);  // Que no se caiga por el suelo
            spritesABorrar.push(this.nuevoIngr) // Lo metemos a lista de sprites a limpiar luego

            this.physics.add.overlap(this.j1, this.nuevoIngr, this.collectIngrJ1, null, this)
            this.physics.add.overlap(this.j2, this.nuevoIngr, this.collectIngrJ2, null, this)
        }
      

        // Para que no se siga llamando al acabar
        if (!this.gameOver){
            this.timedEvent = this.time.delayedCall(1000, this.eventoSpawnIngr, [], this) // Hacemos que se vuelva a llamar a que aparezcan ingr
        }

        
    }


    animInit(){
        //Creamos las animaciones del jugador1:
        this.anims.create({
            key: 'j1Left',    //Al ir a la izquierda
            frames: this.anims.generateFrameNumbers('j1', { start: 0, end: 3 }),  //Usa fotogramas 0-3
            frameRate: 6,
            repeat: -1
        });

        this.anims.create({
            key: 'j1Turn',    //Al girar
            frames: this.anims.generateFrameNumbers('j1', { start: 4, end: 8 }),
            frameRate: 6,
            repeat: -1

        });

        this.anims.create({
            key: 'j1Right',   //Al ir a la derecha
            frames: this.anims.generateFrameNumbers('j1', { start: 9, end: 12 }),
            frameRate: 6,
            repeat: -1
        });


        //Creamos las animaciones del jugador2:
        this.anims.create({
            key: 'j2Left',    //Al ir a la izquierda
            frames: this.anims.generateFrameNumbers('j2', { start: 0, end: 3 }),  //Usa fotogramas 0-3
            frameRate: 6,
            repeat: -1
        });

        this.anims.create({
            key: 'j2Turn',    //Al girar
            frames: this.anims.generateFrameNumbers('j2', { start: 4, end: 8 }),
            frameRate: 6,
            repeat: -1

        });

        this.anims.create({
            key: 'j2Right',   //Al ir a la derecha
            frames: this.anims.generateFrameNumbers('j2', { start: 9, end: 12 }),
            frameRate: 6,
            repeat: -1
        });


        // Animacion del boton
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
     * Funcion al recoger ingrediente
     */
    collectIngrJ1(player, ingr){
        ingr.disableBody(true, true) // Al recoger un ingr, desaparece

        // Añadimos puntuacion si coincide con el elemento buscado
        if (ingr.texture.key == this.objetivo){
            this.scoreJ1++
            this.scoreJ1Text.setText('Score J1: ' + this.scoreJ1);
            // Si hemos acabado
            if (this.scoreJ1 >= puntuacionVictoria){
                this.finPartida()
            }
            else{
                // Buscamos un nuevo elemento a buscar al acertar
                this.nuevoObjetivo()      
                cambioPuntuacion(this.scoreJ1)    // Emitimos evento de cambio de puntuacion
          
            }

        }

    }

    /**
     * Funcion al recoger ingrediente
     */
    collectIngrJ2(player, ingr){
        ingr.disableBody(true, true) // Al recoger un ingr, desaparece

        // Añadimos puntuacion si coincide con el elemento buscado
        if (ingr.texture.key == this.objetivo){
            this.scoreJ2++
            this.scoreJ2Text.setText('Score J2: ' + this.scoreJ2);

            // Si hemos acabado
            if (this.scoreJ2 >= puntuacionVictoria){
                this.finPartida()
            }
            else{
                // Buscamos un nuevo elemento a buscar al acertar
                this.nuevoObjetivo()                
            }

        }

    }


    nuevoObjetivo(){
        // Destruimos todos los sprites para volver a iniciar. Despues, vaciamos la lista de sprites
        spritesABorrar.forEach( x => { x.destroy() });
        spritesABorrar = []

        var numAleat = Phaser.Math.Between(0,5)
        this.objetivo = ingredientes[numAleat]
        this.objetivoSprite = this.physics.add.sprite(xObjetivo, yObjetivo, this.objetivo +'Grande')
        this.objetivoSprite.body.setAllowGravity(false);
        this.objetivoSprite.setImmovable(true)
        spritesABorrar.push(this.objetivoSprite)

    }

    finPartida(){
        this.gameOver = true

        // Paramos la fisica
        this.physics.pause();

        // Destruimos todos los sprites para volver a iniciar. Despues, vaciamos la lista de sprites
        spritesABorrar.forEach( x => { x.destroy() });
        spritesABorrar = []

        // Destruimos jugadores aparte
        this.j1.destroy()
        this.j2.destroy()
        

        // Quitamos el texto anterior
        this.scoreJ1Text.destroy()
        this.scoreJ2Text.destroy()

        // Vemos quien ha ganado
        var ganador = this.scoreJ1 > this.scoreJ2 ? "J1" : "J2"
        gameOverEvento(this.scoreJ1)

        // Mostramos el menu de nuevo
        this.crearMenu("Fin de la partida! Ganador: " + ganador)

    }

}



const config = {
    /* Cambiar configuracion si fuera necesario */
    type: Phaser.AUTO,
    width: 800,
    height: 600,
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
 * Funcion que dado el nombre del personaje elegido devuelve el sprite
 * Esta funcion debe ser exclusiva de cada juego, por si el creador decide
 * usar sus propios sprites
 * @param personajeArg 
 */
function getSprite(personajeArg) {
    console.log("EN GETSPRITE " + personajeArg)

    // Lista con los personajes para los cuales este juego tiene sprites
    let personajesSoportados = ["Monarca", "Artista", "Mantita", "Empresario", "Floral"]

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
