// Função para carregar um arquivo de documento (.cloudapp)
function loadDocumentFile(file) {
    const reader = new FileReader();
    reader.onload = function(event) {
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
                    top: Number(cloudFolhaState.top) || (canvas.height - cloudFolha.height) / 2
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
}

// Função para lidar com o evento de soltar arquivos (drag and drop)
function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();

    // Verificar se o drop ocorreu dentro do canvas
    const canvasElement = document.getElementById('canvas');
    const rect = canvasElement.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (mouseX < 0 || mouseX > rect.width || mouseY < 0 || mouseY > rect.height) {
        return; // Ignorar o drop fora do canvas
    }

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) {
        showCustomAlert('Nenhum arquivo foi detectado. Por favor, tente novamente.');
        return;
    }

    handleFiles(files);
}

// Função para lidar com arquivos (imagens, PDFs, .cloudapp)
function handleFiles(files) {
    Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
            handleImageFile(file);
        } else if (file.type === 'application/pdf') {
            handlePdfFile(file);
        } else if (file.name.endsWith('.cloudapp')) {
            loadDocumentFile(file);
        } else {
            showCustomAlert('Arquivo não suportado. Por favor, insira imagens, PDFs ou arquivos .cloudapp.');
        }
    });
}

// Função para lidar com arquivos de imagem
function handleImageFile(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        if (!canvas || !canvas.add) {
            showCustomAlert('Erro ao carregar a área de trabalho. Por favor, feche e abra o app.');
            return;
        }

        // Criar uma imagem temporária para obter dimensões originais
        const tempImg = new Image();
        tempImg.onload = function() {
            const originalWidth = this.width;
            const originalHeight = this.height;

            fabric.Image.fromURL(e.target.result, function(img) {
                if (!img) {
                    showCustomAlert('Falha ao carregar a imagem.');
                    return;
                }

                // Redimensionar e centralizar a imagem no CloudFolha
                resizeAndCenterImage(img);

                // Definir DPI para 300
                img.set('dpi', 300);

                // Substituir a imagem no canvas (igual ao processo do modal de pintar/contorno)
                replaceImageOnCanvas(img);

                try {
                    canvas.add(img);
                    img.setCoords(); // Força o recálculo da caixa de delimitação
                    canvas.setActiveObject(img);
                    canvas.renderAll();
                    saveState();
                } catch (error) {
                    showCustomAlert('Erro ao adicionar a imagem ao canvas.');
                }
            }, { crossOrigin: 'Anonymous' });
        };
        tempImg.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Função para redimensionar e centralizar a imagem no CloudFolha
function resizeAndCenterImage(img) {
    const cloudFolha = canvas.getObjects().find(obj => obj.id === 'CloudFolha');
    if (!cloudFolha) {
        showCustomAlert('Folha CloudFolha não encontrada.');
        return;
    }

    // Obter as dimensões da folha CloudFolha
    const folhaWidth = cloudFolha.width * cloudFolha.scaleX;
    const folhaHeight = cloudFolha.height * cloudFolha.scaleY;

    // Obter as dimensões da imagem ou PDF
    const imgWidth = img.width * img.scaleX;
    const imgHeight = img.height * img.scaleY;

    // Calcular a escala para que a imagem caiba na folha
    const scale = Math.min(
        folhaWidth / imgWidth,  // Escala baseada na largura
        folhaHeight / imgHeight // Escala baseada na altura
    );

    // Aplicar a escala à imagem
    img.set({
        scaleX: scale,
        scaleY: scale
    });

    // Recalcular as dimensões após o redimensionamento
    const scaledWidth = imgWidth * scale;
    const scaledHeight = imgHeight * scale;

    // Centralizar a imagem no CloudFolha
    img.set({
        left: cloudFolha.left + (folhaWidth - scaledWidth) / 2,
        top: cloudFolha.top + (folhaHeight - scaledHeight) / 2
    });
}

// Função para substituir a imagem no canvas
function replaceImageOnCanvas(newImage) {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
        // Salvar as propriedades da imagem original
        const originalLeft = activeObject.left;
        const originalTop = activeObject.top;
        const originalScaleX = activeObject.scaleX;
        const originalScaleY = activeObject.scaleY;
        const originalAngle = activeObject.angle;

        // Aplicar as propriedades da imagem original à nova imagem
        newImage.set({
            left: originalLeft,
            top: originalTop,
            scaleX: originalScaleX,
            scaleY: originalScaleY,
            angle: originalAngle
        });

        // Remover a imagem original e adicionar a nova
        canvas.remove(activeObject);
        canvas.add(newImage);
        canvas.setActiveObject(newImage);
        canvas.renderAll();
    }
}

// Função para lidar com arquivos PDF
function handlePdfFile(file) {
    const modalHtml = `
        <div id="pdfModal" class="modal-overlay" style="display: flex;">
            <div class="modal-content" style="width: 600px; height: auto; padding: 20px; min-width: 300px; max-height: 80%; overflow-y: auto; display: flex;">
                <div id="pdfImageContainer" style="flex: 1; display: flex; justify-content: center; align-items: center; margin-right: 20px;">
                    <img id="pdfPageImage" src="" alt="PDF Page" style="max-width: 100%; max-height: 400px; border: 1px solid #ccc;">
                </div>
                <div style="flex: 1;">
                    <h3 style="color: white; margin-bottom: 20px;">Selecionar Página do PDF</h3>
                    <div style="margin-bottom: 20px;">
                        <input type="number" id="pdfPageInput" value="1" min="1"
                               style="width: 100%; padding: 8px; background: #1a4b8c; color: white; border: 1px solid #235ab4;">
                    </div>
                    <div style="display: flex; justify-content: flex-end; gap: 10px;">
                        <button id="pdfCancelBtn" class="menu-item" style="width: auto;">Cancelar</button>
                        <button id="pdfConfirmBtn" class="menu-item" style="width: auto; background: #ffd700; color: black;">Importar</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    const modal = document.getElementById('pdfModal');
    const cancelBtn = document.getElementById('pdfCancelBtn');
    const confirmBtn = document.getElementById('pdfConfirmBtn');
    const pageInput = document.getElementById('pdfPageInput');
    const pdfPageImage = document.getElementById('pdfPageImage');

    // Evento para mudar a página
    pageInput.addEventListener('input', () => {
        const pageNumber = parseInt(pageInput.value) || 1;
        loadPdfPageImage(file, pageNumber - 1);
    });

    // Função para carregar a imagem da página do PDF
    async function loadPdfPageImage(file, pageNumber) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;

        // Atualizar o máximo de páginas no input
        pageInput.max = pdf.numPages;

        if (pageNumber >= pdf.numPages) {
            showCustomAlert('Página não existente no PDF.');
            return;
        }

        const page = await pdf.getPage(pageNumber + 1);
        // Escala para preview
        const scale = 2;
        const viewport = page.getViewport({ scale });

        const tempCanvas = document.createElement('canvas');
        const context = tempCanvas.getContext('2d');
        tempCanvas.height = viewport.height;
        tempCanvas.width = viewport.width;

        // Configurar contexto para melhor qualidade mesmo no preview
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';

        await page.render({
            canvasContext: context,
            viewport: viewport
        }).promise;

        pdfPageImage.src = tempCanvas.toDataURL('image/png', 1.0);
    }

    // Carrega a primeira página ao abrir o modal
    loadPdfPageImage(file, 0);

    cancelBtn.addEventListener('click', () => {
        modal.remove();
    });

    confirmBtn.addEventListener('click', () => {
        const selectedPage = parseInt(pageInput.value) || 1;
        convertPdfToImage(file, selectedPage - 1).then(() => {
            modal.remove();
        });
    });
}

// Função para converter uma página do PDF em uma imagem
async function convertPdfToImage(file, pageNumber) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;

    if (pageNumber >= pdf.numPages) {
        showCustomAlert('Página não existente no PDF.');
        return;
    }

    const page = await pdf.getPage(pageNumber + 1);
    // Aumentar a escala para 300 DPI (300/72 = 4.17)
    const scale = 4.17;
    const viewport = page.getViewport({ scale });

    const tempCanvas = document.createElement('canvas');
    const context = tempCanvas.getContext('2d');

    // Configurar o canvas com dimensões maiores para maior qualidade
    tempCanvas.height = viewport.height;
    tempCanvas.width = viewport.width;

    // Configurar contexto para melhor qualidade
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';

    await page.render({
        canvasContext: context,
        viewport: viewport
    }).promise;

    if (!canvas || !canvas.add) {
        showCustomAlert('Erro ao carregar a área de trabalho. Por favor, feche e abra o app.');
        return;
    }

    fabric.Image.fromURL(tempCanvas.toDataURL('image/png', 1.0), function(img) {
        if (!img) {
            showCustomAlert('Erro ao carregar páginas do PDF.');
            return;
        }

        // Redimensionar e centralizar a imagem no CloudFolha
        resizeAndCenterImage(img);

        // Definir DPI para 300
        img.set('dpi', 300);

        // Substituir a imagem no canvas (igual ao processo do modal de pintar/contorno)
        replaceImageOnCanvas(img);

        try {
            canvas.add(img);
            img.setCoords(); // Força o recálculo da caixa de delimitação
            canvas.setActiveObject(img);
            canvas.renderAll();
            saveState();
        } catch (error) {
            showCustomAlert('Erro ao adicionar a página do PDF na área de trabalho.');
        }
    });
}

// Função para exportar o canvas como imagem
function exportCanvasToImage() {
    const cloudFolha = canvas.getObjects().find(obj => obj.id === 'CloudFolha');
    if (!cloudFolha) {
        showCustomAlert('Folha CloudFolha não encontrada.');
        return;
    }

    // Definir DPI para 300
    const dpi = 300;
    const scale = dpi / 96; // 96 é o DPI padrão do canvas

    // Criar um canvas temporário para exportação
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');

    // Definir as dimensões do canvas temporário com base no DPI
    tempCanvas.width = cloudFolha.width * scale;
    tempCanvas.height = cloudFolha.height * scale;

    // Desenhar o conteúdo do canvas no canvas temporário
    const objects = canvas.getObjects().filter(obj => obj.id !== 'CloudFolha');
    objects.forEach(obj => {
        const clone = fabric.util.object.clone(obj);
        clone.set({
            left: clone.left * scale,
            top: clone.top * scale,
            scaleX: clone.scaleX * scale,
            scaleY: clone.scaleY * scale
        });
        tempCtx.drawImage(clone.toCanvasElement(), 0, 0);
    });

    // Converter o canvas temporário em uma imagem
    const imageDataUrl = tempCanvas.toDataURL('image/png', 1.0);

    // Criar um link para download da imagem
    const link = document.createElement('a');
    link.download = 'exported-image.png';
    link.href = imageDataUrl;
    link.click();
}

// Função para obter o centro do canvas
function getCanvasCenter() {
    return {
        left: canvas.getWidth() / 2,
        top: canvas.getHeight() / 2
    };
}

// Eventos de drag and drop
document.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
});

document.addEventListener('drop', handleDrop);
