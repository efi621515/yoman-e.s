// Find location details if available
const locationDetails = locationName && typeof locations !== 'undefined' ? 
locations.find(loc => loc.name === locationName) : null;

// Generate report HTML
let reportHTML = `
<h3>דוח היסטוריית מקום עבודה${locationName ? ': ' + locationName : ''}</h3>
<p>תאריכים: ${formatDate(document.getElementById('report-date-from').value)} עד ${formatDate(document.getElementById('report-date-to').value)}</p>
`;

// Add location details if available
if (locationDetails) {
reportHTML += `
    <div class="details-box">
        <div class="detail-row">
            <div class="detail-label">עיר:</div>
            <div class="detail-value">${locationDetails.city || '-'}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">כתובת:</div>
            <div class="detail-value">${locationDetails.address || '-'}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">איש קשר:</div>
            <div class="detail-value">${locationDetails.contact || '-'}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">טלפון:</div>
            <div class="detail-value">${locationDetails.contactPhone || '-'}</div>
        </div>
    </div>
`;

// Add image if available
if (locationDetails.imageFile) {
    reportHTML += `
        <div class="location-image-container no-print">
            <h4>תמונת מקום העבודה</h4>
            <img src="${locationDetails.imageFile.data}" alt="תמונת מקום העבודה" class="location-image">
        </div>
    `;
}
}

reportHTML += `
<div class="summary-box">
    <div class="summary-item">
        <span class="summary-label">סה"כ עבודות:</span>
        <span class="summary-value">${sortedLogs.length}</span>
    </div>
    <div class="summary-item">
        <span class="summary-label">סה"כ מפעילים:</span>
        <span class="summary-value">${operators.size}</span>
    </div>
    <div class="summary-item">
        <span class="summary-label">סה"כ לקוחות:</span>
        <span class="summary-value">${clients.size}</span>
    </div>
    <div class="summary-item">
        <span class="summary-label">סה"כ לפני מע"מ:</span>
        <span class="summary-value">₪${totalWithoutVat.toFixed(2)}</span>
    </div>
    <div class="summary-item">
        <span class="summary-label">מע"מ (17%):</span>
        <span class="summary-value">₪${vat.toFixed(2)}</span>
    </div>
    <div class="summary-item">
        <span class="summary-label">סה"כ כולל מע"מ:</span>
        <span class="summary-value">₪${totalWithVat.toFixed(2)}</span>
    </div>
</div>

<table class="detailed-table">
    <thead>
        <tr>
            <th>תאריך</th>
            <th>לקוח</th>
            <th>מפעיל</th>
            <th>כלי עבודה</th>
            <th>מחיר ליום</th>
            <th>הובלה</th>
            <th>מחיר הובלה</th>
            <th>סה"כ</th>
        </tr>
    </thead>
    <tbody>
`;

sortedLogs.forEach(log => {
const logTotal = (parseFloat(log.dailyPrice) || 0) + (parseFloat(log.transportationCost) || 0);
const formattedDate = formatDate(log.date);

reportHTML += `
    <tr>
        <td>${formattedDate}</td>
        <td>${log.client}</td>
        <td>${log.operator || '-'}</td>
        <td>${log.tools || '-'}</td>
        <td>₪${log.dailyPrice ? parseFloat(log.dailyPrice).toFixed(2) : '0.00'}</td>
        <td>${log.transportation}</td>
        <td>₪${log.transportationCost ? parseFloat(log.transportationCost).toFixed(2) : '0.00'}</td>
        <td>₪${logTotal.toFixed(2)}</td>
    </tr>
`;

if (log.notes) {
    reportHTML += `
        <tr class="notes-row">
            <td colspan="8">
                <strong>הערות:</strong> ${log.notes}
            </td>
        </tr>
    `;
}
});

reportHTML += `
    </tbody>
</table>

<div class="print-section">
    <button class="print-btn no-print">הדפס דוח</button>
</div>
`;

container.innerHTML = reportHTML;
}

// Add initReports function to initialize report-specific functionality
function initReports() {
// Set default dates if empty (last month to today)
const today = new Date();
const lastMonth = new Date();
lastMonth.setMonth(today.getMonth() - 1);

const fromDateInput = document.getElementById('report-date-from');
const toDateInput = document.getElementById('report-date-to');

if (fromDateInput && !fromDateInput.value) {
fromDateInput.value = lastMonth.toISOString().split('T')[0];
}

if (toDateInput && !toDateInput.value) {
toDateInput.value = today.toISOString().split('T')[0];
}

// Add event listener to report type dropdown to update any UI based on selection
const reportTypeSelect = document.getElementById('report-type');
if (reportTypeSelect) {
reportTypeSelect.addEventListener('change', function() {
    // Optionally update UI based on report type
    const selectedType = this.value;
    
    // Show/hide relevant filter fields based on report type
    const clientField = document.getElementById('report-client').parentElement;
    const operatorField = document.getElementById('report-operator')?.parentElement;
    const locationField = document.getElementById('report-location')?.parentElement;
    
    if (clientField) {
        clientField.style.display = (selectedType === 'detailed-client-report' || selectedType === 'client-summary') ? 'block' : 'none';
    }
    
    if (operatorField) {
        operatorField.style.display = (selectedType === 'operator-history') ? 'block' : 'none';
    }
    
    if (locationField) {
        locationField.style.display = (selectedType === 'location-history') ? 'block' : 'none';
    }
});

// Trigger change event to set initial state
reportTypeSelect.dispatchEvent(new Event('change'));
}

// Initialize print buttons if there's already a report showing
updatePrintButtons();
}