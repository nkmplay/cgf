// ----------------------------------------- Seção Inicio Mover com Setas do teclado ---------------------------------

let arrowKeys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
};

let moveSpeed = 0.1;
const fastSpeed = 0.5;
const maxSpeed = 1;
const speedIncrement = 0.05;

let keyPressTime = 0;
let isKeyPressed = false;

function moveSelectedObjects(dx, dy) {
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects && activeObjects.length > 0) {
        activeObjects.forEach(obj => {
            if (obj.id !== 'CloudFolha') {
                obj.set({
                    left: obj.left + dx,
                    top: obj.top + dy
                });
                obj.setCoords();
            }
        });
        canvas.renderAll();
    }
}

function handleArrowKeys() {
    if (isKeyPressed) {
        keyPressTime += 0.1;
        if (keyPressTime > 5) {
            keyPressTime = 5;
        }
        if (keyPressTime > 5) {
            moveSpeed = fastSpeed;
        }
        if (moveSpeed < maxSpeed) {
            moveSpeed += speedIncrement;
        }
    }

    if (arrowKeys.ArrowUp) {
        moveSelectedObjects(0, -moveSpeed);
    }
    if (arrowKeys.ArrowDown) {
        moveSelectedObjects(0, moveSpeed);
    }
    if (arrowKeys.ArrowLeft) {
        moveSelectedObjects(-moveSpeed, 0);
    }
    if (arrowKeys.ArrowRight) {
        moveSelectedObjects(moveSpeed, 0);
    }

    requestAnimationFrame(handleArrowKeys); 
}

handleArrowKeys();

document.addEventListener('keydown', function (e) {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        if (!arrowKeys[e.key]) {
            arrowKeys[e.key] = true;
            isKeyPressed = true;  
            keyPressTime = 0;  
            e.preventDefault();  
        }
    }
});

document.addEventListener('keyup', function (e) {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        arrowKeys[e.key] = false;
        isKeyPressed = false;  
        moveSpeed = 0.1;  
        keyPressTime = 0;  
    }
});

// ----------------------------------------- Seção Fim Mover com Setas do teclado --------------------------------- 

// ----------------------------------------- Seção Fim Mover zoom espaço do teclado --------------------------------- 

// Variável para controlar se o espaço está pressionado
let isSpacePressed = false;

// Variável para controlar se o canvas está sendo arrastado
let isDraggingCanvas = false;
let lastPosX = 0;
let lastPosY = 0;

// Função para ativar o arrasto do canvas
function startDraggingCanvas(e) {
    if (isSpacePressed && !isDraggingCanvas) {
        isDraggingCanvas = true;
        lastPosX = e.clientX;
        lastPosY = e.clientY;
        canvas.defaultCursor = 'grabbing';
        canvas.renderAll();
    }
}

// Função para mover o canvas
function dragCanvas(e) {
    if (isDraggingCanvas) {
        const deltaX = e.clientX - lastPosX;
        const deltaY = e.clientY - lastPosY;

        // Move o viewport do canvas
        const vpt = canvas.viewportTransform;
        vpt[4] += deltaX;
        vpt[5] += deltaY;

        canvas.requestRenderAll();

        lastPosX = e.clientX;
        lastPosY = e.clientY;
    }
}

// Função para parar o arrasto do canvas
function stopDraggingCanvas() {
    if (isDraggingCanvas) {
        isDraggingCanvas = false;
        canvas.defaultCursor = isSpacePressed ? 'grab' : 'default';
        canvas.renderAll();
    }
}

// Evento para detectar quando o espaço é pressionado
document.addEventListener('keydown', function (e) {
    if (e.code === 'Space' && !isSpacePressed) {
        isSpacePressed = true;

        // Verifica se um objeto de texto não está em modo de edição
        const activeObject = canvas.getActiveObject();
        if (!activeObject || (activeObject.type !== 'i-text' && activeObject.type !== 'text')) {
            canvas.defaultCursor = 'grab';
            canvas.renderAll();
        }
    }
});

// Evento para detectar quando o espaço é solto
document.addEventListener('keyup', function (e) {
    if (e.code === 'Space' && isSpacePressed) {
        isSpacePressed = false;
        canvas.defaultCursor = 'default';
        canvas.renderAll();
    }
});

// Evento para iniciar o arrasto do canvas
canvas.on('mouse:down', function (e) {
    if (isSpacePressed) {
        startDraggingCanvas(e.e);
    }
});

// Evento para mover o canvas enquanto arrasta
canvas.on('mouse:move', function (e) {
    if (isDraggingCanvas) {
        dragCanvas(e.e);
    }
});

// Evento para parar o arrasto do canvas
canvas.on('mouse:up', function () {
    stopDraggingCanvas();
});

// Evento para desativar o arrasto do canvas quando um objeto de texto está em edição
canvas.on('text:editing:entered', function () {
    isSpacePressed = false;
    canvas.defaultCursor = 'text';
    canvas.renderAll();
});

// Evento para reativar o arrasto do canvas quando a edição de texto termina
canvas.on('text:editing:exited', function () {
    if (isSpacePressed) {
        canvas.defaultCursor = 'grab';
    } else {
        canvas.defaultCursor = 'default';
    }
    canvas.renderAll();
});

// ----------------------------------------- Seção Fim Mover zoom espaço do teclado  --------------------------------- 

//--------------------------------- Seção Documento Abrir e Salvar ---------------------------------

document.getElementById('openDocumentBtn').addEventListener('click', function () {
    document.getElementById('loadDocInput').click();
});

document.getElementById('loadDocInput').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (event) {
        const canvasState = JSON.parse(event.target.result);
        const cloudFolhaState = canvasState.cloudFolha;

        canvas.clear();

        canvas.loadFromJSON(canvasState, function () {
            let cloudFolha = canvas.getObjects().find(obj => obj.id === 'CloudFolha');

            if (!cloudFolha) {
                createCloudFolha();
                cloudFolha = canvas.getObjects().find(obj => obj.id === 'CloudFolha');
            }

            if (cloudFolha && cloudFolhaState) {
                cloudFolha.set({
                    width: Number(cloudFolhaState.width) || 21 * CM_TO_PX, 
                    height: Number(cloudFolhaState.height) || 29.7 * CM_TO_PX,
                    left: Number(cloudFolhaState.left) || (canvas.width - cloudFolha.width) / 2,
                    top: Number(cloudFolhaState.top) || (canvas.height - cloudFolha.height) / 2,
                    selectable: false,
                    evented: false
                });
                canvas.sendToBack(cloudFolha);
            }

            if (cloudFolha) {
                const widthCm = convertDimensions(cloudFolha.width, 'px', 'cm');
                const heightCm = convertDimensions(cloudFolha.height, 'px', 'cm');
                widthInput.value = widthCm.toFixed(1);
                heightInput.value = heightCm.toFixed(1);
            }

            canvas.renderAll();
            updateLayersList();
            saveState();
        });
    };
    reader.readAsText(file);
});

document.getElementById('saveDocumentBtn').addEventListener('click', function () {
    const canvasState = canvas.toJSON([
        'id', 'excludeFromExport', 'selectable', 'evented',
        'left', 'top', 'width', 'height', 'scaleX', 'scaleY', 'angle',
        'fill', 'stroke', 'strokeWidth'
    ]);

    const cloudFolha = canvas.getObjects().find(obj => obj.id === 'CloudFolha');
    if (cloudFolha) {
        canvasState.cloudFolha = {
            width: cloudFolha.width,
            height: cloudFolha.height,
            left: cloudFolha.left,
            top: cloudFolha.top
        };
    }

    const blob = new Blob([JSON.stringify(canvasState)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'documento.cloudapp';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});



function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

//--------------------------------- Seção Inicio Texto ---------------------------------

