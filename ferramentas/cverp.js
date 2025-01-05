// cverp.js

function openCropModal(canvas, activeObject) {
    if (!activeObject || activeObject.type !== 'image') {
        showCustomAlert('Selecione uma imagem para recortar.');
        return;
    }

    const boundingRect = activeObject.getBoundingRect();

    const originalState = {
        left: activeObject.left,
        top: activeObject.top,
        angle: activeObject.angle,
        flipX: activeObject.flipX,
        flipY: activeObject.flipY,
        skewX: activeObject.skewX,
        skewY: activeObject.skewY,
        originX: activeObject.originX,
        originY: activeObject.originY,
        width: activeObject.width,
        height: activeObject.height,
        scaleX: activeObject.scaleX,
        scaleY: activeObject.scaleY,
        boundingWidth: boundingRect.width,
        boundingHeight: boundingRect.height
    };

    const imgElement = activeObject.getElement();
    const cropModal = document.getElementById('cropModal');
    const cropImage = document.getElementById('cropImage');
    cropModal.dataset.originalState = JSON.stringify(originalState);

    cropImage.src = imgElement.src;
    cropModal.style.display = 'flex';

    if (cropper) {
        cropper.destroy();
    }

    cropper = new Cropper(cropImage, {
        aspectRatio: NaN,
        viewMode: 1,
        autoCropArea: 0.9,
        zoomable: true,
        scalable: true,
        initialAspectRatio: NaN,
        ready() {
            const containerData = this.cropper.getContainerData();
            const imageData = this.cropper.getImageData();
            const scale = Math.min(
                containerData.width / imageData.naturalWidth,
                containerData.height / imageData.naturalHeight
            );
            this.cropper.zoomTo(scale);
        }
    });

    document.getElementById('saveCrop').addEventListener('click', function () {
        if (!cropper) return;

        const canvasCropped = cropper.getCroppedCanvas({
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high'
        });

        const croppedImageData = canvasCropped.toDataURL();

        fabric.Image.fromURL(croppedImageData, function (newImage) {
            newImage.set({
                left: activeObject.left,
                top: activeObject.top,
                scaleX: activeObject.scaleX,
                scaleY: activeObject.scaleY,
                angle: activeObject.angle
            });

            canvas.remove(activeObject);
            canvas.add(newImage);
            canvas.setActiveObject(newImage);
            canvas.renderAll();
            saveState();

            cropModal.style.display = 'none';
            cropper.destroy();
        });
    });

    document.getElementById('closeCropModal').addEventListener('click', function () {
        cropModal.style.display = 'none';
        if (cropper) {
            cropper.destroy();
        }
    });
}

function openVectorizeModal(canvas, activeObject) {
    if (!activeObject || activeObject.type !== 'image') {
        showCustomAlert('Selecione uma imagem para vetorizar.');
        return;
    }

    const cloudFolha = canvas.getObjects().find(obj => obj.id === 'CloudFolha');
    if (!cloudFolha) {
        showCustomAlert('Folha "CloudFolha" não encontrada.');
        return;
    }

    const centerX = cloudFolha.left + (cloudFolha.width * cloudFolha.scaleX) / 2;
    const centerY = cloudFolha.top + (cloudFolha.height * cloudFolha.scaleY) / 2;

    const imgElement = activeObject.getElement();

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = imgElement.width;
    tempCanvas.height = imgElement.height;
    const ctx = tempCanvas.getContext('2d');

    ctx.drawImage(imgElement, 0, 0);

    const imageData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const brightness = (r + g + b) / 3;
        const threshold = 128;

        data[i] = data[i + 1] = data[i + 2] = brightness > threshold ? 255 : 0;
    }

    ctx.putImageData(imageData, 0, 0);

    tempCanvas.toBlob(function (blob) {
        Potrace.loadImageFromFile(new File([blob], "image.png", { type: "image/png" }));
        Potrace.process(function () {
            const svgContent = Potrace.getSVG(1, {
                turdsize: 2,
                alphamax: 1,
                optcurve: true,
                detail: 5
            });

            fabric.loadSVGFromString(svgContent, function (objects, options) {
                const svgGroup = fabric.util.groupSVGElements(objects, options);

                svgGroup.set({
                    left: centerX - (svgGroup.width * svgGroup.scaleX) / 2,
                    top: centerY - (svgGroup.height * svgGroup.scaleY) / 2,
                    selectable: true,
                    evented: true
                });

                canvas.add(svgGroup);
                canvas.renderAll();
                saveState();
            });
        });
    }, 'image/png');
}

function openExtractRegionsModal(canvas, activeObject) {
    if (!activeObject || activeObject.type !== 'image') {
        showCustomAlert('Selecione uma imagem para extrair as regiões');
        return;
    }

    const imgElement = activeObject.getElement();
    const canvasTemp = document.createElement('canvas');
    const ctxTemp = canvasTemp.getContext('2d');
    canvasTemp.width = imgElement.width;
    canvasTemp.height = imgElement.height;
    ctxTemp.drawImage(imgElement, 0, 0);

    const imageData = ctxTemp.getImageData(0, 0, canvasTemp.width, canvasTemp.height);
    const visited = new Set();
    const regions = [];

    const minRegionSize = 10;

    for (let y = 0; y < canvasTemp.height; y++) {
        for (let x = 0; x < canvasTemp.width; x++) {
            const pos = (y * canvasTemp.width + x) * 4;
            const alpha = imageData.data[pos + 3];

            if (alpha > 0 && !visited.has(`${x},${y}`)) {
                const region = findRegion(imageData, x, y, canvasTemp.width, canvasTemp.height, visited);
                if (region.pixels.length > 0) {
                    const width = region.bounds.maxX - region.bounds.minX + 1;
                    const height = region.bounds.maxY - region.bounds.minY + 1;
                    if (width >= minRegionSize && height >= minRegionSize) {
                        regions.push(region);
                        addRegionToCanvas(region, imgElement);
                    }
                }
            }
        }
    }

    showCustomAlert(`Extraídas ${regions.length} regiões da imagem.`);
}

function findRegion(imageData, startX, startY, width, height, visited) {
    const pixels = [];
    const queue = [[startX, startY]];
    let minX = startX, minY = startY, maxX = startX, maxY = startY;

    while (queue.length > 0) {
        const [x, y] = queue.shift();
        const key = `${x},${y}`;

        if (visited.has(key)) continue;
        visited.add(key);

        const pos = (y * width + x) * 4;
        if (imageData.data[pos + 3] > 0) {
            pixels.push([x, y]);
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);

            const neighbors = [
                [x + 1, y], [x - 1, y],
                [x, y + 1], [x, y - 1]
            ];

            for (const [nx, ny] of neighbors) {
                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                    const npos = (ny * width + nx) * 4;
                    if (imageData.data[npos + 3] > 0) {
                        queue.push([nx, ny]);
                    }
                }
            }
        }
    }

    return {
        pixels,
        bounds: { minX, minY, maxX, maxY }
    };
}

function addRegionToCanvas(region, imgElement) {
    const canvasTemp = document.createElement('canvas');
    const ctxTemp = canvasTemp.getContext('2d');
    const width = region.bounds.maxX - region.bounds.minX + 1;
    const height = region.bounds.maxY - region.bounds.minY + 1;

    canvasTemp.width = width;
    canvasTemp.height = height;

    ctxTemp.drawImage(imgElement,
        region.bounds.minX, region.bounds.minY, width, height,
        0, 0, width, height);

    const imageData = ctxTemp.getImageData(0, 0, width, height);
    const pixels = new Set(region.pixels.map(([x, y]) => `${x - region.bounds.minX},${y - region.bounds.minY}`));

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (!pixels.has(`${x},${y}`)) {
                const pos = (y * width + x) * 4;
                imageData.data[pos + 3] = 0;
            }
        }
    }

    ctxTemp.putImageData(imageData, 0, 0);

    fabric.Image.fromURL(canvasTemp.toDataURL(), function (img) {
        img.set({
            left: region.bounds.minX,
            top: region.bounds.minY,
            originX: 'left',
            originY: 'top',
            selectable: true,
            evented: true
        });
        canvas.add(img);
        canvas.renderAll();
    });
}

function openRemoveColorModal(canvas, activeObject) {
    if (!activeObject || activeObject.type !== 'image') {
        showCustomAlert('Selecione uma imagem para remover a cor');
        return;
    }

    originalImagePosition = {
        left: activeObject.left,
        top: activeObject.top
    };

    const removeColorModal = document.getElementById('removeColorModal');
    const removeColorCanvas = document.getElementById('removeColorCanvas');

    const originalImage = activeObject._element;
    removeColorCanvas.width = originalImage.width;
    removeColorCanvas.height = originalImage.height;

    const ctx = removeColorCanvas.getContext('2d');
    ctx.drawImage(originalImage, 0, 0, originalImage.width, originalImage.height);

    removeColorHistory = [];
    currentRemoveColorIndex = -1;
    saveRemoveColorHistory(ctx.getImageData(0, 0, removeColorCanvas.width, removeColorCanvas.height));

    removeColorModal.style.display = 'flex';

    document.getElementById('closeRemoveColorModal').addEventListener('click', function () {
        removeColorModal.style.display = 'none';
    });

    document.getElementById('undoRemoveColor').addEventListener('click', function () {
        if (currentRemoveColorIndex > 0) {
            currentRemoveColorIndex--;
            const previousState = removeColorHistory[currentRemoveColorIndex];
            const ctx = removeColorCanvas.getContext('2d');
            ctx.putImageData(previousState, 0, 0);
        }
    });

    document.getElementById('saveRemoveColor').addEventListener('click', function () {
        const dataURL = removeColorCanvas.toDataURL('image/png', 1.0);
        const originalProps = {
            left: originalImagePosition.left,
            top: originalImagePosition.top,
            scaleX: activeObject.scaleX,
            scaleY: activeObject.scaleY,
            angle: activeObject.angle,
            flipX: activeObject.flipX,
            flipY: activeObject.flipY,
            width: activeObject.width,
            height: activeObject.height,
            originX: activeObject.originX,
            originY: activeObject.originY,
            centeredScaling: activeObject.centeredScaling,
            centeredRotation: activeObject.centeredRotation
        };

        canvas.remove(activeObject);

        fabric.Image.fromURL(dataURL, function (newImage) {
            newImage.set(originalProps);

            newImage.setCoords();

            canvas.add(newImage);
            canvas.setActiveObject(newImage);
            canvas.renderAll();
            saveState();

            removeColorModal.style.display = 'none';
        });
    });

    removeColorCanvas.addEventListener('click', (e) => {
        if (currentRemoveMode === 'region') {
            handleRemoveColorRegion(e);
        } else {
            handleRemoveColorTotal(e);
        }
    });

    document.getElementById('removeRegionBtn').addEventListener('click', () => {
        currentRemoveMode = 'region';
        removeRegionBtn.classList.add('active');
        removeTotalBtn.classList.remove('active');
        updateButtonStyles();
    });

    document.getElementById('removeTotalBtn').addEventListener('click', () => {
        currentRemoveMode = 'total';
        removeTotalBtn.classList.add('active');
        removeRegionBtn.classList.remove('active');
        updateButtonStyles();
    });

    document.getElementById('removeColorModal').addEventListener('click', function (e) {
        if (e.target === this) {
            this.style.display = 'none';
        }
    });
}

function saveRemoveColorHistory(imageData) {
    removeColorHistory = removeColorHistory.slice(0, currentRemoveColorIndex + 1);
    removeColorHistory.push(imageData);
    currentRemoveColorIndex = removeColorHistory.length - 1;
}

function handleRemoveColorRegion(e) {
    if (!removeColorCtx) return;

    const currentState = removeColorCtx.getImageData(0, 0, removeColorCanvas.width, removeColorCanvas.height);
    saveRemoveColorHistory(currentState);

    const rect = removeColorCanvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) * (removeColorCanvas.width / rect.width));
    const y = Math.floor((e.clientY - rect.top) * (removeColorCanvas.height / rect.height));

    const imageData = removeColorCtx.getImageData(0, 0, removeColorCanvas.width, removeColorCanvas.height);
    const tolerance = parseInt(sensitivityRange.value);

    const processedImageData = floodFillAtPoint(
        imageData,
        x,
        y,
        { r: 0, g: 0, b: 0, a: 0 },
        tolerance
    );

    removeColorCtx.putImageData(processedImageData, 0, 0);
}

function handleRemoveColorTotal(e) {
    if (!removeColorCtx) return;

    const currentState = removeColorCtx.getImageData(0, 0, removeColorCanvas.width, removeColorCanvas.height);
    saveRemoveColorHistory(currentState);

    const rect = removeColorCanvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) * (removeColorCanvas.width / rect.width));
    const y = Math.floor((e.clientY - rect.top) * (removeColorCanvas.height / rect.height));

    const imageData = removeColorCtx.getImageData(0, 0, removeColorCanvas.width, removeColorCanvas.height);
    const tolerance = parseInt(sensitivityRange.value);
    const targetColor = getPixel(imageData, x, y);

    const processedImageData = floodFillEntireImage(
        imageData,
        targetColor,
        { r: 0, g: 0, b: 0, a: 0 },
        tolerance
    );

    removeColorCtx.putImageData(processedImageData, 0, 0);
}

function floodFillAtPoint(imageData, startX, startY, fillColor, tolerance) {
    const width = imageData.width;
    const height = imageData.height;
    const visited = new Uint8Array(width * height);
    const queue = [];

    const targetColor = getPixel(imageData, startX, startY);
    if (!targetColor) return imageData;

    queue.push([startX, startY]);
    visited[startY * width + startX] = 1;

    while (queue.length > 0) {
        const [x, y] = queue.shift();
        const currentPixel = getPixel(imageData, x, y);

        if (colorMatch(currentPixel, targetColor, tolerance)) {
            setPixel(imageData, x, y, fillColor);

            [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]].forEach(([nx, ny]) => {
                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                    const index = ny * width + nx;
                    if (!visited[index]) {
                        visited[index] = 1;
                        queue.push([nx, ny]);
                    }
                }
            });
        }
    }

    return imageData;
}

function floodFillEntireImage(imageData, targetColor, fillColor, tolerance) {
    const width = imageData.width;
    const height = imageData.height;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const currentPixel = getPixel(imageData, x, y);
            if (colorMatch(currentPixel, targetColor, tolerance)) {
                setPixel(imageData, x, y, fillColor);
            }
        }
    }

    return imageData;
}

function getPixel(imageData, x, y) {
    const index = (y * imageData.width + x) * 4;
    if (index >= imageData.data.length) return null;
    return {
        r: imageData.data[index],
        g: imageData.data[index + 1],
        b: imageData.data[index + 2],
        a: imageData.data[index + 3]
    };
}

function setPixel(imageData, x, y, color) {
    const index = (y * imageData.width + x) * 4;
    if (index >= imageData.data.length) return;
    imageData.data[index] = color.r;
    imageData.data[index + 1] = color.g;
    imageData.data[index + 2] = color.b;
    imageData.data[index + 3] = color.a;
}

function colorMatch(c1, c2, tolerance) {
    if (!c1 || !c2) return false;
    return Math.abs(c1.r - c2.r) <= tolerance &&
        Math.abs(c1.g - c2.g) <= tolerance &&
        Math.abs(c1.b - c2.b) <= tolerance;
}

function openPaintingModal(canvas, activeObject, tool) {
    if (!activeObject || activeObject.type !== 'image') {
        showCustomAlert('Selecione uma imagem primeiro');
        return;
    }

    let paintingHistory = [];
    let currentPaintingIndex = -1;
    const maxHistoryStates = 10;
    let originalImagePosition = { left: 0, top: 0 };
    function savePaintingHistory(ctx) {
        const imageData = ctx.getImageData(0, 0, paintingCanvas.width, paintingCanvas.height);
        paintingHistory = paintingHistory.slice(0, currentPaintingIndex + 1);
        paintingHistory.push(imageData);
        currentPaintingIndex++;

        if (paintingHistory.length > maxHistoryStates) {
            paintingHistory.shift();
            currentPaintingIndex--;
        }

        undoButton.disabled = currentPaintingIndex <= 0;
    }

    function undoPainting() {
        if (currentPaintingIndex > 0) {
            currentPaintingIndex--;
            const previousState = paintingHistory[currentPaintingIndex];
            paintingCtx.putImageData(previousState, 0, 0);
            undoButton.disabled = currentPaintingIndex <= 0;
        }
    }

    const modal = document.createElement('div');
    modal.classList.add('modal-overlay');

    const modalContent = document.createElement('div');
    modalContent.classList.add('modal-content');

    const modalBody = document.createElement('div');
    modalBody.classList.add('modal-body');

    const paintingCanvas = document.createElement('canvas');
    paintingCanvas.style.maxWidth = '100%';
    paintingCanvas.style.maxHeight = '100%';
    paintingCanvas.style.border = '1px solid #ccc';
    modalBody.appendChild(paintingCanvas);

    const modalFooter = document.createElement('div');
    modalFooter.classList.add('modal-footer');

    const brushButton = document.createElement('button');
    brushButton.id = 'brushButton';
    brushButton.classList.add('modal-btn');
    brushButton.textContent = 'Pincel';
    brushButton.addEventListener('click', () => {
        setTool('brush');
        hideButtonsExcept('brushButton');
    });

    const eraserButton = document.createElement('button');
    eraserButton.id = 'eraserButton';
    eraserButton.classList.add('modal-btn');
    eraserButton.textContent = 'Borracha';
    eraserButton.addEventListener('click', () => {
        setTool('eraser');
        hideButtonsExcept('eraserButton');
    });

    const bucketButton = document.createElement('button');
    bucketButton.id = 'bucketButton';
    bucketButton.classList.add('modal-btn');
    bucketButton.textContent = 'Balde';
    bucketButton.addEventListener('click', () => {
        setTool('bucket');
        hideButtonsExcept('bucketButton');
    });

    const closeButton = document.createElement('button');
    closeButton.classList.add('modal-btn');
    closeButton.textContent = 'Fechar';
    closeButton.addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    const saveButton = document.createElement('button');
    saveButton.classList.add('modal-btn');
    saveButton.textContent = 'Salvar';
    saveButton.addEventListener('click', () => {
        const imageURL = paintingCanvas.toDataURL('image/png', 1.0);
        fabric.Image.fromURL(imageURL, (img) => {
            const originalLeft = activeObject.left;
            const originalTop = activeObject.top;

            img.set({
                left: originalLeft,
                top: originalTop,
                scaleX: activeObject.scaleX,
                scaleY: activeObject.scaleY,
                angle: activeObject.angle
            });

            canvas.remove(activeObject);
            canvas.add(img);
            canvas.renderAll();
            document.body.removeChild(modal);
        });
    });

    const undoButton = document.createElement('button');
    undoButton.classList.add('modal-btn');
    undoButton.textContent = 'Voltar';
    undoButton.disabled = true;
    undoButton.addEventListener('click', undoPainting);

    const sizeSlider = document.createElement('input');
    sizeSlider.type = 'range';
    sizeSlider.min = '1';
    sizeSlider.max = '500';
    sizeSlider.value = '10';
    sizeSlider.style.width = '100px';
    sizeSlider.classList.add('modal-slider');

    const colorPicker = document.createElement('input');
    colorPicker.type = 'color';
    colorPicker.value = '#000000';

    modalFooter.appendChild(brushButton);
    modalFooter.appendChild(eraserButton);
    modalFooter.appendChild(bucketButton);
    modalFooter.appendChild(sizeSlider);
    modalFooter.appendChild(colorPicker);
    modalFooter.appendChild(undoButton);
    modalFooter.appendChild(closeButton);
    modalFooter.appendChild(saveButton);

    modalContent.appendChild(modalBody);
    modalContent.appendChild(modalFooter);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    const paintingCtx = paintingCanvas.getContext('2d');
    const imageElement = activeObject.getElement();
    const originalWidth = imageElement.naturalWidth;
    const originalHeight = imageElement.naturalHeight;

    const imageRatio = originalWidth / originalHeight;
    const modalWidth = modalContent.clientWidth;
    const modalHeight = modalContent.clientHeight;
    let canvasWidth, canvasHeight;

    if (imageRatio > 1) {
        canvasWidth = modalWidth * 0.9;
        canvasHeight = canvasWidth / imageRatio;
    } else {
        canvasHeight = modalHeight * 0.9;
        canvasWidth = canvasHeight * imageRatio;
    }

    paintingCanvas.width = canvasWidth;
    paintingCanvas.height = canvasHeight;

    paintingCtx.drawImage(imageElement, 0, 0, originalWidth, originalHeight, 0, 0, canvasWidth, canvasHeight);

    savePaintingHistory(paintingCtx);

    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    let currentTool = tool;

    const hideButtonsExcept = (buttonId) => {
        const buttons = [brushButton, eraserButton, bucketButton];
        buttons.forEach(button => {
            if (button.id !== buttonId) {
                button.style.display = 'none';
            } else {
                button.style.display = 'inline-block';
            }
        });
    };

    if (tool === 'brush') {
        hideButtonsExcept('brushButton');
    } else if (tool === 'eraser') {
        hideButtonsExcept('eraserButton');
    } else if (tool === 'bucket') {
        hideButtonsExcept('bucketButton');
    }

    const getMousePos = (canvas, e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    };

    const draw = (e) => {
        if (!isDrawing) return;

        const pos = getMousePos(paintingCanvas, e);
        paintingCtx.lineWidth = parseInt(sizeSlider.value);
        paintingCtx.lineCap = 'round';
        paintingCtx.lineJoin = 'round';

        if (currentTool === 'eraser') {
            paintingCtx.globalCompositeOperation = 'destination-out';
            paintingCtx.strokeStyle = 'rgba(0,0,0,1)';
        } else {
            paintingCtx.globalCompositeOperation = 'source-over';
            paintingCtx.strokeStyle = colorPicker.value;
        }

        paintingCtx.beginPath();
        paintingCtx.moveTo(lastX, lastY);
        paintingCtx.lineTo(pos.x, pos.y);
        paintingCtx.stroke();

        [lastX, lastY] = [pos.x, pos.y];
    };

    const floodFill = (x, y, fillColor) => {
        savePaintingHistory(paintingCtx);

        const imageData = paintingCtx.getImageData(0, 0, paintingCanvas.width, paintingCanvas.height);
        const targetColor = getPixel(imageData, x, y);
        const fillColorRGB = hexToRgb(fillColor);

        if (colorMatch(targetColor, fillColorRGB, 0)) return;

        const queue = [[x, y]];
        while (queue.length > 0) {
            const [cx, cy] = queue.shift();
            if (cx < 0 || cx >= paintingCanvas.width || cy < 0 || cy >= paintingCanvas.height) continue;

            const currentPixel = getPixel(imageData, cx, cy);
            if (colorMatch(currentPixel, targetColor, 10)) {
                setPixel(imageData, cx, cy, fillColorRGB);
                queue.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
            }
        }
        paintingCtx.putImageData(imageData, 0, 0);
    };

    const hexToRgb = (hex) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return { r, g, b, a: 255 };
    };

    const setTool = (tool) => {
        currentTool = tool;
    };

    paintingCanvas.addEventListener('mousedown', (e) => {
        savePaintingHistory(paintingCtx);
        isDrawing = true;
        const pos = getMousePos(paintingCanvas, e);
        [lastX, lastY] = [pos.x, pos.y];

        if (currentTool === 'bucket') {
            floodFill(Math.floor(pos.x), Math.floor(pos.y), colorPicker.value);
        }
    });

    function updateButtonStyles() {
    const removeRegionBtn = document.getElementById('removeRegionBtn');
    const removeTotalBtn = document.getElementById('removeTotalBtn');

    if (currentRemoveMode === 'region') {
        removeRegionBtn.classList.add('active');
        removeTotalBtn.classList.remove('active');
    } else {
        removeTotalBtn.classList.add('active');
        removeRegionBtn.classList.remove('active');
    }
}

    paintingCanvas.addEventListener('mousemove', draw);

    paintingCanvas.addEventListener('mouseup', () => {
        isDrawing = false;
    });

    paintingCanvas.addEventListener('mouseout', () => {
        isDrawing = false;
    });
}
