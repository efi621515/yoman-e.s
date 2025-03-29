// Global tools array
tools = JSON.parse(localStorage.getItem('tools')) || [];

// Check if localStorage is available
function checkToolsStorage() {
    try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return true;
    } catch (e) {
        return false;
    }
}

// Load tools on page load
function loadTools() {
    console.log('Loading tools...');
    console.log('Current tools:', tools);
    displayTools();
    populateToolsDropdowns();
    updateMaintenanceAlerts();
}

// Save tool
function saveTool() {
    console.log('Saving tool...');
    
    if (!checkToolsStorage()) {
        alert('שגיאה: לא ניתן לגשת ל-localStorage. וודא שהדפדפן תומך בו ושהוא מופעל.');
        return;
    }
    
    const toolId = document.getElementById('tool-id').value;
    const toolName = document.getElementById('tool-name').value;
    const toolType = document.getElementById('tool-type').value;
    const toolSerialNumber = document.getElementById('tool-serial-number').value;
    const toolPurchaseDate = document.getElementById('tool-purchase-date').value;
    const toolPurchasePrice = document.getElementById('tool-purchase-price').value;
    const toolStatus = document.getElementById('tool-status').value;
    const toolLocation = document.getElementById('tool-location').value;
    const toolNextMaintenance = document.getElementById('tool-next-maintenance').value;
    const toolNotes = document.getElementById('tool-notes').value;
    
    // New insurance fields
    const toolInsuranceNumber = document.getElementById('tool-insurance-number').value;
    const toolInsuranceCompany = document.getElementById('tool-insurance-company').value;
    const toolInsuranceExpiry = document.getElementById('tool-insurance-expiry').value;
    
    console.log('Tool data:', { toolId, toolName, toolType, toolStatus });
    
    if (!toolName) {
        alert('נא להזין שם כלי עבודה');
        return;
    }
    
    // Handle insurance document upload
    const insuranceFileInput = document.getElementById('tool-insurance-file');
    let insuranceFile = null;
    if (toolId && tools.find(tool => tool.id === toolId)?.insuranceFile) {
        // Keep existing file if editing
        insuranceFile = tools.find(tool => tool.id === toolId).insuranceFile;
    }
    
    // Handle license document upload
    const licenseFileInput = document.getElementById('tool-license-file');
    let licenseFile = null;
    if (toolId && tools.find(tool => tool.id === toolId)?.licenseFile) {
        // Keep existing file if editing
        licenseFile = tools.find(tool => tool.id === toolId).licenseFile;
    }
    
    // Process uploads
    if (insuranceFileInput.files && insuranceFileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            insuranceFile = {
                name: insuranceFileInput.files[0].name,
                type: insuranceFileInput.files[0].type,
                data: e.target.result
            };
            
            // Check for license file too
            if (licenseFileInput.files && licenseFileInput.files[0]) {
                const licenseReader = new FileReader();
                licenseReader.onload = function(e) {
                    licenseFile = {
                        name: licenseFileInput.files[0].name,
                        type: licenseFileInput.files[0].type,
                        data: e.target.result
                    };
                    
                    saveToolData(toolId, toolName, toolType, toolSerialNumber, toolPurchaseDate, 
                                toolPurchasePrice, toolStatus, toolLocation, toolNextMaintenance, toolNotes,
                                toolInsuranceNumber, toolInsuranceCompany, toolInsuranceExpiry,
                                insuranceFile, licenseFile);
                };
                licenseReader.readAsDataURL(licenseFileInput.files[0]);
            } else {
                saveToolData(toolId, toolName, toolType, toolSerialNumber, toolPurchaseDate, 
                            toolPurchasePrice, toolStatus, toolLocation, toolNextMaintenance, toolNotes,
                            toolInsuranceNumber, toolInsuranceCompany, toolInsuranceExpiry,
                            insuranceFile, licenseFile);
            }
        };
        reader.readAsDataURL(insuranceFileInput.files[0]);
    } else if (licenseFileInput.files && licenseFileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            licenseFile = {
                name: licenseFileInput.files[0].name,
                type: licenseFileInput.files[0].type,
                data: e.target.result
            };
            
            saveToolData(toolId, toolName, toolType, toolSerialNumber, toolPurchaseDate, 
                        toolPurchasePrice, toolStatus, toolLocation, toolNextMaintenance, toolNotes,
                        toolInsuranceNumber, toolInsuranceCompany, toolInsuranceExpiry,
                        insuranceFile, licenseFile);
        };
        reader.readAsDataURL(licenseFileInput.files[0]);
    } else {
        saveToolData(toolId, toolName, toolType, toolSerialNumber, toolPurchaseDate, 
                    toolPurchasePrice, toolStatus, toolLocation, toolNextMaintenance, toolNotes,
                    toolInsuranceNumber, toolInsuranceCompany, toolInsuranceExpiry,
                    insuranceFile, licenseFile);
    }
}

// Helper function to actually save tool data once files are processed
function saveToolData(toolId, toolName, toolType, toolSerialNumber, toolPurchaseDate, 
                    toolPurchasePrice, toolStatus, toolLocation, toolNextMaintenance, toolNotes,
                    toolInsuranceNumber, toolInsuranceCompany, toolInsuranceExpiry,
                    insuranceFile, licenseFile) {
    // Check if editing existing tool or adding new one
    if (toolId) {
        // Editing existing tool
        const index = tools.findIndex(tool => tool.id === toolId);
        if (index !== -1) {
            // Keep maintenance history when updating
            const maintenanceHistory = tools[index].maintenanceHistory || [];
            
            tools[index] = {
                id: toolId,
                name: toolName,
                type: toolType,
                serialNumber: toolSerialNumber,
                purchaseDate: toolPurchaseDate,
                purchasePrice: toolPurchasePrice,
                status: toolStatus,
                location: toolLocation,
                nextMaintenance: toolNextMaintenance,
                notes: toolNotes,
                // New insurance fields
                insuranceNumber: toolInsuranceNumber,
                insuranceCompany: toolInsuranceCompany,
                insuranceExpiry: toolInsuranceExpiry,
                insuranceFile: insuranceFile,
                licenseFile: licenseFile,
                maintenanceHistory: maintenanceHistory,
                createdAt: tools[index].createdAt,
                updatedAt: new Date().toISOString()
            };
        }
    } else {
        // Adding new tool
        const newTool = {
            id: Date.now().toString(),
            name: toolName,
            type: toolType,
            serialNumber: toolSerialNumber,
            purchaseDate: toolPurchaseDate,
            purchasePrice: toolPurchasePrice,
            status: toolStatus,
            location: toolLocation,
            nextMaintenance: toolNextMaintenance,
            notes: toolNotes,
            // New insurance fields
            insuranceNumber: toolInsuranceNumber,
            insuranceCompany: toolInsuranceCompany,
            insuranceExpiry: toolInsuranceExpiry,
            insuranceFile: insuranceFile,
            licenseFile: licenseFile,
            maintenanceHistory: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        tools.push(newTool);
    }
    
    // Save to localStorage
    try {
        localStorage.setItem('tools', JSON.stringify(tools));
        console.log('Tools saved successfully');
        
        // Clear form
        clearToolForm();
        
        // Update display
        displayTools();
        populateToolsDropdowns();
        updateMaintenanceAlerts();
        
        alert('כלי העבודה נשמר בהצלחה');
    } catch (e) {
        console.error('Error saving tool:', e);
        alert('שגיאה בשמירת כלי העבודה: ' + e.message);
    }
}

// Display tools in table
function displayTools(toolsToDisplay = null) {
    const tableBody = document.getElementById('tools-body');
    if (!tableBody) {
        console.error('tools-body element not found');
        return;
    }
    
    tableBody.innerHTML = '';
    
    // Use filtered tools if provided, otherwise use all tools
    const displayTools = toolsToDisplay || tools;
    
    // Sort tools alphabetically by name
    const sortedTools = [...displayTools].sort((a, b) => a.name.localeCompare(b.name));
    
    if (sortedTools.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="7" class="text-center">לא נמצאו כלי עבודה</td>`;
        tableBody.appendChild(row);
        return;
    }
    
    sortedTools.forEach(tool => {
        const row = document.createElement('tr');
        
        // Add status class to row
        if (tool.status === 'בתחזוקה') {
            row.classList.add('maintenance-row');
        } else if (tool.status === 'לא זמין') {
            row.classList.add('unavailable-row');
        } else if (tool.status === 'בשימוש') {
            row.classList.add('in-use-row');
        }
        
        // Format dates
        const purchaseDateFormatted = tool.purchaseDate ? formatDate(tool.purchaseDate) : '-';
        const nextMaintenanceDateFormatted = tool.nextMaintenance ? formatDate(tool.nextMaintenance) : '-';
        
        // Check if maintenance is due soon (within 30 days)
        let maintenanceStatus = '';
        if (tool.nextMaintenance) {
            const today = new Date();
            const maintenanceDate = new Date(tool.nextMaintenance);
            const daysDiff = Math.floor((maintenanceDate - today) / (1000 * 60 * 60 * 24));
            
            if (daysDiff < 0) {
                maintenanceStatus = '<span class="maintenance-overdue">פג תוקף</span>';
            } else if (daysDiff < 30) {
                maintenanceStatus = `<span class="maintenance-soon">בקרוב (${daysDiff} ימים)</span>`;
            }
        }
        
        row.innerHTML = `
            <td>${tool.name}</td>
            <td>${tool.type || '-'}</td>
            <td>${tool.status}</td>
            <td>${tool.location || '-'}</td>
            <td>${purchaseDateFormatted}</td>
            <td>${nextMaintenanceDateFormatted} ${maintenanceStatus}</td>
            <td class="actions">
                <button class="edit-btn" onclick="editTool('${tool.id}')">ערוך</button>
                <button class="delete-btn" onclick="deleteTool('${tool.id}')">מחק</button>
                <button class="info-btn" onclick="showToolDetails('${tool.id}')">פרטים</button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Update maintenance alerts counter
    updateMaintenanceAlerts();
}

// Filter tools based on status
function filterTools() {
    const filterValue = document.getElementById('tool-filter').value;
    const searchText = document.getElementById('search-tool-text').value.toLowerCase();
    
    let filteredTools = tools || []; // Ensure filteredTools is an array
    
    // Filter by status if not "all"
    if (filterValue !== 'all') {
        filteredTools = filteredTools.filter(tool => tool.status === filterValue);
    }
    
    // Filter by search text if present
    if (searchText) {
        filteredTools = filteredTools.filter(tool => 
            tool.name.toLowerCase().includes(searchText) ||
            (tool.type && tool.type.toLowerCase().includes(searchText)) ||
            (tool.location && tool.location.toLowerCase().includes(searchText)) ||
            (tool.serialNumber && tool.serialNumber.toLowerCase().includes(searchText))
        );
    }
    
    displayTools(filteredTools);
}

// Search tools based on text input
function searchTools() {
    const searchText = document.getElementById('search-tool-text').value.toLowerCase();
    const filterValue = document.getElementById('tool-filter').value;
    
    let filteredTools = tools || []; // Ensure filteredTools is an array
    
    // Filter by status if not "all"
    if (filterValue !== 'all') {
        filteredTools = filteredTools.filter(tool => tool.status === filterValue);
    }
    
    // Filter by search text
    if (searchText) {
        filteredTools = filteredTools.filter(tool => 
            tool.name.toLowerCase().includes(searchText) ||
            (tool.type && tool.type.toLowerCase().includes(searchText)) ||
            (tool.location && tool.location.toLowerCase().includes(searchText)) ||
            (tool.serialNumber && tool.serialNumber.toLowerCase().includes(searchText))
        );
    } else if (!filterValue || filterValue === 'all') {
        // If no filters applied, show all tools
        displayTools();
        return;
    }
    
    displayTools(filteredTools);
}

// Clear tool form
function clearToolForm() {
    document.getElementById('tool-id').value = '';
    document.getElementById('tool-name').value = '';
    document.getElementById('tool-type').value = '';
    document.getElementById('tool-serial-number').value = '';
    document.getElementById('tool-purchase-date').value = '';
    document.getElementById('tool-purchase-price').value = '';
    document.getElementById('tool-status').value = 'זמין';
    document.getElementById('tool-location').value = '';
    document.getElementById('tool-next-maintenance').value = '';
    document.getElementById('tool-notes').value = '';
    
    // New insurance fields
    document.getElementById('tool-insurance-number').value = '';
    document.getElementById('tool-insurance-company').value = '';
    document.getElementById('tool-insurance-expiry').value = '';
    document.getElementById('tool-insurance-file').value = '';
    document.getElementById('tool-license-file').value = '';
    
    // Reset file indicators
    const insuranceFileIndicator = document.getElementById('insurance-file-indicator');
    const licenseFileIndicator = document.getElementById('license-file-indicator');
    
    if (insuranceFileIndicator) insuranceFileIndicator.textContent = 'אין קובץ';
    if (licenseFileIndicator) licenseFileIndicator.textContent = 'אין קובץ';
    
    // Reset button text
    document.getElementById('save-tool-btn').textContent = 'שמור כלי עבודה';
}

// Edit tool
function editTool(id) {
    const tool = tools.find(tool => tool.id === id);
    
    if (tool) {
        document.getElementById('tool-id').value = tool.id;
        document.getElementById('tool-name').value = tool.name;
        document.getElementById('tool-type').value = tool.type || '';
        document.getElementById('tool-serial-number').value = tool.serialNumber || '';
        document.getElementById('tool-purchase-date').value = tool.purchaseDate || '';
        document.getElementById('tool-purchase-price').value = tool.purchasePrice || '';
        document.getElementById('tool-status').value = tool.status;
        document.getElementById('tool-location').value = tool.location || '';
        document.getElementById('tool-next-maintenance').value = tool.nextMaintenance || '';
        document.getElementById('tool-notes').value = tool.notes || '';
        
        // New insurance fields
        document.getElementById('tool-insurance-number').value = tool.insuranceNumber || '';
        document.getElementById('tool-insurance-company').value = tool.insuranceCompany || '';
        document.getElementById('tool-insurance-expiry').value = tool.insuranceExpiry || '';
        
        // Update file indicators
        const insuranceFileIndicator = document.getElementById('insurance-file-indicator');
        const licenseFileIndicator = document.getElementById('license-file-indicator');
        
        if (insuranceFileIndicator) {
            insuranceFileIndicator.textContent = tool.insuranceFile ? 'קובץ קיים: ' + tool.insuranceFile.name : 'אין קובץ';
        }
        
        if (licenseFileIndicator) {
            licenseFileIndicator.textContent = tool.licenseFile ? 'קובץ קיים: ' + tool.licenseFile.name : 'אין קובץ';
        }
        
        // Change button text
        document.getElementById('save-tool-btn').textContent = 'עדכן כלי עבודה';
        
        // Scroll to form
        document.getElementById('tool-form').scrollIntoView();
    }
}

// Delete tool
function deleteTool(id) {
    const tool = tools.find(tool => tool.id === id);
    
    if (!tool) {
        alert('כלי העבודה לא נמצא');
        return;
    }
    
    // Check if tool is in use in work logs
    const workLogsWithTool = workLogs.filter(log => 
        log.tools && log.tools.toLowerCase().includes(tool.name.toLowerCase())
    );
    
    if (workLogsWithTool.length > 0) {
        const message = `לא ניתן למחוק את כלי העבודה מכיוון שהוא משויך ל-${workLogsWithTool.length} רישומי עבודה.`;
        alert(message);
        return;
    }
    
    if (confirm(`האם אתה בטוח שברצונך למחוק את כלי העבודה "${tool.name}"?`)) {
        tools = tools.filter(tool => tool.id !== id);
        localStorage.setItem('tools', JSON.stringify(tools));
        
        displayTools();
        populateToolsDropdowns();
        
        alert('כלי העבודה נמחק בהצלחה');
    }
}

// Show tool details with history
function showToolDetails(id) {
    const tool = tools.find(tool => tool.id === id);
    
    if (!tool) {
        alert('כלי העבודה לא נמצא');
        return;
    }
    
    // Get tool usage in work logs
    const workLogsWithTool = workLogs.filter(log => 
        log.tools && log.tools.toLowerCase().includes(tool.name.toLowerCase())
    );
    
    // Count usage days and revenue
    let totalUsageDays = workLogsWithTool.length;
    let totalRevenue = 0;
    workLogsWithTool.forEach(log => {
        totalRevenue += parseFloat(log.dailyPrice) || 0;
    });
    
    // Show tool details modal
    const toolDetailsContainer = document.getElementById('tool-details');
    const toolDetailsContent = document.getElementById('tool-details-content');
    
    if (!toolDetailsContainer || !toolDetailsContent) {
        console.error('tool-details or tool-details-content elements not found');
        return;
    }
    
    // Format dates
    const purchaseDateFormatted = tool.purchaseDate ? formatDate(tool.purchaseDate) : '-';
    const nextMaintenanceDateFormatted = tool.nextMaintenance ? formatDate(tool.nextMaintenance) : '-';
    const createdAtDate = new Date(tool.createdAt);
    const formattedCreatedAt = `${createdAtDate.getDate()}/${createdAtDate.getMonth() + 1}/${createdAtDate.getFullYear()}`;
    
    // Calculate tool age
    let toolAge = '-';
    if (tool.purchaseDate) {
        const today = new Date();
        const purchaseDate = new Date(tool.purchaseDate);
        const monthsDiff = (today.getFullYear() - purchaseDate.getFullYear()) * 12 + today.getMonth() - purchaseDate.getMonth();
        const yearsDiff = Math.floor(monthsDiff / 12);
        const remainingMonths = monthsDiff % 12;
        
        if (yearsDiff > 0) {
            toolAge = `${yearsDiff} שנים ו-${remainingMonths} חודשים`;
        } else {
            toolAge = `${monthsDiff} חודשים`;
        }
    }
    
    // Calculate days until insurance expiry
    let insuranceStatus = '-';
    if (tool.insuranceExpiry) {
        const today = new Date();
        const expiryDate = new Date(tool.insuranceExpiry);
        const daysDiff = Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24));
        
        if (daysDiff < 0) {
            insuranceStatus = `<span class="maintenance-overdue">פג תוקף (${Math.abs(daysDiff)} ימים)</span>`;
        }
        else if (daysDiff < 30) {
            insuranceStatus = `<span class="maintenance-soon">בקרוב (${daysDiff} ימים)</span>`;
        } else {
            insuranceStatus = `בעוד ${daysDiff} ימים`;
        }
    }
    
    // Calculate days until next maintenance
    let maintenanceStatus = '-';
    if (tool.nextMaintenance) {
        const today = new Date();
        const maintenanceDate = new Date(tool.nextMaintenance);
        const daysDiff = Math.floor((maintenanceDate - today) / (1000 * 60 * 60 * 24));
        
        if (daysDiff < 0) {
            maintenanceStatus = `<span class="maintenance-overdue">פג תוקף (${Math.abs(daysDiff)} ימים)</span>`;
        }
        else if (daysDiff < 30) {
            maintenanceStatus = `<span class="maintenance-soon">בקרוב (${daysDiff} ימים)</span>`;
        } else {
            maintenanceStatus = `בעוד ${daysDiff} ימים`;
        }
    }
    
    // Add insurance information to tool info
    const insuranceExpiryFormatted = tool.insuranceExpiry ? formatDate(tool.insuranceExpiry) : '-';
    
    // Generate HTML for tool details
    let detailsHTML = `
        <div class="tool-profile">
            <h3>פרטי כלי עבודה: ${tool.name}</h3>
            <div class="tool-info">
                <div class="info-group">
                    <label>סוג:</label>
                    <div>${tool.type || '-'}</div>
                </div>
                <div class="info-group">
                    <label>מספר סידורי:</label>
                    <div>${tool.serialNumber || '-'}</div>
                </div>
                <div class="info-group">
                    <label>סטטוס:</label>
                    <div>${tool.status}</div>
                </div>
                <div class="info-group">
                    <label>מיקום נוכחי:</label>
                    <div>${tool.location || '-'}</div>
                </div>
                <div class="info-group">
                    <label>תאריך רכישה:</label>
                    <div>${purchaseDateFormatted}</div>
                </div>
                <div class="info-group">
                    <label>גיל הכלי:</label>
                    <div>${toolAge}</div>
                </div>
                <div class="info-group">
                    <label>מחיר רכישה:</label>
                    <div>${tool.purchasePrice ? '₪' + tool.purchasePrice : '-'}</div>
                </div>
                <div class="info-group">
                    <label>טיפול הבא:</label>
                    <div>${nextMaintenanceDateFormatted}</div>
                </div>
                <div class="info-group">
                    <label>הזמן לטיפול:</label>
                    <div>${maintenanceStatus}</div>
                </div>
                <div class="info-group">
                    <label>מספר ביטוח:</label>
                    <div>${tool.insuranceNumber || '-'}</div>
                </div>
                <div class="info-group">
                    <label>חברת ביטוח:</label>
                    <div>${tool.insuranceCompany || '-'}</div>
                </div>
                <div class="info-group">
                    <label>תוקף ביטוח:</label>
                    <div>${insuranceExpiryFormatted}</div>
                </div>
                <div class="info-group">
                    <label>זמן לפקיעת ביטוח:</label>
                    <div>${insuranceStatus}</div>
                </div>
                <div class="info-group">
                    <label>הערות:</label>
                    <div>${tool.notes || '-'}</div>
                </div>
            </div>
        </div>
        
        <!-- Add document viewers if available -->
        ${tool.insuranceFile || tool.licenseFile ? `<div class="tool-documents">
            ${tool.insuranceFile ? `
                <div class="document-section">
                    <h4>מסמך ביטוח</h4>
                    <div class="document-preview">
                        ${tool.insuranceFile.type.startsWith('image/') 
                          ? `<img src="${tool.insuranceFile.data}" alt="ביטוח" class="document-image">` 
                          : `<a href="${tool.insuranceFile.data}" download="${tool.insuranceFile.name}" class="document-link">הורד מסמך ביטוח</a>`}
                    </div>
                </div>
            ` : ''}
            
            ${tool.licenseFile ? `
                <div class="document-section">
                    <h4>רשיון</h4>
                    <div class="document-preview">
                        ${tool.licenseFile.type.startsWith('image/') 
                          ? `<img src="${tool.licenseFile.data}" alt="רשיון" class="document-image">` 
                          : `<a href="${tool.licenseFile.data}" download="${tool.licenseFile.name}" class="document-link">הורד מסמך רשיון</a>`}
                    </div>
                </div>
            ` : ''}
        </div>` : ''}
    `;
    
    // Add maintenance history
    if (tool.maintenanceHistory && tool.maintenanceHistory.length > 0) {
        // Sort by date (newest first)
        const sortedHistory = [...tool.maintenanceHistory].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        detailsHTML += `
            <div class="tool-maintenance-history">
                <h4>היסטוריית טיפולים</h4>
                <table class="details-table">
                    <thead>
                        <tr>
                            <th>תאריך</th>
                            <th>סוג טיפול</th>
                            <th>מבצע</th>
                            <th>עלות</th>
                            <th>הערות</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        sortedHistory.forEach(maintenance => {
            const formattedDate = formatDate(maintenance.date);
            
            detailsHTML += `
                <tr>
                    <td>${formattedDate}</td>
                    <td>${maintenance.type}</td>
                    <td>${maintenance.performer || '-'}</td>
                    <td>₪${maintenance.cost || '0'}</td>
                    <td>${maintenance.notes || '-'}</td>
                </tr>
            `;
        });
        
        detailsHTML += `
                    </tbody>
                </table>
            </div>
        `;
    }
    
    // Add recent usage
    if (workLogsWithTool.length > 0) {
        // Sort by date (newest first)
        const sortedLogs = [...workLogsWithTool].sort((a, b) => new Date(b.date) - new Date(a.date));
        const recentLogs = sortedLogs.slice(0, 5); // Show only 5 most recent
        
        detailsHTML += `
            <div class="tool-recent-usage">
                <h4>שימוש אחרון</h4>
                <table class="details-table">
                    <thead>
                        <tr>
                            <th>תאריך</th>
                            <th>לקוח</th>
                            <th>מקום עבודה</th>
                            <th>מחיר ליום</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        recentLogs.forEach(log => {
            const formattedDate = formatDate(log.date);
            
            detailsHTML += `
                <tr>
                    <td>${formattedDate}</td>
                    <td>${log.client}</td>
                    <td>${log.location || '-'}</td>
                    <td>₪${log.dailyPrice || '0'}</td>
                </tr>
            `;
        });
        
        detailsHTML += `
                    </tbody>
                </table>
                ${workLogsWithTool.length > 5 ? `<div class="see-more-link"><a href="#" onclick="generateToolUsageReport('${tool.id}'); return false;">צפה בכל ההיסטוריה</a></div>` : ''}
            </div>
        `;
    }
    
    // Maintenance actions section
    detailsHTML += `
        <div class="maintenance-actions">
            <h4>פעולות תחזוקה</h4>
            <div class="maintenance-form">
                <div class="form-group">
                    <label for="maintenance-date">תאריך טיפול:</label>
                    <input type="date" id="maintenance-date" value="${new Date().toISOString().split('T')[0]}">
                </div>
                <div class="form-group">
                    <label for="maintenance-type">סוג טיפול:</label>
                    <select id="maintenance-type">
                        <option value="טיפול תקופתי">טיפול תקופתי</option>
                        <option value="תיקון">תיקון</option>
                        <option value="החלפת חלק">החלפת חלק</option>
                        <option value="כיול">כיול</option>
                        <option value="אחר">אחר</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="maintenance-performer">מבצע הטיפול:</label>
                    <input type="text" id="maintenance-performer">
                </div>
                <div class="form-group">
                    <label for="maintenance-cost">עלות:</label>
                    <input type="number" id="maintenance-cost" min="0">
                </div>
                <div class="form-group">
                    <label for="maintenance-notes">הערות:</label>
                    <textarea id="maintenance-notes"></textarea>
                </div>
                <div class="form-group">
                    <label for="next-maintenance-date">תאריך טיפול הבא:</label>
                    <input type="date" id="next-maintenance-date" value="${tool.nextMaintenance || ''}">
                </div>
                <button onclick="addMaintenance('${tool.id}')">הוסף טיפול</button>
            </div>
        </div>
    `;
    
    // Update modal content and show it
    toolDetailsContent.innerHTML = detailsHTML;
    toolDetailsContainer.style.display = 'block';
}

// Close tool details modal
function closeToolDetails() {
    const toolDetailsContainer = document.getElementById('tool-details');
    if (toolDetailsContainer) {
        toolDetailsContainer.style.display = 'none';
    }
}

// Add maintenance record to tool
function addMaintenance(id) {
    const tool = tools.find(tool => tool.id === id);
    
    if (!tool) {
        alert('כלי העבודה לא נמצא');
        return;
    }
    
    const maintenanceDate = document.getElementById('maintenance-date').value;
    const maintenanceType = document.getElementById('maintenance-type').value;
    const maintenancePerformer = document.getElementById('maintenance-performer').value;
    const maintenanceCost = document.getElementById('maintenance-cost').value;
    const maintenanceNotes = document.getElementById('maintenance-notes').value;
    const nextMaintenanceDate = document.getElementById('next-maintenance-date').value;
    
    if (!maintenanceDate || !maintenanceType) {
        alert('נא למלא תאריך וסוג טיפול');
        return;
    }
    
    // Create maintenance record
    const maintenanceRecord = {
        id: Date.now().toString(),
        date: maintenanceDate,
        type: maintenanceType,
        performer: maintenancePerformer,
        cost: maintenanceCost,
        notes: maintenanceNotes
    };
    
    // Add to tool's maintenance history
    if (!tool.maintenanceHistory) {
        tool.maintenanceHistory = [];
    }
    
    tool.maintenanceHistory.push(maintenanceRecord);
    
    // Update next maintenance date
    if (nextMaintenanceDate) {
        tool.nextMaintenance = nextMaintenanceDate;
    }
    
    // Update tool status if needed
    if (tool.status === 'בתחזוקה') {
        tool.status = 'זמין';
    }
    
    // Save changes
    localStorage.setItem('tools', JSON.stringify(tools));
    
    // Update displays
    displayTools();
    updateMaintenanceAlerts();
    
    // Refresh tool details
    showToolDetails(id);
    
    alert('טיפול נרשם בהצלחה');
}

// Generate tool usage report
function generateToolUsageReport(toolId) {
    const tool = tools.find(tool => tool.id === toolId);
    
    if (!tool) return;
    
    // Close the modal
    closeToolDetails();
    
    // Navigate to reports tab
    showTab('reports');
    
    // Set report type to tools usage
    document.getElementById('report-type').value = 'tools-usage';
    
    // Set tool filter if available
    const toolFilterElement = document.getElementById('report-tool-filter');
    if (toolFilterElement) {
        toolFilterElement.value = tool.name;
    }
    
    // Generate report
    generateReport();
}

// Count tools that need maintenance soon
function updateMaintenanceAlerts() {
    // Count tools that need maintenance in the next 30 days
    const today = new Date();
    let count = 0;
    
    tools.forEach(tool => {
        if (tool.nextMaintenance) {
            const maintenanceDate = new Date(tool.nextMaintenance);
            const daysDiff = Math.floor((maintenanceDate - today) / (1000 * 60 * 60 * 24));
            
            if (daysDiff < 30) {
                count++;
            }
        }
    });
    
    // Update maintenance alerts badge
    const badge = document.getElementById('maintenance-alerts-badge');
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'inline-block' : 'none';
    }
    
    // Update maintenance tab title
    const maintenanceTitle = document.getElementById('maintenance-tab-title');
    if (maintenanceTitle && count > 0) {
        maintenanceTitle.innerHTML = `תחזוקה <span class="maintenance-count">(${count})</span>`;
    } else if (maintenanceTitle) {
        maintenanceTitle.innerHTML = 'תחזוקה';
    }
}

// Populate tool dropdowns in forms
function populateToolsDropdowns() {
    // Get all tool dropdown elements
    const toolDropdowns = document.querySelectorAll('.tool-dropdown');
    
    toolDropdowns.forEach(dropdown => {
        // Save current selection if exists
        const currentSelection = dropdown.value;
        
        // Clear existing options (except the empty default option)
        while (dropdown.options.length > 1) {
            dropdown.remove(1);
        }
        
        // Add available tools (only those with status 'זמין')
        const availableTools = tools.filter(tool => tool.status === 'זמין');
        const sortedTools = [...availableTools].sort((a, b) => a.name.localeCompare(b.name));
        
        sortedTools.forEach(tool => {
            const option = document.createElement('option');
            option.value = tool.name;
            option.textContent = tool.name;
            dropdown.appendChild(option);
        });
        
        // Restore previous selection if it exists
        if (currentSelection && dropdown.querySelector(`option[value="${currentSelection}"]`)) {
            dropdown.value = currentSelection;
        }
    });
}

// Initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing tools module');
    loadTools();
});