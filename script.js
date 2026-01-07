const PASSWORD = '1234';
let currentUser = null;
let allTools = []; // Demo tools data
let myTools = []; // Tools checked out by current user

// Updated Demo Tools for Will Power Excavation
const DEMO_TOOLS = [
    { id: 'WP-001', name: 'Topcon Pipe Laser (Green Beam)', status: 'available', condition: 'Excellent' },
    { id: 'WP-002', name: 'Wacker Neuson Plate Compactor', status: 'checked_out', holder: 'Mike (Grading)', condition: 'Good' },
    { id: 'WP-003', name: '3-Inch Trash Pump (Honda)', status: 'available', condition: 'Fair' },
    { id: 'WP-004', name: 'Husqvarna K770 Cut-Off Saw', status: 'checked_out', holder: 'Sarah (Utility)', condition: 'Good' },
    { id: 'WP-005', name: 'Spectra GL422 Grade Laser', status: 'available', condition: 'Excellent' },
    { id: 'WP-006', name: 'Aluminum Trench Box (8x8)', status: 'available', condition: 'Good' },
    { id: 'WP-007', name: 'Honda EU3000 Generator', status: 'checked_out', holder: 'Davon (Concrete)', condition: 'Fair' },
    { id: 'WP-008', name: 'Werner 12ft Fiberglass Ladder', status: 'available', condition: 'Good' }
];

// Initialize demo data
function initDemoData() {
    allTools = DEMO_TOOLS.map(tool => ({ ...tool }));
    myTools = [];
}

// Toast Notification
function showToast(message, type = 'error') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Screen navigation
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

function showLogin() {
    const errorEl = document.getElementById('login-error');
    if (errorEl) {
        errorEl.textContent = '';
    }
    showScreen('login-screen');
}

// Login Handler
function handleLogin() {
    const pinInput = document.getElementById('crewPin');
    const pin = pinInput.value.trim();

    if (!pin) {
        showToast('Please enter a Crew ID', 'error');
        return;
    }

    // Demo: Accept any PIN, but '1234' is the main one
    if (pin === PASSWORD || pin.length > 0) {
        currentUser = { login_id: pin, name: pin };
        document.getElementById('crewNameDisplay').textContent = pin;
        
        // Initialize demo data
        initDemoData();
        
        // Load all tools
        loadAllTools();
        
        showToast('Login successful!', 'success');
        setTimeout(() => {
            showScreen('dashboardScreen');
            pinInput.value = '';
            
            // Ensure scan tab is active
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            document.querySelector('[data-tab="scan"]').classList.add('active');
            document.getElementById('scanTab').classList.add('active');
        }, 500);
    } else {
        showToast('Invalid Crew ID. Please try again.', 'error');
    }
}

// Scan Tool Handler
function handleScanTool(toolIdFromInput = null) {
    const toolInput = document.getElementById('toolScanInput');
    const toolId = toolIdFromInput || toolInput.value.trim();

    if (!toolId) {
        showToast('Please enter a Tool ID', 'error');
        return;
    }

    const resultDiv = document.getElementById('toolResult');
    resultDiv.innerHTML = '<div class="loading">Scanning tool...</div>';

    // Simulate API delay
    setTimeout(() => {
        const tool = allTools.find(t => t.id.toLowerCase() === toolId.toLowerCase());
        
        if (tool) {
            const status = tool.status || '';
            const isAvailable = status === 'available' || !tool.holder;
            const isCheckedOut = status === 'checked_out' && tool.holder === currentUser.login_id;
            
            resultDiv.innerHTML = `
                <div class="tool-card">
                    <div class="tool-image-container">
                        <div class="tool-image-placeholder">No Image</div>
                    </div>
                    <div class="tool-info">
                        <h3 class="tool-name">${tool.name || 'Unknown Tool'}</h3>
                        <p style="color: var(--slate-400); margin: 0.5rem 0;">ID: ${tool.id || 'N/A'}</p>
                        <div class="tool-status ${isAvailable ? 'in_shop' : 'checked_out'}">
                            ${isAvailable ? 'Available' : `Checked Out by ${tool.holder || 'Unknown'}`}
                        </div>
                    </div>
                    <div class="tool-actions">
                        ${isAvailable ? 
                            `<button class="btn-action checkout" onclick="handleCheckout('${tool.id}')">
                                CHECK OUT
                            </button>` :
                            isCheckedOut ?
                            `<button class="btn-action checkin" onclick="handleCheckin('${tool.id}')">
                                CHECK IN
                            </button>` :
                            ''
                        }
                        <button class="btn-action report" onclick="reportIssue('${tool.id}')">
                            REPORT ISSUE
                        </button>
                    </div>
                </div>
            `;
            toolInput.value = '';
        } else {
            resultDiv.innerHTML = '<div class="error-message">Tool not found</div>';
        }
    }, 500);
}

// Checkout Handler
function handleCheckout(toolId) {
    const tool = allTools.find(t => t.id === toolId);
    if (!tool) return;

    tool.status = 'checked_out';
    tool.holder = currentUser.login_id;
    
    // Add to my tools if not already there
    if (!myTools.find(t => t.id === toolId)) {
        myTools.push({ ...tool });
    }
    
    showToast('Tool checked out successfully', 'success');
    
    // Refresh the tool display
    setTimeout(() => handleScanTool(toolId), 500);
    
    // Refresh my tools if that tab is active
    if (document.getElementById('mytoolsTab').classList.contains('active')) {
        loadMyTools();
    }
}

// Checkin Handler
function handleCheckin(toolId) {
    const tool = allTools.find(t => t.id === toolId);
    if (!tool) return;

    tool.status = 'available';
    tool.holder = null;
    
    // Remove from my tools
    myTools = myTools.filter(t => t.id !== toolId);
    
    showToast('Tool checked in successfully', 'success');
    
    // Refresh the tool display
    setTimeout(() => handleScanTool(toolId), 500);
    
    // Refresh my tools if that tab is active
    if (document.getElementById('mytoolsTab').classList.contains('active')) {
        loadMyTools();
    }
}

// Report Issue
function reportIssue(toolId) {
    showToast('Issue reported. Thank you for your feedback.', 'success');
}

// Load All Tools (for search catalog)
function loadAllTools() {
    // Tools are already loaded in allTools
    // If search tab is active, render them
    if (document.getElementById('searchTab').classList.contains('active')) {
        handleSearch();
    }
}

// Render Catalog (shows all tools or filtered list)
function renderCatalog(tools) {
    const resultsDiv = document.getElementById('searchResults');
    if (!resultsDiv) return;
    
    const count = tools.length;
    const countText = count === 1 ? 'Showing 1 Tool' : `Showing ${count} Tools`;
    
    if (tools.length === 0) {
        resultsDiv.innerHTML = '<div class="empty-state">No tools found</div>';
        return;
    }
    
    const cardsHtml = tools.map(tool => {
        const isAvailable = tool.status === 'available' || !tool.holder;
        const statusBadge = isAvailable 
            ? '<span class="status-badge status-in-shop">IN SHOP</span>'
            : `<span class="status-badge status-checked-out">WITH ${(tool.holder || 'UNKNOWN').toUpperCase()}</span>`;
        
        return `
            <div class="catalog-card" onclick="openToolDetail('${tool.id}')">
                <div class="catalog-card-image">
                    <div class="catalog-image-placeholder">No Image</div>
                </div>
                <div class="catalog-card-info">
                    <h3 class="catalog-card-name">${tool.name || 'Unknown Tool'}</h3>
                    <p class="catalog-card-id">ID: ${tool.id || 'N/A'}</p>
                </div>
                <div class="catalog-card-status">
                    ${statusBadge}
                </div>
            </div>
        `;
    }).join('');
    
    resultsDiv.innerHTML = `
        <div class="catalog-count">${countText}</div>
        <div class="catalog-cards-grid">
            ${cardsHtml}
        </div>
    `;
}

// Search Handler (instant filtering)
function handleSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : '';
    
    let filteredTools = [...allTools];
    
    if (searchTerm) {
        filteredTools = filteredTools.filter(tool => {
            const toolName = (tool.name || '').toLowerCase();
            const toolId = (tool.id || '').toLowerCase();
            return toolName.includes(searchTerm) || toolId.includes(searchTerm);
        });
    }
    
    renderCatalog(filteredTools);
}

// Open Tool Detail (from catalog)
function openToolDetail(toolId) {
    const tool = allTools.find(t => t.id === toolId);
    if (!tool) return;
    
    // Switch to scan tab and show the tool
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.querySelector('[data-tab="scan"]').classList.add('active');
    document.getElementById('scanTab').classList.add('active');
    
    // Set the input and scan
    document.getElementById('toolScanInput').value = toolId;
    handleScanTool(toolId);
}

// Load My Tools
function loadMyTools() {
    const toolsList = document.getElementById('toolsList');
    if (!toolsList) return;
    
    // Filter tools checked out by current user
    const userTools = allTools.filter(tool => 
        tool.holder === currentUser.login_id && tool.status === 'checked_out'
    );
    
    if (userTools.length === 0) {
        toolsList.innerHTML = '<div class="empty-state">No tools checked out</div>';
        return;
    }
    
    toolsList.innerHTML = userTools.map(tool => {
        return `
            <div class="tool-item">
                <div class="tool-item-image">
                    <div class="tool-item-placeholder">No Image</div>
                </div>
                <div class="tool-item-info">
                    <h4>${tool.name || 'Unknown Tool'}</h4>
                    <p>ID: ${tool.id || 'N/A'}</p>
                    <span class="tool-item-status checked_out">Checked Out</span>
                </div>
                <div class="tool-actions">
                    <button class="btn-action checkin" onclick="handleCheckin('${tool.id}')">
                        CHECK IN
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Logout Handler
function handleLogout() {
    currentUser = null;
    showScreen('landing-screen');
    document.getElementById('toolResult').innerHTML = '';
    document.getElementById('toolsList').innerHTML = '';
    document.getElementById('toolScanInput').value = '';
    document.getElementById('searchInput').value = '';
}

// Tab Navigation
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            
            // Update active tab button
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update active tab content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            if (tab === 'mytools') {
                document.getElementById('mytoolsTab').classList.add('active');
                loadMyTools();
            } else if (tab === 'search') {
                document.getElementById('searchTab').classList.add('active');
                handleSearch();
            } else {
                document.getElementById('scanTab').classList.add('active');
            }
        });
    });
    
    // Event Listeners
    document.getElementById('loginBtn').addEventListener('click', handleLogin);
    document.getElementById('crewPin').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });
    
    document.getElementById('scanBtn').addEventListener('click', () => handleScanTool());
    document.getElementById('toolScanInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleScanTool();
    });
    
    document.getElementById('refreshToolsBtn').addEventListener('click', loadMyTools);
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
    
    // Make functions globally available
    window.handleCheckout = handleCheckout;
    window.handleCheckin = handleCheckin;
    window.openToolDetail = openToolDetail;
    window.reportIssue = reportIssue;
    
    // Initialize demo data
    initDemoData();
});
