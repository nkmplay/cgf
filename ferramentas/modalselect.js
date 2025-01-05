document.addEventListener('DOMContentLoaded', function () {
    const canvas = window.canvas; // Certifique-se de que o objeto canvas está acessível globalmente

    function initSelectModal() {
        const activeImage = canvas.getActiveObject();
        if (!activeImage || activeImage.type !== 'image') return;

        // Remover modal anterior se existir
        const existingModal = document.getElementById('imageEditModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Criar o modal
        const modal = document.createElement('div');
        modal.id = 'imageEditModal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.8);
            z-index: 2000;
            display: flex;
            flex-direction: column;
        `;

        const content = document.createElement('div');
        content.style.cssText = `
            height: 90%;
            position: relative;
            overflow: hidden;
            background: #16213e;
        `;

        const imageContainer = document.createElement('div');
        imageContainer.style.cssText = `
            width: 100%;
            height: 100%;
            overflow: auto;
            display: flex;
            justify-content: center;
            align-items: center;
        `;

        const editCanvas = document.createElement('canvas');
        editCanvas.id = 'editCanvas';

        const toolbar = document.createElement('div');
        toolbar.style.cssText = `
            height: 10%;
            background: #0f3460;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 20px;
        `;

        const leftTools = document.createElement('div');
        const rightTools = document.createElement('div');
        leftTools.style.cssText = rightTools.style.cssText = `
            display: flex;
            gap: 10px;
        `;

        const buttonStyle = `
            background: #4a90e2;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
        `;

        const tools = [
            { text: 'Quadrado', id: 'squareSelect' },
            { text: 'Redondo', id: 'circleSelect' },
            { text: 'Laço', id: 'lassoSelect' },
            { text: 'Cor', id: 'colorSelect' },
            { text: 'X', id: 'resetColor' }
        ];

        tools.forEach(tool => {
            const button = document.createElement('button');
            button.textContent = tool.text;
            button.id = tool.id;
            button.style.cssText = buttonStyle;
            button.classList.add('modal-btn');
            leftTools.appendChild(button);
        });

        const copyBtn = document.createElement('button');
        copyBtn.textContent = 'Copiar';
        copyBtn.id = 'copySelection';
        copyBtn.style.cssText = buttonStyle;
        rightTools.appendChild(copyBtn);

        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Fechar';
        closeBtn.id = 'closeModal';
        closeBtn.style.cssText = buttonStyle;
        rightTools.appendChild(closeBtn);

        toolbar.appendChild(leftTools);
        toolbar.appendChild(rightTools);
        imageContainer.appendChild(editCanvas);
        content.appendChild(imageContainer);
        modal.appendChild(content);
        modal.appendChild(toolbar);
        document.body.appendChild(modal);

        // Configurar o canvas de edição
        editCanvas.width = activeImage.width * activeImage.scaleX;
        editCanvas.height = activeImage.height * activeImage.scaleY;
        const editContext = editCanvas.getContext('2d');
        editContext.drawImage(activeImage.getElement(), 0, 0, editCanvas.width, editCanvas.height);

        // Criar um objeto para armazenar os estados
        const editState = {
            isDrawing: false,
            selectionMode: 'square',
            selectionPath: [],
            originalImageData: null,
            isColorSelection: false
        };

        // Funções de desenho
        function drawSelectionRect(x, y) {
            const startX = editState.selectionPath[0][0];
            const startY = editState.selectionPath[0][1];
            editContext.save();
            editContext.setLineDash([5, 5]);
            editContext.strokeStyle = '#ffffff';
            editContext.strokeRect(startX, startY, x - startX, y - startY);
            editContext.strokeStyle = '#000000';
            editContext.strokeRect(startX + 1, startY + 1, x - startX - 2, y - startY - 2);
            editContext.restore();
            editState.selectionPath = [[startX, startY], [x, y]];
        }

        function drawSelectionCircle(x, y) {
            const startX = editState.selectionPath[0][0];
            const startY = editState.selectionPath[0][1];
            const width = Math.max(0, x - startX);
            const height = Math.max(0, y - startY);
            const diameter = Math.max(width, height);
            editContext.save();
            editContext.setLineDash([5, 5]);
            editContext.beginPath();
            editContext.arc(startX, startY, diameter, 0, Math.PI * 2);
            editContext.strokeStyle = '#ffffff';
            editContext.stroke();
            editContext.beginPath();
            editContext.arc(startX, startY, diameter - 1, 0, Math.PI * 2);
            editContext.strokeStyle = '#000000';
            editContext.stroke();
            editContext.restore();
            editState.selectionPath = [[startX, startY], [x, y]];
        }

        function drawLassoSelection(x, y) {
            editState.selectionPath.push([x, y]);
            editContext.lineTo(x, y);
            editContext.strokeStyle = '#ffffff';
            editContext.stroke();
            editContext.strokeStyle = '#000000';
            editContext.stroke();
        }

        function clearSelection() {
            if (editContext && activeImage && activeImage.getElement()) {
                editContext.clearRect(0, 0, editCanvas.width, editCanvas.height);
                editContext.drawImage(activeImage.getElement(), 0, 0, editCanvas.width, editCanvas.height);
                editState.selectionPath = [];
                editState.originalImageData = null;
                editState.isColorSelection = false;
            }
        }

        function copySelectedAreaEdit() {
            if (editState.isColorSelection) {
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = editCanvas.width;
                tempCanvas.height = editCanvas.height;
                const tempCtx = tempCanvas.getContext('2d');
                tempCtx.drawImage(editCanvas, 0, 0);
                const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
                let minX = tempCanvas.width,
                    minY = tempCanvas.height,
                    maxX = 0,
                    maxY = 0;
                for (let y = 0; y < tempCanvas.height; y++) {
                    for (let x = 0; x < tempCanvas.width; x++) {
                        const alpha = imageData.data[(y * tempCanvas.width + x) * 4 + 3];
                        if (alpha > 0) {
                            minX = Math.min(minX, x);
                            minY = Math.min(minY, y);
                            maxX = Math.max(maxX, x);
                            maxY = Math.max(maxY, y);
                        }
                    }
                }
                const croppedCanvas = document.createElement('canvas');
                croppedCanvas.width = maxX - minX + 1;
                croppedCanvas.height = maxY - minY + 1;
                const croppedCtx = croppedCanvas.getContext('2d');
                croppedCtx.drawImage(tempCanvas, minX, minY, maxX - minX + 1, maxY - minY + 1, 0, 0, maxX - minX + 1, maxY - minY + 1);

                fabric.Image.fromURL(croppedCanvas.toDataURL(), img => {
                    const cloudFolha = canvas.getObjects().find(obj => obj.id === 'CloudFolha');
                    if (cloudFolha) {
                        const centerX = cloudFolha.left + cloudFolha.width / 2;
                        const centerY = cloudFolha.top + cloudFolha.height / 2;

                        img.set({
                            left: centerX - img.width / 2,
                            top: centerY - img.height / 2
                        });
                    }
                    canvas.add(img);
                    canvas.renderAll();
                    modal.remove();
                    clearSelection();
                });
                return;
            }

            if (!editState.selectionPath.length) return;
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = editCanvas.width;
            tempCanvas.height = editCanvas.height;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.drawImage(editCanvas, 0, 0);
            const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
            let minX = tempCanvas.width,
                minY = tempCanvas.height,
                maxX = 0,
                maxY = 0;
            for (let y = 0; y < tempCanvas.height; y++) {
                for (let x = 0; x < tempCanvas.width; x++) {
                    const alpha = imageData.data[(y * tempCanvas.width + x) * 4 + 3];
                    if (alpha > 0) {
                        minX = Math.min(minX, x);
                        minY = Math.min(minY, y);
                        maxX = Math.max(maxX, x);
                        maxY = Math.max(maxY, y);
                    }
                }
            }
            const croppedCanvas = document.createElement('canvas');
            croppedCanvas.width = maxX - minX + 1;
            croppedCanvas.height = maxY - minY + 1;
            const croppedCtx = croppedCanvas.getContext('2d');
            croppedCtx.drawImage(tempCanvas, minX, minY, maxX - minX + 1, maxY - minY + 1, 0, 0, maxX - minX + 1, maxY - minY + 1);

            fabric.Image.fromURL(croppedCanvas.toDataURL(), img => {
                const cloudFolha = canvas.getObjects().find(obj => obj.id === 'CloudFolha');
                if (cloudFolha) {
                    const centerX = cloudFolha.left + cloudFolha.width / 2;
                    const centerY = cloudFolha.top + cloudFolha.height / 2;

                    img.set({
                        left: centerX - img.width / 2,
                        top: centerY - img.height / 2
                    });
                }
                canvas.add(img);
                canvas.renderAll();
                modal.remove();
                clearSelection();
            });
        }

        // Adicionar eventos para cada ferramenta
        const toolEvents = ['squareSelect', 'circleSelect', 'lassoSelect', 'colorSelect'];
        toolEvents.forEach(tool => {
            const toolBtn = document.getElementById(tool);
            toolBtn.addEventListener('click', function () {
                toolEvents.forEach(t => document.getElementById(t).classList.remove('active'));
                this.classList.add('active');
                editState.selectionMode = tool.replace('Select', '');
            });
        });

        // Event listeners do canvas
        editCanvas.addEventListener('mousedown', function (e) {
            if (editState.selectionMode === 'color') {
                const rect = editCanvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                if (!editState.originalImageData) {
                    editState.originalImageData = editContext.getImageData(0, 0, editCanvas.width, editCanvas.height);
                }
                const pixel = editContext.getImageData(x, y, 1, 1);
                const [r, g, b] = pixel.data;
                const imageData = editContext.createImageData(editCanvas.width, editCanvas.height);
                for (let i = 0; i < editState.originalImageData.data.length; i += 4) {
                    if (Math.abs(editState.originalImageData.data[i] - r) < 10 &&
                        Math.abs(editState.originalImageData.data[i + 1] - g) < 10 &&
                        Math.abs(editState.originalImageData.data[i + 2] - b) < 10) {
                        imageData.data[i] = editState.originalImageData.data[i];
                        imageData.data[i + 1] = editState.originalImageData.data[i + 1];
                        imageData.data[i + 2] = editState.originalImageData.data[i + 2];
                        imageData.data[i + 3] = editState.originalImageData.data[i + 3];
                    } else {
                        imageData.data[i + 3] = 0;
                    }
                }
                editContext.putImageData(imageData, 0, 0);
                editState.isColorSelection = true;
                return;
            }
            editState.isDrawing = true;
            const rect = editCanvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            editState.selectionPath = [[x, y]];
            editContext.save();
            editContext.strokeStyle = '#ffffff';
            editContext.lineWidth = 2;
            editContext.beginPath();
            editContext.moveTo(x, y);
        });

        editCanvas.addEventListener('mousemove', function (e) {
            if (!editState.isDrawing) return;
            const rect = editCanvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            editContext.clearRect(0, 0, editCanvas.width, editCanvas.height);
            editContext.drawImage(activeImage.getElement(), 0, 0, editCanvas.width, editCanvas.height);

            if (editState.selectionMode === 'square') {
                drawSelectionRect(x, y);
            } else if (editState.selectionMode === 'circle') {
                drawSelectionCircle(x, y);
            } else if (editState.selectionMode === 'lasso') {
                drawLassoSelection(x, y);
            }
        });

        editCanvas.addEventListener('mouseup', function () {
            if (!editState.isDrawing) return;
            editState.isDrawing = false;
            editContext.restore();
            if (editState.selectionMode === 'square' || editState.selectionMode === 'circle' || editState.selectionMode === 'lasso') {
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = editCanvas.width;
                tempCanvas.height = editCanvas.height;
                const tempCtx = tempCanvas.getContext('2d');
                tempCtx.drawImage(activeImage.getElement(), 0, 0, editCanvas.width, editCanvas.height);
                editContext.clearRect(0, 0, editCanvas.width, editCanvas.height);
                editContext.save();
                editContext.beginPath();
                if (editState.selectionMode === 'square') {
                    const [startX, startY] = editState.selectionPath[0];
                    const [endX, endY] = editState.selectionPath[editState.selectionPath.length - 1];
                    editContext.rect(startX, startY, endX - startX, endY - startY);
                } else if (editState.selectionMode === 'circle') {
                    const [startX, startY] = editState.selectionPath[0];
                    const [endX, endY] = editState.selectionPath[editState.selectionPath.length - 1];
                    const diameter = Math.max(0, endX - startX, endY - startY);
                    editContext.arc(startX, startY, diameter, 0, Math.PI * 2);
                } else if (editState.selectionMode === 'lasso') {
                    editContext.moveTo(editState.selectionPath[0][0], editState.selectionPath[0][1]);
                    for (let i = 1; i < editState.selectionPath.length; i++) {
                        editContext.lineTo(editState.selectionPath[i][0], editState.selectionPath[i][1]);
                    }
                    editContext.lineTo(editState.selectionPath[0][0], editState.selectionPath[0][1]);
                }
                editContext.clip();
                editContext.drawImage(tempCanvas, 0, 0);
                editContext.restore();
            }
        });

        // Botão de fechar
        document.getElementById('closeModal').addEventListener('click', function() {
            modal.remove();
            clearSelection();
        });

        // Botão de copiar
        document.getElementById('copySelection').addEventListener('click', function() {
            copySelectedAreaEdit();
        });

        // Botão de resetar cor
        document.getElementById('resetColor').addEventListener('click', function() {
            if (activeImage && activeImage.getElement()) {
                editContext.clearRect(0, 0, editCanvas.width, editCanvas.height);
                editContext.drawImage(activeImage.getElement(), 0, 0, editCanvas.width, editCanvas.height);
                editState.isColorSelection = false;
                editState.originalImageData = null;
            }
        });
    }

    window.initSelectModal = initSelectModal;
});
