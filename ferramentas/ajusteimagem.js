// Função para criar o modal e injetar o conteúdo
function createModal() {
  const modalHTML = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Ajustar Cores</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: Arial, sans-serif;
          background-color: #f0f0f0;
        }

        #modalContent {
          width: 100%;
          height: 100%;
          padding: 20px;
          box-sizing: border-box;
        }

        #imageContainer {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          margin-bottom: 20px;
        }

        #addedImage {
          max-width: 100%;
          max-height: 80vh;
          border: 2px solid #ccc;
          border-radius: 8px;
        }

        .adjustment-box {
          border: 1px solid #bdc3c7;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 15px;
          background-color: #fff;
        }

        .control-group {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .control-group label {
          flex: 1;
        }

        .control-group input[type="number"] {
          width: 100px;
          padding: 5px;
          font-size: 14px;
          margin-left: 10px;
        }

        input[type="range"] {
          width: 100%;
          margin-bottom: 10px;
        }

        .invert-buttons {
          display: flex;
          gap: 10px;
        }

        .invert-btn {
          flex: 1;
          padding: 5px 10px;
          background-color: #34495e;
          color: #ecf0f1;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }

        .invert-btn.active, .invert-btn:hover {
          background-color: #3d566e;
        }

        #buttonContainer {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }

        #saveBtn, #cancelBtn {
          flex: 1;
          padding: 10px;
          font-size: 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        #saveBtn {
          background-color: #27ae60;
          color: #fff;
        }

        #saveBtn:hover {
          background-color: #2ecc71;
        }

        #cancelBtn {
          background-color: #e74c3c;
          color: #fff;
        }

        #cancelBtn:hover {
          background-color: #c0392b;
        }
      </style>
    </head>
    <body>
      <div id="modalContent">
        <!-- Container da Imagem -->
        <div id="imageContainer">
          <img id="addedImage" src="" alt="Imagem para ajuste de cores">
        </div>

        <!-- Controles de Ajuste -->
        <div id="controlsSidebar">
          <h3 style="margin: 0 0 10px 0;">Ajustes de Cor</h3>

          <!-- Brilho -->
          <div class="adjustment-box">
            <div class="control-group">
              <label for="brightnessInput">Brilho:</label>
              <input type="number" id="brightnessInput" value="0" min="-100" max="100">
            </div>
            <input type="range" id="brightnessSlider" min="-100" max="100" value="0">
          </div>

          <!-- Contraste -->
          <div class="adjustment-box">
            <div class="control-group">
              <label for="contrastInput">Contraste:</label>
              <input type="number" id="contrastInput" value="0" min="-100" max="100">
            </div>
            <input type="range" id="contrastSlider" min="-100" max="100" value="0">
          </div>

          <!-- Saturação -->
          <div class="adjustment-box">
            <div class="control-group">
              <label for="saturationInput">Saturação:</label>
              <input type="number" id="saturationInput" value="0" min="-100" max="100">
            </div>
            <input type="range" id="saturationSlider" min="-100" max="100" value="0">
          </div>

          <!-- Inverter Cores -->
          <div class="adjustment-box">
            <div class="control-group">
              <label>Inverter Cor:</label>
              <div class="invert-buttons">
                <button id="invertYesBtn" class="invert-btn">Sim</button>
                <button id="invertNoBtn" class="invert-btn active">Não</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Botões Salvar e Cancelar -->
        <div id="buttonContainer">
          <button id="saveBtn">Salvar</button>
          <button id="cancelBtn">Cancelar</button>
        </div>
      </div>

      <!-- Script de Ajuste de Cores -->
      <script>
        // Função para carregar a imagem no modal
        function loadImageInModal(imgSrc) {
          const img = document.getElementById('addedImage');
          img.src = imgSrc;
          img.onload = () => {
            applyFilters();
          };
        }

        // Variáveis globais para os filtros
        let brightness = 0;
        let contrast = 0;
        let saturation = 0;
        let invert = 0;

        // Função para aplicar os filtros
        function applyFilters() {
          const img = document.getElementById('addedImage');
          if (img) {
            const totalBrightness = brightness + 100;
            const totalContrast = contrast + 100;
            const totalSaturation = 100 + saturation;
            img.style.filter = \`
              brightness(\${totalBrightness}%)
              contrast(\${totalContrast}%)
              saturate(\${totalSaturation}%)
              invert(\${invert}%)
            \`;
          }
        }

        // Função para salvar a imagem ajustada
        function saveImage() {
          const img = document.getElementById('addedImage');
          if (img) {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Definir o tamanho do canvas
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;

            // Aplicar os filtros ao canvas
            ctx.filter = img.style.filter;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Obter a imagem ajustada como base64
            const adjustedImageSrc = canvas.toDataURL('image/png');

            // Enviar a imagem ajustada de volta para o canvas principal
            if (window.opener && window.opener.updateCanvasWithAdjustedImage) {
              window.opener.updateCanvasWithAdjustedImage(adjustedImageSrc);
            }

            // Fechar o modal
            window.close();
          }
        }

        // Função para cancelar e fechar o modal
        function cancelAdjustment() {
          window.close();
        }

        // Eventos para os controles de ajuste
        document.getElementById('brightnessInput').addEventListener('input', (e) => {
          brightness = parseInt(e.target.value, 10);
          document.getElementById('brightnessSlider').value = brightness;
          applyFilters();
        });

        document.getElementById('brightnessSlider').addEventListener('input', (e) => {
          brightness = parseInt(e.target.value, 10);
          document.getElementById('brightnessInput').value = brightness;
          applyFilters();
        });

        document.getElementById('contrastInput').addEventListener('input', (e) => {
          contrast = parseInt(e.target.value, 10);
          document.getElementById('contrastSlider').value = contrast;
          applyFilters();
        });

        document.getElementById('contrastSlider').addEventListener('input', (e) => {
          contrast = parseInt(e.target.value, 10);
          document.getElementById('contrastInput').value = contrast;
          applyFilters();
        });

        document.getElementById('saturationInput').addEventListener('input', (e) => {
          saturation = parseInt(e.target.value, 10);
          document.getElementById('saturationSlider').value = saturation;
          applyFilters();
        });

        document.getElementById('saturationSlider').addEventListener('input', (e) => {
          saturation = parseInt(e.target.value, 10);
          document.getElementById('saturationInput').value = saturation;
          applyFilters();
        });

        document.getElementById('invertYesBtn').addEventListener('click', () => {
          invert = 100;
          document.getElementById('invertYesBtn').classList.add('active');
          document.getElementById('invertNoBtn').classList.remove('active');
          applyFilters();
        });

        document.getElementById('invertNoBtn').addEventListener('click', () => {
          invert = 0;
          document.getElementById('invertNoBtn').classList.add('active');
          document.getElementById('invertYesBtn').classList.remove('active');
          applyFilters();
        });

        // Eventos para os botões "Salvar" e "Cancelar"
        document.getElementById('saveBtn').addEventListener('click', saveImage);
        document.getElementById('cancelBtn').addEventListener('click', cancelAdjustment);

        // Carregar a imagem passada como parâmetro
        const urlParams = new URLSearchParams(window.location.search);
        const imgSrc = urlParams.get('imgSrc');
        if (imgSrc) {
          loadImageInModal(imgSrc);
        }
      </script>
    </body>
    </html>
  `;

  // Abrir o modal em uma nova janela
  const modalWindow = window.open('', '_blank', 'width=800,height=600');
  modalWindow.document.write(modalHTML);
  modalWindow.document.close();
}

// Inicializar o modal
createModal();
