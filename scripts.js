//2 ---------- Inicio Seção Exportação ----------
const exportButton = document.getElementById('exportButton');
const exportOptions = document.getElementById('exportOptions');
const resolutionInput = document.getElementById('resolutionInput');

exportButton.addEventListener('click', () => {
  if (previewRect) {
    canvas.remove(previewRect);
    previewRect = null;
    canvas.renderAll();
  }
  exportOptions.classList.toggle('active');
});

function exportCanvas(format) {
  const dpi = parseInt(resolutionInput.value) || 600;
  const scale = dpi / 96;

  const cloudFolha = canvas.getObjects().find(obj => obj.id === 'CloudFolha');
  if (!cloudFolha) return;

  const tempContainer = document.createElement('div');
  tempContainer.style.position = 'absolute';
  tempContainer.style.left = '-9999px';
  tempContainer.style.top = '-9999px';
  document.body.appendChild(tempContainer);

  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = cloudFolha.width;
  exportCanvas.height = cloudFolha.height;
  tempContainer.appendChild(exportCanvas);

  const exportFabricCanvas = new fabric.Canvas(exportCanvas);
  exportFabricCanvas.setWidth(cloudFolha.width);
  exportFabricCanvas.setHeight(cloudFolha.height);

  const objects = canvas.getObjects().filter(obj => obj.id !== 'CloudFolha');
  objects.forEach(obj => {
    const clonedObj = fabric.util.object.clone(obj);

    const relativeLeft = (obj.left - cloudFolha.left) / cloudFolha.scaleX;
    const relativeTop = (obj.top - cloudFolha.top) / cloudFolha.scaleY;

    clonedObj.set({
      left: relativeLeft,
      top: relativeTop,
      scaleX: obj.scaleX / cloudFolha.scaleX,
      scaleY: obj.scaleY / cloudFolha.scaleY
    });

    exportFabricCanvas.add(clonedObj);
  });

  exportFabricCanvas.renderAll();

  html2canvas(exportCanvas, {
    scale: scale,
    backgroundColor: format === 'jpg' ? '#ffffff' : null,
    logging: false,
    useCORS: true
  }).then(outputCanvas => {
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[-:]/g, '');

    if (format === 'png' || format === 'jpg') {
      link.href = outputCanvas.toDataURL(`image/${format}`, 1.0);
      link.download = `canvas_export_${timestamp}.${format}`;
      link.click();
    }

    tempContainer.remove();
    exportFabricCanvas.dispose();
  });
}

document.querySelectorAll('.export-btn').forEach(btn => {
  if (btn.id !== 'previewExportBtn') {
    btn.addEventListener('click', () => {
      const format = btn.dataset.format;
      if (format === 'pdf' || format === 'vector-pdf') {
        alert('Em Breve');
        return;
      }
      exportCanvas(format);
    });
  }
});

document.getElementById('previewExportBtn').addEventListener('click', () => {
  if (previewRect) {
    canvas.remove(previewRect);
    previewRect = null;
    canvas.renderAll();
    return;
  }

  const cloudFolha = canvas.getObjects().find(obj => obj.id === 'CloudFolha');
  if (!cloudFolha) return;

  previewRect = new fabric.Rect({
    left: cloudFolha.left,
    top: cloudFolha.top,
    width: cloudFolha.width,
    height: cloudFolha.height,
    fill: 'rgba(255, 0, 0, 0.2)',
    stroke: 'red',
    strokeWidth: 2,
    selectable: false,
    evented: false,
    scaleX: cloudFolha.scaleX,
    scaleY: cloudFolha.scaleY
  });

  canvas.add(previewRect);
  canvas.bringToFront(previewRect);
  canvas.renderAll();
});

imageWidthInput.addEventListener('change', () => {
  const activeObj = canvas.getActiveObject();
  if (!activeObj) return;

  const widthInPx = parseFloat(imageWidthInput.value) * CM_TO_PX;
  const heightInPx = parseFloat(imageHeightInput.value) * CM_TO_PX;

  const scaleX = widthInPx / activeObj.width;
  const scaleY = heightInPx / activeObj.height;

  activeObj.set({
    scaleX: scaleX,
    scaleY: scaleY
  });

  canvas.renderAll();
  addToHistory();
});

imageHeightInput.addEventListener('change', () => {
  const activeObj = canvas.getActiveObject();
  if (!activeObj) return;

  const widthInPx = parseFloat(imageWidthInput.value) * CM_TO_PX;
  const heightInPx = parseFloat(imageHeightInput.value) * CM_TO_PX;

  const scaleX = widthInPx / activeObj.width;
  const scaleY = heightInPx / activeObj.height;

  activeObj.set({
    scaleX: scaleX,
    scaleY: scaleY
  });

  canvas.renderAll();
  addToHistory();
});
// ---------- Final Seção Exportação ----------

// ---------- Inicio Seção Guias ----------
const addGuidesBtn = document.getElementById('addGuidesBtn');
const guidesMenu = document.getElementById('guidesMenu');
const addGuideBtn = document.getElementById('addGuideBtn');
const guidePositionInput = document.getElementById('guidePositionInput');
const horizontalGuideBtn = document.getElementById('horizontalGuideBtn');
const verticalGuideBtn = document.getElementById('verticalGuideBtn');
const singleGuideBtn = document.getElementById('singleGuideBtn');
const multipleGuidesBtn = document.getElementById('multipleGuidesBtn');

addGuidesBtn.addEventListener('click', () => {
  guidesMenu.classList.toggle('active');
});

addGuideBtn.addEventListener('click', () => {
  const position = parseFloat(guidePositionInput.value) * CM_TO_PX;
  const isHorizontal = horizontalGuideBtn.classList.contains('active');
  const isSingle = singleGuideBtn.classList.contains('active');

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

  guidesMenu.classList.remove('active');
});

function addHorizontalGuide(position) {
  const cloudFolha = canvas.getObjects().find(obj => obj.id === 'CloudFolha');
  if (cloudFolha) {
    const guide = new fabric.Line([cloudFolha.left, cloudFolha.top + position, cloudFolha.left + cloudFolha.width * cloudFolha.scaleX, cloudFolha.top + position], {
      stroke: 'red',
      strokeDashArray: [5, 5],
      selectable: false,
      evented: false,
      id: 'guide'
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
      selectable: false,
      evented: false,
      id: 'guide'
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

const addDefaultGuidesBtn = document.getElementById('addDefaultGuidesBtn');
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

const removeGuidesBtn = document.getElementById('removeGuidesBtn');
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

document.addEventListener('keydown', function(e) {
  if (e.key === 'F2') {
    e.preventDefault();
    addDefaultGuides();
  }
});

horizontalGuideBtn.addEventListener('click', () => {
  horizontalGuideBtn.classList.add('active');
  verticalGuideBtn.classList.remove('active');
});

verticalGuideBtn.addEventListener('click', () => {
  verticalGuideBtn.classList.add('active');
  horizontalGuideBtn.classList.remove('active');
});

singleGuideBtn.addEventListener('click', () => {
  singleGuideBtn.classList.add('active');
  multipleGuidesBtn.classList.remove('active');
});

multipleGuidesBtn.addEventListener('click', () => {
  multipleGuidesBtn.classList.add('active');
  singleGuideBtn.classList.remove('active');
});

addGuideBtn.addEventListener('click', () => {
  const position = parseFloat(guidePositionInput.value) * CM_TO_PX;
  const isHorizontal = horizontalGuideBtn.classList.contains('active');
  const isSingle = singleGuideBtn.classList.contains('active');

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

  guidesMenu.classList.remove('active');
});
// ---------- Final Seção Guias ----------

// ---------- Inicio Seção Documentos ----------
function saveDocument() {
  const state = canvas.toJSON(['id', 'name']);
  const blob = new Blob([JSON.stringify(state)], {type: 'application/json'});
  const link = document.createElement('a');
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[-:]/g, '');
  link.href = URL.createObjectURL(blob);
  link.download = `document_${timestamp}.cloudapp`;
  link.click();
  URL.revokeObjectURL(link.href);
}

function openDocument(file) {
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const state = JSON.parse(e.target.result);
      canvas.clear();
      canvas.loadFromJSON(state, function() {
        const cloudFolha = canvas.getObjects().find(obj => obj.id === 'CloudFolha');
        if (cloudFolha) {
          cloudFolha.set({
            selectable: false,
            evented: false
          });
        }
        canvas.renderAll();
        addToHistory();
      });
    } catch (err) {
      alert('Error loading document: ' + err.message);
    }
  };
  reader.readAsText(file);
}

window.addEventListener('load', function() {
  const saveDocBtn = document.querySelector('button.menu-item:nth-of-type(2)');
  const openDocBtn = document.querySelector('button.menu-item:nth-of-type(1)');
  const openFileInput = document.getElementById('openFileInput');

  saveDocBtn.addEventListener('click', saveDocument);

  openDocBtn.addEventListener('click', () => {
    openFileInput.click();
  });

  openFileInput.addEventListener('change', (e) => {
    if (e.target.files[0]) {
      openDocument(e.target.files[0]);
    }
    openFileInput.value = '';
  });

  const cloudFolha = canvas.getObjects().find(obj => obj.id === 'CloudFolha');
  if (cloudFolha) {
    cloudFolha.set({
      selectable: false,
      evented: false
    });
  }
  loadHistoryFromLocalStorage();
  if (history.length === 0) {
    addToHistory();
  }
});
// ---------- Final Seção Documentos ----------

// ---------- Inicio Seção Formas ----------
function addShape(shapeName) {
  let shape;
  const cloudFolha = canvas.getObjects().find(obj => obj.id === 'CloudFolha');
  const center = {
    left: cloudFolha.left + (cloudFolha.width * cloudFolha.scaleX) / 2,
    top: cloudFolha.top + (cloudFolha.height * cloudFolha.scaleY) / 2
  };

  switch(shapeName) {
    case 'square':
      shape = new fabric.Rect({
        left: center.left,
        top: center.top,
        width: 100,
        height: 100,
        fill: '#fff',
        stroke: '#000',
        strokeWidth: 2,
        originX: 'center',
        originY: 'center'
      });
      break;

    case 'circle':
      shape = new fabric.Circle({
        left: center.left,
        top: center.top,
        radius: 50,
        fill: '#fff',
        stroke: '#000',
        strokeWidth: 2,
        originX: 'center',
        originY: 'center'
      });
      break;

    case 'triangle':
      shape = new fabric.Triangle({
        left: center.left,
        top: center.top,
        width: 100,
        height: 100,
        fill: '#fff',
        stroke: '#000',
        strokeWidth: 2,
        originX: 'center',
        originY: 'center'
      });
      break;

    case 'line':
      shape = new fabric.Line([50, 50, 150, 50], {
        left: center.left - 50,
        top: center.top,
        stroke: '#000',
        strokeWidth: 2
      });
      break;

    case 'ellipse':
      shape = new fabric.Ellipse({
        left: center.left,
        top: center.top,
        rx: 80,
        ry: 40,
        fill: '#fff',
        stroke: '#000',
        strokeWidth: 2,
        originX: 'center',
        originY: 'center'
      });
      break;

    case 'polygon':
      shape = new fabric.Polygon([
        {x: 0, y: 0},
        {x: 100, y: 0},
        {x: 100, y: 100},
        {x: 50, y: 150},
        {x: 0, y: 100}
      ], {
        left: center.left - 50,
        top: center.top - 75,
        fill: '#fff',
        stroke: '#000',
        strokeWidth: 2
      });
      break;

    case 'polyline':
      shape = new fabric.Polyline([
        {x: 0, y: 0},
        {x: 50, y: 50},
        {x: 100, y: 0},
        {x: 150, y: 50}
      ], {
        left: center.left - 75,
        top: center.top - 25,
        fill: '',
        stroke: '#000',
        strokeWidth: 2
      });
      break;

    case 'rectangle':
      shape = new fabric.Rect({
        left: center.left,
        top: center.top,
        width: 150,
        height: 100,
        fill: '#fff',
        stroke: '#000',
        strokeWidth: 2,
        originX: 'center',
        originY: 'center'
      });
      break;
  }

  if (shape) {
    canvas.add(shape);
    canvas.setActiveObject(shape);
    canvas.renderAll();
    addToHistory();
  }
}

document.getElementById('squareBtn').addEventListener('click', () => addShape('square'));
document.getElementById('circleBtn').addEventListener('click', () => addShape('circle'));
document.getElementById('triangleBtn').addEventListener('click', () => addShape('triangle'));
document.getElementById('lineBtn').addEventListener('click', () => addShape('line'));
document.getElementById('ellipseBtn').addEventListener('click', () => addShape('ellipse'));
document.getElementById('polygonBtn').addEventListener('click', () => addShape('polygon'));
document.getElementById('polylineBtn').addEventListener('click', () => addShape('polyline'));
document.getElementById('rectangleBtn').addEventListener('click', () => addShape('rectangle'));
// ---------- Final Seção Formas ----------
