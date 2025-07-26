document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('drawing-canvas');
    const ctx = canvas.getContext('2d');
    const brushSizeSlider = document.getElementById('brush-size');
    const brushSizeValue = document.getElementById('brush-size-value');
    const colorPicker = document.getElementById('color-picker');
    const eraserBtn = document.getElementById('eraser-btn');
    const penBtn = document.getElementById('pen-btn');
    const clearBtn = document.getElementById('clear-btn');
    const saveBtn = document.getElementById('save-btn');
    const savedList = document.getElementById('saved-list');

    // Canvas setup
    function resizeCanvas() {
        const container = document.querySelector('.canvas-container');
        canvas.width = container.clientWidth - 20;
        canvas.height = 400;
        
        // Set white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Initialize canvas
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Drawing state
    let isDrawing = false;
    let currentTool = 'pen';
    let currentColor = '#000000';
    let currentBrushSize = 5;

    // Load saved drawings
    let savedDrawings = JSON.parse(localStorage.getItem('drawings')) || [];

    // Update brush size display
    brushSizeSlider.addEventListener('input', (e) => {
        currentBrushSize = e.target.value;
        brushSizeValue.textContent = `${currentBrushSize}px`;
    });

    // Color picker
    colorPicker.addEventListener('change', (e) => {
        currentColor = e.target.value;
        if (currentTool === 'pen') {
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = currentColor;
        }
    });

    // Tool selection
    penBtn.addEventListener('click', () => {
        currentTool = 'pen';
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = currentColor;
        penBtn.classList.add('active');
        eraserBtn.classList.remove('active');
    });

    eraserBtn.addEventListener('click', () => {
        currentTool = 'eraser';
        ctx.globalCompositeOperation = 'destination-out';
        eraserBtn.classList.add('active');
        penBtn.classList.remove('active');
    });

    // Drawing functions
    function startDrawing(e) {
        isDrawing = true;
        
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        ctx.beginPath();
        ctx.moveTo(x, y);
        
        // Set drawing properties
        ctx.lineWidth = currentBrushSize;
        ctx.lineCap = 'round';
        
        if (currentTool === 'pen') {
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = currentColor;
        } else {
            ctx.globalCompositeOperation = 'destination-out';
        }
    }

    function draw(e) {
        if (!isDrawing) return;
        
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        ctx.lineTo(x, y);
        ctx.stroke();
    }

    function stopDrawing() {
        if (isDrawing) {
            isDrawing = false;
            ctx.beginPath();
        }
    }

    // Mouse events
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Touch events for mobile
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    });

    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    });

    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        const mouseEvent = new MouseEvent('mouseup', {});
        canvas.dispatchEvent(mouseEvent);
    });

    // Clear canvas
    clearBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear the canvas?')) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    });

    // Save drawing
    saveBtn.addEventListener('click', () => {
        const drawingData = canvas.toDataURL();
        const timestamp = new Date().toLocaleString();
        const drawing = {
            id: Date.now(),
            data: drawingData,
            timestamp: timestamp
        };

        savedDrawings.unshift(drawing);
        localStorage.setItem('drawings', JSON.stringify(savedDrawings));
        renderSavedDrawings();
        
        // Show feedback
        const originalText = saveBtn.textContent;
        saveBtn.textContent = 'Saved!';
        saveBtn.style.backgroundColor = '#27ae60';
        setTimeout(() => {
            saveBtn.textContent = originalText;
            saveBtn.style.backgroundColor = '#4A90E2';
        }, 2000);
    });

    // Render saved drawings
    function renderSavedDrawings() {
        savedList.innerHTML = '';
        
        if (savedDrawings.length === 0) {
            savedList.innerHTML = '<p class="no-drawings">No saved drawings yet.</p>';
            return;
        }

        savedDrawings.forEach(drawing => {
            const drawingDiv = document.createElement('div');
            drawingDiv.className = 'saved-drawing';
            
            drawingDiv.innerHTML = `
                <img src="${drawing.data}" alt="Saved drawing" />
                <div class="drawing-info">
                    <span class="timestamp">${drawing.timestamp}</span>
                    <div class="drawing-actions">
                        <button class="load-btn" data-id="${drawing.id}">Load</button>
                        <button class="download-btn" data-id="${drawing.id}">Download</button>
                        <button class="delete-btn" data-id="${drawing.id}">Delete</button>
                    </div>
                </div>
            `;
            
            savedList.appendChild(drawingDiv);
        });
    }

    // Handle saved drawing actions
    savedList.addEventListener('click', (e) => {
        const drawingId = parseInt(e.target.dataset.id);
        const drawing = savedDrawings.find(d => d.id === drawingId);
        
        if (e.target.classList.contains('load-btn')) {
            const img = new Image();
            img.onload = function() {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
            };
            img.src = drawing.data;
        } else if (e.target.classList.contains('download-btn')) {
            const link = document.createElement('a');
            link.download = `drawing-${drawing.timestamp.replace(/[\/\s:]/g, '-')}.png`;
            link.href = drawing.data;
            link.click();
        } else if (e.target.classList.contains('delete-btn')) {
            if (confirm('Are you sure you want to delete this drawing?')) {
                savedDrawings = savedDrawings.filter(d => d.id !== drawingId);
                localStorage.setItem('drawings', JSON.stringify(savedDrawings));
                renderSavedDrawings();
            }
        }
    });

    // Initialize
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = currentBrushSize;
    ctx.lineCap = 'round';
    renderSavedDrawings();
});