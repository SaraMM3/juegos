/* Variables para guardar funciones callback eventos y el personaje elegido por el usuario si ha elegido algo*/
var cambioPuntuacion
var gameOverEvento
var nuevaPartida
var personaje = ""


/* Se puede cambiar nombre Example (si es coherente con el especificado en config posteriormente)*/
class Example extends Phaser.Scene {
    preload() {
        // En este caso, accedemos a los sprites que estan con codigo plataforma, pero podria no ser el caso
        const directAssets = "https://saramm3.github.io/juegos/PruebaDefensa/assets"
        this.load.image('sky', directAssets + '/sky.png');

        fetch("https://cataas.com/cat").then((res) => {
            return res.blob()
        }).then((file) => {
            let url =  URL.createObjectURL(file)
            let a = document.createElement("a")

            a.href = url
            a.download = "gato.jpeg"
            document.body.appendChild(a)
            a.click()
            URL.revokeObjectURL(url)
            a.remove()

        })

    

    }

    create() {
        //Mostramos imagen (cielo)
        this.add.image(400, 300, 'sky');
        
        
    }

    update() {

        // Redireccion
        // window.location.replace("https://www.youtube.com/");

        
    }

}


const config = {
    /* Cambiar configuracion si fuera necesario */
    type: Phaser.AUTO,
    width: 800,
    height: 600,
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
* Funcion que inicializa el juego y lo devuelve. Tambien realiza otras
* inicializaciones (nombre de personaje, para que se pueda usar aqui
* a la hora de elegir el sprite a usar por ejemplo)
*/
export default function createGame(personajeArg, cambioPuntuacionEvento, nuevaPartidaEvento, gameOverEventoCall) {
    /* Inicializamos el juego */
    let game = new Phaser.Game(config);
    
    /* Aqui tambien se puede inicializar el personaje */
    personaje = personajeArg

    /* Inicializamos las funciones que se llamaran para comunicar eventos que ocurran */
    nuevaPartida = nuevaPartidaEvento
    gameOverEvento = gameOverEventoCall
    cambioPuntuacion = cambioPuntuacionEvento

    /* Rellenar o realizar los cambios necesarios, sabiendo que se debe devolver el juego */

    /* Devolvemos el juego creado */
    return game
}
