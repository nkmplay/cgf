
// ---------- Inicio Seção Texto ----------
const DEFAULT_TEXT_SETTINGS = {
    fontSize: 20,
    fontFamily: 'Arial',
    fill: '#000000',
    gradientMode: false,
    gradientType: 'linear',
    gradientStops: [
        { color: '#000000', position: 100 },
        { color: '#ff0000', position: 50 }
    ],
    gradientAngle: 0,
    stroke1: {
        enabled: false,
        width: 1,
        color: '#000000'
    }
};


// Mapa para armazenar configurações de texto por textId
const textSettingsMap = new Map();

// Configurações ativas do texto
let activeTextSettings = {
    gradientMode: false,
    gradientType: 'linear',
    gradientStops: [
        { color: '#000000', position: 100 },
        { color: '#ff0000', position: 50 }
    ],
    gradientAngle: 0,
    stroke1: {
        enabled: false,
        width: 1,
        color: '#000000'
    }
};

// Função para gerar um ID único para cada texto
function generateUniqueId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

// Função para salvar as configurações de um texto
function saveTextSettings(textObject) {
    if (!textObject.textId) {
        textObject.textId = generateUniqueId();
    }

    textSettingsMap.set(textObject.textId, {
        gradientMode: activeTextSettings.gradientMode,
        gradientType: activeTextSettings.gradientType,
        gradientStops: JSON.parse(JSON.stringify(activeTextSettings.gradientStops)),
        gradientAngle: activeTextSettings.gradientAngle,
        stroke1: { ...activeTextSettings.stroke1 },
        fontFamily: textObject.fontFamily,
        fontSize: textObject.fontSize,
        fill: textObject.fill
    });
}

// Função para carregar as configurações de um texto
function loadTextSettings(textObject) {
  if (!textObject.textId || !textSettingsMap.has(textObject.textId)) {
    return false;
  }

  const settings = textSettingsMap.get(textObject.textId);
  
  // Atualizar as configurações ativas
  activeTextSettings = JSON.parse(JSON.stringify(settings));

  // Atualizar a interface
  document.getElementById('fontSelect').value = settings.fontFamily;
  document.getElementById('fontSizeInput').value = settings.fontSize;
  
  // Configurar o modo de cor (sólida ou gradiente)
  document.getElementById('solidColorBtn').classList.toggle('active', !settings.gradientMode);
  document.getElementById('gradientColorBtn').classList.toggle('active', settings.gradientMode);
  document.getElementById('solidColorPicker').style.display = settings.gradientMode ? 'none' : 'block';
  document.getElementById('gradientPicker').style.display = settings.gradientMode ? 'block' : 'none';

  // Se for um gradiente, atualizar as paradas do gradiente
  if (settings.gradientMode && settings.gradientStops) {
    activeTextSettings.gradientStops = JSON.parse(JSON.stringify(settings.gradientStops));
    updateGradientStopsUI();
  } else {
    // Se for cor sólida, atualizar o color picker
    document.getElementById('textColorInput').value = typeof settings.fill === 'string' ? 
      settings.fill : '#000000';
  }

  // Atualizar configurações de contorno
  document.getElementById('stroke1Enable').checked = settings.stroke1.enabled;
  document.getElementById('stroke1Width').value = settings.stroke1.width;
  document.getElementById('stroke1Color').value = settings.stroke1.color;
  document.getElementById('stroke1Width').disabled = !settings.stroke1.enabled;
  document.getElementById('stroke1Color').disabled = !settings.stroke1.enabled;

  return true;
}

// Função para atualizar o texto ativo com as configurações do menu
function updateActiveText() {
    const activeObject = canvas.getActiveObject();
    if (!activeObject || activeObject.type !== 'text') return;

    // Atualizar as propriedades do texto com base nas entradas do menu
    activeObject.set({
        fontFamily: document.getElementById('fontSelect').value,
        fontSize: parseInt(document.getElementById('fontSizeInput').value),
        fill: activeTextSettings.gradientMode ? createGradientFromStops(activeObject) : document.getElementById('textColorInput').value,
        stroke: activeTextSettings.stroke1.enabled ? activeTextSettings.stroke1.color : null,
        strokeWidth: activeTextSettings.stroke1.enabled ? activeTextSettings.stroke1.width : 0,
    });

    // Salvar as configurações atualizadas no mapa
    saveTextSettings(activeObject);

    canvas.renderAll();
}

// Função para criar um gradiente a partir das paradas (stops)
function createGradientFromStops(obj) {
    const stops = activeTextSettings.gradientStops.sort((a, b) => a.position - b.position);
    const coords = calculateGradientCoords(obj, activeTextSettings.gradientAngle);

    return new fabric.Gradient({
        type: 'linear',
        coords: coords,
        colorStops: stops.map(stop => ({
            offset: stop.position / 100,
            color: stop.color
        }))
    });
}

// Função para calcular as coordenadas do gradiente
function calculateGradientCoords(obj, angle) {
    const angleRad = angle * Math.PI / 180;
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);

    return {
        x1: -obj.width / 2 * cos,
        y1: -obj.width / 2 * sin,
        x2: obj.width / 2 * cos,
        y2: obj.width / 2 * sin
    };
}

// Função para atualizar os contornos do texto
function updateTextStrokes(obj) {
    const stroke1 = activeTextSettings.stroke1;

    if (stroke1.enabled) {
        obj.set({
            strokeWidth: stroke1.width,
            stroke: stroke1.color,
            paintFirst: 'stroke',
            strokeUniform: true 
        });
    } else {
        obj.set({
            strokeWidth: 0,
            stroke: null,
            paintFirst: 'fill',
            strokeUniform: true 
        });
    }
}

// Função para ativar a categoria "TEXTO"
function activateTextCategory() {
    categoryItems.forEach(i => i.classList.remove('active'));
    menuContents.forEach(m => m.classList.remove('active'));
    const textoCategory = document.querySelector('.category-item[data-category="texto"]');
    textoCategory.classList.add('active');
    document.getElementById('menu-texto').classList.add('active');
}

// Evento para adicionar um novo texto
document.getElementById('addTextBtn').addEventListener('click', function () {
    const text = new fabric.Text('CloudApp', {
        left: canvas.getWidth() / 2,
        top: canvas.getHeight() / 2,
        fontSize: DEFAULT_TEXT_SETTINGS.fontSize,
        fill: DEFAULT_TEXT_SETTINGS.fill,
        fontFamily: DEFAULT_TEXT_SETTINGS.fontFamily,
        originX: 'center',
        originY: 'center',
        paintFirst: 'stroke',
        strokeUniform: true
    });

    text.textId = generateUniqueId();
    
    // Resetar o menu para as configurações padrão
    document.getElementById('fontSizeInput').value = DEFAULT_TEXT_SETTINGS.fontSize;
    document.getElementById('textColorInput').value = DEFAULT_TEXT_SETTINGS.fill;
    document.getElementById('fontSelect').value = DEFAULT_TEXT_SETTINGS.fontFamily;
    
    // Resetar as configurações ativas para o padrão
    activeTextSettings = JSON.parse(JSON.stringify(DEFAULT_TEXT_SETTINGS));
    
    // Salvar as configurações iniciais
    saveTextSettings(text);

    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
    addToHistory();

    activateTextCategory();
    updateTextControlsUI(text);
});

// Função para atualizar a interface de controle de texto
function updateTextControlsUI(textObject) {
    if (!textObject) return;
    
    const settings = textSettingsMap.get(textObject.textId);
    if (!settings) return;

    document.getElementById('fontSizeInput').value = textObject.fontSize;
    document.getElementById('fontSelect').value = textObject.fontFamily;
    
    if (settings.gradientMode) {
        document.getElementById('gradientColorBtn').classList.add('active');
        document.getElementById('solidColorBtn').classList.remove('active');
        document.getElementById('gradientPicker').style.display = 'block';
        document.getElementById('solidColorPicker').style.display = 'none';
    } else {
        document.getElementById('solidColorBtn').classList.add('active');
        document.getElementById('gradientColorBtn').classList.remove('active');
        document.getElementById('solidColorPicker').style.display = 'block';
        document.getElementById('gradientPicker').style.display = 'none';
        document.getElementById('textColorInput').value = textObject.fill;
    }
    
    // Atualizar controles de contorno
    document.getElementById('stroke1Enable').checked = settings.stroke1.enabled;
    document.getElementById('stroke1Width').value = settings.stroke1.width;
    document.getElementById('stroke1Color').value = settings.stroke1.color;
    document.getElementById('stroke1Width').disabled = !settings.stroke1.enabled;
    document.getElementById('stroke1Color').disabled = !settings.stroke1.enabled;
}

// Eventos para atualizar o texto ativo quando as configurações mudarem
document.getElementById('fontSelect').addEventListener('change', updateActiveText);
document.getElementById('fontSizeInput').addEventListener('change', updateActiveText);
document.getElementById('textColorInput').addEventListener('input', updateActiveText);
document.getElementById('stroke1Color').addEventListener('input', updateActiveText);
document.getElementById('stroke1Width').addEventListener('input', updateActiveText);

// Eventos para alternar entre cor sólida e gradiente
document.getElementById('solidColorBtn').addEventListener('click', () => {
    activeTextSettings.gradientMode = false;
    document.getElementById('solidColorPicker').style.display = 'block';
    document.getElementById('gradientPicker').style.display = 'none';
    updateActiveText();
});

document.getElementById('gradientColorBtn').addEventListener('click', () => {
    activeTextSettings.gradientMode = true;
    document.getElementById('solidColorPicker').style.display = 'none';
    document.getElementById('gradientPicker').style.display = 'block';
    updateGradientStopsUI();
    updateActiveText();
});

// Evento para adicionar uma nova parada de gradiente
document.getElementById('addGradientStop').addEventListener('click', () => {
    const stop = { color: '#000000', position: 50 };
    activeTextSettings.gradientStops.push(stop);
    updateGradientStopsUI();
    updateActiveText();
});

// Eventos para atualizar o contorno do texto
document.getElementById('stroke1Enable').addEventListener('change', function () {
    activeTextSettings.stroke1.enabled = this.checked;
    document.getElementById('stroke1Width').disabled = !this.checked;
    document.getElementById('stroke1Color').disabled = !this.checked;
    updateActiveText();
});

document.getElementById('stroke1Width').addEventListener('input', function () {
    activeTextSettings.stroke1.width = parseInt(this.value);
    updateActiveText();
});

document.getElementById('stroke1Color').addEventListener('input', function () {
    activeTextSettings.stroke1.color = this.value;
    updateActiveText();
});

// Função para atualizar a interface do gradiente
function updateGradientStopsUI() {
    const container = document.querySelector('.gradient-stops');
    container.innerHTML = '';

    activeTextSettings.gradientStops.forEach((stop, index) => {
        const stopEl = document.createElement('div');
        stopEl.className = 'gradient-stop';
        stopEl.innerHTML = `
            <input type="color" class="gradient-color" value="${stop.color}">
            <input type="number" class="gradient-position" value="${stop.position}" min="0" max="100">
            <button class="remove-stop">&times;</button>
        `;

        stopEl.querySelector('.gradient-color').addEventListener('input', (e) => {
            stop.color = e.target.value;
            updateActiveText();
        });

        stopEl.querySelector('.gradient-position').addEventListener('input', (e) => {
            stop.position = parseInt(e.target.value);
            updateActiveText();
        });

        const removeButton = stopEl.querySelector('.remove-stop');
        if (index < 2) {
            removeButton.disabled = true;
        } else {
            removeButton.addEventListener('click', () => {
                if (activeTextSettings.gradientStops.length > 2) {
                    activeTextSettings.gradientStops.splice(index, 1);
                    updateGradientStopsUI();
                    updateActiveText();
                }
            });
        }

        container.appendChild(stopEl);
    });
}

// Eventos para carregar as configurações ao selecionar um texto
canvas.on('selection:created', function (e) {
    if (e.selected[0] && e.selected[0].type === 'text') {
        activateTextCategory();
        const textObject = e.selected[0];
        
        // Carregar configurações salvas ou criar novas se não existirem
        if (!textObject.textId) {
            textObject.textId = generateUniqueId();
            saveTextSettings(textObject);
        }
        
        const settings = textSettingsMap.get(textObject.textId);
        if (settings) {
            activeTextSettings = JSON.parse(JSON.stringify(settings));
        }
        
        updateTextControlsUI(textObject);
        document.querySelector('.text-controls').style.display = 'block';

        // Adicionar as chamadas aqui
        updateGradientStopsUI();
        updateActiveText();
    }
});

canvas.on('selection:updated', function (e) {
    if (e.selected[0] && e.selected[0].type === 'text') {
        activateTextCategory();
        const textObject = e.selected[0];
        
        if (!textObject.textId) {
            textObject.textId = generateUniqueId();
            saveTextSettings(textObject);
        }
        
        const settings = textSettingsMap.get(textObject.textId);
        if (settings) {
            activeTextSettings = JSON.parse(JSON.stringify(settings));
        }
        
        updateTextControlsUI(textObject);
        document.querySelector('.text-controls').style.display = 'block';

        // Adicionar as chamadas aqui
        updateGradientStopsUI();
        updateActiveText();
    }
});

canvas.on('object:modified', function(e) {
    if (e.target && e.target.type === 'text') {
        const textObject = e.target;
        if (textObject.scaleX !== 1 || textObject.scaleY !== 1) {
            // Atualizar o tamanho da fonte baseado na escala
            const newFontSize = Math.round(textObject.fontSize * textObject.scaleX);
            textObject.set({
                fontSize: newFontSize,
                scaleX: 1,
                scaleY: 1
            });
            
            // Atualizar as configurações salvas
            const settings = textSettingsMap.get(textObject.textId);
            if (settings) {
                settings.fontSize = newFontSize;
                textSettingsMap.set(textObject.textId, settings);
            }
            
            // Atualizar a interface
            document.getElementById('fontSizeInput').value = newFontSize;
        }
        canvas.renderAll();
    }
});

canvas.on('selection:cleared', function () {
    document.querySelector('.text-controls').style.display = 'none';
});

// Evento para atualizar o tamanho da fonte do texto
document.getElementById('fontSizeInput').addEventListener('input', function () {
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'text') {
        const newFontSize = parseInt(this.value);
        activeObject.set('fontSize', newFontSize);
        activeObject.set('scaleX', 1);
        activeObject.set('scaleY', 1);
        canvas.renderAll();
    }
});

function calculateGradientAngle(coords) {
  if (!coords) return 0;
  const dx = coords.x2 - coords.x1;
  const dy = coords.y2 - coords.y1;
  return Math.round(Math.atan2(dy, dx) * 180 / Math.PI);
}
