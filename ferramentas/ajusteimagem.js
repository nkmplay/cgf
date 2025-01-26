<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Adicionar Imagem</title>
  <style>
    body {
      margin: 0;
      display: flex;
      height: 100vh;
      font-family: Arial, sans-serif;
    }

    .sidebar {
      width: 250px;
      background-color: #2c3e50;
      padding: 20px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .sidebar button {
      width: 100%;
      padding: 10px;
      background-color: #34495e;
      color: #ecf0f1;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
      transition: background-color 0.3s ease;
      margin-bottom: 10px;
    }

    .sidebar button:hover {
      background-color: #3d566e;
    }

    .sidebar-spacing {
      height: 20px;
    }

    .sidebar-large-spacing {
      height: 30px;
    }

    .controls-sidebar,
    .reduce-colors-sidebar {
      width: 300px;
      background-color: #ecf0f1;
      padding: 20px;
      box-sizing: border-box;
      display: none;
      flex-direction: column;
      overflow-y: auto;
    }

    .controls-sidebar.active,
    .reduce-colors-sidebar.active {
      display: flex;
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

    .control-group select,
    .control-group input[type="number"] {
      width: 150px;
      padding: 5px;
      font-size: 14px;
      margin: 0 10px;
      box-sizing: border-box;
      max-width: 150px;
    }

    .controls-sidebar input[type="range"],
    .reduce-colors-sidebar input[type="range"] {
      width: 100%;
      margin-bottom: 20px;
    }

    .reduce-colors-sidebar .control-group input[type="number"] {
      width: 60px;
    }

    .container {
      flex: 1;
      background-color: #f0f0f0;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .container img {
      max-width: 100%;
      max-height: 100%;
      border: 2px solid #2c3e50;
      border-radius: 8px;
      animation: fadeIn 0.5s ease-in-out;
      filter: url(#shadowAdjust);
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
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

    #nitidezYesBtn,
    #nitidezNoBtn {
      flex: 1;
      padding: 5px 10px;
      background-color: #34495e;
      color: #ecf0f1;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }

    #nitidezYesBtn.active,
    #nitidezNoBtn.active,
    #nitidezYesBtn:hover,
    #nitidezNoBtn:hover {
      background-color: #3d566e;
    }

    .reduce-colors-sidebar {
      position: relative;
    }

    .reduce-colors-sidebar h3 {
      margin-top: 0;
    }

    .reduce-colors-sidebar .control-group label {
      flex: 1;
    }

    .reduce-colors-sidebar .control-group input[type="number"] {
      width: 60px;
      padding: 5px;
      margin-left: 10px;
    }

    .progress-container {
      width: 100%;
      background-color: #ddd;
      border-radius: 4px;
      overflow: hidden;
      margin-top: 10px;
    }

    .progress-bar {
      width: 0%;
      height: 20px;
      background-color: #27ae60;
      transition: width 0.2s ease;
    }

    .countdown {
      margin-top: 10px;
      font-size: 14px;
      color: #333;
      text-align: center;
    }

    .accept-btn {
      padding: 10px;
      background-color: #27ae60;
      color: #ecf0f1;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
      transition: background-color 0.3s ease;
      align-self: center;
      width: 100%;
    }

    .accept-btn:hover {
      background-color: #2ecc71;
    }
  </style>
</head>
<body>
  <div class="sidebar">
    <button id="addImageBtn">Adicionar Imagem</button>
    <button id="colorAdjustBtn">Ajustes de Cor</button>
    <div class="sidebar-spacing"></div>
    <button id="autoToneBtn">Tom Automático</button>
    <button id="autoContrastBtn">Contraste Automático</button>
    <button id="autoColorBtn">Cor Automática</button>
    <div class="sidebar-large-spacing"></div>
    <button id="reduceColorsBtn">Reduzir Cores</button>
    <input type="file" id="imageInput" accept="image/*" style="display: none;">
  </div>

  <div class="controls-sidebar" id="controlsSidebar">
    <h3>Ajustes de Cor</h3>

    <div class="adjustment-box">
      <div class="control-group">
        <label for="brightnessInput">Brilho:</label>
        <input type="number" id="brightnessInput" value="0" min="-100" max="100">
      </div>
      <input type="range" id="brightnessSlider" min="-100" max="100" value="0">
    </div>

    <div class="adjustment-box">
      <div class="control-group">
        <label for="contrastInput">Contraste:</label>
        <input type="number" id="contrastInput" value="0" min="-100" max="100">
      </div>
      <input type="range" id="contrastSlider" min="-100" max="100" value="0">
    </div>

    <div class="adjustment-box">
      <div class="control-group">
        <label for="hueInput">Matiz:</label>
        <select id="hueCategory">
          <option value="0">Geral</option>
          <option value="30">Vermelhos</option>
          <option value="60">Amarelos</option>
          <option value="120">Verdes</option>
          <option value="180">Cianos</option>
          <option value="240">Azul</option>
          <option value="300">Magentas</option>
        </select>
        <input type="number" id="hueInput" value="0" min="-180" max="180">
      </div>
      <input type="range" id="hueSlider" min="-180" max="180" value="0">
    </div>

    <div class="adjustment-box">
      <div class="control-group">
        <label for="saturationInput">Saturação:</label>
        <input type="number" id="saturationInput" value="0" min="-100" max="100">
      </div>
      <input type="range" id="saturationSlider" min="-100" max="100" value="0">
    </div>

    <div class="adjustment-box">
      <div class="control-group">
        <label>Inverter Cor:</label>
        <div class="invert-buttons">
          <button id="invertYesBtn" class="invert-btn">Sim</button>
          <button id="invertNoBtn" class="invert-btn">Não</button>
        </div>
      </div>
    </div>

    <div class="adjustment-box">
      <div class="control-group">
        <label>Nitidez:</label>
        <div class="invert-buttons">
          <button id="nitidezYesBtn" class="invert-btn">Sim</button>
          <button id="nitidezNoBtn" class="invert-btn active">Não</button>
        </div>
      </div>
    </div>

  </div>

  <div class="reduce-colors-sidebar" id="reduceColorsSidebar">
    <h3>Reduzir Cores</h3>

    <div class="adjustment-box">
      <div class="control-group">
        <label for="colorCountInput">Quantidade de Cores:</label>
        <input type="number" id="colorCountInput" value="8" min="2" max="64">
      </div>
      <input type="range" id="colorCountSlider" min="2" max="64" value="8">
    </div>

    <button id="acceptReduceColorsBtn" class="accept-btn">Aceitar</button>

    <!-- Progress Indicator -->
    <div class="progress-container" id="reduceColorsProgress" style="display: none;">
      <div class="progress-bar" id="progressBar"></div>
    </div>
    <div class="countdown" id="countdownTimer" style="display: none;">
      Processando... <span id="timeLeft">0</span>s restantes
    </div>

  </div>

  <div class="container" id="imageContainer">
    <!-- Images will be added here -->
  </div>

  <!-- SVG Filter for Sharpening -->
  <svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
    <filter id="sharpen">
      <feConvolveMatrix order="3" kernelMatrix="0 -1 0 -1 5 -1 0 -1 0" />
    </filter>
    <!-- Existing Shadow Filter -->
    <filter id="shadowAdjust">
      <!-- ...existing filter definitions... -->
    </filter>
  </svg>

  <!-- Hidden Canvas for Image Processing -->
  <canvas id="hiddenCanvas" style="display: none;"></canvas>

  <script>
    // Add a variable to store the original image
    let originalImageSrc = null;

    document.getElementById('addImageBtn').addEventListener('click', () => {
      document.getElementById('imageInput').click();
    });

    document.getElementById('imageInput').addEventListener('change', (event) => {
      const container = document.getElementById('imageContainer');
      const file = event.target.files[0];
      if (file) {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.alt = 'Imagem adicionada';
        img.id = 'addedImage';
        container.innerHTML = '';
        container.appendChild(img);

        // Store the original image source
        originalImageSrc = img.src;

        resetFilters();
        img.onload = () => {
          checkImageSize(img);
        };
      }
    });

    // Toggle Controls Sidebar
    document.getElementById('colorAdjustBtn').addEventListener('click', () => {
      document.getElementById('controlsSidebar').classList.toggle('active');
    });

    // Toggle Reduce Colors Sidebar
    document.getElementById('reduceColorsBtn').addEventListener('click', () => {
      document.getElementById('reduceColorsSidebar').classList.toggle('active');
      const reduceColorsSidebar = document.getElementById('reduceColorsSidebar');
      if (reduceColorsSidebar.classList.contains('active')) {
        // Apply 8 colors on open
        const colorCount = 8;
        document.getElementById('colorCountInput').value = colorCount;
        document.getElementById('colorCountSlider').value = colorCount;
        reduceColorsWithProgress(colorCount);
      }
    });

    // Initialize filter values
    let brightness = 0;
    let contrast = 0;
    let hue = 0;
    let saturation = 0;
    let invert = 0;
    let nitidez = 0;

    // Flag to determine if image is large
    let isLargeImage = false;

    // Function to check image size
    function checkImageSize(img) {
      const maxDimension = Math.max(img.naturalWidth, img.naturalHeight);
      isLargeImage = maxDimension > 1500;
      const reduceColorsSidebar = document.getElementById('reduceColorsSidebar');
      const acceptBtn = document.getElementById('acceptReduceColorsBtn');

      if (isLargeImage) {
        // Show Accept button
        acceptBtn.style.display = 'block';
        // Disable real-time changes
        disableRealTimeReduceColors();
      } else {
        // Hide Accept button
        acceptBtn.style.display = 'none';
        // Enable real-time changes
        enableRealTimeReduceColors();
      }
    }

    // Function to disable real-time reduce colors
    function disableRealTimeReduceColors() {
      document.getElementById('colorCountInput').removeEventListener('input', handleReduceColorsInput);
      document.getElementById('colorCountSlider').removeEventListener('input', handleReduceColorsInput);
    }

    // Function to enable real-time reduce colors
    function enableRealTimeReduceColors() {
      document.getElementById('colorCountInput').addEventListener('input', handleReduceColorsInput);
      document.getElementById('colorCountSlider').addEventListener('input', handleReduceColorsInput);
    }

    // Handle reduce colors input changes
    function handleReduceColorsInput(e) {
      const colorCount = parseInt(e.target.value, 10);

      // Update both input and slider consistently
      document.getElementById('colorCountInput').value = colorCount;
      document.getElementById('colorCountSlider').value = colorCount;

      if (!isLargeImage) {
        reduceColorsWithProgress(colorCount);
      }
    }

    // Modify event listeners to ensure bidirectional updates
    document.getElementById('colorCountInput').addEventListener('input', (e) => {
      const colorCount = parseInt(e.target.value, 10);

      // Ensure value is within allowed range
      const clampedValue = Math.min(Math.max(colorCount, 2), 64);

      // Update both input and slider consistently
      document.getElementById('colorCountInput').value = clampedValue;
      document.getElementById('colorCountSlider').value = clampedValue;

      if (!isLargeImage) {
        reduceColorsWithProgress(clampedValue);
      }
    });

    document.getElementById('colorCountSlider').addEventListener('input', (e) => {
      const colorCount = parseInt(e.target.value, 10);

      // Update both input and slider consistently
      document.getElementById('colorCountInput').value = colorCount;
      document.getElementById('colorCountSlider').value = colorCount;

      if (!isLargeImage) {
        reduceColorsWithProgress(colorCount);
      }
    });

    // Accept button for large images
    document.getElementById('acceptReduceColorsBtn').addEventListener('click', () => {
      const colorCount = parseInt(document.getElementById('colorCountInput').value, 10);
      reduceColorsWithProgress(colorCount);
    });

    // Modify the reduceColorsWithProgress function to use the original image
    async function reduceColorsWithProgress(numberOfColors) {
      const img = document.getElementById('addedImage');
      if (!img) return;

      const canvas = document.getElementById('hiddenCanvas');
      const ctx = canvas.getContext('2d');

      // Show progress indicators
      document.getElementById('reduceColorsProgress').style.display = 'block';
      document.getElementById('countdownTimer').style.display = 'block';
      const progressBar = document.getElementById('progressBar');
      const countdownTimer = document.getElementById('timeLeft');
      progressBar.style.width = '0%';
      countdownTimer.textContent = '0';

      // Create a new image from the original source
      const originalImg = new Image();
      originalImg.src = originalImageSrc;

      await new Promise(resolve => {
        originalImg.onload = () => {
          // Set canvas size to original image size
          canvas.width = originalImg.naturalWidth;
          canvas.height = originalImg.naturalHeight;

          // Draw original image onto canvas
          ctx.drawImage(originalImg, 0, 0, canvas.width, canvas.height);

          // Get image data
          let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          let data = imageData.data;

          // Start timer
          let startTime = Date.now();
          let estimatedTime = 5; // Estimated time in seconds
          countdownTimer.textContent = estimatedTime;

          const timerInterval = setInterval(() => {
            let elapsed = Math.floor((Date.now() - startTime) / 1000);
            let timeLeft = estimatedTime - elapsed;
            if (timeLeft <= 0) {
              countdownTimer.textContent = '0';
              clearInterval(timerInterval);
            } else {
              countdownTimer.textContent = timeLeft;
            }
          }, 1000);

          // Perform color quantization using Web Worker
          if (window.Worker) {
            const worker = new Worker(URL.createObjectURL(new Blob([`
              self.onmessage = function(e) {
                const { data, width, height, colors } = e.data;

                // Convert the flat image data array to an array of RGB tuples
                const pixels = [];
                for (let i = 0; i < data.length; i += 4) {
                  pixels.push([data[i], data[i + 1], data[i + 2]]);
                }

                // Perform Median Cut quantization
                const quantized = medianCut(pixels, colors);
                const palette = quantized.palette;

                // Map each pixel to the nearest palette color
                for (let i = 0; i < pixels.length; i++) {
                  const nearest = findNearestColor(pixels[i], palette);
                  data[i * 4] = nearest[0];
                  data[i * 4 + 1] = nearest[1];
                  data[i * 4 + 2] = nearest[2];
                  // Alpha channel (data[i * 4 + 3]) remains unchanged
                }

                // Send the quantized data and palette back to the main thread
                postMessage({ quantizedData: data, palette });
              };

              // Median Cut Algorithm Implementation
              function medianCut(pixels, colorCount) {
                // Initialize with one box containing all pixels
                let boxes = [pixels.slice()];

                // Split boxes until we reach the desired number of colors
                while (boxes.length < colorCount) {
                  // Find the box with the largest color range
                  let maxRange = 0;
                  let boxToSplitIndex = 0;

                  boxes.forEach((box, index) => {
                    const range = getColorRange(box);
                    if (range > maxRange) {
                      maxRange = range;
                      boxToSplitIndex = index;
                    }
                  });

                  // If no box can be split further, exit the loop
                  if (maxRange === 0) break;

                  // Split the selected box
                  const boxToSplit = boxes.splice(boxToSplitIndex, 1)[0];
                  const [box1, box2] = splitBox(boxToSplit);
                  boxes.push(box1, box2);
                }

                // Calculate the average color for each box to form the palette
                const palette = boxes.map(box => {
                  const avg = [0, 0, 0];
                  box.forEach(pixel => {
                    avg[0] += pixel[0];
                    avg[1] += pixel[1];
                    avg[2] += pixel[2];
                  });
                  avg[0] = Math.round(avg[0] / box.length);
                  avg[1] = Math.round(avg[1] / box.length);
                  avg[2] = Math.round(avg[2] / box.length);
                  return avg;
                });

                return { palette };
              }

              // Function to get the largest color range in a box
              function getColorRange(box) {
                let min = [Infinity, Infinity, Infinity];
                let max = [-Infinity, -Infinity, -Infinity];

                box.forEach(pixel => {
                  for (let i = 0; i < 3; i++) {
                    if (pixel[i] < min[i]) min[i] = pixel[i];
                    if (pixel[i] > max[i]) max[i] = pixel[i];
                  }
                });

                const ranges = [
                  max[0] - min[0],
                  max[1] - min[1],
                  max[2] - min[2]
                ];

                return Math.max(...ranges);
              }

              // Function to split a box into two boxes based on the median of the largest color range
              function splitBox(box) {
                // Determine which color channel has the largest range
                let min = [Infinity, Infinity, Infinity];
                let max = [-Infinity, -Infinity, -Infinity];

                box.forEach(pixel => {
                  for (let i = 0; i < 3; i++) {
                    if (pixel[i] < min[i]) min[i] = pixel[i];
                    if (pixel[i] > max[i]) max[i] = pixel[i];
                  }
                });

                const ranges = [
                  max[0] - min[0],
                  max[1] - min[1],
                  max[2] - min[2]
                ];

                const channel = ranges.indexOf(Math.max(...ranges));

                // Sort the box based on the selected channel
                box.sort((a, b) => a[channel] - b[channel]);

                // Find the median index
                const medianIndex = Math.floor(box.length / 2);

                // Split the box into two halves
                const box1 = box.slice(0, medianIndex);
                const box2 = box.slice(medianIndex);

                return [box1, box2];
              }

              // Function to find the nearest color in the palette to a given pixel
              function findNearestColor(pixel, palette) {
                let minDistance = Infinity;
                let nearest = palette[0];

                palette.forEach(color => {
                  const distance = Math.pow(pixel[0] - color[0], 2) +
                                   Math.pow(pixel[1] - color[1], 2) +
                                   Math.pow(pixel[2] - color[2], 2);
                  if (distance < minDistance) {
                    minDistance = distance;
                    nearest = color;
                  }
                });

                return nearest;
              }
            `], { type: 'application/javascript' })));

            worker.postMessage({ data: data.slice(), width: canvas.width, height: canvas.height, colors: numberOfColors });

            worker.onmessage = function(e) {
              const { quantizedData, palette } = e.data;
              // Update image data
              imageData.data.set(quantizedData);
              ctx.putImageData(imageData, 0, 0);

              // Update image source
              img.src = canvas.toDataURL();

              // Hide progress indicators
              document.getElementById('reduceColorsProgress').style.display = 'none';
              document.getElementById('countdownTimer').style.display = 'none';

              worker.terminate();
              resolve();
            };

            worker.onerror = function(error) {
              console.error('Worker error:', error);
              document.getElementById('reduceColorsProgress').style.display = 'none';
              document.getElementById('countdownTimer').style.display = 'none';
              clearInterval(timerInterval);
              resolve();
            };
          } else {
            // Fallback if Web Workers are not supported
            reduceColors(numberOfColors);
            // Hide progress indicators
            document.getElementById('reduceColorsProgress').style.display = 'none';
            document.getElementById('countdownTimer').style.display = 'none';
            clearInterval(timerInterval);
            resolve();
          }
        };
      });
    }

    // Function to reduce number of colors in the image without Web Worker
    function reduceColors(numberOfColors) {
      const img = document.getElementById('addedImage');
      if (!img) return;

      const canvas = document.getElementById('hiddenCanvas');
      const ctx = canvas.getContext('2d');

      // Set canvas size to image size
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      // Draw image onto canvas
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Get image data
      let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let data = imageData.data;

      // Perform quantization using Median Cut
      const worker = new Worker(URL.createObjectURL(new Blob([`
        self.onmessage = function(e) {
          const { data, width, height, colors } = e.data;

          // Convert the flat image data array to an array of RGB tuples
          const pixels = [];
          for (let i = 0; i < data.length; i += 4) {
            pixels.push([data[i], data[i + 1], data[i + 2]]);
          }

          // Perform Median Cut quantization
          const quantized = medianCut(pixels, colors);
          const palette = quantized.palette;

          // Map each pixel to the nearest palette color
          for (let i = 0; i < pixels.length; i++) {
            const nearest = findNearestColor(pixels[i], palette);
            data[i * 4] = nearest[0];
            data[i * 4 + 1] = nearest[1];
            data[i * 4 + 2] = nearest[2];
            // Alpha channel (data[i * 4 + 3]) remains unchanged
          }

          // Send the quantized data and palette back to the main thread
          postMessage({ quantizedData: data, palette });
        };

        // Median Cut Algorithm Implementation
        function medianCut(pixels, colorCount) {
          // Initialize with one box containing all pixels
          let boxes = [pixels.slice()];

          // Split boxes until we reach the desired number of colors
          while (boxes.length < colorCount) {
            // Find the box with the largest color range
            let maxRange = 0;
            let boxToSplitIndex = 0;

            boxes.forEach((box, index) => {
              const range = getColorRange(box);
              if (range > maxRange) {
                maxRange = range;
                boxToSplitIndex = index;
              }
            });

            // If no box can be split further, exit the loop
            if (maxRange === 0) break;

            // Split the selected box
            const boxToSplit = boxes.splice(boxToSplitIndex, 1)[0];
            const [box1, box2] = splitBox(boxToSplit);
            boxes.push(box1, box2);
          }

          // Calculate the average color for each box to form the palette
          const palette = boxes.map(box => {
            const avg = [0, 0, 0];
            box.forEach(pixel => {
              avg[0] += pixel[0];
              avg[1] += pixel[1];
              avg[2] += pixel[2];
            });
            avg[0] = Math.round(avg[0] / box.length);
            avg[1] = Math.round(avg[1] / box.length);
            avg[2] = Math.round(avg[2] / box.length);
            return avg;
          });

          return { palette };
        }

        // Function to get the largest color range in a box
        function getColorRange(box) {
          let min = [Infinity, Infinity, Infinity];
          let max = [-Infinity, -Infinity, -Infinity];

          box.forEach(pixel => {
            for (let i = 0; i < 3; i++) {
              if (pixel[i] < min[i]) min[i] = pixel[i];
              if (pixel[i] > max[i]) max[i] = pixel[i];
            }
          });

          const ranges = [
            max[0] - min[0],
            max[1] - min[1],
            max[2] - min[2]
          ];

          return Math.max(...ranges);
        }

        // Function to split a box into two boxes based on the median of the largest color range
        function splitBox(box) {
          // Determine which color channel has the largest range
          let min = [Infinity, Infinity, Infinity];
          let max = [-Infinity, -Infinity, -Infinity];

          box.forEach(pixel => {
            for (let i = 0; i < 3; i++) {
              if (pixel[i] < min[i]) min[i] = pixel[i];
              if (pixel[i] > max[i]) max[i] = pixel[i];
            }
          });

          const ranges = [
            max[0] - min[0],
            max[1] - min[1],
            max[2] - min[2]
          ];

          const channel = ranges.indexOf(Math.max(...ranges));

          // Sort the box based on the selected channel
          box.sort((a, b) => a[channel] - b[channel]);

          // Find the median index
          const medianIndex = Math.floor(box.length / 2);

          // Split the box into two halves
          const box1 = box.slice(0, medianIndex);
          const box2 = box.slice(medianIndex);

          return [box1, box2];
        }

        // Function to find the nearest color in the palette to a given pixel
        function findNearestColor(pixel, palette) {
          let minDistance = Infinity;
          let nearest = palette[0];

          palette.forEach(color => {
            const distance = Math.pow(pixel[0] - color[0], 2) +
                             Math.pow(pixel[1] - color[1], 2) +
                             Math.pow(pixel[2] - color[2], 2);
            if (distance < minDistance) {
              minDistance = distance;
              nearest = color;
            }
          });

          return nearest;
        }
      `], { type: 'application/javascript' })));

      worker.postMessage({ data: data.slice(), width: canvas.width, height: canvas.height, colors: numberOfColors });

      worker.onmessage = function(e) {
        const { quantizedData, palette } = e.data;
        // Update image data
        imageData.data.set(quantizedData);
        ctx.putImageData(imageData, 0, 0);

        // Update image source
        img.src = canvas.toDataURL();

        worker.terminate();
      };

      worker.onerror = function(error) {
        console.error('Worker error:', error);
      };
    }

    // Function to apply filters to the image
    function applyFilters() {
      const img = document.getElementById('addedImage');
      if (img) {
        const totalBrightness = brightness + 100;
        const totalContrast = contrast + 100;
        const totalSaturation = 100 + saturation;
        let filterString = `
          brightness(${totalBrightness}%)
          contrast(${totalContrast}%)
          hue-rotate(${hue}deg)
          saturate(${totalSaturation}%)
          invert(${invert}%)
        `;
        if (nitidez === 100) {
          filterString += ` url(#sharpen) `;
        }
        img.style.filter = filterString.trim();
      }
    }

    // Function to reset filters
    function resetFilters() {
      brightness = 0;
      contrast = 0;
      hue = 0;
      saturation = 0;
      invert = 0;
      nitidez = 0;

      document.getElementById('brightnessInput').value = 0;
      document.getElementById('brightnessSlider').value = 0;

      document.getElementById('contrastInput').value = 0;
      document.getElementById('contrastSlider').value = 0;

      document.getElementById('hueInput').value = 0;
      document.getElementById('hueSlider').value = 0;
      document.getElementById('hueCategory').value = '0';

      document.getElementById('saturationInput').value = 0;
      document.getElementById('saturationSlider').value = 0;

      // Reset Invert Color
      invert = 0;
      document.getElementById('invertYesBtn').classList.remove('active');
      document.getElementById('invertNoBtn').classList.add('active');

      // Reset Nitidez
      nitidez = 0;
      document.getElementById('nitidezYesBtn').classList.remove('active');
      document.getElementById('nitidezNoBtn').classList.add('active');

      applyFilters();
    }

    // Brightness Controls
    const brightnessInput = document.getElementById('brightnessInput');
    const brightnessSlider = document.getElementById('brightnessSlider');

    brightnessInput.addEventListener('input', (e) => {
      brightness = parseInt(e.target.value, 10);
      brightnessSlider.value = brightness;
      applyFilters();
    });

    brightnessSlider.addEventListener('input', (e) => {
      brightness = parseInt(e.target.value, 10);
      brightnessInput.value = brightness;
      applyFilters();
    });

    // Contrast Controls
    const contrastInput = document.getElementById('contrastInput');
    const contrastSlider = document.getElementById('contrastSlider');

    contrastInput.addEventListener('input', (e) => {
      contrast = parseInt(e.target.value, 10);
      contrastSlider.value = contrast;
      applyFilters();
    });

    contrastSlider.addEventListener('input', (e) => {
      contrast = parseInt(e.target.value, 10);
      contrastInput.value = contrast;
      applyFilters();
    });

    // Hue Controls
    const hueInput = document.getElementById('hueInput');
    const hueSlider = document.getElementById('hueSlider');

    hueInput.addEventListener('input', (e) => {
      hue = parseInt(e.target.value, 10);
      hueSlider.value = hue;
      updateHueCategory();
      applyFilters();
    });

    hueSlider.addEventListener('input', (e) => {
      hue = parseInt(e.target.value, 10);
      hueInput.value = hue;
      updateHueCategory();
      applyFilters();
    });

    // Saturation Controls
    const saturationInput = document.getElementById('saturationInput');
    const saturationSlider = document.getElementById('saturationSlider');

    saturationInput.addEventListener('input', (e) => {
      saturation = parseInt(e.target.value, 10);
      saturationSlider.value = saturation;
      applyFilters();
    });

    saturationSlider.addEventListener('input', (e) => {
      saturation = parseInt(e.target.value, 10);
      saturationInput.value = saturation;
      applyFilters();
    });

    // Hue Category Controls
    const hueCategory = document.getElementById('hueCategory');

    hueCategory.addEventListener('change', (e) => {
      hue = parseInt(e.target.value, 10);
      hueSlider.value = hue;
      hueInput.value = hue;
      applyFilters();
    });

    // Function to update hue category based on hue value
    function updateHueCategory() {
      const category = document.getElementById('hueCategory');
      const hueValue = hue;

      if (hueValue === 0) {
        category.value = '0';
      } else {
        // Find the closest category value
        const categories = [0, 30, 60, 120, 180, 240, 300];
        let closest = categories.reduce((prev, curr) => {
          return (Math.abs(curr - hueValue) < Math.abs(prev - hueValue) ? curr : prev);
        }, categories[0]);
        category.value = closest.toString();
      }
    }

    // Invert Color Controls
    const invertYesBtn = document.getElementById('invertYesBtn');
    const invertNoBtn = document.getElementById('invertNoBtn');

    invertYesBtn.addEventListener('click', () => {
      invert = 100;
      invertYesBtn.classList.add('active');
      invertNoBtn.classList.remove('active');
      applyFilters();
    });

    invertNoBtn.addEventListener('click', () => {
      invert = 0;
      invertNoBtn.classList.add('active');
      invertYesBtn.classList.remove('active');
      applyFilters();
    });

    // Nitidez Controls
    const nitidezYesBtn = document.getElementById('nitidezYesBtn');
    const nitidezNoBtn = document.getElementById('nitidezNoBtn');

    nitidezYesBtn.addEventListener('click', () => {
      nitidez = 100;
      nitidezYesBtn.classList.add('active');
      nitidezNoBtn.classList.remove('active');
      applyFilters();
    });

    nitidezNoBtn.addEventListener('click', () => {
      nitidez = 0;
      nitidezNoBtn.classList.add('active');
      nitidezYesBtn.classList.remove('active');
      applyFilters();
    });

    // Auto Tone, Auto Contrast, Auto Color Buttons
    const autoToneBtn = document.getElementById('autoToneBtn');
    const autoContrastBtn = document.getElementById('autoContrastBtn');
    const autoColorBtn = document.getElementById('autoColorBtn');

    autoToneBtn.addEventListener('click', autoTone);
    autoContrastBtn.addEventListener('click', autoContrast);
    autoColorBtn.addEventListener('click', autoColor);

    // Function to apply Auto Tone
    function autoTone() {
      const img = document.getElementById('addedImage');
      if (!img) return;

      const canvas = document.getElementById('hiddenCanvas');
      const ctx = canvas.getContext('2d');

      // Set canvas size to image size
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      // Draw image onto canvas
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Get image data
      let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let data = imageData.data;

      // Calculate average brightness
      let total = 0;
      for (let i = 0; i < data.length; i += 4) {
        total += (data[i] + data[i + 1] + data[i + 2]) / 3;
      }
      let avg = total / (data.length / 4);

      // Adjust brightness based on average
      let adjustment = 128 - avg;
      for (let i = 0; i < data.length; i += 4) {
        data[i] += adjustment;     // R
        data[i + 1] += adjustment; // G
        data[i + 2] += adjustment; // B
      }

      // Put adjusted data back
      ctx.putImageData(imageData, 0, 0);

      // Update image source
      img.src = canvas.toDataURL();

      // Reset filters to avoid conflicts
      resetFilters();
    }

    // Function to apply Auto Contrast
    function autoContrast() {
      const img = document.getElementById('addedImage');
      if (!img) return;

      const canvas = document.getElementById('hiddenCanvas');
      const ctx = canvas.getContext('2d');

      // Set canvas size to image size
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      // Draw image onto canvas
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Get image data
      let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let data = imageData.data;

      // Find min and max luminance
      let min = 255, max = 0;
      for (let i = 0; i < data.length; i += 4) {
        let lum = (data[i] + data[i + 1] + data[i + 2]) / 3;
        if (lum < min) min = lum;
        if (lum > max) max = lum;
      }

      // Stretch luminance to full range
      let range = max - min;
      if (range === 0) return; // Avoid division by zero

      for (let i = 0; i < data.length; i += 4) {
        data[i] = ((data[i] - min) / range) * 255;     // R
        data[i + 1] = ((data[i + 1] - min) / range) * 255; // G
        data[i + 2] = ((data[i + 2] - min) / range) * 255; // B
      }

      // Put adjusted data back
      ctx.putImageData(imageData, 0, 0);

      // Update image source
      img.src = canvas.toDataURL();

      // Reset filters to avoid conflicts
      resetFilters();
    }

    // Function to apply Auto Color
    function autoColor() {
      const img = document.getElementById('addedImage');
      if (!img) return;

      const canvas = document.getElementById('hiddenCanvas');
      const ctx = canvas.getContext('2d');

      // Set canvas size to image size
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      // Draw image onto canvas
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Get image data
      let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let data = imageData.data;

      // Calculate average for each channel
      let rTotal = 0, gTotal = 0, bTotal = 0;
      let count = 0;
      for (let i = 0; i < data.length; i += 4) {
        rTotal += data[i];
        gTotal += data[i + 1];
        bTotal += data[i + 2];
        count++;
      }
      let rAvg = rTotal / count;
      let gAvg = gTotal / count;
      let bAvg = bTotal / count;

      // Calculate correction factors
      let avg = (rAvg + gAvg + bAvg) / 3;
      let rFactor = avg / rAvg;
      let gFactor = avg / gAvg;
      let bFactor = avg / bAvg;

      // Apply correction
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, data[i] * rFactor);       // R
        data[i + 1] = Math.min(255, data[i + 1] * gFactor); // G
        data[i + 2] = Math.min(255, data[i + 2] * bFactor); // B
      }

      // Put adjusted data back
      ctx.putImageData(imageData, 0, 0);

      // Update image source
      img.src = canvas.toDataURL();

      // Reset filters to avoid conflicts
      resetFilters();
    }
  </script>
</body>
</html>
