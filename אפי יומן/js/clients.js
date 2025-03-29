// בדיקה אם localStorage זמין
function checkStorage() {
    try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return true;
    } catch (e) {
        return false;
    }
}

// טעינת לקוחות בטעינת הדף
function loadClients() {
    console.log('טוען לקוחות...');
    console.log('לקוחות נוכחיים:', clients);
    displayClients();
    populateClientDropdowns();
}

// שמירת לקוח
function saveClient() {
    console.log('שומר לקוח...');
    
    if (!checkStorage()) {
        alert('שגיאה: לא ניתן לגשת ל-localStorage. וודא שהדפדפן תומך בו ושהוא מופעל.');
        return;
    }
    
    const clientId = document.getElementById('client-id').value;
    const clientName = document.getElementById('client-name').value;
    const clientPhone = document.getElementById('client-phone').value;
    const clientEmail = document.getElementById('client-email').value;
    const clientAddress = document.getElementById('client-address').value;
    const clientNotes = document.getElementById('client-notes').value;
    
    console.log('נתוני לקוח:', { clientId, clientName, clientPhone, clientEmail, clientAddress });
    
    if (!clientName) {
        alert('נא להזין שם לקוח');
        return;
    }
    
    // בדיקה אם עורכים לקוח קיים או מוסיפים חדש
    if (clientId) {
        // עריכת לקוח קיים
        const index = clients.findIndex(client => client.id === clientId);
        if (index !== -1) {
            clients[index] = {
                id: clientId,
                name: clientName,
                phone: clientPhone,
                email: clientEmail,
                address: clientAddress,
                notes: clientNotes,
                createdAt: clients[index].createdAt,
                updatedAt: new Date().toISOString()
            };
        }
    } else {
        // הוספת לקוח חדש
        const newClient = {
            id: Date.now().toString(),
            name: clientName,
            phone: clientPhone,
            email: clientEmail,
            address: clientAddress,
            notes: clientNotes,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        clients.push(newClient);
    }
    
    // שמירה ב-localStorage
    try {
        localStorage.setItem('clients', JSON.stringify(clients));
        console.log('הלקוחות נשמרו בהצלחה');
        
        // ניקוי טופס
        clearClientForm();
        
        // עדכון תצוגה
        displayClients();
        populateClientDropdowns();
        
        alert('הלקוח נשמר בהצלחה');
    } catch (e) {
        console.error('שגיאה בשמירת הלקוח:', e);
        alert('שגיאה בשמירת הלקוח: ' + e.message);
    }
}

// הצגת לקוחות בטבלה
function displayClients() {
    const tableBody = document.getElementById('clients-body');
    if (!tableBody) {
        console.error('clients-body לא נמצא');
        return;
    }
    
    tableBody.innerHTML = '';
    
    // מיון לקוחות אלפביתית לפי שם
    const sortedClients = [...clients].sort((a, b) => a.name.localeCompare(b.name));
    
    if (sortedClients.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="5" class="text-center">לא נמצאו לקוחות</td>`;
        tableBody.appendChild(row);
        return;
    }
    
    sortedClients.forEach(client => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${client.name}</td>
            <td>${client.phone || '-'}</td>
            <td>${client.email || '-'}</td>
            <td>${client.address || '-'}</td>
            <td class="actions">
                <button class="edit-btn" onclick="editClient('${client.id}')">ערוך</button>
                <button class="delete-btn" onclick="deleteClient('${client.id}')">מחק</button>
                <button class="info-btn" onclick="showClientDetails('${client.id}')">פרטים</button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// עריכת לקוח
function editClient(id) {
    const client = clients.find(client => client.id === id);
    
    if (client) {
        document.getElementById('client-id').value = client.id;
        document.getElementById('client-name').value = client.name;
        document.getElementById('client-phone').value = client.phone || '';
        document.getElementById('client-email').value = client.email || '';
        document.getElementById('client-address').value = client.address || '';
        document.getElementById('client-notes').value = client.notes || '';
        
        // שינוי טקסט כפתור
        document.getElementById('save-client-btn').textContent = 'עדכן לקוח';
        
        // גלילה לטופס
        document.getElementById('client-form').scrollIntoView();
    }
}

// מחיקת לקוח
function deleteClient(id) {
    // בדיקה אם הלקוח בשימוש ברישומי עבודה או הצעות מחיר
    const workLogsWithClient = workLogs.filter(log => log.client === getClientNameById(id));
    const quotesWithClient = quotes.filter(quote => quote.client === getClientNameById(id));
    
    if (workLogsWithClient.length > 0 || quotesWithClient.length > 0) {
        const message = `לא ניתן למחוק את הלקוח מכיוון שהוא משויך ל-${workLogsWithClient.length} רישומי עבודה ו-${quotesWithClient.length} הצעות מחיר.`;
        alert(message);
        return;
    }
    
    if (confirm('האם אתה בטוח שברצונך למחוק את הלקוח הזה?')) {
        clients = clients.filter(client => client.id !== id);
        localStorage.setItem('clients', JSON.stringify(clients));
        
        displayClients();
        populateClientDropdowns();
        
        alert('הלקוח נמחק בהצלחה');
    }
}

// ניקוי טופס לקוח
function clearClientForm() {
    document.getElementById('client-id').value = '';
    document.getElementById('client-name').value = '';
    document.getElementById('client-phone').value = '';
    document.getElementById('client-email').value = '';
    document.getElementById('client-address').value = '';
    document.getElementById('client-notes').value = '';
    
    // איפוס טקסט כפתור
    document.getElementById('save-client-btn').textContent = 'שמור לקוח';
}

// מילוי רשימות נגללות של לקוחות בטפסים
function populateClientDropdowns() {
    // קבלת כל האלמנטים של רשימות נגללות של לקוחות
    const clientDropdowns = document.querySelectorAll('.client-dropdown');
    
    clientDropdowns.forEach(dropdown => {
        // שמירת הבחירה הנוכחית אם קיימת
        const currentSelection = dropdown.value;
        
        // ניקוי אפשרויות קיימות (פרט לאפשרות ברירת המחדל הריקה)
        while (dropdown.options.length > 1) {
            dropdown.remove(1);
        }
        
        // מיון לקוחות אלפביתית לפי שם
        const sortedClients = [...clients].sort((a, b) => a.name.localeCompare(b.name));
        
        // הוספת אפשרויות לכל לקוח
        sortedClients.forEach(client => {
            const option = document.createElement('option');
            option.value = client.name;
            option.textContent = client.name;
            dropdown.appendChild(option);
        });
        
        // שחזור הבחירה הקודמת אם היא קיימת
        if (currentSelection && dropdown.querySelector(`option[value="${currentSelection}"]`)) {
            dropdown.value = currentSelection;
        }
    });
}

// קבלת שם לקוח לפי מזהה
function getClientNameById(id) {
    const client = clients.find(client => client.id === id);
    return client ? client.name : '';
}

// קבלת מזהה לקוח לפי שם
function getClientIdByName(name) {
    const client = clients.find(client => client.name === name);
    return client ? client.id : '';
}

// הצגת פרטי לקוח עם היסטוריה
function showClientDetails(id) {
    const client = clients.find(client => client.id === id);
    
    if (!client) {
        alert('לקוח לא נמצא');
        return;
    }
    
    // קבלת היסטוריית לקוח
    const clientLogs = workLogs.filter(log => log.client === client.name);
    const clientQuotes = quotes.filter(quote => quote.client === client.name);
    
    // חישוב סך הכנסות
    let totalRevenue = 0;
    clientLogs.forEach(log => {
        totalRevenue += parseFloat(log.dailyPrice) || 0;
        totalRevenue += parseFloat(log.transportationCost) || 0;
    });
    
    // הצגת חלון מודל פרטי לקוח
    const clientDetailsContainer = document.getElementById('client-details');
    const clientDetailsContent = document.getElementById('client-details-content');
    
    if (!clientDetailsContainer || !clientDetailsContent) {
        console.error('client-details או client-details-content לא נמצאו');
        return;
    }
    
    // פורמט תאריכים
    const createdAtDate = new Date(client.createdAt);
    const formattedCreatedAt = `${createdAtDate.getDate()}/${createdAtDate.getMonth() + 1}/${createdAtDate.getFullYear()}`;
    
    // יצירת HTML לפרטי לקוח
    let detailsHTML = `
        <div class="client-profile">
            <h3>פרטי לקוח: ${client.name}</h3>
            <div class="client-info">
                <div class="info-group">
                    <label>טלפון:</label>
                    <div>${client.phone || '-'}</div>
                </div>
                <div class="info-group">
                    <label>דוא"ל:</label>
                    <div>${client.email || '-'}</div>
                </div>
                <div class="info-group">
                    <label>כתובת:</label>
                    <div>${client.address || '-'}</div>
                </div>
                <div class="info-group">
                    <label>הערות:</label>
                    <div>${client.notes || '-'}</div>
                </div>
                <div class="info-group">
                    <label>תאריך הוספה:</label>
                    <div>${formattedCreatedAt}</div>
                </div>
            </div>
        </div>
        
        <div class="client-summary">
            <h4>סיכום פעילות</h4>
            <div class="summary-stats">
                <div class="stat-box">
                    <div class="stat-number">${clientLogs.length}</div>
                    <div class="stat-label">רישומי עבודה</div>
                </div>
                <div class="stat-box">
                    <div class="stat-number">${clientQuotes.length}</div>
                    <div class="stat-label">הצעות מחיר</div>
                </div>
                <div class="stat-box">
                    <div class="stat-number">₪${totalRevenue.toFixed(2)}</div>
                    <div class="stat-label">סה"כ הכנסות</div>
                </div>
            </div>
        </div>
    `;
    
    // הוספת רישומי עבודה אחרונים
    if (clientLogs.length > 0) {
        // מיון לפי תאריך (חדש לישן)
        const sortedLogs = [...clientLogs].sort((a, b) => new Date(b.date) - new Date(a.date));
        const recentLogs = sortedLogs.slice(0, 5); // קבלת 5 הרישומים האחרונים
        
        detailsHTML += `
            <div class="client-recent-logs">
                <h4>עבודות אחרונות</h4>
                <table class="details-table">
                    <thead>
                        <tr>
                            <th>תאריך</th>
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
                    <td>${log.location || '-'}</td>
                    <td>${log.tools || '-'}</td>
                    <td>₪${totalPrice.toFixed(2)}</td>
                </tr>
            `;
        });
        
        detailsHTML += `
                    </tbody>
                </table>
                ${clientLogs.length > 5 ? `<div class="see-more-link"><a href="#" onclick="generateClientReport('${client.id}'); return false;">צפה בכל ההיסטוריה</a></div>` : ''}
            </div>
        `;
    }
    
    // הוספת הצעות מחיר אחרונות
    if (clientQuotes.length > 0) {
        // מיון לפי תאריך (חדש לישן)
        const sortedQuotes = [...clientQuotes].sort((a, b) => new Date(b.date) - new Date(a.date));
        const recentQuotes = sortedQuotes.slice(0, 5); // קבלת 5 ההצעות האחרונות
        
        detailsHTML += `
            <div class="client-recent-quotes">
                <h4>הצעות מחיר אחרונות</h4>
                <table class="details-table">
                    <thead>
                        <tr>
                            <th>תאריך</th>
                            <th>כלי עבודה</th>
                            <th>מחיר ליום</th>
                            <th>מקום עבודה</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        recentQuotes.forEach(quote => {
            const formattedDate = formatDate(quote.date);
            
            detailsHTML += `
                <tr>
                    <td>${formattedDate}</td>
                    <td>${quote.tools || '-'}</td>
                    <td>₪${quote.dailyPrice || '0'}</td>
                    <td>${quote.location || '-'}</td>
                </tr>
            `;
        });
        
        detailsHTML += `
                    </tbody>
                </table>
                ${clientQuotes.length > 5 ? `<div class="see-more-link"><a href="#" onclick="showClientAllQuotes('${client.id}'); return false;">צפה בכל הצעות המחיר</a></div>` : ''}
            </div>
        `;
    }
    
    // עדכון תוכן המודל והצגתו
    clientDetailsContent.innerHTML = detailsHTML;
    clientDetailsContainer.style.display = 'block';
}

// סגירת מודל פרטי לקוח
function closeClientDetails() {
    const clientDetailsContainer = document.getElementById('client-details');
    if (clientDetailsContainer) {
        clientDetailsContainer.style.display = 'none';
    }
}

// יצירת דוח לקוח מפרטי לקוח
function generateClientReport(clientId) {
    const client = clients.find(client => client.id === clientId);
    
    if (!client) return;
    
    // הגדרת פרמטרים לדוח
    document.getElementById('report-type').value = 'detailed-client-report';
    document.getElementById('report-client').value = client.name;
    
    // הגדרת טווח תאריכים לשנה האחרונה כברירת מחדל
    const today = new Date();
    const lastYear = new Date();
    lastYear.setFullYear(today.getFullYear() - 1);
    
    document.getElementById('report-date-from').value = lastYear.toISOString().split('T')[0];
    document.getElementById('report-date-to').value = today.toISOString().split('T')[0];
    
    // סגירת מודל
    closeClientDetails();
    
    // הצגת לשונית דוחות ויצירת הדוח
    showTab('reports');
    generateReport();
}

// הצגת כל הצעות המחיר של לקוח
function showClientAllQuotes(clientId) {
    const client = clients.find(client => client.id === clientId);
    
    if (!client) return;
    
    // סינון הצעות מחיר להצגת רק של לקוח זה
    document.getElementById('search-quote-client').value = client.name;
    
    // סגירת מודל
    closeClientDetails();
    
    // הצגת לשונית הצעות מחיר והפעלת חיפוש
    showTab('quotes');
    searchQuotes();
}

// חיפוש לקוחות לפי טקסט
function searchClients() {
    const searchText = document.getElementById('search-client-text').value.toLowerCase();
    
    if (!searchText) {
        displayClients();
        return;
    }
    
    const filteredClients = clients.filter(client => 
        client.name.toLowerCase().includes(searchText) ||
        (client.phone && client.phone.toLowerCase().includes(searchText)) ||
        (client.email && client.email.toLowerCase().includes(searchText)) ||
        (client.address && client.address.toLowerCase().includes(searchText))
    );
    
    displayFilteredClients(filteredClients);
}

// הצגת לקוחות מסוננים
function displayFilteredClients(filteredClients) {
    const tableBody = document.getElementById('clients-body');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    // מיון לקוחות אלפביתית לפי שם
    const sortedClients = [...filteredClients].sort((a, b) => a.name.localeCompare(b.name));
    
    if (sortedClients.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="5" class="text-center">לא נמצאו לקוחות מתאימים</td>`;
        tableBody.appendChild(row);
        return;
    }
    
    sortedClients.forEach(client => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${client.name}</td>
            <td>${client.phone || '-'}</td>
            <td>${client.email || '-'}</td>
            <td>${client.address || '-'}</td>
            <td class="actions">
                <button class="edit-btn" onclick="editClient('${client.id}')">ערוך</button>
                <button class="delete-btn" onclick="deleteClient('${client.id}')">מחק</button>
                <button class="info-btn" onclick="showClientDetails('${client.id}')">פרטים</button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// איתחול כשה-DOM נטען לגמרי
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM נטען, מאתחל מודול לקוחות');
    loadClients();
});