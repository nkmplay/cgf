// ---------- Inicio Seção Exportar Vetor com ClipPath -------------------------------------------

const ZOOM_MANUAL = 0.5;

document.getElementById('saveAsBtn').addEventListener('click', () => {
    const modal = document.getElementById('saveAsModalOverlay');
    modal.style.display = 'flex';
});

document.getElementById('closeSaveAsModal').addEventListener('click', () => {
    const modal = document.getElementById('saveAsModalOverlay');
    modal.style.display = 'none';
});

document.getElementById('saveAsModalOverlay').addEventListener('click', function (e) {
    if (e.target === this) {
        this.style.display = 'none';
    }
});

document.getElementById('exportsoSVGBtn').addEventListener('click', function () {
    const modal = document.getElementById('saveAsModalOverlay');
    modal.style.display = 'none';

    const vectorPreviewModal = document.getElementById('vectorPreviewModal');
    vectorPreviewModal.style.display = 'flex';

    renderVectorPreviewWithClipPath();
});

async function generateSVGContentWithClipPath(cloudFolha, objects) {
    const extraMargin = 0.5 * CM_TO_PX;

    const svgWidth = cloudFolha.width + 2 * extraMargin;
    const svgHeight = cloudFolha.height + 2 * extraMargin; 

    let svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" 
             width="${svgWidth}" 
             height="${svgHeight}" 
             viewBox="0 0 ${svgWidth} ${svgHeight}"
             preserveAspectRatio="xMidYMid meet">
            <defs>
                <style>
                    @font-face {
                        font-family: 'ArialMT';
                        src: local('Arial');
                    }
                </style>
                <clipPath id="cloudFolhaClip">
                    <rect x="0" y="0" width="${svgWidth}" height="${svgHeight}" />
                </clipPath>
            </defs>
            <rect x="0" y="0" width="${svgWidth}" height="${svgHeight}" fill="white" />
            <g clip-path="url(#cloudFolhaClip)">
    `;

    for (const obj of objects) {
        const relativeLeft = obj.left - cloudFolha.left + extraMargin;
        const relativeTop = obj.top - cloudFolha.top + extraMargin;

        if (obj.type === 'i-text' || obj.type === 'text') {
            const fontSize = obj.fontSize * (obj.scaleX || 1);
            const transform = `
                translate(${relativeLeft} ${relativeTop}) 
                rotate(${obj.angle || 0})
            `;
            
            const escapedText = obj.text.replace(/[<>&"']/g, char => ({
                '<': '&lt;',
                '>': '&gt;',
                '&': '&amp;',
                '"': '&quot;',
                "'": '&apos;'
            }[char]));

            svgContent += `
                <text 
                    transform="${transform}"
                    font-family="${obj.fontFamily || 'ArialMT'}"
                    font-size="${fontSize}"
                    fill="${obj.fill}"
                    text-anchor="${obj.textAlign === 'center' ? 'middle' : 
                                obj.textAlign === 'right' ? 'end' : 'start'}"
                    dominant-baseline="hanging"
                    style="white-space: pre"
                >${escapedText}</text>
            `;
        } else if (obj.type === 'rect') {
            const transform = `translate(${relativeLeft} ${relativeTop}) scale(${obj.scaleX || 1} ${obj.scaleY || 1}) rotate(${obj.angle || 0})`;
            svgContent += `
                <rect 
                    x="0" y="0"
                    width="${obj.width}"
                    height="${obj.height}"
                    fill="${obj.fill}"
                    stroke="${obj.stroke || 'none'}"
                    stroke-width="${obj.strokeWidth || 0}"
                    transform="${transform}"
                />
            `;
        } else if (obj.type === 'circle') {
            const transform = `translate(${relativeLeft} ${relativeTop}) scale(${obj.scaleX || 1} ${obj.scaleY || 1}) rotate(${obj.angle || 0})`;
            svgContent += `
                <circle 
                    cx="${obj.radius}"
                    cy="${obj.radius}"
                    r="${obj.radius}"
                    fill="${obj.fill}"
                    stroke="${obj.stroke || 'none'}"
                    stroke-width="${obj.strokeWidth || 0}"
                    transform="${transform}"
                />
            `;
        } else if (obj.type === 'path') {
            const transform = `translate(${relativeLeft} ${relativeTop}) scale(${obj.scaleX || 1} ${obj.scaleY || 1}) rotate(${obj.angle || 0})`;
            const pathData = obj.path.map(point => point.join(' ')).join(' ');
            svgContent += `
                <path 
                    d="${pathData}"
                    fill="${obj.fill}"
                    stroke="${obj.stroke || 'none'}"
                    stroke-width="${obj.strokeWidth || 0}"
                    transform="${transform}"
                />
            `;
        } else if (obj.type === 'image') {
            const transform = `translate(${relativeLeft} ${relativeTop}) scale(${obj.scaleX || 1} ${obj.scaleY || 1}) rotate(${obj.angle || 0})`;
            const imgSrc = await getImageDataURL(obj);
            svgContent += `
                <image 
                    x="0" y="0"
                    width="${obj.width}"
                    height="${obj.height}"
                    href="${imgSrc}"
                    transform="${transform}"
                />
            `;
        }
    }

    svgContent += `
            </g>
        </svg>
    `;

    return svgContent;
}

async function renderVectorPreviewWithClipPath() {
    const cloudFolha = canvas.getObjects().find(obj => obj.id === 'CloudFolha');
    if (!cloudFolha) {
        showCustomAlert('Nenhuma folha encontrada.');
        return;
    }

    const objects = canvas.getObjects().filter(obj => {
        return (
            obj.id !== 'CloudFolha' &&
            (obj.type === 'i-text' || obj.type === 'text' || obj.type === 'rect' || obj.type === 'circle' || obj.type === 'path' || obj.type === 'image')
        );
    });

    const svgContent = await generateSVGContentWithClipPath(cloudFolha, objects);

    const vectorPreviewContainer = document.getElementById('vectorPreviewContainer');
    vectorPreviewContainer.innerHTML = '';

    const svgElement = document.createElement('div');
    svgElement.innerHTML = svgContent;
    vectorPreviewContainer.appendChild(svgElement);

    const svg = svgElement.querySelector('svg');
    svg.style.display = 'block';
    svg.style.margin = 'auto';
    svg.style.transform = `scale(${ZOOM_MANUAL})`;
    svg.style.transformOrigin = 'center center';
}

async function exportGroupWithClipPath() {
    const cloudFolha = canvas.getObjects().find(obj => obj.id === 'CloudFolha');
    if (!cloudFolha) {
        showCustomAlert('Nenhuma folha encontrada.');
        return;
    }

    const objects = canvas.getObjects().filter(obj => {
        return (
            obj.id !== 'CloudFolha' &&
            (obj.type === 'i-text' || obj.type === 'text' || obj.type === 'rect' || obj.type === 'circle' || obj.type === 'path' || obj.type === 'image')
        );
    });

    try {
        const svgContent = await generateSVGContentWithClipPath(cloudFolha, objects);

        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[-:]/g, '');
        link.download = `CloudApp_${timestamp}.svg`;

        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Erro ao exportar SVG:', error);
        showCustomAlert('Erro ao exportar SVG. Verifique o console para mais detalhes.');
    }
}

document.getElementById('downloadVectorBtn').addEventListener('click', function () {
    exportGroupWithClipPath(); 
    const vectorPreviewModal = document.getElementById('vectorPreviewModal');
    vectorPreviewModal.style.display = 'none'; 
});

async function getImageDataURL(imageObject) {
    return new Promise((resolve) => {
        const imgElement = imageObject.getElement();
        const canvas = document.createElement('canvas');
        canvas.width = imgElement.width;
        canvas.height = imgElement.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(imgElement, 0, 0);
        resolve(canvas.toDataURL('image/png'));
    });
}

document.getElementById('closeVectorPreviewModalBtn').addEventListener('click', function () {
    const vectorPreviewModal = document.getElementById('vectorPreviewModal');
    vectorPreviewModal.style.display = 'none';
});

document.getElementById('vectorPreviewModal').addEventListener('click', function (e) {
    if (e.target === this) {
        this.style.display = 'none';
    }
});

// ---------- Fim Seção Exportar Vetor com ClipPath -------------------------------------------
