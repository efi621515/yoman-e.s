// מערך גלובלי לתעודות משלוח
let deliveryNotes = [];

// טעינת תעודות משלוח בטעינת הדף
function loadDeliveryNotes() {
    try {
        deliveryNotes = JSON.parse(localStorage.getItem('deliveryNotes')) || [];
        console.log(`נטענו ${deliveryNotes.length} תעודות משלוח`);
        displayDeliveryNotes();
    } catch (e) {
        console.error('שגיאה בטעינת תעודות משלוח:', e);
        deliveryNotes = [];
    }
}

// שמירת תעודת משלוח
function saveDeliveryNote() {
    const noteId = document.getElementById('delivery-id').value || Date.now().toString();
    const noteNumber = document.getElementById('delivery-number').value || generateDeliveryNumber();
    const date = document.getElementById('delivery-date').value;
    const time = document.getElementById('delivery-time').value;
    const client = document.getElementById('delivery-client').value;
    const licenseNumber = document.getElementById('delivery-license').value;
    const equipmentType = getSelectedEquipmentType();
    const location = document.getElementById('delivery-location').value;
    const destination = document.getElementById('delivery-destination').value;
    
    // קבלת פרטי המוצרים מהטבלה
    const itemsTable = document.getElementById('delivery-items-table');
    const itemRows = itemsTable.querySelectorAll('tbody tr');
    
    const items = [];
    itemRows.forEach(row => {
        const productInput = row.querySelector('.item-product');
        const quantityInput = row.querySelector('.item-quantity');
        const priceInput = row.querySelector('.item-price');
        
        if (productInput && productInput.value.trim() !== '') {
            items.push({
                product: productInput.value,
                quantity: quantityInput ? quantityInput.value : '',
                price: priceInput ? priceInput.value : ''
            });
        }
    });
    
    // בדיקת שדות חובה
    if (!date || !client) {
        alert('נא למלא לפחות תאריך ולקוח');
        return;
    }
    
    // יצירת אובייקט תעודת משלוח
    const deliveryNote = {
        id: noteId,
        number: noteNumber,
        date: date,
        time: time,
        client: client,
        licenseNumber: licenseNumber,
        equipmentType: equipmentType,
        location: location,
        destination: destination,
        items: items,
        createdAt: new Date().toISOString()
    };
    
    // עדכון או הוספה של תעודת משלוח
    const index = deliveryNotes.findIndex(note => note.id === noteId);
    if (index !== -1) {
        deliveryNotes[index] = deliveryNote;
    } else {
        deliveryNotes.push(deliveryNote);
    }
    
    // שמירה ב-localStorage
    try {
        localStorage.setItem('deliveryNotes', JSON.stringify(deliveryNotes));
        
        // ניקוי טופס
        clearDeliveryNoteForm();
        
        // עדכון תצוגה
        displayDeliveryNotes();
        
        alert('תעודת המשלוח נשמרה בהצלחה');
    } catch (e) {
        console.error('שגיאה בשמירת תעודת משלוח:', e);
        alert('שגיאה בשמירת תעודת משלוח: ' + e.message);
    }
}

// ניקוי טופס תעודת משלוח
function clearDeliveryNoteForm() {
    document.getElementById('delivery-id').value = '';
    document.getElementById('delivery-number').value = '';
    document.getElementById('delivery-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('delivery-time').value = '';
    document.getElementById('delivery-client').value = '';
    document.getElementById('delivery-license').value = '';
    
    // איפוס סוג הציוד
    const equipmentTypeRadios = document.querySelectorAll('input[name="equipment-type"]');
    if (equipmentTypeRadios.length > 0) {
        equipmentTypeRadios[0].checked = true;
    }
    
    document.getElementById('delivery-location').value = '';
    document.getElementById('delivery-destination').value = '';
    
    // ניקוי טבלת מוצרים
    resetItemsTable();
    
    // עדכון כפתור שמירה
    document.getElementById('save-delivery-btn').textContent = 'שמור תעודת משלוח';
}

// איפוס טבלת המוצרים לשורה אחת ריקה
function resetItemsTable() {
    const tbody = document.querySelector('#delivery-items-table tbody');
    tbody.innerHTML = '';
    
    // הוספת שורה ריקה
    addNewItemRow();
}

// הוספת שורה חדשה לטבלת המוצרים
function addNewItemRow() {
    const tbody = document.querySelector('#delivery-items-table tbody');
    const rowCount = tbody.children.length + 1;
    
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td>${rowCount}</td>
        <td><input type="text" class="item-product" placeholder="שם המוצר"></td>
        <td><input type="number" class="item-quantity" placeholder="כמות"></td>
        <td><input type="number" class="item-price" placeholder="מחיר"></td>
        <td><button type="button" class="delete-row-btn" onclick="removeItemRow(this)">-</button></td>
    `;
    
    tbody.appendChild(newRow);
}

// הסרת שורה מטבלת המוצרים
function removeItemRow(button) {
    const row = button.closest('tr');
    const tbody = row.parentNode;
    
    // אם זו השורה האחרונה, אל תמחק אותה
    if (tbody.children.length <= 1) {
        // נקה את השדות במקום למחוק
        const inputs = row.querySelectorAll('input');
        inputs.forEach(input => input.value = '');
        return;
    }
    
    row.remove();
    
    // עדכון מספרי השורות
    const rows = tbody.querySelectorAll('tr');
    rows.forEach((row, index) => {
        row.cells[0].textContent = index + 1;
    });
}

// קבלת סוג הציוד שנבחר
function getSelectedEquipmentType() {
    const radioButtons = document.querySelectorAll('input[name="equipment-type"]');
    for (const radioButton of radioButtons) {
        if (radioButton.checked) {
            return radioButton.value;
        }
    }
    return '';
}

// יצירת מספר תעודת משלוח אוטומטי
function generateDeliveryNumber() {
    let maxNumber = 0;
    
    // מצא את המספר הגבוה ביותר
    deliveryNotes.forEach(note => {
        const noteNumber = parseInt(note.number);
        if (!isNaN(noteNumber) && noteNumber > maxNumber) {
            maxNumber = noteNumber;
        }
    });
    
    // הגדל ב-1 ליצירת המספר הבא
    return (maxNumber + 1).toString();
}

// הצגת תעודות משלוח בטבלה
function displayDeliveryNotes() {
    const tableBody = document.getElementById('delivery-notes-table').querySelector('tbody');
    if (!tableBody) {
        console.error('לא נמצא גוף טבלה להצגת תעודות משלוח');
        return;
    }
    
    // ניקוי הטבלה
    tableBody.innerHTML = '';
    
    if (!deliveryNotes || deliveryNotes.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="6" class="text-center">לא נמצאו תעודות משלוח</td>';
        tableBody.appendChild(row);
        return;
    }
    
    // מיון לפי תאריך (חדש לישן)
    const sortedNotes = [...deliveryNotes].sort((a, b) => {
        return new Date(b.date + (b.time || '')) - new Date(a.date + (a.time || ''));
    });
    
    sortedNotes.forEach(note => {
        const row = document.createElement('tr');
        
        const formattedDate = formatDate(note.date);
        
        row.innerHTML = `
            <td>${note.number}</td>
            <td>${formattedDate}</td>
            <td>${note.client}</td>
            <td>${note.location || '-'}</td>
            <td>${note.destination || '-'}</td>
            <td class="actions">
                <button class="edit-btn" onclick="editDeliveryNote('${note.id}')">ערוך</button>
                <button class="delete-btn" onclick="deleteDeliveryNote('${note.id}')">מחק</button>
                <button class="print-btn" onclick="printDeliveryNote('${note.id}')">הדפס</button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// עריכת תעודת משלוח
function editDeliveryNote(id) {
    const note = deliveryNotes.find(note => note.id === id);
    
    if (!note) {
        console.error('לא נמצאה תעודת משלוח עם מזהה:', id);
        return;
    }
    
    // מילוי הטופס בנתוני התעודה
    document.getElementById('delivery-id').value = note.id;
    document.getElementById('delivery-number').value = note.number || '';
    document.getElementById('delivery-date').value = note.date || '';
    document.getElementById('delivery-time').value = note.time || '';
    document.getElementById('delivery-client').value = note.client || '';
    document.getElementById('delivery-license').value = note.licenseNumber || '';
    
    // בחירת סוג הציוד
    if (note.equipmentType) {
        const radioButton = document.querySelector(`input[name="equipment-type"][value="${note.equipmentType}"]`);
        if (radioButton) {
            radioButton.checked = true;
        }
    }
    
    document.getElementById('delivery-location').value = note.location || '';
    document.getElementById('delivery-destination').value = note.destination || '';
    
    // מילוי טבלת המוצרים
    resetItemsTable(); // נקה את הטבלה תחילה
    
    if (note.items && note.items.length > 0) {
        const tbody = document.querySelector('#delivery-items-table tbody');
        tbody.innerHTML = ''; // נקה את כל השורות הקיימות
        
        // הוסף שורה לכל פריט
        note.items.forEach((item, index) => {
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td>${index + 1}</td>
                <td><input type="text" class="item-product" value="${item.product || ''}" placeholder="שם המוצר"></td>
                <td><input type="number" class="item-quantity" value="${item.quantity || ''}" placeholder="כמות"></td>
                <td><input type="number" class="item-price" value="${item.price || ''}" placeholder="מחיר"></td>
                <td><button type="button" class="delete-row-btn" onclick="removeItemRow(this)">-</button></td>
            `;
            
            tbody.appendChild(newRow);
        });
    }
    
    // אם אין שורות, הוסף שורה ריקה
    if (document.querySelectorAll('#delivery-items-table tbody tr').length === 0) {
        addNewItemRow();
    }
    
    // עדכון כפתור שמירה
    document.getElementById('save-delivery-btn').textContent = 'עדכן תעודת משלוח';
    
    // גלילה לטופס
    document.getElementById('delivery-form').scrollIntoView();
}

// מחיקת תעודת משלוח
function deleteDeliveryNote(id) {
    if (confirm('האם אתה בטוח שברצונך למחוק את תעודת המשלוח?')) {
        deliveryNotes = deliveryNotes.filter(note => note.id !== id);
        
        // שמירה ב-localStorage
        localStorage.setItem('deliveryNotes', JSON.stringify(deliveryNotes));
        
        // עדכון התצוגה
        displayDeliveryNotes();
        
        alert('תעודת המשלוח נמחקה בהצלחה');
    }
}

// חיפוש תעודות משלוח
function searchDeliveryNotes() {
    const clientFilter = document.getElementById('search-delivery-client').value;
    const dateFromFilter = document.getElementById('search-delivery-date-from').value;
    const dateToFilter = document.getElementById('search-delivery-date-to').value;
    
    // סינון לפי הקריטריונים
    let filteredNotes = [...deliveryNotes];
    
    if (clientFilter) {
        filteredNotes = filteredNotes.filter(note => 
            note.client && note.client.includes(clientFilter)
        );
    }
    
    if (dateFromFilter) {
        filteredNotes = filteredNotes.filter(note => 
            note.date >= dateFromFilter
        );
    }
    
    if (dateToFilter) {
        filteredNotes = filteredNotes.filter(note => 
            note.date <= dateToFilter
        );
    }
    
    // הצגת התוצאות המסוננות
    const tableBody = document.getElementById('delivery-notes-table').querySelector('tbody');
    tableBody.innerHTML = '';
    
    if (filteredNotes.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="6" class="text-center">לא נמצאו תעודות משלוח מתאימות</td>';
        tableBody.appendChild(row);
        return;
    }
    
    // מיון לפי תאריך (חדש לישן)
    const sortedNotes = filteredNotes.sort((a, b) => {
        return new Date(b.date + (b.time || '')) - new Date(a.date + (a.time || ''));
    });
    
    sortedNotes.forEach(note => {
        const row = document.createElement('tr');
        
        const formattedDate = formatDate(note.date);
        
        row.innerHTML = `
            <td>${note.number}</td>
            <td>${formattedDate}</td>
            <td>${note.client}</td>
            <td>${note.location || '-'}</td>
            <td>${note.destination || '-'}</td>
            <td class="actions">
                <button class="edit-btn" onclick="editDeliveryNote('${note.id}')">ערוך</button>
                <button class="delete-btn" onclick="deleteDeliveryNote('${note.id}')">מחק</button>
                <button class="print-btn" onclick="printDeliveryNote('${note.id}')">הדפס</button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// הדפסת תעודת משלוח
function printDeliveryNote(id) {
    const note = deliveryNotes.find(note => note.id === id);
    
    if (!note) {
        console.error('לא נמצאה תעודת משלוח עם מזהה:', id);
        return;
    }
    
    // קבלת פרטי התעודה
    const noteNumber = note.number || '-';
    const formattedDate = formatDate(note.date) || '-';
    const formattedTime = note.time || '';
    const client = note.client || '-';
    const licenseNumber = note.licenseNumber || '';
    const equipmentType = note.equipmentType || '';
    const location = note.location || '';
    const destination = note.destination || '';
    
    // יצירת אלמנט טביעת רגל להדפסה
    const printContainer = document.createElement('div');
    printContainer.className = 'print-container delivery-note-print';
    
    // פורמט ה-HTML להדפסה בהתאם לעיצוב של התעודה שהועלתה
    printContainer.innerHTML = `
        <div class="delivery-note-header">
            <div class="company-logo">
                <h2>אילן אליהו בע"מ</h2>
                <p>ח.פ 513363705</p>
            </div>
            <div class="company-info">
                <p>עבודות עפר ופיתוח • עבודות הריסה • פינוי פסולת ועפר</p>
                <p>אספקת חומרי מחצבה, חול, אדמת גן, חמרה וקומפוסט</p>
            </div>
            <div class="company-contact">
                <p>רח' יציאת אירופה 9 ירושלים 96909 טל: 077-7880884 פקס: 02-6788884</p>
                <p>אילן: 050-5258675, יורם: 052-2406516</p>
                <p>E-mail: ilan-e@012.net.il</p>
            </div>
        </div>
        
        <div class="delivery-note-title">
            <h1>תעודת משלוח מס' ${noteNumber}</h1>
            <p class="delivery-note-date">תאריך: ${formattedDate} ${formattedTime}</p>
        </div>
        
        <div class="client-details">
            <p>שם הנהג: ________________ מס' רישוי: ${licenseNumber}</p>
            <p>ציוד: ${equipmentType}</p>
            <p>משאית: ________________</p>
            <p>לכבוד: ${client}</p>
            <p>ממקום: ${location} למקום: ${destination}</p>
        </div>
        
        <table class="delivery-items-table">
            <thead>
                <tr>
                    <th>מספר</th>
                    <th>פרטים</th>
                    <th>כמות</th>
                    <th>מחיר</th>
                    <th>חתימה</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    // הוספת שורות המוצרים
    if (note.items && note.items.length > 0) {
        note.items.forEach((item, index) => {
            printContainer.innerHTML += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${item.product || ''}</td>
                    <td>${item.quantity || ''}</td>
                    <td>${item.price || ''}</td>
                    <td></td>
                </tr>
            `;
        });
    }
    
    // הוספת שורות ריקות אם יש פחות מ-6 פריטים
    const itemsCount = note.items ? note.items.length : 0;
    for (let i = itemsCount; i < 6; i++) {
        printContainer.innerHTML += `
            <tr>
                <td>${i + 1}</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
            </tr>
        `;
    }
    
    // סיום טבלת הפריטים
    printContainer.innerHTML += `
            </tbody>
        </table>
        
        <div class="delivery-note-footer">
            <p>המסירה בבעלות חב' אילן אליהו בע"מ עד גמר התשלום המלא בפועל.</p>
            <p>מאשר את הנ"ל לטיפולך וזיכוי בהתאם להזמנתך.</p>
            <div class="signature-section">
                <p>חתימה: ________________</p>
                <p>שם המקבל: ________________ טלפון: ________________</p>
            </div>
        </div>
    `;
    
    // שמירת תוכן הדף הנוכחי
    const originalContent = document.body.innerHTML;
    
    // החלפת תוכן הדף באלמנט ההדפסה
    document.body.innerHTML = `
        <style>
            @media print {
                body { 
                    direction: rtl;
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                }
                
                .delivery-note-print {
                    width: 100%;
                    max-width: 210mm;
                    margin: 0 auto;
                    padding: 10mm;
                }
                
                .delivery-note-header {
                    text-align: center;
                    margin-bottom: 5mm;
                    border-bottom: 1px solid #000;
                    padding-bottom: 2mm;
                }
                
                .company-logo h2 {
                    margin: 0;
                    font-size: 20pt;
                    color: #003399;
                }
                
                .company-info p, .company-contact p {
                    margin: 1mm 0;
                    font-size: 10pt;
                }
                
                .delivery-note-title {
                    text-align: center;
                    margin: 5mm 0;
                }
                
                .delivery-note-title h1 {
                    margin: 0;
                    font-size: 16pt;
                }
                
                .delivery-note-date {
                    margin: 2mm 0;
                    font-size: 12pt;
                }
                
                .client-details {
                    margin: 5mm 0;
                }
                
                .client-details p {
                    margin: 2mm 0;
                    font-size: 12pt;
                }
                
                .delivery-items-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 5mm 0;
                }
                
                .delivery-items-table th,
                .delivery-items-table td {
                    border: 1px solid #000;
                    padding: 2mm;
                    text-align: center;
                    font-size: 12pt;
                }
                
                .delivery-note-footer {
                    margin-top: 5mm;
                    font-size: 10pt;
                }
                
                .signature-section {
                    margin-top: 10mm;
                }
            }
        </style>
        ${printContainer.outerHTML}
    `;
    
    // הפעלת חלון ההדפסה של הדפדפן
    window.print();
    
    // שחזור תוכן הדף המקורי
    document.body.innerHTML = originalContent;
    
    // אתחול האפליקציה מחדש
    // (המקום תלוי במבנה האפליקציה)
    if (typeof init === 'function') {
        init();
        
        // הצגת לשונית תעודות משלוח
        showTab('delivery-notes');
    }
}

// האזנה לטעינת הדף
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM נטען, אתחול מודול תעודות משלוח');
    
    // אתחול טופס עם תאריך היום
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('delivery-date');
    if (dateInput) {
        dateInput.value = today;
    }
    
    // טעינת תעודות משלוח
    loadDeliveryNotes();
    
    // הוספת אירוע לכפתור הוספת שורת מוצר
    const addItemButton = document.getElementById('add-item-btn');
    if (addItemButton) {
        addItemButton.addEventListener('click', addNewItemRow);
    }
    
    // איתחול טבלת מוצרים עם שורה ריקה
    resetItemsTable();
});