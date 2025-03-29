// שמירת רישום עבודה
function saveWorkLog() {
    console.log('מנסה לשמור רישום עבודה...');
    
    const date = document.getElementById('log-date').value;
    const client = document.getElementById('log-client').value;
    
    if (!date || !client) {
        alert('נא למלא את התאריך והלקוח');
        return;
    }
    
    const logId = document.getElementById('log-id').value || Date.now().toString();
    
    // בדיקה אם מתבצע העלאת תמונה
    const fieldImageInput = document.getElementById('log-field-image');
    let fieldImage = null;
    
    // אם עורכים, שמור על התמונה הקיימת
    if (document.getElementById('log-id').value) {
        const existingLog = workLogs.find(log => log.id === logId);
        if (existingLog && existingLog.fieldImage) {
            fieldImage = existingLog.fieldImage;
        }
    }
    
    if (fieldImageInput.files && fieldImageInput.files[0]) {
        // יש תמונה חדשה להעלאה
        const reader = new FileReader();
        
        reader.onload = function(e) {
            fieldImage = {
                name: fieldImageInput.files[0].name,
                type: fieldImageInput.files[0].type,
                data: e.target.result
            };
            
            completeWorkLogSave(logId, date, client, fieldImage);
        };
        
        reader.readAsDataURL(fieldImageInput.files[0]);
    } else {
        // אין תמונה חדשה
        completeWorkLogSave(logId, date, client, fieldImage);
    }
}

// פונקציית עזר להשלמת שמירת רישום העבודה
function completeWorkLogSave(logId, date, client, fieldImage) {
    console.log('משלים שמירת רישום עבודה:', { logId, date, client });
    
    // ודא שמערך workLogs מוגדר
    if (typeof workLogs === 'undefined') {
        console.error('מערך workLogs לא מוגדר!');
        workLogs = [];
    }
    
    const workLog = {
        id: logId,
        date: date,
        client: client,
        location: document.getElementById('log-location').value,
        tools: document.getElementById('log-tools').value,
        operator: document.getElementById('log-operator').value,
        dailyPrice: document.getElementById('log-daily-price').value,
        transportation: document.getElementById('log-transportation').value,
        transportationCost: document.getElementById('log-transportation-cost').value,
        notes: document.getElementById('log-notes').value,
        fieldImage: fieldImage
    };
    
    // אם עורכים, מחק את הרשומה הישנה קודם
    const oldLogIndex = workLogs.findIndex(log => log.id === logId);
    if (oldLogIndex !== -1) {
        workLogs.splice(oldLogIndex, 1);
    }
    
    workLogs.push(workLog);
    
    try {
        localStorage.setItem('workLogs', JSON.stringify(workLogs));
        console.log('רישום העבודה נשמר בהצלחה', workLog);
        
        // ניקוי טופס
        document.getElementById('log-id').value = '';
        document.getElementById('log-client').value = '';
        document.getElementById('log-location').value = '';
        document.getElementById('log-tools').value = '';
        document.getElementById('log-operator').value = '';
        document.getElementById('log-daily-price').value = '';
        document.getElementById('log-transportation').value = 'כן';
        document.getElementById('log-transportation-cost').value = '';
        document.getElementById('log-notes').value = '';
        document.getElementById('log-field-image').value = '';
        
        // איפוס סמן התמונה
        const imageIndicator = document.getElementById('field-image-indicator');
        if (imageIndicator) imageIndicator.textContent = 'אין תמונה';
        
        // עדכון הכפתור וכותרת הטופס
        document.getElementById('log-submit-btn').textContent = 'שמור רישום עבודה';
        document.getElementById('log-form-title').textContent = 'יצירת רישום עבודה חדש';
        
        // עדכון התצוגה
        if (typeof displayWorkLogs === 'function') {
            displayWorkLogs();
        } else {
            console.warn('פונקציית displayWorkLogs לא נמצאה');
        }
        
        alert('רישום העבודה נשמר בהצלחה');
    } catch (e) {
        console.error('שגיאה בשמירת רישום העבודה:', e);
        alert('שגיאה בשמירת רישום העבודה: ' + e.message);
    }
}

// הצגת רישומי עבודה
function displayWorkLogs(logsToDisplay = null) {
    const tableBody = document.getElementById('work-logs-body');
    if (!tableBody) {
        console.error('אלמנט work-logs-body לא נמצא');
        return;
    }
    
    // ודא שמערך workLogs מוגדר
    if (typeof workLogs === 'undefined') {
        console.error('מערך workLogs לא מוגדר בפונקציית displayWorkLogs');
        workLogs = [];
    }
    
    tableBody.innerHTML = '';
    
    const logs = logsToDisplay || workLogs;
    
    // בדיקה אם יש רישומי עבודה להצגה
    if (!logs || logs.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="9" class="text-center">לא נמצאו רישומי עבודה</td>`;
        tableBody.appendChild(row);
        return;
    }
    
    // מיון רישומי העבודה לפי תאריך (ישן לחדש)
    const sortedLogs = [...logs].sort((a, b) => {
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(a.date) - new Date(b.date);
    });
    
    sortedLogs.forEach(log => {
        const row = document.createElement('tr');
        
        // פורמט תאריך להצגה
        const formattedDate = formatDate(log.date);
        
        row.innerHTML = `
            <td>${formattedDate}</td>
            <td>${log.client}</td>
            <td>${log.location || '-'}</td>
            <td>${log.tools || '-'}</td>
            <td>${log.operator || '-'}</td>
            <td>${log.dailyPrice ? '₪' + log.dailyPrice : '-'}</td>
            <td>${log.transportation}</td>
            <td>${log.transportationCost ? '₪' + log.transportationCost : '-'}</td>
            <td class="actions">
                <button class="edit-btn" onclick="editWorkLog('${log.id}')">ערוך</button>
                <button class="delete-btn" onclick="deleteWorkLog('${log.id}')">מחק</button>
                ${log.fieldImage ? `<button class="info-btn" onclick="showWorkLogImage('${log.id}')">תמונה</button>` : ''}
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// עריכת רישום עבודה
function editWorkLog(id) {
    console.log('עריכת רישום עבודה:', id);
    
    // ודא שמערך workLogs מוגדר
    if (typeof workLogs === 'undefined') {
        console.error('מערך workLogs לא מוגדר בפונקציית editWorkLog');
        return;
    }
    
    const log = workLogs.find(log => log.id === id);
    
    if (log) {
        document.getElementById('log-id').value = log.id;
        document.getElementById('log-date').value = log.date;
        document.getElementById('log-client').value = log.client;
        document.getElementById('log-location').value = log.location || '';
        document.getElementById('log-tools').value = log.tools || '';
        document.getElementById('log-operator').value = log.operator || '';
        document.getElementById('log-daily-price').value = log.dailyPrice || '';
        document.getElementById('log-transportation').value = log.transportation;
        document.getElementById('log-transportation-cost').value = log.transportationCost || '';
        document.getElementById('log-notes').value = log.notes || '';
        
        // עדכון סמן התמונה אם יש תמונה
        const imageIndicator = document.getElementById('field-image-indicator');
        if (imageIndicator) {
            imageIndicator.textContent = log.fieldImage ? 'תמונה קיימת: ' + log.fieldImage.name : 'אין תמונה';
        }
        
        // גלילה לטופס
        document.getElementById('log-form').scrollIntoView();
        
        // עדכון התצוגה להראות שאנחנו עורכים
        document.getElementById('log-submit-btn').textContent = 'עדכן רישום עבודה';
        document.getElementById('log-form-title').textContent = 'עריכת רישום עבודה';
    } else {
        console.error('לא נמצא רישום עבודה עם המזהה:', id);
    }
}

// מחיקת רישום עבודה
function deleteWorkLog(id) {
    console.log('ניסיון למחוק רישום עבודה:', id);
    
    // ודא שמערך workLogs מוגדר
    if (typeof workLogs === 'undefined') {
        console.error('מערך workLogs לא מוגדר בפונקציית deleteWorkLog');
        return;
    }
    
    if (confirm('האם אתה בטוח שברצונך למחוק את רישום העבודה הזה?')) {
        const beforeLength = workLogs.length;
        workLogs = workLogs.filter(log => log.id !== id);
        const afterLength = workLogs.length;
        
        console.log(`הוסרו ${beforeLength - afterLength} רישומי עבודה`);
        
        localStorage.setItem('workLogs', JSON.stringify(workLogs));
        
        // עדכון התצוגה
        displayWorkLogs();
        
        alert('רישום העבודה נמחק בהצלחה');
    }
}

// חיפוש רישומי עבודה
function searchWorkLogs() {
    console.log('מחפש רישומי עבודה...');
    
    // ודא שמערך workLogs מוגדר
    if (typeof workLogs === 'undefined') {
        console.error('מערך workLogs לא מוגדר בפונקציית searchWorkLogs');
        workLogs = [];
    }
    
    const client = document.getElementById('search-client').value;
    const dateFrom = document.getElementById('search-date-from').value;
    const dateTo = document.getElementById('search-date-to').value;
    
    console.log('פרמטרי חיפוש:', { client, dateFrom, dateTo });
    
    let filteredLogs = workLogs;
    
    if (client) {
        filteredLogs = filteredLogs.filter(log => 
            log.client === client
        );
    }
    
    if (dateFrom) {
        filteredLogs = filteredLogs.filter(log => 
            log.date >= dateFrom
        );
    }
    
    if (dateTo) {
        filteredLogs = filteredLogs.filter(log => 
            log.date <= dateTo
        );
    }
    
    console.log(`נמצאו ${filteredLogs.length} רישומי עבודה מתוך ${workLogs.length}`);
    displayWorkLogs(filteredLogs);
}

// פונקציה להצגת תמונת מקום העבודה
function showWorkLogImage(id) {
    console.log('מציג תמונת רישום עבודה:', id);
    
    // ודא שמערך workLogs מוגדר
    if (typeof workLogs === 'undefined') {
        console.error('מערך workLogs לא מוגדר בפונקציית showWorkLogImage');
        return;
    }
    
    const log = workLogs.find(log => log.id === id);
    
    if (!log || !log.fieldImage) {
        alert('לא נמצאה תמונה לרישום זה');
        return;
    }
    
    // הצגת מודל התמונה
    const modalContainer = document.getElementById('work-image-modal');
    const modalContent = document.getElementById('work-image-content');
    
    if (!modalContainer || !modalContent) {
        console.error('work-image-modal או work-image-content לא נמצאו');
        return;
    }
    
    // פורמט תאריך להצגה
    const formattedDate = formatDate(log.date);
    
    // יצירת HTML להצגת התמונה
    modalContent.innerHTML = `
        <h3>תמונה מהשטח</h3>
        <div class="image-info">
            <div>תאריך: ${formattedDate}</div>
            <div>לקוח: ${log.client}</div>
            <div>מקום עבודה: ${log.location || '-'}</div>
        </div>
        <div class="image-container">
            <img src="${log.fieldImage.data}" alt="תמונה מהשטח" class="field-image">
        </div>
        <div class="modal-actions">
            <a href="${log.fieldImage.data}" download="${log.fieldImage.name}" class="download-link">הורד תמונה</a>
            <button onclick="closeWorkImageModal()">סגור</button>
        </div>
    `;
    
    // הצגת המודל
    modalContainer.style.display = 'block';
}

// סגירת מודל תמונת העבודה
function closeWorkImageModal() {
    const modalContainer = document.getElementById('work-image-modal');
    if (modalContainer) {
        modalContainer.style.display = 'none';
    }
}

// טעינת רישומי עבודה בטעינת הדף
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM נטען, אתחול מודול רישום עבודה...');
    
    // ודא שמערך workLogs קיים
    if (typeof workLogs === 'undefined') {
        console.log('אתחול מערך workLogs');
        workLogs = JSON.parse(localStorage.getItem('workLogs')) || [];
    }
    
    // הצג רישומי עבודה
    displayWorkLogs();
});