// Global operators array
operators = JSON.parse(localStorage.getItem('operators')) || [];

// Check if localStorage is available
function checkOperatorsStorage() {
    try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return true;
    } catch (e) {
        return false;
    }
}

// Load operators on page load
function loadOperators() {
    console.log('Loading operators...');
    console.log('Current operators:', operators);
    displayOperators();
    populateOperatorDropdowns();
}

// Save operator
function saveOperator() {
    console.log('Saving operator...');
    
    if (!checkOperatorsStorage()) {
        alert('שגיאה: לא ניתן לגשת ל-localStorage. וודא שהדפדפן תומך בו ושהוא מופעל.');
        return;
    }
    
    const operatorId = document.getElementById('operator-id').value;
    const operatorName = document.getElementById('operator-name').value;
    const operatorPhone = document.getElementById('operator-phone').value;
    const operatorEmail = document.getElementById('operator-email').value;
    const operatorAddress = document.getElementById('operator-address').value;
    const operatorLicense = document.getElementById('operator-license').value;
    const operatorNotes = document.getElementById('operator-notes').value;
    
    if (!operatorName) {
        alert('נא להזין שם מפעיל');
        return;
    }
    
    // Handle ID document upload
    const idFileInput = document.getElementById('operator-id-file');
    let idFile = null;
    if (operatorId && operators.find(op => op.id === operatorId)?.idFile) {
        // Keep existing file if editing
        idFile = operators.find(op => op.id === operatorId).idFile;
    }
    
    if (idFileInput.files && idFileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            idFile = {
                name: idFileInput.files[0].name,
                type: idFileInput.files[0].type,
                data: e.target.result
            };
            
            saveOperatorData(operatorId, operatorName, operatorPhone, operatorEmail, 
                            operatorAddress, operatorLicense, operatorNotes, idFile, null);
        };
        reader.readAsDataURL(idFileInput.files[0]);
    } else {
        // Handle license document upload
        const licenseFileInput = document.getElementById('operator-license-file');
        let licenseFile = null;
        if (operatorId && operators.find(op => op.id === operatorId)?.licenseFile) {
            // Keep existing file if editing
            licenseFile = operators.find(op => op.id === operatorId).licenseFile;
        }
        
        if (licenseFileInput.files && licenseFileInput.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                licenseFile = {
                    name: licenseFileInput.files[0].name,
                    type: licenseFileInput.files[0].type,
                    data: e.target.result
                };
                
                saveOperatorData(operatorId, operatorName, operatorPhone, operatorEmail, 
                                operatorAddress, operatorLicense, operatorNotes, idFile, licenseFile);
            };
            reader.readAsDataURL(licenseFileInput.files[0]);
        } else {
            saveOperatorData(operatorId, operatorName, operatorPhone, operatorEmail, 
                            operatorAddress, operatorLicense, operatorNotes, idFile, null);
        }
    }
}

// Helper function to actually save operator data once files are processed
function saveOperatorData(operatorId, operatorName, operatorPhone, operatorEmail, 
                        operatorAddress, operatorLicense, operatorNotes, idFile, licenseFile) {
    // Check if editing existing operator or adding new one
    if (operatorId) {
        // Editing existing operator
        const index = operators.findIndex(operator => operator.id === operatorId);
        if (index !== -1) {
            operators[index] = {
                id: operatorId,
                name: operatorName,
                phone: operatorPhone,
                email: operatorEmail,
                address: operatorAddress,
                license: operatorLicense,
                notes: operatorNotes,
                idFile: idFile || operators[index].idFile,
                licenseFile: licenseFile || operators[index].licenseFile,
                createdAt: operators[index].createdAt,
                updatedAt: new Date().toISOString()
            };
        }
    } else {
        // Adding new operator
        const newOperator = {
            id: Date.now().toString(),
            name: operatorName,
            phone: operatorPhone,
            email: operatorEmail,
            address: operatorAddress,
            license: operatorLicense,
            notes: operatorNotes,
            idFile: idFile,
            licenseFile: licenseFile,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        operators.push(newOperator);
    }
    
    // Save to localStorage
    try {
        localStorage.setItem('operators', JSON.stringify(operators));
        console.log('Operators saved successfully');
        
        // Clear form
        clearOperatorForm();
        
        // Update display
        displayOperators();
        populateOperatorDropdowns();
        
        alert('המפעיל נשמר בהצלחה');
    } catch (e) {
        console.error('Error saving operator:', e);
        alert('שגיאה בשמירת המפעיל: ' + e.message);
    }
}

// Display operators in table
function displayOperators() {
    const tableBody = document.getElementById('operators-body');
    if (!tableBody) {
        console.error('operators-body element not found');
        return;
    }
    
    tableBody.innerHTML = '';
    
    // Sort operators alphabetically by name
    const sortedOperators = [...operators].sort((a, b) => a.name.localeCompare(b.name));
    
    if (sortedOperators.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="6" class="text-center">לא נמצאו מפעילים</td>`;
        tableBody.appendChild(row);
        return;
    }
    
    sortedOperators.forEach(operator => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${operator.name}</td>
            <td>${operator.phone || '-'}</td>
            <td>${operator.email || '-'}</td>
            <td>${operator.license || '-'}</td>
            <td>${operator.idFile ? '<span class="file-indicator">✓</span>' : '-'}</td>
            <td>${operator.licenseFile ? '<span class="file-indicator">✓</span>' : '-'}</td>
            <td class="actions">
                <button class="edit-btn" onclick="editOperator('${operator.id}')">ערוך</button>
                <button class="delete-btn" onclick="deleteOperator('${operator.id}')">מחק</button>
                <button class="info-btn" onclick="showOperatorDetails('${operator.id}')">פרטים</button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Edit operator
function editOperator(id) {
    const operator = operators.find(operator => operator.id === id);
    
    if (operator) {
        document.getElementById('operator-id').value = operator.id;
        document.getElementById('operator-name').value = operator.name;
        document.getElementById('operator-phone').value = operator.phone || '';
        document.getElementById('operator-email').value = operator.email || '';
        document.getElementById('operator-address').value = operator.address || '';
        document.getElementById('operator-license').value = operator.license || '';
        document.getElementById('operator-notes').value = operator.notes || '';
        
        // Update file indicators
        const idFileIndicator = document.getElementById('id-file-indicator');
        const licenseFileIndicator = document.getElementById('license-file-indicator');
        
        if (idFileIndicator) {
            idFileIndicator.textContent = operator.idFile ? 'קובץ קיים: ' + operator.idFile.name : 'אין קובץ';
        }
        
        if (licenseFileIndicator) {
            licenseFileIndicator.textContent = operator.licenseFile ? 'קובץ קיים: ' + operator.licenseFile.name : 'אין קובץ';
        }
        
        // Change button text
        document.getElementById('save-operator-btn').textContent = 'עדכן מפעיל';
        
        // Scroll to form
        document.getElementById('operator-form').scrollIntoView();
    }
}

// Delete operator
function deleteOperator(id) {
    // Check if operator is used in work logs
    const workLogsWithOperator = workLogs.filter(log => log.operator === getOperatorNameById(id));
    
    if (workLogsWithOperator.length > 0) {
        const message = `לא ניתן למחוק את המפעיל מכיוון שהוא משויך ל-${workLogsWithOperator.length} רישומי עבודה.`;
        alert(message);
        return;
    }
    
    if (confirm('האם אתה בטוח שברצונך למחוק את המפעיל הזה?')) {
        operators = operators.filter(operator => operator.id !== id);
        localStorage.setItem('operators', JSON.stringify(operators));
        
        displayOperators();
        populateOperatorDropdowns();
        
        alert('המפעיל נמחק בהצלחה');
    }
}

// Clear operator form
function clearOperatorForm() {
    document.getElementById('operator-id').value = '';
    document.getElementById('operator-name').value = '';
    document.getElementById('operator-phone').value = '';
    document.getElementById('operator-email').value = '';
    document.getElementById('operator-address').value = '';
    document.getElementById('operator-license').value = '';
    document.getElementById('operator-notes').value = '';
    document.getElementById('operator-id-file').value = '';
    document.getElementById('operator-license-file').value = '';
    
    // Reset file indicators
    const idFileIndicator = document.getElementById('id-file-indicator');
    const licenseFileIndicator = document.getElementById('license-file-indicator');
    
    if (idFileIndicator) idFileIndicator.textContent = 'אין קובץ';
    if (licenseFileIndicator) licenseFileIndicator.textContent = 'אין קובץ';
    
    // Reset button text
    document.getElementById('save-operator-btn').textContent = 'שמור מפעיל';
}

// Populate operator dropdowns in forms
function populateOperatorDropdowns() {
    // Get all operator dropdown elements
    const operatorDropdowns = document.querySelectorAll('.operator-dropdown');
    
    operatorDropdowns.forEach(dropdown => {
        // Save current selection if exists
        const currentSelection = dropdown.value;
        
        // Clear existing options (except the empty default option)
        while (dropdown.options.length > 1) {
            dropdown.remove(1);
        }
        
        // Sort operators alphabetically by name
        const sortedOperators = [...operators].sort((a, b) => a.name.localeCompare(b.name));
        
        // Add options for each operator
        sortedOperators.forEach(operator => {
            const option = document.createElement('option');
            option.value = operator.name;
            option.textContent = operator.name;
            dropdown.appendChild(option);
        });
        
        // Restore previous selection if it exists
        if (currentSelection && dropdown.querySelector(`option[value="${currentSelection}"]`)) {
            dropdown.value = currentSelection;
        }
    });
}

// Get operator name by ID
function getOperatorNameById(id) {
    const operator = operators.find(operator => operator.id === id);
    return operator ? operator.name : '';
}

// Get operator ID by name
function getOperatorIdByName(name) {
    const operator = operators.find(operator => operator.name === name);
    return operator ? operator.id : '';
}

// Show operator details modal
function showOperatorDetails(id) {
    const operator = operators.find(operator => operator.id === id);
    
    if (!operator) {
        alert('מפעיל לא נמצא');
        return;
    }
    
    // Get operator history from work logs
    const operatorLogs = workLogs.filter(log => log.operator === operator.name);
    
    // Show operator details modal
    const operatorDetailsContainer = document.getElementById('operator-details');
    const operatorDetailsContent = document.getElementById('operator-details-content');
    
    if (!operatorDetailsContainer || !operatorDetailsContent) {
        console.error('operator-details or operator-details-content elements not found');
        return;
    }
    
    // Format dates
    const createdAtDate = new Date(operator.createdAt);
    const formattedCreatedAt = `${createdAtDate.getDate()}/${createdAtDate.getMonth() + 1}/${createdAtDate.getFullYear()}`;
    
    // Generate HTML for operator details
    let detailsHTML = `
        <div class="operator-profile">
            <h3>פרטי מפעיל: ${operator.name}</h3>
            <div class="operator-info">
                <div class="info-group">
                    <label>טלפון:</label>
                    <div>${operator.phone || '-'}</div>
                </div>
                <div class="info-group">
                    <label>דוא"ל:</label>
                    <div>${operator.email || '-'}</div>
                </div>
                <div class="info-group">
                    <label>כתובת:</label>
                    <div>${operator.address || '-'}</div>
                </div>
                <div class="info-group">
                    <label>מס' רשיון:</label>
                    <div>${operator.license || '-'}</div>
                </div>
                <div class="info-group">
                    <label>הערות:</label>
                    <div>${operator.notes || '-'}</div>
                </div>
                <div class="info-group">
                    <label>תאריך הוספה:</label>
                    <div>${formattedCreatedAt}</div>
                </div>
            </div>
        </div>
    `;
    
    // Add document viewers if available
    if (operator.idFile || operator.licenseFile) {
        detailsHTML += `<div class="operator-documents">`;
        
        if (operator.idFile) {
            detailsHTML += `
                <div class="document-section">
                    <h4>תעודת זהות</h4>
                    <div class="document-preview">
                        ${operator.idFile.type.startsWith('image/') 
                          ? `<img src="${operator.idFile.data}" alt="תעודת זהות" class="document-image">` 
                          : `<a href="${operator.idFile.data}" download="${operator.idFile.name}" class="document-link">הורד מסמך תעודת זהות</a>`}
                    </div>
                </div>
            `;
        }
        
        if (operator.licenseFile) {
            detailsHTML += `
                <div class="document-section">
                    <h4>רשיון</h4>
                    <div class="document-preview">
                        ${operator.licenseFile.type.startsWith('image/') 
                          ? `<img src="${operator.licenseFile.data}" alt="רשיון" class="document-image">` 
                          : `<a href="${operator.licenseFile.data}" download="${operator.licenseFile.name}" class="document-link">הורד מסמך רשיון</a>`}
                    </div>
                </div>
            `;
        }
        
        detailsHTML += `</div>`;
    }
    
    // Add work history if available
    if (operatorLogs.length > 0) {
        // Sort by date (newest first)
        const sortedLogs = [...operatorLogs].sort((a, b) => new Date(b.date) - new Date(a.date));
        const recentLogs = sortedLogs.slice(0, 5); // Show 5 most recent
        
        detailsHTML += `
            <div class="operator-history">
                <h4>היסטוריית עבודה אחרונה</h4>
                <table class="details-table">
                    <thead>
                        <tr>
                            <th>תאריך</th>
                            <th>לקוח</th>
                            <th>מקום עבודה</th>
                            <th>כלי עבודה</th>
                            <th>מחיר</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        recentLogs.forEach(log => {
            const formattedDate = formatDate(log.date);
            const totalPrice = (parseFloat(log.dailyPrice) || 0) + (parseFloat(log.transportationCost) || 0);
            
            detailsHTML += `
                <tr>
                    <td>${formattedDate}</td>
                    <td>${log.client}</td>
                    <td>${log.location || '-'}</td>
                    <td>${log.tools || '-'}</td>
                    <td>₪${totalPrice.toFixed(2)}</td>
                </tr>
            `;
        });
        
        detailsHTML += `
                    </tbody>
                </table>
                ${operatorLogs.length > 5 ? `<div class="see-more-link"><a href="#" onclick="showAllOperatorHistory('${operator.id}')">צפה בכל ההיסטוריה</a></div>` : ''}
            </div>
        `;
    }
    
    // Add action buttons
    detailsHTML += `
        <div class="modal-actions">
            <button class="edit-btn" onclick="editOperator('${operator.id}'); closeOperatorDetails();">ערוך</button>
            <button onclick="closeOperatorDetails()">סגור</button>
        </div>
    `;
    
    // Update modal content and show it
    operatorDetailsContent.innerHTML = detailsHTML;
    operatorDetailsContainer.style.display = 'block';
}

// Close operator details modal
function closeOperatorDetails() {
    const operatorDetailsContainer = document.getElementById('operator-details');
    if (operatorDetailsContainer) {
        operatorDetailsContainer.style.display = 'none';
    }
}

// Show all operator history
function showAllOperatorHistory(operatorId) {
    const operator = operators.find(operator => operator.id === operatorId);
    
    if (!operator) return;
    
    // Navigate to reports tab
    showTab('reports');
    
    // Set report parameters
    document.getElementById('report-type').value = 'operator-history';
    document.getElementById('report-type').value = 'operator-history';
    document.getElementById('report-operator').value = operator.name;
    // Close modal
    closeOperatorDetails();
    
    // Generate report
    generateReport();
}

// Search operators
function searchOperators() {
    const searchText = document.getElementById('search-operator-text').value.toLowerCase();
    
    if (!searchText) {
        displayOperators();
        return;
    }
    
    const filteredOperators = operators.filter(operator => 
        operator.name.toLowerCase().includes(searchText) ||
        (operator.phone && operator.phone.toLowerCase().includes(searchText)) ||
        (operator.email && operator.email.toLowerCase().includes(searchText)) ||
        (operator.license && operator.license.toLowerCase().includes(searchText))
    );
    
    displayOperators(filteredOperators);
}

// Initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing operators module');
    loadOperators();
});