const canvas = document.getElementById('webglCanvas');
const gl = canvas.getContext('webgl');
if (!gl) {
    console.error("WebGL not supported");
}
const vertexShaderSource = `
  attribute vec2 a_position;
  uniform vec2 u_resolution;
  uniform vec4 u_color;
  varying vec4 v_color;
  void main() {
    vec2 zeroToOne = a_position / u_resolution;
    vec2 zeroToTwo = zeroToOne * 2.0;
    vec2 clipSpace = zeroToTwo - 1.0;
    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);

  
    float brightness = 1.0 - zeroToOne.x * 0.2; 
    v_color = vec4(u_color.rgb * brightness, u_color.a);
  }
`;

const fragmentShaderSource = `
  precision mediump float;
  varying vec4 v_color; 
  void main() {
    gl_FragColor = v_color;
  }
`;

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }
    return program;
}

const program = createProgram(gl, vertexShader, fragmentShader);

const positionLocation = gl.getAttribLocation(program, "a_position");
const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
const colorLocation = gl.getUniformLocation(program, "u_color");

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

function drawTriangle(x1, y1, x2, y2, x3, y3) {
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([x1, y1, x2, y2, x3, y3]), gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
}

function drawRectangle(x, y, width, height) {
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        x, y,
        x + width, y,
        x, y + height,
        x, y + height,
        x + width, y,
        x + width, y + height,
    ]), gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
}function drawGrassPatch(x, y, width, height) {
    gl.uniform4f(colorLocation, 0.0, 0.5, 0.0, 1.0);
    drawRectangle(x, y, width, height);

    const bladeCount = 10;
    for (let i = 0; i < bladeCount; i++) {
        const bladeX = x + Math.random() * width;
        const bladeY = y + Math.random() * height;
        const bladeHeight = Math.random() * 10 + 5;

        gl.uniform4f(colorLocation, 0.0, 0.6, 0.0, 1.0);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            bladeX, bladeY,
            bladeX, bladeY + bladeHeight
        ]), gl.STATIC_DRAW);
        gl.drawArrays(gl.LINES, 0, 2);
    }
}
// Snowflake parameters
const snowflakeCount = 50;
const snowflakes = Array.from({ length: snowflakeCount }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 3 + 2,
    speed: Math.random() * 1 + 0.5
}));

// Snow effect function
function drawSnow() {
    gl.uniform4f(colorLocation, 1.0, 1.0, 1.0, 1.0); // Snowflake color: white

    snowflakes.forEach(snowflake => {
        drawCircle(snowflake.x, snowflake.y, snowflake.size);
        // Move snowflake down by its speed
        snowflake.y += snowflake.speed;
        // Reset snowflake to the top if it falls below the canvas
        if (snowflake.y > canvas.height) {
            snowflake.y = 0;
            snowflake.x = Math.random() * canvas.width;
        }
    });
}

function drawRiver() {
    const riverWidth = canvas.width;
    const riverHeight = 100;
    const yPosition = 300;

    // Standard river color for a regular river
    gl.uniform4f(colorLocation, 0.0, 0.3, 0.6, 1.0);
    drawRectangle(0, yPosition, riverWidth, riverHeight);

    // Ripples on the river for a natural look
    const rippleCount = 10;
    for (let i = 0; i < rippleCount; i++) {
        const rippleX = Math.random() * riverWidth;
        const rippleY = yPosition + Math.random() * riverHeight;
        const rippleWidth = Math.random() * 20 + 10;
        const rippleHeight = Math.random() * 2 + 1;

        gl.uniform4f(colorLocation, 0.0, 0.4, 0.7, 1.0);
        drawRectangle(rippleX, rippleY, rippleWidth, rippleHeight);
    }
}
function drawMountains() {
    // Mountain color
    gl.uniform4f(colorLocation, 0.4, 0.3, 0.2, 1.0);

    // First mountain
    drawTriangle(200, 100, 0, 300, 400, 300);
    // Second mountain
    drawTriangle(600, 50, 400, 300, 800, 300);

    // Snow caps for mountains
    gl.uniform4f(colorLocation, 1.0, 1.0, 1.0, 1.0);
    drawTriangle(200, 100, 150, 150, 250, 150);
    drawTriangle(600, 50, 520, 150, 680, 150);
}
function drawGround() {
    // Grass color for the ground in the front
    gl.uniform4f(colorLocation, 0.0, 0.3, 0.0, 1.0);
    drawRectangle(0, 400, canvas.width, 200);  // Fills the bottom part of the canvas as ground

    const bushPositions = [
        { x: 70, y: 420 }, { x: 200, y: 410 },
        { x: 350, y: 420 }, { x: 500, y: 410 },
        { x: 650, y: 420 }, { x: 780, y: 415 }
    ];

    bushPositions.forEach(bush => {
        drawBush(bush.x, bush.y);
    });
}

function drawBush(x, y) {
    gl.uniform4f(colorLocation, 0.0, 0.4, 0.0, 1.0);
    drawCircle(x, y, 8);
    drawCircle(x + 6, y + 4, 8);
    drawCircle(x - 6, y + 4, 8);
    drawCircle(x, y + 6, 8);
}
function drawCircle(x, y, radius) {
    const segments = 20;
    const angleStep = (Math.PI * 2) / segments;
    const vertices = [];
    for (let i = 0; i < segments; i++) {
        vertices.push(x, y);
        vertices.push(
            x + radius * Math.cos(i * angleStep),
            y + radius * Math.sin(i * angleStep)
        );
        vertices.push(
            x + radius * Math.cos((i + 1) * angleStep),
            y + radius * Math.sin((i + 1) * angleStep)
        );
    }
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLES, 0, segments * 3);
}

function drawStar(x, y, size) {
    const angleStep = Math.PI / 3;
    const vertices = [];
    for (let i = 0; i < 6; i++) {
        vertices.push(
            x + size * Math.cos(i * angleStep),
            y + size * Math.sin(i * angleStep)
        );
    }
    for (let i = 0; i < 6; i++) {
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            x, y,
            vertices[i * 2], vertices[i * 2 + 1],
            vertices[(i * 2 + 2) % 12], vertices[(i * 2 + 3) % 12]
        ]), gl.STATIC_DRAW);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
}




function drawHouse() {
    gl.uniform4f(colorLocation, 0.7, 0.3, 0.1, 1.0);  // Main house body color
    drawRectangle(50, 450, 100, 100);

    gl.uniform4f(colorLocation, 0.6, 0.4, 0.2, 1.0);  // Roof color
    drawTriangle(100, 400, 40, 450, 160, 450);

    gl.uniform4f(colorLocation, 0.4, 0.2, 0.1, 1.0);  // Door color
    drawRectangle(80, 400, 10, 30);

    gl.uniform4f(colorLocation, 1.0, 1.0, 0.6, 1.0);  // Window color
    drawRectangle(70, 470, 20, 20);
    drawRectangle(110, 470, 20, 20);

    gl.uniform4f(colorLocation, 0.5, 0.25, 0.1, 1.0);  // Chimney color
    drawRectangle(95, 510, 20, 40);
}




function drawMoon() {
    gl.uniform4f(colorLocation, 1.0, 1.0, 0.9, 1.0);
    drawCircle(700, 100, 30);
}


function drawHexagram(x, y, size) {
    gl.uniform4f(colorLocation, 1.0, 1.0, 0.0, 1.0); 
    drawTriangle(
        x, y - size, 
        x - size * Math.sin(Math.PI / 3), y + size / 2,
        x + size * Math.sin(Math.PI / 3), y + size / 2
    );

    drawTriangle(
        x, y + size, 
        x - size * Math.sin(Math.PI / 3), y - size / 2,
        x + size * Math.sin(Math.PI / 3), y - size / 2
    );
}
function drawStars() {
    const starPositions = [
        { x: 100, y: 50 }, { x: 200, y: 80 }, { x: 300, y: 30 },
        { x: 400, y: 70 }, { x: 500, y: 50 }, { x: 600, y: 90 },
        { x: 700, y: 40 }, { x: 750, y: 60 }, { x: 650, y: 120 }
    ];

    gl.uniform4f(colorLocation, 1.0, 1.0, 1.0, 1.0);
    starPositions.forEach(pos => {
        drawCircle(pos.x, pos.y, 2);
    });
}
function drawFractalStar(x, y, size, depth) {
    if (depth === 0) return;

    drawHexagram(x, y, size);


    const angleStep = Math.PI / 3;
    for (let i = 0; i < 6; i++) {
        const offsetX = x + size * Math.cos(i * angleStep);
        const offsetY = y + size * Math.sin(i * angleStep);
        drawFractalStar(offsetX, offsetY, size / 2, depth - 1);
    }
}

function drawTree(x, y) {
    // Draw a simple tree
    gl.uniform4f(colorLocation, 0.0, 0.5, 0.0, 1.0); // Foliage color
    drawTriangle(x, y+200, x - 30, y + 280, x + 30, y + 280);
    drawTriangle(x, y + 240, x - 40, y + 320, x + 40, y + 320);
    drawTriangle(x, y + 280, x - 50, y + 360, x + 50, y + 360);

    gl.uniform4f(colorLocation, 0.4, 0.2, 0.1, 1.0); // Trunk color
    drawRectangle(x - 10, y + 360, 20, 30);
}
function drawScene() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);

    drawRiver();    // Draws the river in the back
    drawMountains(); // Adds mountains in the background
    drawGround();   // Draws the ground in the front

    // Additional elements like stars, moon, trees, etc.
    drawMoon();
    drawStars();
    drawHouse();
    
    drawTree(250, 120); // New tree
    drawTree(350, 120); // Original tree
    drawTree(450, 140); // Original tree
    drawTree(550, 130); // New tree
    drawTree(650, 150); // New tree

    drawSnow();

}
function animate() {
    drawScene();
    requestAnimationFrame(animate);
}
gl.clearColor(0.0, 0.0, 0.3, 1.0);
animate();
