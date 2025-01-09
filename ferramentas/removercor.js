// removercor.js

// Variáveis globais
let isColorRemovalActive = false;
let isTotalColorRemovalActive = false;
let tolerance = 30;
let lastRemovedState = null; // Armazena o estado antes da remoção de cor

// Função para abrir o modal do slider
function openDetectionLevelModal() {
    const modal = document.getElementById('detectionLevelModal');
    modal.style.display = 'flex';
}

// Função para fechar o modal do slider
function closeDetectionLevelModal() {
    const modal = document.getElementById('detectionLevelModal');
    modal.style.display = 'none';
}

// Atualizar valor do slider
document.getElementById('detection-level').addEventListener('input', function () {
    tolerance = parseInt(this.value);
    document.getElementById('sliderValue').textContent = this.value;
});

// Lógica para o botão "Remover Cor Clique"
function setupRemoveCorCliqueBtn() {
    const removeCorCliqueBtn = document.getElementById('removeCorCliqueBtn');
    removeCorCliqueBtn.addEventListener('click', function () {
        isColorRemovalActive = !isColorRemovalActive;
        isTotalColorRemovalActive = false;

        if (isColorRemovalActive) {
            openDetectionLevelModal();
            canvas.defaultCursor = 'crosshair';
        } else {
            closeDetectionLevelModal();
            canvas.defaultCursor = 'default';
        }
    });
}

// Lógica para o botão "Remover Cor Total"
function setupRemoveCorTotalBtn() {
    const removeCorTotalBtn = document.getElementById('removeCorTotalBtn');
    removeCorTotalBtn.addEventListener('click', function () {
        isTotalColorRemovalActive = !isTotalColorRemovalActive;
        isColorRemovalActive = false;

        if (isTotalColorRemovalActive) {
            openDetectionLevelModal();
            canvas.defaultCursor = 'crosshair';
        } else {
            closeDetectionLevelModal();
            canvas.defaultCursor = 'default';
        }
    });
}

// Fechar modal e cancelar remoção ao clicar fora do canvas ou do botão
function setupCloseModalOnClickOutside() {
    document.addEventListener('click', function (e) {
        const canvasContainer = document.getElementById('canvas-container');
        const removeCorCliqueBtn = document.getElementById('removeCorCliqueBtn');
        const removeCorTotalBtn = document.getElementById('removeCorTotalBtn');
        const modal = document.getElementById('detectionLevelModal');

        // Verifica se o clique foi fora do canvas, dos botões ou do modal
        if (
            !canvasContainer.contains(e.target) &&
            !removeCorCliqueBtn.contains(e.target) &&
            !removeCorTotalBtn.contains(e.target) &&
            !modal.contains(e.target)
        ) {
            closeDetectionLevelModal();
            isColorRemovalActive = false;
            isTotalColorRemovalActive = false;
            canvas.defaultCursor = 'default';
        }
    });
}

// Lógica para remover cores
function setupColorRemoval() {
    canvas.on('mouse:down', function (options) {
        if (isColorRemovalActive || isTotalColorRemovalActive) {
            handleColorRemoval(options);
        }
    });
}

function handleColorRemoval(options) {
    const pointer = canvas.getPointer(options.e);
    const clickedObject = canvas.findTarget(options.e);

    if (clickedObject && clickedObject.type === 'image') {
        // Salva o estado atual antes de remover a cor (excluindo o CloudFolha)
        const objects = canvas.getObjects().filter(obj => obj.id !== 'CloudFolha');
        lastRemovedState = canvas.toJSON(['id']); // Salva o estado sem o CloudFolha
        lastRemovedState.objects = objects.map(obj => obj.toJSON(['id'])); // Filtra os objetos

        const imageElement = clickedObject._element;
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = imageElement.width;
        tempCanvas.height = imageElement.height;
        tempCtx.drawImage(imageElement, 0, 0, imageElement.width, imageElement.height);

        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const targetColor = getColorAtPosition(imageData, pointer, clickedObject);

        if (targetColor) {
            if (isTotalColorRemovalActive) {
                removeTotalColor(imageData, targetColor);
            } else {
                removeColorArea(imageData, targetColor, pointer, clickedObject);
            }
            tempCtx.putImageData(imageData, 0, 0);

            fabric.Image.fromURL(tempCanvas.toDataURL(), function (img) {
                img.set({
                    left: clickedObject.left,
                    top: clickedObject.top,
                    scaleX: clickedObject.scaleX,
                    scaleY: clickedObject.scaleY,
                    angle: clickedObject.angle,
                    name: clickedObject.name
                });
                canvas.remove(clickedObject);
                canvas.add(img);
                canvas.renderAll();
                updateLayersList();
            });
        }
    }
}

function getColorAtPosition(imageData, pointer, obj) {
    const x = Math.round((pointer.x - obj.left) / obj.scaleX);
    const y = Math.round((pointer.y - obj.top) / obj.scaleY);
    const index = (y * imageData.width + x) * 4;
    return {
        r: imageData.data[index],
        g: imageData.data[index + 1],
        b: imageData.data[index + 2],
        a: imageData.data[index + 3]
    };
}

function removeTotalColor(imageData, targetColor) {
    for (let i = 0; i < imageData.data.length; i += 4) {
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];

        if (
            Math.abs(r - targetColor.r) <= tolerance &&
            Math.abs(g - targetColor.g) <= tolerance &&
            Math.abs(b - targetColor.b) <= tolerance
        ) {
            imageData.data[i + 3] = 0;
        }
    }
}

function removeColorArea(imageData, targetColor, pointer, obj) {
    const stack = [];
    const startX = Math.round((pointer.x - obj.left) / obj.scaleX);
    const startY = Math.round((pointer.y - obj.top) / obj.scaleY);
    stack.push([startX, startY]);

    while (stack.length > 0) {
        const [x, y] = stack.pop();
        const index = (y * imageData.width + x) * 4;

        if (
            x >= 0 && x < imageData.width &&
            y >= 0 && y < imageData.height &&
            imageData.data[index + 3] !== 0 &&
            Math.abs(imageData.data[index] - targetColor.r) <= tolerance &&
            Math.abs(imageData.data[index + 1] - targetColor.g) <= tolerance &&
            Math.abs(imageData.data[index + 2] - targetColor.b) <= tolerance
        ) {
            imageData.data[index + 3] = 0;
            stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
        }
    }
}

// Função para desfazer a remoção de cor
function setupUndoColorRemovalBtn() {
    document.getElementById('undoColorRemovalBtn').addEventListener('click', function () {
        if (lastRemovedState) {
            // Preserva o objeto CloudFolha
            const cloudFolha = canvas.getObjects().find(obj => obj.id === 'CloudFolha');

            // Carrega o estado salvo
            canvas.loadFromJSON(lastRemovedState, function () {
                // Readiciona o CloudFolha ao canvas
                if (cloudFolha) {
                    canvas.add(cloudFolha);
                    canvas.sendToBack(cloudFolha); // Garante que o CloudFolha fique no fundo
                }

                canvas.renderAll();
                lastRemovedState = null; // Limpa o estado salvo após desfazer
            });
        }
    });
}

// Inicializa todas as funções
function initRemoverCor() {
    setupRemoveCorCliqueBtn();
    setupRemoveCorTotalBtn();
    setupCloseModalOnClickOutside();
    setupColorRemoval();
    setupUndoColorRemovalBtn();
}

// Inicializa o módulo quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function () {
    initRemoverCor();
});
