function initContorno(canvas, activeObject) {
    const outlineModal = document.getElementById('outlineModal');
    const outlineImagePreview = document.getElementById('outlineImagePreview');

    outlineImagePreview.src = activeObject.toDataURL();
    outlineImagePreview.style.display = 'block';
    outlineImagePreview.style.maxWidth = '80%';
    outlineImagePreview.style.maxHeight = '80vh';
    outlineImagePreview.style.objectFit = 'contain';
    outlineImagePreview.style.margin = 'auto';

    outlineModal.style.display = 'flex';

    updateSliderValues();
    [outlineSlider1, outlineSlider2, colorPicker1, colorPicker2].forEach(element => {
        element.addEventListener('input', function() {
            applyOutlines();
            updateSliderValues();
        });
    });

    document.getElementById('closeOutlineModal').addEventListener('click', function() {
        document.getElementById('outlineModal').style.display = 'none';
    });

    document.getElementById('applyOutlineBtn').addEventListener('click', function() {
        const width1 = parseInt(document.getElementById('outlineSlider1').value);
        const width2 = parseInt(document.getElementById('outlineSlider2').value);
        const color1 = document.getElementById('colorPicker1').value;
        const color2 = document.getElementById('colorPicker2').value;

        if (activeObject) {
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
            fabric.Image.fromURL(dataUrl, function(img) {
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

            // Fechar o modal
            document.getElementById('outlineModal').style.display = 'none';
        }
    });

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

    updateSliderValues();
}
