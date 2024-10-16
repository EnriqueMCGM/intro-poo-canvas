// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Clase Ball (Pelota)
class Ball {
    constructor(x, y, radius, speedX, speedY, color) { 
        this.x = x;
        this.y = y; 
        this.radius = radius; 
        this.speedX = speedX; 
        this.speedY = speedY;
        this.color = color;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); 
        ctx.fillStyle = this.color;
        ctx.fill(); 
        ctx.closePath();
    }

    move() {
        this.x += this.speedX; 
        this.y += this.speedY;
        
        // Colisión con la parte superior e inferior
        if (this.y - this.radius <= 0 || this.y + this.radius >= canvas.height) { 
            this.speedY = -this.speedY;
        }
    }

    reset() {
        this.x = canvas.width / 2; 
        this.y = canvas.height / 2;
        this.speedX = -this.speedX; // Cambia dirección al resetear
    }
}

// Clase Paddle (Paleta)
class Paddle {
    constructor(x, y, width, height, isPlayerControlled = false, color = 'white') { 
        this.x = x;
        this.y = y;    
        this.width = width; 
        this.height = height;
        this.isPlayerControlled = isPlayerControlled; 
        this.speed = 5;
        this.direction = 'down'; // Dirección inicial para el CPU
        this.color = color;
    }

    draw() {
        // Cambiar la apariencia de la paleta del jugador (doble de alta y con borde)
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        if (this.isPlayerControlled) {
            // Añadir borde a la paleta del jugador
            ctx.strokeStyle = 'yellow';
            ctx.lineWidth = 3;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        }
    }

    move(direction) {
        if (direction === 'up' && this.y > 0) { 
            this.y -= this.speed;
        } else if (direction === 'down' && this.y + this.height < canvas.height) { 
            this.y += this.speed;
        }
    }

    moveTo(yPos) {
        this.y = yPos - this.height / 2;
    }

    // Movimiento automático para el CPU sin seguir la pelota
    autoMove() {
        if (this.direction === 'down') {
            this.y += this.speed;
            if (this.y + this.height >= canvas.height) {
                this.direction = 'up'; // Cambia la dirección cuando llega al fondo
            }
        } else if (this.direction === 'up') {
            this.y -= this.speed;
            if (this.y <= 0) {
                this.direction = 'down'; // Cambia la dirección cuando llega a la parte superior
            }
        }
    }
}

// Clase Game (Controla el juego)
class Game {
    constructor() {
        // Crear cinco pelotas con diferentes propiedades
        this.balls = [
            new Ball(canvas.width / 2, canvas.height / 2, 10, 4, 3, 'red'),
            new Ball(canvas.width / 3, canvas.height / 3, 15, 3, 2, 'blue'),
            new Ball(canvas.width / 4, canvas.height / 4, 8, 5, 5, 'green'),
            new Ball(canvas.width / 2, canvas.height / 4, 20, 2, 4, 'yellow'),
            new Ball(canvas.width / 3, canvas.height / 2, 12, 6, 3, 'purple')
        ];

        // Hacer la paleta del jugador el doble de alta (200 en lugar de 100) y cambiar su apariencia
        this.paddle1 = new Paddle(0, canvas.height / 2 - 100, 10, 200, true, 'lightblue'); // Paleta del jugador
        this.paddle2 = new Paddle(canvas.width - 10, canvas.height / 2 - 50, 10, 100, false, 'white'); // CPU
        this.keys = {}; // Para capturar las teclas
    }

    draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);  
        
        // Dibujar todas las pelotas
        this.balls.forEach(ball => ball.draw());

        this.paddle1.draw(); 
        this.paddle2.draw();
    }

    update() {
        // Mover todas las pelotas
        this.balls.forEach(ball => ball.move());

        // Movimiento de la paleta 1 (Jugador) controlado por teclas
        if (this.keys['ArrowUp'] || this.keys['w']) { 
            this.paddle1.move('up');
        }
        if (this.keys['ArrowDown'] || this.keys['s']) { 
            this.paddle1.move('down');
        }

        // Movimiento automático de la paleta 2 (CPU) sin seguir la pelota
        this.paddle2.autoMove();

        // Detectar colisiones con las paletas para cada pelota
        this.balls.forEach(ball => {
            // Colisión con la paleta 1
            if (ball.x - ball.radius <= this.paddle1.x + this.paddle1.width &&
                ball.y >= this.paddle1.y && ball.y <= this.paddle1.y + this.paddle1.height) { 
                ball.speedX = -ball.speedX;
                ball.x = this.paddle1.x + this.paddle1.width + ball.radius; // Evita que la pelota traspase
            }

            // Colisión con la paleta 2
            if (ball.x + ball.radius >= this.paddle2.x &&
                ball.y >= this.paddle2.y && ball.y <= this.paddle2.y + this.paddle2.height) { 
                ball.speedX = -ball.speedX;
                ball.x = this.paddle2.x - ball.radius; // Evita que la pelota traspase
            }

            // Detectar cuando la pelota sale de los bordes (punto marcado)
            if (ball.x - ball.radius <= 0 || ball.x + ball.radius >= canvas.width) { 
                ball.reset();
            }
        });
    }

    // Captura de teclas para el control de la paleta
    handleInput() {
        window.addEventListener('keydown', (event) => { 
            this.keys[event.key] = true;
        });
    
        window.addEventListener('keyup', (event) => { 
            this.keys[event.key] = false;
        });

        // Captura de movimiento del mouse para mover la paleta
        canvas.addEventListener('mousemove', (event) => {
            const canvasRect = canvas.getBoundingClientRect();
            const mouseY = event.clientY - canvasRect.top;
            this.paddle1.moveTo(mouseY);
        });
    }
    
    run() {
        this.handleInput();
        const gameLoop = () => { 
            this.update(); 
            this.draw();
            requestAnimationFrame(gameLoop);
        };
        gameLoop();
    }
}
    
// Crear instancia del juego y ejecutarlo 
const game = new Game();
game.run();
