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


// ----------------------------------------- Seção Final Menu Editar ----------------------------------------------------
function openOutlineModal(canvas, activeObject) {
    const outlineModal = document.getElementById('outlineModal');
    const outlineImagePreview = document.getElementById('outlineImagePreview');

    if (!activeObject || activeObject.type !== 'image') {
        showCustomAlert('Selecione uma imagem para adicionar contorno.');
        return;
    }

    // Carrega a imagem no modal
    outlineImagePreview.src = activeObject.toDataURL();
    outlineImagePreview.style.display = 'block';
    outlineImagePreview.style.maxWidth = '80%';
    outlineImagePreview.style.maxHeight = '80vh';
    outlineImagePreview.style.objectFit = 'contain';
    outlineImagePreview.style.margin = 'auto';

    // Exibe o modal
    outlineModal.style.display = 'flex';

    // Atualiza os valores dos sliders
    updateSliderValues();

    // Adiciona listeners para os controles do modal
    const outlineSlider1 = document.getElementById('outlineSlider1');
    const outlineSlider2 = document.getElementById('outlineSlider2');
    const colorPicker1 = document.getElementById('colorPicker1');
    const colorPicker2 = document.getElementById('colorPicker2');

    [outlineSlider1, outlineSlider2, colorPicker1, colorPicker2].forEach(element => {
        element.addEventListener('input', function () {
            applyOutlines();
            updateSliderValues();
        });
    });

    // Listener para o botão de aplicar contorno
    document.getElementById('applyOutlineBtn').addEventListener('click', function () {
        applyOutlineToImage(canvas, activeObject);
        outlineModal.style.display = 'none';
    });

    // Listener para o botão de fechar o modal
    document.getElementById('closeOutlineModal').addEventListener('click', function () {
        outlineModal.style.display = 'none';
    });
}

function updateSliderValues() {
    document.getElementById('sliderValue1').textContent = document.getElementById('outlineSlider1').value + 'px';
    document.getElementById('sliderValue2').textContent = document.getElementById('outlineSlider2').value + 'px';
}

function applyOutlines() {
    const width1 = document.getElementById('outlineSlider1').value;
    const width2 = document.getElementById('outlineSlider2').value;
    const color1 = document.getElementById('colorPicker1').value;
    const color2 = document.getElementById('colorPicker2').value;
    const shadows = [];

    if (width1 > 0) {
        shadows.push(
            `drop-shadow(${width1}px 0 0 ${color1})`,
            `drop-shadow(-${width1}px 0 0 ${color1})`,
            `drop-shadow(0 ${width1}px 0 ${color1})`,
            `drop-shadow(0 -${width1}px 0 ${color1})`
        );
    }

    if (width2 > 0) {
        shadows.push(
            `drop-shadow(${width2}px 0 0 ${color2})`,
            `drop-shadow(-${width2}px 0 0 ${color2})`,
            `drop-shadow(0 ${width2}px 0 ${color2})`,
            `drop-shadow(0 -${width2}px 0 ${color2})`
        );
    }

    document.getElementById('outlineImagePreview').style.filter = shadows.join(' ');
}

function applyOutlineToImage(canvas, activeObject) {
    const width1 = parseInt(document.getElementById('outlineSlider1').value);
    const width2 = parseInt(document.getElementById('outlineSlider2').value);
    const color1 = document.getElementById('colorPicker1').value;
    const color2 = document.getElementById('colorPicker2').value;

    const imgElement = activeObject.getElement();

    // Calcular o tamanho necessário para o contorno
    const maxOutlineWidth = Math.max(width1, width2);
    const padding = maxOutlineWidth * 2; // Aumentar o padding para acomodar o contorno

    // Criar um canvas temporário para aplicar o contorno
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = imgElement.width + (padding * 2); // Padding em ambos os lados
    tempCanvas.height = imgElement.height + (padding * 2); // Padding em ambos os lados

    // Centralizar a imagem no canvas temporário
    const offsetX = padding;
    const offsetY = padding;

    // Aplicar os contornos em uma única operação
    const shadows = [];
    if (width1 > 0) {
        shadows.push(
            `drop-shadow(${width1}px 0 0 ${color1})`,
            `drop-shadow(-${width1}px 0 0 ${color1})`,
            `drop-shadow(0 ${width1}px 0 ${color1})`,
            `drop-shadow(0 -${width1}px 0 ${color1})`
        );
    }
    if (width2 > 0) {
        shadows.push(
            `drop-shadow(${width2}px 0 0 ${color2})`,
            `drop-shadow(-${width2}px 0 0 ${color2})`,
            `drop-shadow(0 ${width2}px 0 ${color2})`,
            `drop-shadow(0 -${width2}px 0 ${color2})`
        );
    }

    // Aplicar o filtro de contorno
    tempCtx.filter = shadows.join(' ');
    tempCtx.drawImage(imgElement, offsetX, offsetY);

    // Desenhar a imagem original no centro (sem contorno)
    tempCtx.globalCompositeOperation = 'source-over';
    tempCtx.drawImage(imgElement, offsetX, offsetY);

    // Converter o canvas temporário para uma imagem e substituir a original
    const dataUrl = tempCanvas.toDataURL('image/png', 1.0);
    fabric.Image.fromURL(dataUrl, function (img) {
        img.set({
            left: activeObject.left - (offsetX * activeObject.scaleX), // Ajustar a posição
            top: activeObject.top - (offsetY * activeObject.scaleY),  // Ajustar a posição
            scaleX: activeObject.scaleX,
            scaleY: activeObject.scaleY,
            angle: activeObject.angle,
            selectable: true,
            evented: true
        });

        canvas.remove(activeObject);
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
    });
}
// ----------------------------------------- Seção Final Contorno ----------------------------------------------------
