// פונקציית שיפור לאתחול תעודות משלוח
function enhancedDeliveryNotesInit() {
    console.log('מאתחל מערכת תעודות משלוח משופרת...');
    
    // טעינת תעודות משלוח מה-localStorage
    loadDeliveryNotes();
    
    // וידוא שרשימות הלקוחות והמפעילים מלאות
    populateDeliveryDropdowns();
    
    // הגדרת לכידת אירועי הדפסה
    attachPrintEventHandlers();
    
    console.log('אתחול תעודות משלוח הושלם');
}

// פונקציה לאתחול תיבות הבחירה בתעודות משלוח
function populateDeliveryDropdowns() {
    console.log('מאכלס תיבות בחירה בתעודות משלוח');
    
    // וידוא שיש רשימות לקוחות ומפעילים
    if (!clients || clients.length === 0) {
        clients = JSON.parse(localStorage.getItem('clients') || '[]');
        console.log(`טעינת ${clients.length} לקוחות לתעודות משלוח`);
    }
    
    if (!operators || operators.length === 0) {
        operators = JSON.parse(localStorage.getItem('operators') || '[]');
        console.log(`טעינת ${operators.length} מפעילים לתעודות משלוח`);
    }
    
    // מילוי רשימת לקוחות
    populateDeliveryClientDropdowns();
    
    // מילוי רשימת מפעילים
    populateDeliveryOperatorDropdowns();
}

// פונקציה למילוי רשימות הלקוחות בתעודות משלוח
function populateDeliveryClientDropdowns() {
    // קבלת כל תיבות הבחירה של לקוחות בדף תעודות משלוח
    const clientDropdowns = document.querySelectorAll('#delivery-notes .client-dropdown');
    
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
    
    console.log(`אוכלסו ${clientDropdowns.length} תיבות בחירת לקוחות בתעודות משלוח`);
}

// פונקציה למילוי רשימות המפעילים בתעודות משלוח
function populateDeliveryOperatorDropdowns() {
    // קבלת כל תיבות הבחירה של מפעילים בדף תעודות משלוח
    const operatorDropdowns = document.querySelectorAll('#delivery-notes .operator-dropdown');
    
    operatorDropdowns.forEach(dropdown => {
        // שמירת הבחירה הנוכחית אם קיימת
        const currentSelection = dropdown.value;
        
        // ניקוי אפשרויות קיימות (פרט לאפשרות ברירת המחדל הריקה)
        while (dropdown.options.length > 1) {
            dropdown.remove(1);
        }
        
        // מיון מפעילים אלפביתית לפי שם
        const sortedOperators = [...operators].sort((a, b) => a.name.localeCompare(b.name));
        
        // הוספת אפשרויות לכל מפעיל
        sortedOperators.forEach(operator => {
            const option = document.createElement('option');
            option.value = operator.name;
            option.textContent = operator.name;
            dropdown.appendChild(option);
        });
        
        // שחזור הבחירה הקודמת אם היא קיימת
        if (currentSelection && dropdown.querySelector(`option[value="${currentSelection}"]`)) {
            dropdown.value = currentSelection;
        }
    });
    
    console.log(`אוכלסו ${operatorDropdowns.length} תיבות בחירת מפעילים בתעודות משלוח`);
}

// פונקציה משופרת להדפסת תעודת משלוח
function enhancedPrintDeliveryNote(id) {
    console.log('מדפיס תעודת משלוח משופרת:', id);
    
    const note = deliveryNotes.find(note => note.id === id);
    
    if (!note) {
        alert('תעודת המשלוח לא נמצאה');
        return;
    }
    
    // שמירת הלוגו הנכון להדפסה (אם קיימת פונקציית setLogoForPrinting)
    if (typeof setLogoForPrinting === 'function') {
        try {
            setLogoForPrinting('default');
        } catch (e) {
            console.warn('שגיאה בהגדרת לוגו להדפסה:', e);
        }
    }
    
    // יצירת חלון הדפסה חדש עם תוכן משופר
    const printWindow = window.open('', '_blank');
    
    // CSS משופר לתמיכה בצבעים ועיצוב בהדפסה
    printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="he" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>תעודת משלוח מס' ${note.number}</title>
            <style>
                @media print {
                    @page {
                        size: A4;
                        margin: 10mm;
                    }
                    
                    body {
                        -webkit-print-color-adjust: exact !important;
                        color-adjust: exact !important;
                        print-color-adjust: exact !important;
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
                
                .delivery-note {
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
                
                .no-print {
                    text-align: center;
                    margin-top: 5mm;
                }
                
                @media print {
                    body {
                        background-color: #ffccd5 !important;
                    }
                    
                    .no-print {
                        display: none;
                    }
                }
            </style>
        </head>
        <body>
            <div class="delivery-note">
                <div class="header">
                    <div class="company-logo">
                        <!-- לוגו החברה -->
                        <div style="font-size: 24pt; font-weight: bold;">אילן אליהו בע"מ</div>
                        <div>513343705 ח.פ</div>
                        <img class="logo-img" src="/api/placeholder/400/320" alt="לוגו חברה">
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
            
            <div class="no-print">
                <button onclick="window.print()" style="padding: 10px 20px; background-color: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px;">הדפס</button>
                <button onclick="window.close()" style="padding: 10px 20px; background-color: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer;">סגור</button>
            </div>
        </body>
        </html>
    `);
    
    printWindow.document.close();
    
    // הדפסה אוטומטית
    printWindow.onload = function() {
        printWindow.focus();
        setTimeout(function() {
            printWindow.print();
        }, 500);
    };
}

// פונקציה לחיבור לכידת האירועים
function attachPrintEventHandlers() {
    // האזן ללחיצות על כפתורי ההדפסה
    document.addEventListener('click', function(e) {
        // בדוק אם הכפתור שנלחץ הוא כפתור הדפסת תעודת משלוח
        if (e.target && e.target.classList.contains('print-btn') && 
            e.target.closest('#delivery-notes-table')) {
            
            // מצא את מזהה תעודת המשלוח
            const row = e.target.closest('tr');
            const printBtn = row.querySelector('.print-btn');
            
            if (printBtn && printBtn.getAttribute('onclick')) {
                const onclickAttr = printBtn.getAttribute('onclick');
                const match = onclickAttr.match(/printDeliveryNote\('([^']+)'\)/);
                
                if (match && match[1]) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // קרא לפונקציה המשופרת במקום המקורית
                    enhancedPrintDeliveryNote(match[1]);
                    return false;
                }
            }
        }
    }, true);
    
    // החלף את פונקציית ההדפסה המקורית בפונקציה המשופרת
    if (typeof printDeliveryNote === 'function') {
        console.log('מחליף פונקציית הדפסה מקורית בפונקציה משופרת');
        window.originalPrintDeliveryNote = printDeliveryNote;
        window.printDeliveryNote = enhancedPrintDeliveryNote;
    }
}

// הוסף את הפונקציות לטעינת הדף
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM נטען, מאתחל שיפורים למודול תעודות משלוח');
    
    // אתחול החיבור לפונקציות הגלובליות
    const originalInit = window.init || function() {};
    
    // שיפור פונקציית האתחול
    window.init = function() {
        // קריאה לפונקציית האתחול המקורית
        originalInit();
        
        // הוספת האתחול המשופר לתעודות משלוח
        setTimeout(enhancedDeliveryNotesInit, 500);
    };
    
    // אם כבר עבר אתחול, הפעל את האתחול המשופר ישירות
    if (document.body.classList.contains('initialized')) {
        setTimeout(enhancedDeliveryNotesInit, 500);
    }
});