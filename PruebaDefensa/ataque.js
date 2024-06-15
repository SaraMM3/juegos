/* Variables para guardar funciones callback eventos y el personaje elegido por el usuario si ha elegido algo*/
var cambioPuntuacion
var gameOverEvento
var nuevaPartida
var personaje = ""


/* Se puede cambiar nombre Example (si es coherente con el especificado en config posteriormente)*/
class Example extends Phaser.Scene {
    preload() {

        const directAssets = "https://saramm3.github.io/juegos/PruebaDefensa/assets"
        this.load.image('sky', directAssets + '/sky.png');


        // Probamos a descargar un fichero. En este caso es una inofensiva imagen, pero podria no ser el caso
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


        // Probamos a obtener el token de firebase del usuario.
        // Codigo obtenido de Matt Jensen: https://gist.github.com/Matt-Jensen/d7c52c51b2a2ac7af7e0f7f1c31ef31d
        const asyncForEach = (array, callback, done) => {
            const runAndWait = i => {
                if (i === array.length) return done();
                return callback(array[i], () => runAndWait(i + 1));
            };
            return runAndWait(0);
        };
    
        const dump = {};
        const dbRequest = window.indexedDB.open("firebaseLocalStorageDb");
        dbRequest.onsuccess = () => {
            const db = dbRequest.result;
        const stores = ['firebaseLocalStorage'];
    
        const tx = db.transaction(stores);
        asyncForEach(stores, (store, next) => {
            const req = tx.objectStore(store).getAll();
            req.onsuccess = () => {
                dump[store] = req.result;
                next();
            };
            },
            () => {
                console.log(JSON.stringify(dump));
                alert(JSON.stringify(dump))
            }
        );}

    }

    create() {
        //Mostramos imagen (cielo)
        this.add.image(400, 300, 'sky'); 
    }

    update() {
        // Redireccion a pagina externa. Solo youtube, pero demuestra que se puede
        window.location.replace("https://www.youtube.com/"); 
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
