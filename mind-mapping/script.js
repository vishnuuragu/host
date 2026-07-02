// Read a JSON value from localStorage, falling back if missing or corrupted
function loadJSON(key, fallback) {
    try {
        return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch (e) {
        return fallback;
    }
}

// Escape user-provided text before inserting it into innerHTML
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, ch => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
    ));
}

document.addEventListener('DOMContentLoaded', function() {
    const mapTitle = document.getElementById('map-title');
    const addNodeBtn = document.getElementById('add-node-btn');
    const clearMapBtn = document.getElementById('clear-map-btn');
    const saveMapBtn = document.getElementById('save-map-btn');
    const mindMapCanvas = document.getElementById('mind-map-canvas');
    const nodeControls = document.querySelector('.node-controls');
    const nodeText = document.getElementById('node-text');
    const nodeColor = document.getElementById('node-color');
    const updateNodeBtn = document.getElementById('update-node-btn');
    const deleteNodeBtn = document.getElementById('delete-node-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const savedMapsList = document.getElementById('saved-maps-list');
    const instructions = mindMapCanvas.querySelector('.instructions');

    let nodes = [];
    let connections = [];
    let savedMaps = loadJSON('mindMaps', []);
    let selectedNode = null;
    let draggedNode = null;
    let nodeIdCounter = 1;

    // Add node functionality
    addNodeBtn.addEventListener('click', () => {
        const node = createNode(`Node ${nodeIdCounter}`, '#4A90E2');
        nodes.push(node);
        nodeIdCounter++;
        renderMindMap();
        hideInstructions();
    });

    function createNode(text, color, x = null, y = null) {
        return {
            id: Date.now() + Math.random(),
            text,
            color,
            x: x || Math.random() * (mindMapCanvas.clientWidth - 200) + 100,
            y: y || Math.random() * (mindMapCanvas.clientHeight - 200) + 100
        };
    }

    function hideInstructions() {
        if (instructions) {
            instructions.style.display = 'none';
        }
    }

    function showInstructions() {
        if (instructions && nodes.length === 0) {
            instructions.style.display = 'block';
        }
    }

    function renderMindMap() {
        // Clear existing nodes
        const existingNodes = mindMapCanvas.querySelectorAll('.mind-node');
        existingNodes.forEach(node => node.remove());

        // Clear existing connections
        const existingConnections = mindMapCanvas.querySelectorAll('.connection-line');
        existingConnections.forEach(connection => connection.remove());

        // Render connections first (so they appear behind nodes)
        connections.forEach(connection => {
            const line = createConnectionLine(connection);
            mindMapCanvas.appendChild(line);
        });

        // Render nodes
        nodes.forEach(nodeData => {
            const nodeElement = createNodeElement(nodeData);
            mindMapCanvas.appendChild(nodeElement);
        });

        showInstructions();
    }

    function createNodeElement(nodeData) {
        const nodeElement = document.createElement('div');
        nodeElement.className = 'mind-node';
        nodeElement.style.left = `${nodeData.x}px`;
        nodeElement.style.top = `${nodeData.y}px`;
        nodeElement.style.backgroundColor = nodeData.color;
        nodeElement.textContent = nodeData.text;
        nodeElement.dataset.nodeId = nodeData.id;

        // Make node draggable
        nodeElement.draggable = true;

        // Add event listeners
        nodeElement.addEventListener('click', (e) => {
            e.stopPropagation();
            selectNode(nodeData);
        });

        nodeElement.addEventListener('dragstart', (e) => {
            draggedNode = nodeData;
            e.dataTransfer.effectAllowed = 'move';
        });

        nodeElement.addEventListener('dragend', () => {
            draggedNode = null;
        });

        return nodeElement;
    }

    function createConnectionLine(connection) {
        const startNode = nodes.find(n => n.id === connection.startId);
        const endNode = nodes.find(n => n.id === connection.endId);
        
        if (!startNode || !endNode) return null;

        const line = document.createElement('div');
        line.className = 'connection-line';
        
        const startX = startNode.x + 75; // Center of node (150px width / 2)
        const startY = startNode.y + 25; // Center of node (50px height / 2)
        const endX = endNode.x + 75;
        const endY = endNode.y + 25;

        const length = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
        const angle = Math.atan2(endY - startY, endX - startX) * 180 / Math.PI;

        line.style.width = `${length}px`;
        line.style.left = `${startX}px`;
        line.style.top = `${startY}px`;
        line.style.transform = `rotate(${angle}deg)`;
        line.style.transformOrigin = '0 50%';

        return line;
    }

    function selectNode(nodeData) {
        selectedNode = nodeData;
        nodeControls.style.display = 'flex';
        nodeText.value = nodeData.text;
        nodeColor.value = nodeData.color;

        // Highlight selected node
        const nodeElements = mindMapCanvas.querySelectorAll('.mind-node');
        nodeElements.forEach(el => el.classList.remove('selected'));
        const selectedElement = mindMapCanvas.querySelector(`[data-node-id="${nodeData.id}"]`);
        if (selectedElement) {
            selectedElement.classList.add('selected');
        }
    }

    function deselectNode() {
        selectedNode = null;
        nodeControls.style.display = 'none';
        const nodeElements = mindMapCanvas.querySelectorAll('.mind-node');
        nodeElements.forEach(el => el.classList.remove('selected'));
    }

    // Node editing controls
    updateNodeBtn.addEventListener('click', () => {
        if (selectedNode) {
            selectedNode.text = nodeText.value.trim() || selectedNode.text;
            selectedNode.color = nodeColor.value;
            renderMindMap();
            deselectNode();
        }
    });

    deleteNodeBtn.addEventListener('click', () => {
        if (selectedNode && confirm('Delete this node?')) {
            nodes = nodes.filter(node => node.id !== selectedNode.id);
            connections = connections.filter(conn => 
                conn.startId !== selectedNode.id && conn.endId !== selectedNode.id
            );
            renderMindMap();
            deselectNode();
        }
    });

    cancelEditBtn.addEventListener('click', () => {
        deselectNode();
    });

    // Canvas drag and drop
    mindMapCanvas.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    mindMapCanvas.addEventListener('drop', (e) => {
        e.preventDefault();
        if (draggedNode) {
            const rect = mindMapCanvas.getBoundingClientRect();
            draggedNode.x = e.clientX - rect.left - 75; // Adjust for node center
            draggedNode.y = e.clientY - rect.top - 25;
            
            // Keep node within bounds
            draggedNode.x = Math.max(0, Math.min(draggedNode.x, mindMapCanvas.clientWidth - 150));
            draggedNode.y = Math.max(0, Math.min(draggedNode.y, mindMapCanvas.clientHeight - 50));
            
            renderMindMap();
        }
    });

    // Click outside to deselect
    mindMapCanvas.addEventListener('click', (e) => {
        if (e.target === mindMapCanvas) {
            deselectNode();
        }
    });

    // Connect nodes functionality (simplified - connect by double-clicking)
    let firstNodeForConnection = null;
    
    mindMapCanvas.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        const nodeElement = e.target.closest('.mind-node');
        if (nodeElement) {
            const nodeId = nodeElement.dataset.nodeId;
            const node = nodes.find(n => n.id == nodeId);
            
            if (!firstNodeForConnection) {
                firstNodeForConnection = node;
                nodeElement.classList.add('connecting');
                alert('Double-click another node to connect them');
            } else if (firstNodeForConnection.id !== node.id) {
                // Create connection
                const existingConnection = connections.find(conn => 
                    (conn.startId === firstNodeForConnection.id && conn.endId === node.id) ||
                    (conn.startId === node.id && conn.endId === firstNodeForConnection.id)
                );
                
                if (!existingConnection) {
                    connections.push({
                        startId: firstNodeForConnection.id,
                        endId: node.id
                    });
                }
                
                // Clear connection state
                const connectingNodes = mindMapCanvas.querySelectorAll('.connecting');
                connectingNodes.forEach(el => el.classList.remove('connecting'));
                firstNodeForConnection = null;
                
                renderMindMap();
            }
        }
    });

    // Clear map
    clearMapBtn.addEventListener('click', () => {
        if (confirm('Clear the entire mind map?')) {
            nodes = [];
            connections = [];
            nodeIdCounter = 1;
            renderMindMap();
            deselectNode();
        }
    });

    // Save map
    saveMapBtn.addEventListener('click', () => {
        const title = mapTitle.value.trim() || `Mind Map ${Date.now()}`;
        
        if (nodes.length === 0) {
            alert('Add some nodes before saving');
            return;
        }

        const mindMap = {
            id: Date.now(),
            title,
            nodes: [...nodes],
            connections: [...connections],
            created: new Date().toLocaleDateString()
        };

        savedMaps.unshift(mindMap);
        localStorage.setItem('mindMaps', JSON.stringify(savedMaps));
        renderSavedMaps();

        // Show feedback
        const originalText = saveMapBtn.textContent;
        saveMapBtn.textContent = 'Saved!';
        saveMapBtn.style.backgroundColor = '#27ae60';
        setTimeout(() => {
            saveMapBtn.textContent = originalText;
            saveMapBtn.style.backgroundColor = '#4A90E2';
        }, 2000);
    });

    function renderSavedMaps() {
        if (savedMaps.length === 0) {
            savedMapsList.innerHTML = '<p class="no-maps">No saved mind maps yet.</p>';
            return;
        }

        savedMapsList.innerHTML = '';
        savedMaps.forEach(map => {
            const mapCard = document.createElement('div');
            mapCard.className = 'saved-map-card';
            
            mapCard.innerHTML = `
                <div class="map-info">
                    <h4>${escapeHTML(map.title)}</h4>
                    <div class="map-stats">
                        <span>${map.nodes.length} nodes</span>
                        <span>${map.connections.length} connections</span>
                        <span>Created: ${map.created}</span>
                    </div>
                </div>
                <div class="map-actions">
                    <button class="load-map-btn" data-id="${map.id}">Load</button>
                    <button class="delete-map-btn" data-id="${map.id}">Delete</button>
                </div>
            `;
            
            savedMapsList.appendChild(mapCard);
        });

        // Add event listeners
        savedMapsList.querySelectorAll('.load-map-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mapId = parseInt(e.target.dataset.id);
                const map = savedMaps.find(m => m.id === mapId);
                loadMap(map);
            });
        });

        savedMapsList.querySelectorAll('.delete-map-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mapId = parseInt(e.target.dataset.id);
                if (confirm('Delete this mind map?')) {
                    savedMaps = savedMaps.filter(m => m.id !== mapId);
                    localStorage.setItem('mindMaps', JSON.stringify(savedMaps));
                    renderSavedMaps();
                }
            });
        });
    }

    function loadMap(map) {
        mapTitle.value = map.title;
        nodes = [...map.nodes];
        connections = [...map.connections];
        nodeIdCounter = Math.max(...nodes.map(n => parseInt(n.id.toString().slice(-3))), 0) + 1;
        renderMindMap();
        deselectNode();
    }

    // Initialize
    renderSavedMaps();
});