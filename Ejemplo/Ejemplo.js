//const Phaser = require('//cdn.jsdelivr.net/npm/phaser@3.55.2/dist/phaser.js')
var script = document.createElement("script");  // create a script DOM node
script.src = "https://cdnjs.cloudflare.com/ajax/libs/phaser/3.70.0/phaser.min.js";  // set its src to the provided URL
   
document.head.appendChild(script);

    class Example extends Phaser.Scene{
        preload (){
            this.load.setBaseURL('https://labs.phaser.io');

            // Cargamos los assets
            this.load.image('sky', 'assets/skies/space3.png');
            this.load.image('logo', 'assets/sprites/phaser3-logo.png');
            this.load.image('red', 'assets/particles/red.png');
        }

        create (){
            // Añadimos las imagenes
            this.add.image(400, 300, 'sky');

            const particles = this.add.particles(0, 0, 'red', {
                speed: 100,
                scale: { start: 1, end: 0 },
                blendMode: 'ADD'
            });

            const logo = this.physics.add.image(400, 100, 'logo');

            // Hacemos que el logo se mueva
            logo.setVelocity(100, 200);
            logo.setBounce(1, 1);
            logo.setCollideWorldBounds(true);

            particles.startFollow(logo);
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
        parent: "phaser"
    };


    export default function createGame() {
        return new Phaser.Game(config);
    }
