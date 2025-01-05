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

//--------------------------------- Seção Atalhos ---------------------------------

document.addEventListener('keydown', function (e) {
  if (e.key === 'Delete') {
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects && activeObjects.length) {
      activeObjects.forEach(obj => {
        if (obj.id !== 'CloudFolha') {
          canvas.remove(obj);
        }
      });
      canvas.discardActiveObject();
      canvas.requestRenderAll();
    }
  }
  if (e.ctrlKey && e.key === 'z') {
    e.preventDefault();
    undo();
  }
  if (e.ctrlKey && e.shiftKey && e.key === 'Z' || e.ctrlKey && e.key === 'y') {
    e.preventDefault();
    redo();
  }
  if (e.ctrlKey && e.key === 'v') {
    e.preventDefault();
    navigator.clipboard.read().then(data => {
      data.forEach(item => {
        if (item.types.includes('image/png') || item.types.includes('image/jpeg')) {
          item.getType('image/png').then(blob => {
            const reader = new FileReader();
            reader.onload = function (e) {
              fabric.Image.fromURL(e.target.result, function (img) {
                const pageWidth = 21 * CM_TO_PX;
                const pageHeight = 29.7 * CM_TO_PX;
                const scale = Math.min(pageWidth * 0.8 / img.width, pageHeight * 0.8 / img.height);
                img.scale(scale);
                const a4Page = canvas.getObjects().find(obj => obj.id === 'CloudFolha');
                if (a4Page) {
                  img.set({
                    left: a4Page.left + (a4Page.width - img.width * scale) / 2,
                    top: a4Page.top + (a4Page.height - img.height * scale) / 2
                  });
                }
                canvas.add(img);
                canvas.setActiveObject(img);
                canvas.renderAll();
              });
            };
            reader.readAsDataURL(blob);
          });
        }
        if (item.types.includes('text/plain')) {
          item.getType('text/plain').then(blob => {
            blob.text().then(text => {
              const itext = new fabric.IText(text, {
                left: 100,
                top: 100,
                fontFamily: 'Arial',
                fontSize: 20,
                fill: 'black'
              });
              canvas.add(itext);
              canvas.setActiveObject(itext);
              canvas.renderAll();
            });
          });
        }
      });
    });
  }
  if (e.ctrlKey && e.key === 'd') {
    e.preventDefault();
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects && activeObjects.length) {
      const clones = [];
      activeObjects.forEach(obj => {
        if (obj.id !== 'CloudFolha') {
          const clone = fabric.util.object.clone(obj);
          clone.set({
            left: obj.left + 20,
            top: obj.top + 20
          });
          canvas.add(clone);
          clones.push(clone);
        }
      });
      canvas.discardActiveObject();
      if (clones.length > 1) {
        const selection = new fabric.ActiveSelection(clones, {
          canvas
        });
        canvas.setActiveObject(selection);
      } else if (clones.length === 1) {
        canvas.setActiveObject(clones[0]);
      }
      canvas.requestRenderAll();
    }
  }
document.addEventListener('keydown', function (e) {
  if (e.ctrlKey && e.key === 'p') {
    e.preventDefault();

    const a4Page = canvas.getObjects().find(obj => obj.id === 'CloudFolha');
    if (!a4Page) return;

    const tempCanvas = document.createElement('canvas');
    const ctx = tempCanvas.getContext('2d');
    tempCanvas.width = a4Page.width;
    tempCanvas.height = a4Page.height;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    ctx.save(); 
    ctx.beginPath();
    ctx.rect(0, 0, a4Page.width, a4Page.height);
    ctx.clip(); 
    const objects = canvas.getObjects().filter(obj => obj.id !== 'CloudFolha');
    objects.forEach(obj => {
      const clone = fabric.util.object.clone(obj);

      const objLeft = clone.left - a4Page.left;
      const objTop = clone.top - a4Page.top;

      if (
        objLeft + clone.width * clone.scaleX > 0 &&
        objTop + clone.height * clone.scaleY > 0 &&
        objLeft < a4Page.width &&
        objTop < a4Page.height
      ) {
        clone.set({
          left: objLeft,
          top: objTop
        });

        clone.render(ctx);
      }
    });

    ctx.restore(); 

    const printWindow = window.open('');
    printWindow.document.write(`
      <html>
        <head>
          <title>Imprimir</title>
          <style>
            @media print {
              img { max-width: 100%; height: auto; }
            }
          </style>
        </head>
        <body>
          <img src="${tempCanvas.toDataURL()}" onload="window.print();window.close()">
        </body>
      </html>
    `);
    printWindow.document.close();
  }
});

  if (e.ctrlKey && e.key === 'c') {
    e.preventDefault();
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'image') {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = activeObject.width * activeObject.scaleX;
      tempCanvas.height = activeObject.height * activeObject.scaleY;
      const tempFabricCanvas = new fabric.Canvas(tempCanvas);
      const clone = fabric.util.object.clone(activeObject);
      clone.left = 0;
      clone.top = 0;
      tempFabricCanvas.add(clone);
      tempFabricCanvas.renderAll();
      tempCanvas.toBlob(blob => {
        const item = new ClipboardItem({
          'image/png': blob
        });
        navigator.clipboard.write([item]).then(() => {
          showCustomAlert('Imagem copiada para área de transferência!');
        });
      });
    }
  }
  if (e.ctrlKey && e.key === 'a') {
    e.preventDefault();
    const objects = canvas.getObjects().filter(obj => obj.id !== 'CloudFolha');
    if (objects.length > 0) {
      const selection = new fabric.ActiveSelection(objects, {
        canvas
      });
      canvas.setActiveObject(selection);
      canvas.requestRenderAll();
    }
  }
});


