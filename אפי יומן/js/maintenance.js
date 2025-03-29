// Load maintenance data
function loadMaintenanceData() {
    displayUpcomingMaintenance();
    displayMaintenanceStats();
    populateToolFilters();
    displayMaintenanceHistory();
}

// Display upcoming maintenance tasks
function displayUpcomingMaintenance() {
    const upcomingMaintenanceContainer = document.getElementById('upcoming-maintenance');
    if (!upcomingMaintenanceContainer) return;
    
    upcomingMaintenanceContainer.innerHTML = '';
    
    // Get tools with upcoming maintenance
    const today = new Date();
    const upcomingTools = tools.filter(tool => {
        if (!tool.nextMaintenance) return false;
        
        const maintenanceDate = new Date(tool.nextMaintenance);
        const daysDiff = Math.floor((maintenanceDate - today) / (1000 * 60 * 60 * 24));
        
        return daysDiff < 60; // Show maintenance needed in the next 60 days
    });
    
    // Sort by date (soonest first)
    upcomingTools.sort((a, b) => {
        const dateA = new Date(a.nextMaintenance);
        const dateB = new Date(b.nextMaintenance);
        return dateA - dateB;
    });
    
    if (upcomingTools.length === 0) {
        upcomingMaintenanceContainer.innerHTML = '<p>אין טיפולים מתוכננים לתקופה הקרובה.</p>';
        return;
    }
    
    upcomingTools.forEach(tool => {
        const maintenanceDate = new Date(tool.nextMaintenance);
        const daysDiff = Math.floor((maintenanceDate - today) / (1000 * 60 * 60 * 24));
        
        let cardClass = 'maintenance-card';
        if (daysDiff < 0) {
            cardClass += ' maintenance-card-overdue';
        } else if (daysDiff < 30) {
            cardClass += ' maintenance-card-soon';
        }
        
        let daysMessage = '';
        if (daysDiff < 0) {
            daysMessage = `<span class="maintenance-overdue">פג תוקף לפני ${Math.abs(daysDiff)} ימים</span>`;
        } else if (daysDiff === 0) {
            daysMessage = '<span class="maintenance-soon">היום!</span>';
        } else if (daysDiff === 1) {
            daysMessage = '<span class="maintenance-soon">מחר!</span>';
        } else if (daysDiff < 30) {
            daysMessage = `<span class="maintenance-soon">בעוד ${daysDiff} ימים</span>`;
        } else {
            daysMessage = `בעוד ${daysDiff} ימים`;
        }
        
        const formattedDate = formatDate(tool.nextMaintenance);
        
        const card = document.createElement('div');
        card.className = cardClass;
        card.innerHTML = `
            <div class="maintenance-card-header">
                <div class="maintenance-card-title">${tool.name}</div>
                <div class="maintenance-card-date">${formattedDate} (${daysMessage})</div>
            </div>
            <div class="maintenance-card-details">
                <div class="maintenance-card-detail">
                    <div class="maintenance-card-detail-label">סטטוס:</div>
                    <div>${tool.status}</div>
                </div>
                <div class="maintenance-card-detail">
                    <div class="maintenance-card-detail-label">מיקום:</div>
                    <div>${tool.location || '-'}</div>
                </div>
                <div class="maintenance-card-detail">
                    <div class="maintenance-card-detail-label">סוג:</div>
                    <div>${tool.type || '-'}</div>
                </div>
            </div>
            <div class="maintenance-card-actions">
                <button class="info-btn" onclick="showToolDetails('${tool.id}')">פרטים</button>
                <button class="edit-btn" onclick="markToolForMaintenance('${tool.id}')">סמן לתחזוקה</button>
            </div>
        `;
        
        upcomingMaintenanceContainer.appendChild(card);
    });
}

// Mark tool for maintenance
function markToolForMaintenance(id) {
    const tool = tools.find(tool => tool.id === id);
    
    if (!tool) {
        alert('כלי העבודה לא נמצא');
        return;
    }
    
    // Update tool status to maintenance
    tool.status = 'בתחזוקה';
    
    // Save changes
    localStorage.setItem('tools', JSON.stringify(tools));
    
    // Update displays
    displayTools();
    displayUpcomingMaintenance();
    
    // Show tool details for maintenance
    showToolDetails(id);
    
    alert(`${tool.name} סומן לתחזוקה`);
}

// Display maintenance statistics
function displayMaintenanceStats() {
    const maintenanceStatsContainer = document.getElementById('maintenance-stats');
    if (!maintenanceStatsContainer) return;
    
    // Count maintenance by month (past 6 months)
    const monthlyMaintenanceCount = {};
    const today = new Date();
    
    // Initialize last 6 months
    for (let i = 0; i < 6; i++) {
        const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthKey = `${month.getMonth() + 1}/${month.getFullYear()}`;
        monthlyMaintenanceCount[monthKey] = 0;
    }
    
    // Count maintenance records for each month
    tools.forEach(tool => {
        if (!tool.maintenanceHistory) return;
        
        tool.maintenanceHistory.forEach(record => {
            const date = new Date(record.date);
            const monthKey = `${date.getMonth() + 1}/${date.getFullYear()}`;
            
            if (monthlyMaintenanceCount[monthKey] !== undefined) {
                monthlyMaintenanceCount[monthKey]++;
            }
        });
    });
    
    // Calculate most popular tools
    const toolUsage = {};
    workLogs.forEach(log => {
        if (!log.tools) return;
        
        // Split multiple tools
        const toolsList = log.tools.split(',').map(t => t.trim());
        toolsList.forEach(toolName => {
            if (!toolName) return;
            
            if (!toolUsage[toolName]) {
                toolUsage[toolName] = 0;
            }
            
            toolUsage[toolName]++;
        });
    });
    
    // Sort tools by usage
    const sortedTools = Object.keys(toolUsage).sort((a, b) => toolUsage[b] - toolUsage[a]);
    const topTools = sortedTools.slice(0, 5); // Get top 5
    
    // Create statistics display
    maintenanceStatsContainer.innerHTML = `
        <div class="maintenance-stats-section">
            <h4>תחזוקה לפי חודש</h4>
            <div class="maintenance-stats-container" id="monthly-maintenance-chart"></div>
        </div>
        
        <div class="maintenance-stats-section">
            <h4>כלי עבודה פופולריים</h4>
            <div class="usage-stats" id="popular-tools"></div>
        </div>
    `;
    
    // Render monthly maintenance chart
    const monthlyChart = document.getElementById('monthly-maintenance-chart');
    if (monthlyChart) {
        let chartHTML = '';
        
        // Get sorted months
        const sortedMonths = Object.keys(monthlyMaintenanceCount).sort((a, b) => {
            const [monthA, yearA] = a.split('/');
            const [monthB, yearB] = b.split('/');
            
            if (yearA !== yearB) {
                return yearA - yearB;
            }
            
            return monthA - monthB;
        });
        
        // Get max count for scaling
        const maxCount = Math.max(...Object.values(monthlyMaintenanceCount));
        const scaleFactor = maxCount === 0 ? 0 : 200 / maxCount; // Max height is 200px
        
        sortedMonths.forEach((month, index) => {
            const count = monthlyMaintenanceCount[month];
            const barHeight = count * scaleFactor;
            
            // Format month for display (short month name)
            const [monthNum, year] = month.split('/');
            const monthDate = new Date(year, monthNum - 1, 1);
            const monthName = monthDate.toLocaleString('he-IL', { month: 'short' });
            
            chartHTML += `
                <div class="maintenance-stats-bar" style="height: ${barHeight}px; left: ${index * 60 + 30}px;">
                    ${count}
                </div>
                <div class="maintenance-stats-label" style="left: ${index * 60 + 30}px;">
                    ${monthName}
                </div>
            `;
        });
        
        monthlyChart.innerHTML = chartHTML;
    }
    
    // Render popular tools
    const popularTools = document.getElementById('popular-tools');
    if (popularTools) {
        let toolsHTML = '';
        
        topTools.forEach(toolName => {
            toolsHTML += `
                <div class="usage-stat-item">
                    <span class="usage-stat-count">${toolUsage[toolName]}</span>
                    ${toolName}
                </div>
            `;
        });
        
        popularTools.innerHTML = toolsHTML || '<p>אין מספיק נתונים</p>';
    }
}

// Populate tool filters
function populateToolFilters() {
    // Get all tool filter dropdowns
    const toolFilters = document.querySelectorAll('.tool-filter-all');
    
    toolFilters.forEach(dropdown => {
        // Save current selection if exists
        const currentSelection = dropdown.value;
        
        // Clear existing options (except the empty default option or 'all' option)
        while (dropdown.options.length > 1) {
            dropdown.remove(1);
        }
        
        // Sort tools alphabetically by name
        const sortedTools = [...tools].sort((a, b) => a.name.localeCompare(b.name));
        
        // Add options for each tool
        sortedTools.forEach(tool => {
            const option = document.createElement('option');
            option.value = tool.id;
            option.textContent = tool.name;
            dropdown.appendChild(option);
        });
        
        // Restore previous selection if it exists
        if (currentSelection && dropdown.querySelector(`option[value="${currentSelection}"]`)) {
            dropdown.value = currentSelection;
        }
    });
}

// Display maintenance history
function displayMaintenanceHistory() {
    const tableBody = document.getElementById('maintenance-history-body');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    // Get filter values
    const toolId = document.getElementById('maintenance-filter').value;
    const dateFrom = document.getElementById('maintenance-date-from').value;
    const dateTo = document.getElementById('maintenance-date-to').value;
    
    // Collect all maintenance records
    let allRecords = [];
    
    tools.forEach(tool => {
        if (!tool.maintenanceHistory) return;
        
        tool.maintenanceHistory.forEach(record => {
            allRecords.push({
                ...record,
                toolId: tool.id,
                toolName: tool.name
            });
        });
    });
    
    // Apply filters
    if (toolId && toolId !== 'all') {
        allRecords = allRecords.filter(record => record.toolId === toolId);
    }
    
    if (dateFrom) {
        allRecords = allRecords.filter(record => record.date >= dateFrom);
    }
    
    if (dateTo) {
        allRecords = allRecords.filter(record => record.date <= dateTo);
    }
    
    // Sort by date (newest first)
    allRecords.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (allRecords.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="6" class="text-center">לא נמצאו רשומות תחזוקה</td>`;
        tableBody.appendChild(row);
        return;
    }
    
    allRecords.forEach(record => {
        const row = document.createElement('tr');
        
        const formattedDate = formatDate(record.date);
        
        row.innerHTML = `
            <td>${formattedDate}</td>
            <td>${record.toolName}</td>
            <td>${record.type}</td>
            <td>${record.performer || '-'}</td>
            <td>₪${record.cost || '0'}</td>
            <td>${record.notes || '-'}</td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Filter maintenance history
function filterMaintenanceHistory() {
    displayMaintenanceHistory();
}

// Initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing maintenance module');
    loadMaintenanceData();
});