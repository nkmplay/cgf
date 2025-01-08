// Função para exportar para PNG ou JPG
async function exportCanvas(format) {
    const dpi = parseInt(document.getElementById('resolutionInput').value) || 150; // Usar o valor do input ou 150 como padrão
    const scale = dpi / 96;

    const cloudFolha = canvas.getObjects().find(obj => obj.id === 'CloudFolha');
    if (!cloudFolha) {
        showCustomAlert('Nenhuma folha encontrada.');
        return;
    }

    const tempContainer = document.createElement('div');
    document.body.appendChild(tempContainer);

    const exportCanvas = document.createElement('canvas');
    const targetWidth = cloudFolha.width * scale;
    const targetHeight = cloudFolha.height * scale;

    exportCanvas.width = targetWidth;
    exportCanvas.height = targetHeight;
    tempContainer.appendChild(exportCanvas);

    const exportFabricCanvas = new fabric.Canvas(exportCanvas, {
        enableRetinaScaling: true,
        imageSmoothingQuality: 'high'
    });

    exportFabricCanvas.setWidth(targetWidth);
    exportFabricCanvas.setHeight(targetHeight);

    // Adiciona fundo branco para JPG
    if (format === 'jpg') {
        const whiteBackground = new fabric.Rect({
            width: cloudFolha.width,
            height: cloudFolha.height,
            fill: 'white',
            originX: 'left',
            originY: 'top',
            scaleX: scale,
            scaleY: scale
        });
        exportFabricCanvas.add(whiteBackground);
    }

    const objects = canvas.getObjects().filter(obj => obj.id !== 'CloudFolha');
    const promises = objects.map(async (obj) => {
        const clonedObj = await cloneObjectWithQuality(obj);

        // Ajusta a posição e a escala para a rotação
        const angle = obj.angle || 0;
        const radians = fabric.util.degreesToRadians(angle);
        const cos = Math.abs(Math.cos(radians));
        const sin = Math.abs(Math.sin(radians));

        const scaledWidth = (obj.width * obj.scaleX * cos + obj.height * obj.scaleY * sin) * scale;
        const scaledHeight = (obj.height * obj.scaleY * cos + obj.width * obj.scaleX * sin) * scale;

        const relativeLeft = (obj.left - cloudFolha.left) / cloudFolha.scaleX;
        const relativeTop = (obj.top - cloudFolha.top) / cloudFolha.scaleY;

        const scaleFactor = targetWidth / cloudFolha.width;

        clonedObj.set({
            left: relativeLeft * scaleFactor,
            top: relativeTop * scaleFactor,
            scaleX: (obj.scaleX / cloudFolha.scaleX) * scaleFactor,
            scaleY: (obj.scaleY / cloudFolha.scaleY) * scaleFactor,
            angle: angle // Mantém o ângulo de rotação
        });

        return clonedObj;
    });

    const clonedObjects = await Promise.all(promises);
    clonedObjects.forEach(obj => exportFabricCanvas.add(obj));

    exportFabricCanvas.renderAll();

    const exportOptions = {
        format: format,
        quality: 1.0,
        enableRetinaScaling: true,
        multiplier: 1,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high'
    };

    if (format === 'jpg') {
        exportOptions.backgroundColor = '#ffffff'; // Fundo branco para JPG
    }

    const dataUrl = exportFabricCanvas.toDataURL(exportOptions);

    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[-:]/g, '');
    link.href = dataUrl;
    link.download = `CloudApp_${timestamp}.${format}`;
    link.click();

    tempContainer.remove();
    exportFabricCanvas.dispose();
}

// Função para exportar para PDF
async function exportPdf() {
    const dpi = parseInt(document.getElementById('resolutionInput').value) || 150;
    const scale = dpi / 96;

    const cloudFolha = canvas.getObjects().find(obj => obj.id === 'CloudFolha');
    if (!cloudFolha) {
        showCustomAlert('Nenhuma folha encontrada.');
        return;
    }

    const pageWidth = cmToPoints(cloudFolha.width / CM_TO_PX);
    const pageHeight = cmToPoints(cloudFolha.height / CM_TO_PX);

    const tempCanvas = document.createElement('canvas');
    const targetWidth = Math.min(cloudFolha.width * scale, 4096);
    const targetHeight = Math.min(cloudFolha.height * scale, 4096);

    tempCanvas.width = targetWidth;
    tempCanvas.height = targetHeight;

    const tempFabricCanvas = new fabric.StaticCanvas(tempCanvas, {
        enableRetinaScaling: true,
        imageSmoothingQuality: 'high'
    });

    const objects = canvas.getObjects().filter(obj => obj.id !== 'CloudFolha');
    const promises = objects.map(async (obj) => {
        const clonedObj = await cloneObjectWithQuality(obj);

        // Ajusta a posição e a escala para a rotação
        const angle = obj.angle || 0;
        const radians = fabric.util.degreesToRadians(angle);
        const cos = Math.abs(Math.cos(radians));
        const sin = Math.abs(Math.sin(radians));

        const scaledWidth = (obj.width * obj.scaleX * cos + obj.height * obj.scaleY * sin) * scale;
        const scaledHeight = (obj.height * obj.scaleY * cos + obj.width * obj.scaleX * sin) * scale;

        const relativeLeft = (obj.left - cloudFolha.left) / cloudFolha.scaleX;
        const relativeTop = (obj.top - cloudFolha.top) / cloudFolha.scaleY;

        const scaleFactor = targetWidth / cloudFolha.width;

        clonedObj.set({
            left: relativeLeft * scaleFactor,
            top: relativeTop * scaleFactor,
            scaleX: (obj.scaleX / cloudFolha.scaleX) * scaleFactor,
            scaleY: (obj.scaleY / cloudFolha.scaleY) * scaleFactor,
            angle: angle // Mantém o ângulo de rotação
        });

        return clonedObj;
    });

    const clonedObjects = await Promise.all(promises);
    clonedObjects.forEach(obj => tempFabricCanvas.add(obj));

    tempFabricCanvas.renderAll();

    const pdfDoc = await PDFLib.PDFDocument.create();
    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    const pngImage = await pdfDoc.embedPng(
        tempCanvas.toDataURL('image/png', 1.0)
    );

    page.drawImage(pngImage, {
        x: 0,
        y: 0,
        width: pageWidth,
        height: pageHeight
    });

    const pdfBytes = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
        compress: true
    });

    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[-:]/g, '');
    link.download = `CloudApp_${timestamp}.pdf`;
    link.click();
    URL.revokeObjectURL(url);

    tempFabricCanvas.dispose();
}

// Função para clonar objetos com qualidade
async function cloneObjectWithQuality(obj) {
    return new Promise(async (resolve) => {
        const clonedObj = fabric.util.object.clone(obj);

        clonedObj.set({
            stroke: null, // Remove o contorno
            strokeWidth: 0,
            shadow: null // Remove sombras
        });

        if (obj.type === 'image' && obj.getSrc) {
            const imgSrc = obj.getSrc();
            fabric.Image.fromURL(imgSrc, function (img) {
                img.set(clonedObj);
                resolve(img);
            }, {
                crossOrigin: 'anonymous',
                quality: 1.0
            });
        } else {
            resolve(clonedObj);
        }
    });
}

// Função para converter cm para pontos (usado no PDF)
function cmToPoints(cm) {
    return cm * 28.3465;
}
