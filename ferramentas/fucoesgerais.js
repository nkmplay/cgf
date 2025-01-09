// fucoesgerais.js


// ---------- Inicio Seção Guias ----------
function initializeGuides(canvas) {
    const CM_TO_PX = 37.7952755906; // Fator de conversão de cm para px (1 cm = 37.7952755906 px)

    let guides = [];

    const addGuidesBtn = document.getElementById('addGuidesBtn');
    const guidesControls = document.getElementById('guides-controls');
    const addGuideBtn = document.getElementById('addGuideBtn');
    const guidePositionInput = document.getElementById('guidePositionInput');
    const horizontalGuideBtn = document.getElementById('horizontalGuideBtn');
    const verticalGuideBtn = document.getElementById('verticalGuideBtn');
    const singleGuideBtn = document.getElementById('singleGuideBtn');
    const multipleGuidesBtn = document.getElementById('multipleGuidesBtn');
    const removeGuidesBtn = document.getElementById('removeGuidesBtn');
    const addDefaultGuidesBtn = document.getElementById('addDefaultGuidesBtn');

    addGuidesBtn.addEventListener('click', () => {
        guidesControls.style.display = 'flex';
    });

    addGuideBtn.addEventListener('click', () => {
        const position = parseFloat(guidePositionInput.value) * CM_TO_PX;
        const isHorizontal = horizontalGuideBtn.classList.contains('selected');
        const isSingle = singleGuideBtn.classList.contains('selected');

        if (isHorizontal) {
            if (isSingle) {
                addHorizontalGuide(position);
            } else {
                addMultipleHorizontalGuides(position);
            }
        } else {
            if (isSingle) {
                addVerticalGuide(position);
            } else {
                addMultipleVerticalGuides(position);
            }
        }

        guidesControls.style.display = 'none';
    });

    function addHorizontalGuide(position) {
    const cloudFolha = canvas.getObjects().find(obj => obj.id === 'CloudFolha');
    if (cloudFolha) {
        const guide = new fabric.Line([cloudFolha.left, cloudFolha.top + position, cloudFolha.left + cloudFolha.width * cloudFolha.scaleX, cloudFolha.top + position], {
            stroke: 'red',
            strokeDashArray: [5, 5],
            selectable: true,
            evented: false,
            id: 'guide',
            excludeFromLayers: true // Adiciona a propriedade personalizada
        });
        guides.push(guide);
        canvas.add(guide);
        canvas.renderAll();
    }
}

function addVerticalGuide(position) {
    const cloudFolha = canvas.getObjects().find(obj => obj.id === 'CloudFolha');
    if (cloudFolha) {
        const guide = new fabric.Line([cloudFolha.left + position, cloudFolha.top, cloudFolha.left + position, cloudFolha.top + cloudFolha.height * cloudFolha.scaleY], {
            stroke: 'red',
            strokeDashArray: [5, 5],
            selectable: true,
            evented: false,
            id: 'guide',
            excludeFromLayers: true // Adiciona a propriedade personalizada
        });
        guides.push(guide);
        canvas.add(guide);
        canvas.renderAll();
    }
}

    function addMultipleHorizontalGuides(position) {
        const cloudFolha = canvas.getObjects().find(obj => obj.id === 'CloudFolha');
        if (cloudFolha) {
            const numGuides = Math.floor(cloudFolha.height / position);
            for (let i = 1; i <= numGuides; i++) {
                addHorizontalGuide(i * position);
            }
        }
    }

    function addMultipleVerticalGuides(position) {
        const cloudFolha = canvas.getObjects().find(obj => obj.id === 'CloudFolha');
        if (cloudFolha) {
            const numGuides = Math.floor(cloudFolha.width / position);
            for (let i = 1; i <= numGuides; i++) {
                addVerticalGuide(i * position);
            }
        }
    }

    addDefaultGuidesBtn.addEventListener('click', addDefaultGuides);

    function addDefaultGuides() {
        const cloudFolha = canvas.getObjects().find(obj => obj.id === 'CloudFolha');
        if (cloudFolha) {
            const margin = 0.5 * CM_TO_PX;
            addHorizontalGuide(margin);
            addHorizontalGuide(cloudFolha.height - margin);
            addVerticalGuide(margin);
            addVerticalGuide(cloudFolha.width - margin);
        }
    }

    removeGuidesBtn.addEventListener('click', removeGuides);

    function removeGuides() {
        guides.forEach(guide => canvas.remove(guide));
        guides = [];
        canvas.renderAll();
    }

    canvas.on('object:moving', function(e) {
        const obj = e.target;
        guides.forEach(guide => {
            if (guide.type === 'line') {
                if (guide.x1 === guide.x2) {
                    if (Math.abs(obj.left - guide.x1) < 5) {
                        obj.set('left', guide.x1);
                    }
                } else {
                    if (Math.abs(obj.top - guide.y1) < 5) {
                        obj.set('top', guide.y1);
                    }
                }
            }
        });
    });

    horizontalGuideBtn.addEventListener('click', () => {
        horizontalGuideBtn.classList.add('selected');
        verticalGuideBtn.classList.remove('selected');
    });

    verticalGuideBtn.addEventListener('click', () => {
        verticalGuideBtn.classList.add('selected');
        horizontalGuideBtn.classList.remove('selected');
    });

    singleGuideBtn.addEventListener('click', () => {
        singleGuideBtn.classList.add('selected');
        multipleGuidesBtn.classList.remove('selected');
    });

    multipleGuidesBtn.addEventListener('click', () => {
        multipleGuidesBtn.classList.add('selected');
        singleGuideBtn.classList.remove('selected');
    });

    addGuideBtn.addEventListener('click', () => {
        const position = parseFloat(guidePositionInput.value) * CM_TO_PX;
        const isHorizontal = horizontalGuideBtn.classList.contains('selected');
        const isSingle = singleGuideBtn.classList.contains('selected');

        if (isHorizontal) {
            if (isSingle) {
                addHorizontalGuide(position);
            } else {
                addMultipleHorizontalGuides(position);
            }
        } else {
            if (isSingle) {
                addVerticalGuide(position);
            } else {
                addMultipleVerticalGuides(position);
            }
        }

        guidesControls.style.display = 'none';
    });
}
// ---------- Final Seção Guias ----------

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

