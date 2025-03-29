// פונקציה משופרת לטעינת תעודות משלוח
function fixedLoadDeliveryNotes() {
    console.log("טוען תעודות משלוח מ-localStorage...");
    
    // טעינת נתונים מהאחסון המקומי
    try {
        // טען את תעודות המשלוח מהאחסון המקומי
        deliveryNotes = JSON.parse(localStorage.getItem('deliveryNotes') || '[]');
        console.log(`נטענו ${deliveryNotes.length} תעודות משלוח`);
        
        // בדוק אם צריך לטעון את מערכי הלקוחות והמפעילים
        if (!window.clients || window.clients.length === 0) {
            window.clients = JSON.parse(localStorage.getItem('clients') || '[]');
            console.log(`נטענו ${window.clients.length} לקוחות לתמיכה בתעודות משלוח`);
        }
        
        if (!window.operators || window.operators.length === 0) {
            window.operators = JSON.parse(localStorage.getItem('operators') || '[]');
            console.log(`נטענו ${window.operators.length} מפעילים לתמיכה בתעודות משלוח`);
        }
        
        // בדוק אם צריך לטעון את מערכי המיקומים וכלי העבודה
        if (!window.locations || window.locations.length === 0) {
            window.locations = JSON.parse(localStorage.getItem('locations') || '[]');
            console.log(`נטענו ${window.locations.length} מיקומים לתמיכה בתעודות משלוח`);
        }
        
        if (!window.tools || window.tools.length === 0) {
            window.tools = JSON.parse(localStorage.getItem('tools') || '[]');
            console.log(`נטענו ${window.tools.length} כלי עבודה לתמיכה בתעודות משלוח`);
        }
    } catch (e) {
        console.error("שגיאה בטעינת תעודות משלוח:", e);
        deliveryNotes = [];
    }
    
    // הצגת תעודות המשלוח בטבלה
    displayDeliveryNotes();
    
    // שלב 1: מלא את רשימות הלקוחות
    populateDeliveryClientDropdowns();
    
    // שלב 2: מלא את רשימות המפעילים
    populateDeliveryOperatorDropdowns();
    
    // אתחול מספר תעודה אם צריך
    initDeliveryNoteNumber();
}

// פונקציה משופרת למילוי רשימות הלקוחות בתעודות משלוח
function populateDeliveryClientDropdowns() {
    console.log("ממלא רשימות לקוחות בתעודות משלוח...");
    
    // מצא את כל תיבות הבחירה של לקוחות בדף תעודות משלוח
    const clientSelectors = document.querySelectorAll('#delivery-notes select.client-dropdown');
    if (clientSelectors.length === 0) {
        console.warn("לא נמצאו תיבות בחירה של לקוחות בדף תעודות משלוח");
        return;
    }
    
    // אסוף את הלקוחות
    let clients = window.clients || [];
    if (clients.length === 0) {
        clients = JSON.parse(localStorage.getItem('clients') || '[]');
        window.clients = clients;
    }
    
    // מיין לקוחות לפי שם
    const sortedClients = [...clients].sort((a, b) => {
        return a.name.localeCompare(b.name, 'he');
    });
    
    // עדכן כל תיבת בחירה
    clientSelectors.forEach(selector => {
        // שמור את הערך הנוכחי
        const currentValue = selector.value;
        
        // נקה את האפשרויות הקיימות (שמור רק את האפשרות הריקה הראשונה)
        while (selector.options.length > 1) {
            selector.remove(1);
        }
        
        // הוסף אפשרויות מהלקוחות
        sortedClients.forEach(client => {
            const option = document.createElement('option');
            option.value = client.name;
            option.textContent = client.name;
            selector.appendChild(option);
        });
        
        // החזר את הערך הקודם אם הוא עדיין קיים
        if (currentValue && selector.querySelector(`option[value="${currentValue}"]`)) {
            selector.value = currentValue;
        }
    });
    
    console.log(`מילוי ${clientSelectors.length} תיבות בחירת לקוחות הושלם`);
}

// פונקציה משופרת למילוי רשימות המפעילים בתעודות משלוח
function populateDeliveryOperatorDropdowns() {
    console.log("ממלא רשימות מפעילים בתעודות משלוח...");
    
    // מצא את כל תיבות הבחירה של מפעילים בדף תעודות משלוח
    const operatorSelectors = document.querySelectorAll('#delivery-notes select.operator-dropdown');
    if (operatorSelectors.length === 0) {
        console.warn("לא נמצאו תיבות בחירה של מפעילים בדף תעודות משלוח");
        return;
    }
    
    // אסוף את המפעילים
    let operators = window.operators || [];
    if (operators.length === 0) {
        operators = JSON.parse(localStorage.getItem('operators') || '[]');
        window.operators = operators;
    }
    
    // מיין מפעילים לפי שם
    const sortedOperators = [...operators].sort((a, b) => {
        return a.name.localeCompare(b.name, 'he');
    });
    
    // עדכן כל תיבת בחירה
    operatorSelectors.forEach(selector => {
        // שמור את הערך הנוכחי
        const currentValue = selector.value;
        
        // נקה את האפשרויות הקיימות (שמור רק את האפשרות הריקה הראשונה)
        while (selector.options.length > 1) {
            selector.remove(1);
        }
        
        // הוסף אפשרויות מהמפעילים
        sortedOperators.forEach(operator => {
            const option = document.createElement('option');
            option.value = operator.name;
            option.textContent = operator.name;
            selector.appendChild(option);
        });
        
        // החזר את הערך הקודם אם הוא עדיין קיים
        if (currentValue && selector.querySelector(`option[value="${currentValue}"]`)) {
            selector.value = currentValue;
        }
    });
    
    console.log(`מילוי ${operatorSelectors.length} תיבות בחירת מפעילים הושלם`);
}

// פונקציה משופרת להדפסת תעודת משלוח
function fixedPrintDeliveryNote(id) {
    console.log("מדפיס תעודת משלוח (גרסה משופרת):", id);
    
    // מצא את תעודת המשלוח לפי מזהה
    const note = deliveryNotes.find(note => note.id === id);
    
    if (!note) {
        alert('תעודת המשלוח לא נמצאה');
        return;
    }
    
    // שמור את תוכן הדף הנוכחי
    const originalContent = document.body.innerHTML;
    
    // הכן את התוכן להדפסה עם סגנון CSS משופר
    const printContent = `
        <style>
            @media print {
                @page {
                    size: A4;
                    margin: 10mm;
                }
                
                body {
                    background-color: #ffccd5 !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                    font-family: Arial, sans-serif;
                    direction: rtl;
                }
            }
            
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 10mm;
                direction: rtl;
                background-color: #ffccd5; /* רקע ורדרד */
                color: #000;
            }
            
            .print-container {
                max-width: 210mm;
                margin: 0 auto;
            }
            
            .header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 5mm;
                border-bottom: 1px solid #000;
                padding-bottom: 5mm;
            }
            
            .company-details {
                text-align: center;
                flex: 2;
            }
            
            .company-logo {
                flex: 1;
                text-align: right;
            }
            
            .logo-img {
                max-width: 60mm;
                height: auto;
            }
            
            h1 {
                font-size: 24pt;
                margin: 0;
                color: #333;
            }
            
            .contact-info {
                flex: 1;
                text-align: left;
                font-size: 9pt;
            }
            
            .note-number {
                text-align: center;
                font-size: 20pt;
                font-weight: bold;
                margin: 10mm 0 5mm;
                color: #d00;
            }
            
            .client-info {
                margin-bottom: 5mm;
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 5mm;
            }
            
            .info-row {
                display: flex;
                margin-bottom: 3mm;
            }
            
            .info-label {
                min-width: 25mm;
                font-weight: bold;
            }
            
            .info-value {
                flex: 1;
                border-bottom: 1px dotted #000;
                padding-bottom: 1mm;
            }
            
            .equipment-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 5mm;
                border: 1px solid #000;
                padding: 2mm;
            }
            
            .equipment-option {
                margin: 0 3mm;
            }
            
            .equipment-selected {
                font-weight: bold;
                text-decoration: underline;
            }
            
            .items-table {
                width: 100%;
                border-collapse: collapse;
                margin: 5mm 0;
            }
            
            .items-table th,
            .items-table td {
                border: 1px solid #000;
                padding: 2mm;
                text-align: center;
            }
            
            .items-table th {
                background-color: rgba(0,0,0,0.1);
            }
            
            .signature-block {
                display: flex;
                justify-content: space-between;
                margin-top: 10mm;
            }
            
            .signature-section {
                width: 45%;
            }
            
            .signature-line {
                margin-top: 10mm;
                border-top: 1px solid #000;
                padding-top: 2mm;
                text-align: center;
            }
            
            .footer {
                margin-top: 10mm;
                text-align: center;
                font-size: 8pt;
                color: #555;
            }
        </style>
        
        <div class="print-container">
            <div class="header">
                <div class="company-logo">
                    <!-- לוגו החברה -->
                    <div style="font-size: 24pt; font-weight: bold;">אילן אליהו בע"מ</div>
                    <div>513343705 ח.פ</div>
                </div>
                
                <div class="company-details">
                    <div style="font-weight: bold;">עבודות עפר ופיתוח • עבודות הריסה • פינוי פסולת ועפר</div>
                    <div style="font-weight: bold;">אספקת חומרי מחצבה, חולים, אדמה גן, חמרה וקומפוסט</div>
                </div>
                
                <div class="contact-info">
                    <div>רח' יציאה אריתריאה 7 ירושלים 96909</div>
                    <div>טל: 077-7880884, אילן: 050-5258475, יורם: 052-2406516</div>
                    <div>פקס: 077-7680077</div>
                    <div>E-mail: ilan-e@012.net.il</div>
                </div>
            </div>
            
            <div class="note-number">
                תעודת משלוח מס' ${note.number || ''}
            </div>
            
            <div class="client-info">
                <div class="info-row">
                    <div class="info-label">תאריך:</div>
                    <div class="info-value">${formatDate(note.date)}</div>
                    
                    <div class="info-label" style="margin-right: 15mm;">שעה:</div>
                    <div class="info-value">___________</div>
                </div>
                
                <div class="info-row">
                    <div class="info-label">שם הנהג:</div>
                    <div class="info-value">${note.operator || ''}</div>
                    
                    <div class="info-label" style="margin-right: 15mm;">מס׳ רישוי:</div>
                    <div class="info-value">${note.licenseNumber || ''}</div>
                </div>
            </div>
            
            <div class="equipment-row">
                <span class="equipment-label">ציוד:</span>
                <span class="equipment-option ${note.equipmentType === 'מחפרון' ? 'equipment-selected' : ''}">מחפרון</span>
                <span class="equipment-option ${note.equipmentType === 'באגר גלגלים' ? 'equipment-selected' : ''}">באגר גלגלים</span>
                <span class="equipment-option ${note.equipmentType === 'באגר זחל' ? 'equipment-selected' : ''}">באגר זחל</span>
                <span class="equipment-option ${note.equipmentType === 'שופל' ? 'equipment-selected' : ''}">שופל</span>
                <span class="equipment-option ${note.equipmentType === 'בובקט' ? 'equipment-selected' : ''}">בובקט</span>
                <span class="equipment-option ${note.equipmentType === 'מכבש' ? 'equipment-selected' : ''}">מכבש</span>
                <span class="equipment-option ${note.equipmentType === 'מיני מחפרון' ? 'equipment-selected' : ''}">מיני מחפרון</span>
            </div>
            
            <div class="info-row">
                <div class="info-label">משאית:</div>
                <div class="info-value">
                    ${note.truckType === 'רכב רגיל' ? 'רכב רגיל' : ''}
                    ${note.truckType === 'רכב פוליטריילר' ? 'רכב פוליטריילר' : ''}
                    ${note.truckType === 'טריילר' ? 'טריילר' : ''}
                </div>
                
                <div class="info-label" style="margin-right: 15mm;">מס׳ הזמנה:</div>
                <div class="info-value">${note.orderNumber || ''}</div>
            </div>
            
            <div class="info-row">
                <div class="info-label">לכבוד:</div>
                <div class="info-value">${note.client || ''}</div>
            </div>
            
            <div class="info-row">
                <div class="info-label">ממקום:</div>
                <div class="info-value">${note.fromLocation || ''}</div>
            </div>
            
            <div class="info-row">
                <div class="info-label">למקום:</div>
                <div class="info-value">${note.toLocation || ''}</div>
            </div>
            
            <table class="items-table">
                <thead>
                    <tr>
                        <th>מספר</th>
                        <th>כמות</th>
                        <th>פרטים</th>
                        <th>מחיר</th>
                        <th>חתימה</th>
                    </tr>
                </thead>
                <tbody>
                    ${note.items && note.items.length > 0 ? note.items.map(item => `
                        <tr>
                            <td>${item.id}</td>
                            <td>${item.quantity || ''}</td>
                            <td>${item.details || ''}</td>
                            <td>${item.price || ''}</td>
                            <td>${item.signature || ''}</td>
                        </tr>
                    `).join('') : `
                        <tr>
                            <td>1</td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>
                        <tr>
                            <td>2</td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>
                        <tr>
                            <td>3</td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>
                    `}
                </tbody>
            </table>
            
            <div style="color: #333; margin: 5mm 0; text-align: center;">
                <strong>המחיר לא כולל מע"מ</strong>
            </div>
            
            <div class="info-row" style="margin-top: 10mm;">
                <div class="info-label">הערות:</div>
                <div class="info-value" style="min-height: 15mm;">${note.notes || ''}</div>
            </div>
            
            <div class="signature-block">
                <div class="signature-section">
                    <div>שם המקבל: ${note.recipient || '_______________'}</div>
                    <div class="signature-line">חתימה</div>
                </div>
                
                <div class="signature-section">
                    <div>טלפון: ${note.phone || '_______________'}</div>
                    <div class="signature-line">חותמת</div>
                </div>
            </div>
            
            <div class="footer">
                <div>התמורה עבור עבודות אילן אליהו בע"מ עד גמר התשלום בפועל.</div>
                <div>מאשר את תנאי ושביעות רצוני והתאמתי.</div>
            </div>
        </div>
    `;
    
    // החלף את תוכן הדף בתוכן ההדפסה
    document.body.innerHTML = printContent;
    
    // פתח דיאלוג הדפסה
    window.print();
    
    // החזר את התוכן המקורי לאחר הדפסה
    setTimeout(() => {
        document.body.innerHTML = originalContent;
        
        // הרץ מחדש את האתחול הגלובלי
        if (typeof init === 'function') {
            init();
        }
        
        // גלול לכרטיסיית תעודות משלוח
        if (typeof showTab === 'function') {
            showTab('delivery-notes');
        }
    }, 1000);
}

// אתחול קובץ התיקונים בטעינת הדף
document.addEventListener('DOMContentLoaded', function() {
    console.log("טוען תיקוני תעודות משלוח...");
    
    // החלף את פונקציות הטעינה וההדפסה בגרסאות המשופרות
    if (typeof loadDeliveryNotes === 'function') {
        console.log("מחליף פונקציית טעינת תעודות משלוח");
        window.original_loadDeliveryNotes = loadDeliveryNotes;
        window.loadDeliveryNotes = fixedLoadDeliveryNotes;
    }
    
    if (typeof printDeliveryNote === 'function') {
        console.log("מחליף פונקציית הדפסת תעודת משלוח");
        window.original_printDeliveryNote = printDeliveryNote;
        window.printDeliveryNote = fixedPrintDeliveryNote;
    }
    
    // הפעל את הטעינה המשופרת אם יש צורך
    if (document.querySelector('#delivery-notes')) {
        console.log("מפעיל טעינה משופרת של תעודות משלוח");
        setTimeout(fixedLoadDeliveryNotes, 500);
    }
});