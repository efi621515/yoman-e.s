// פונקציית ייצוא נתונים בפורמטים שונים
function exportData() {
    const exportType = document.getElementById('export-type').value;
    const exportFormat = document.getElementById('export-format').value;
    
    // בחירת הנתונים לפי סוג
    let data = [];
    let filename = '';
    let title = '';
    
    switch(exportType) {
        case 'work-logs':
            data = workLogs;
            filename = 'work_logs';
            title = 'רישומי עבודה';
            break;
        case 'quotes':
            data = quotes;
            filename = 'quotes';
            title = 'הצעות מחיר';
            break;
        case 'reminders':
            data = JSON.parse(localStorage.getItem('reminders') || '[]');
            filename = 'reminders';
            title = 'תזכורות';
            break;
        case 'tools':
            data = tools;
            filename = 'tools';
            title = 'כלי עבודה';
            break;
        case 'clients':
            data = clients;
            filename = 'clients';
            title = 'לקוחות';
            break;
        default:
            alert('סוג נתונים לא נתמך');
            return;
    }
    
    if (data.length === 0) {
        alert('אין נתונים לייצוא');
        return;
    }
    
    // ייצוא בפורמט הנבחר
    switch(exportFormat) {
        case 'csv':
            exportToCSV(data, filename, exportType);
            break;
        case 'xlsx':
            exportToXLSX(data, filename, exportType);
            break;
        case 'pdf':
            exportToPDF(data, filename, title, exportType);
            break;
        case 'json':
            exportToJSON(data, filename);
            break;
        default:
            alert('פורמט לא נתמך');
            return;
    }
}

// ייצוא ל-CSV
function exportToCSV(data, filename, type) {
    // הוספת BOM ל-UTF-8 לתמיכה בעברית באקסל
    let csvContent = '\ufeff';
    
    // יצירת כותרות מתאימות לפי סוג הנתונים
    let headers = getHeaders(type);
    csvContent += headers.join(',') + '\n';
    
    // המרת הנתונים ל-CSV
    data.forEach(item => {
        const row = formatRowForCSV(item, type);
        csvContent += row.join(',') + '\n';
    });
    
    // יצירת קישור הורדה
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename + '.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ייצוא ל-XLSX (אקסל מלא)
function exportToXLSX(data, filename, type) {
    // הכנת נתונים לאקסל
    const headers = getHeaders(type);
    const rows = data.map(item => formatRowForXLSX(item, type));
    
    // הוספת שורת כותרות
    rows.unshift(headers);
    
    // יצירת גיליון עבודה
    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    
    // ייצוא
    XLSX.writeFile(workbook, filename + '.xlsx');
}

// פונקציה להגדרת תמיכה בעברית ב-PDF
function setupRTLSupport(doc) {
    // הגדרת מאפייני כיוון טקסט - שימוש בספריית jsPDF
    doc.context2d.direction = 'rtl';
    doc.context2d.textAlign = 'right';
    
    // תוספת עבור טיפול בעברית
    const oldDrawText = doc.API.__proto__.text;
    doc.API.__proto__.text = function(text, x, y, options) {
        if (typeof text === 'string' && /[\u0590-\u05FF]/.test(text)) {
            // אם יש תווים בעברית, יש להפוך את סדר התווים
            if (!options) options = {};
            options.isRTL = true;
        }
        return oldDrawText.call(this, text, x, y, options);
    };
    
    return doc;
}

// ייצוא ל-PDF עם תמיכה בעברית
function exportToPDF(data, filename, title, type) {
    // יצירת מסמך PDF
    const { jsPDF } = window.jspdf;
    let doc = new jsPDF('l', 'mm', 'a4'); // אופקי לדף רחב יותר
    
    // הגדרת תמיכה בעברית
    doc = setupRTLSupport(doc);
    
    // הגדרת כותרת
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(18);
    
    // הוספת הכותרת בעברית
    const rtlTitle = title.split('').reverse().join('');
    doc.text(rtlTitle, doc.internal.pageSize.width - 10, 15, { align: 'right' });
    
    // הכנת נתונים לטבלה
    const headers = getHeaders(type);
    const rows = data.map(item => formatRowForPDF(item, type));
    
    // יצירת טבלה אוטומטית
    doc.autoTable({
        head: [headers],
        body: rows,
        startY: 25,
        theme: 'grid',
        headStyles: { fillColor: [76, 175, 80], textColor: 255 },
        styles: { 
            font: 'Helvetica',
            overflow: 'linebreak',
            cellWidth: 'wrap',
            halign: 'right', // יישור לימין עבור עברית
            direction: 'rtl' // תמיכה בכיוון RTL
        },
        columnStyles: { text: { cellWidth: 'auto' } }
    });
    
    // שמירת הקובץ
    doc.save(filename + '.pdf');
}

// ייצוא ל-JSON
function exportToJSON(data, filename) {
    // המרה ל-JSON מפורמט
    const jsonContent = JSON.stringify(data, null, 2);
    
    // יצירת קישור הורדה
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename + '.json');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// פונקציות עזר להמרת נתונים

// קבלת כותרות לפי סוג נתונים
function getHeaders(type) {
    switch(type) {
        case 'work-logs':
            return ['מזהה', 'תאריך', 'לקוח', 'מקום עבודה', 'כלי עבודה', 'מפעיל', 'מחיר ליום', 'הובלה', 'מחיר הובלה', 'הערות'];
        case 'quotes':
            return ['מזהה', 'תאריך', 'לקוח', 'כלי עבודה', 'מחיר ליום', 'מקום עבודה', 'מפעיל', 'הובלה', 'מחיר הובלה', 'הערות'];
        case 'reminders':
            return ['מזהה', 'תאריך', 'שעה', 'כותרת', 'תיאור', 'עדיפות', 'הושלם'];
        case 'tools':
            return ['מזהה', 'שם כלי', 'סוג', 'מספר סידורי', 'סטטוס', 'מיקום נוכחי', 'תאריך רכישה', 'תאריך טיפול הבא'];
        case 'clients':
            return ['מזהה', 'שם לקוח', 'טלפון', 'דוא"ל', 'כתובת', 'הערות'];
        default:
            return Object.keys(data[0] || {});
    }
}

// פורמט שורה ל-CSV
function formatRowForCSV(item, type) {
    let row = [];
    
    switch(type) {
        case 'work-logs':
            row = [
                escapeCSV(item.id),
                escapeCSV(item.date),
                escapeCSV(item.client),
                escapeCSV(item.location || ''),
                escapeCSV(item.tools || ''),
                escapeCSV(item.operator || ''),
                escapeCSV(item.dailyPrice || ''),
                escapeCSV(item.transportation || ''),
                escapeCSV(item.transportationCost || ''),
                escapeCSV(item.notes || '')
            ];
            break;
        case 'quotes':
            row = [
                escapeCSV(item.id),
                escapeCSV(item.date),
                escapeCSV(item.client),
                escapeCSV(item.tools || ''),
                escapeCSV(item.dailyPrice || ''),
                escapeCSV(item.location || ''),
                escapeCSV(item.operator || ''),
                escapeCSV(item.transportation || ''),
                escapeCSV(item.transportationCost || ''),
                escapeCSV(item.notes || '')
            ];
            break;
        case 'reminders':
            row = [
                escapeCSV(item.id),
                escapeCSV(item.date),
                escapeCSV(item.time || ''),
                escapeCSV(item.title),
                escapeCSV(item.description || ''),
                escapeCSV(item.priority || 'normal'),
                escapeCSV(item.completed ? 'כן' : 'לא')
            ];
            break;
        case 'tools':
            row = [
                escapeCSV(item.id),
                escapeCSV(item.name),
                escapeCSV(item.type || ''),
                escapeCSV(item.serialNumber || ''),
                escapeCSV(item.status || ''),
                escapeCSV(item.location || ''),
                escapeCSV(item.purchaseDate || ''),
                escapeCSV(item.nextMaintenance || '')
            ];
            break;
        case 'clients':
            row = [
                escapeCSV(item.id),
                escapeCSV(item.name),
                escapeCSV(item.phone || ''),
                escapeCSV(item.email || ''),
                escapeCSV(item.address || ''),
                escapeCSV(item.notes || '')
            ];
            break;
        default:
            row = Object.values(item).map(val => escapeCSV(val));
    }
    
    return row;
}

// פורמט שורה ל-XLSX
function formatRowForXLSX(item, type) {
    // XLSX יכול לקבל את אותו הפורמט של שורות כמו CSV, רק ללא אסקייפינג
    switch(type) {
        case 'work-logs':
            return [
                item.id,
                item.date,
                item.client,
                item.location || '',
                item.tools || '',
                item.operator || '',
                item.dailyPrice || '',
                item.transportation || '',
                item.transportationCost || '',
                item.notes || ''
            ];
        case 'quotes':
            return [
                item.id,
                item.date,
                item.client,
                item.tools || '',
                item.dailyPrice || '',
                item.location || '',
                item.operator || '',
                item.transportation || '',
                item.transportationCost || '',
                item.notes || ''
            ];
        case 'reminders':
            return [
                item.id,
                item.date,
                item.time || '',
                item.title,
                item.description || '',
                item.priority || 'normal',
                item.completed ? 'כן' : 'לא'
            ];
        case 'tools':
            return [
                item.id,
                item.name,
                item.type || '',
                item.serialNumber || '',
                item.status || '',
                item.location || '',
                item.purchaseDate || '',
                item.nextMaintenance || ''
            ];
        case 'clients':
            return [
                item.id,
                item.name,
                item.phone || '',
                item.email || '',
                item.address || '',
                item.notes || ''
            ];
        default:
            return Object.values(item);
    }
}

// פורמט שורה ל-PDF
function formatRowForPDF(item, type) {
    // זהה לפורמט XLSX
    return formatRowForXLSX(item, type);
}

// עיבוד מחרוזת עבור CSV
function escapeCSV(value) {
    if (value === undefined || value === null) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
}

// הוספת האתחול לטעינת הדף
document.addEventListener('DOMContentLoaded', function() {
    // בדיקה אם יש צורך להוסיף ספריות חסרות
    if (typeof jsPDF === 'undefined' && !document.getElementById('jspdf-script')) {
        console.log("טוען ספריית jsPDF");
        const script1 = document.createElement('script');
        script1.id = 'jspdf-script';
        script1.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        script1.async = true;
        document.head.appendChild(script1);
        
        const script2 = document.createElement('script');
        script2.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.25/jspdf.plugin.autotable.min.js';
        script2.async = true;
        document.head.appendChild(script2);
    }
    
    if (typeof XLSX === 'undefined' && !document.getElementById('xlsx-script')) {
        console.log("טוען ספריית XLSX");
        const script = document.createElement('script');
        script.id = 'xlsx-script';
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
        script.async = true;
        document.head.appendChild(script);
    }
});