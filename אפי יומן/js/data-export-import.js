// פונקציה לייצוא נתונים לאקסל (פורמט CSV)
function exportDataToExcel() {
    // קבלת סוג הנתונים לייצוא
    const exportType = document.getElementById('export-type').value;
    
    // יצירת תוכן CSV בהתאם לסוג הייצוא
    let csvContent = '';
    let filename = '';
    
    // הוספת BOM ל-UTF-8 לתמיכה בעברית באקסל
    csvContent = '\ufeff';
    
    if (exportType === 'work-logs') {
        // יצירת שורת כותרת לרישומי עבודה
        csvContent += 'ID,תאריך,לקוח,מקום העבודה,כלי עבודה,מפעיל,מחיר ליום עבודה,הובלה,מחיר הובלה,הערות\n';
        
        // הוספת נתוני רישומי עבודה
        workLogs.forEach(log => {
            // הוצאת שדות שעלולים להכיל פסיקים
            const escapedClient = log.client ? `"${log.client.replace(/"/g, '""')}"` : '';
            const escapedLocation = log.location ? `"${log.location.replace(/"/g, '""')}"` : '';
            const escapedTools = log.tools ? `"${log.tools.replace(/"/g, '""')}"` : '';
            const escapedOperator = log.operator ? `"${log.operator.replace(/"/g, '""')}"` : '';
            const escapedNotes = log.notes ? `"${log.notes.replace(/"/g, '""')}"` : '';
            
            csvContent += `${log.id},${log.date},${escapedClient},${escapedLocation},${escapedTools},${escapedOperator},${log.dailyPrice || ''},${log.transportation},${log.transportationCost || ''},${escapedNotes}\n`;
        });
        
        filename = 'work_logs_export.csv';
    } else if (exportType === 'quotes') {
        // יצירת שורת כותרת להצעות מחיר
        csvContent += 'ID,תאריך,לקוח,כלי עבודה,מחיר ליום,מקום העבודה,מפעיל,הובלה,מחיר הובלה,הערות\n';
        
        // הוספת נתוני הצעות מחיר
        quotes.forEach(quote => {
            // הוצאת שדות שעלולים להכיל פסיקים
            const escapedClient = quote.client ? `"${quote.client.replace(/"/g, '""')}"` : '';
            const escapedTools = quote.tools ? `"${quote.tools.replace(/"/g, '""')}"` : '';
            const escapedLocation = quote.location ? `"${quote.location.replace(/"/g, '""')}"` : '';
            const escapedOperator = quote.operator ? `"${quote.operator.replace(/"/g, '""')}"` : '';
            const escapedNotes = quote.notes ? `"${quote.notes.replace(/"/g, '""')}"` : '';
            
            csvContent += `${quote.id},${quote.date},${escapedClient},${escapedTools},${quote.dailyPrice},${escapedLocation},${escapedOperator},${quote.transportation},${quote.transportationCost || ''},${escapedNotes}\n`;
        });
        
        filename = 'quotes_export.csv';
    }
    
    // יצירת והפעלת קישור להורדה
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    // יצירת קישור הורדה
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    // הוספת הקישור לגוף הדף, הפעלת לחיצה והסרה
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// פונקציה לייבוא נתונים מאקסל (פורמט CSV)
function importDataFromExcel() {
    const fileInput = document.getElementById('import-file');
    const importType = document.getElementById('import-type').value;
    
    if (!fileInput.files || fileInput.files.length === 0) {
        alert('נא לבחור קובץ לייבוא');
        return;
    }
    
    const file = fileInput.files[0];
    const reader = new FileReader();
    
    reader.onload = function(event) {
        let csvData = event.target.result;
        
        // בדיקה עבור UTF-8 BOM והסרתו
        if (csvData.charCodeAt(0) === 0xFEFF) {
            csvData = csvData.substring(1);
        }
        
        const dataRows = csvData.split('\n');
        
        // דילוג על שורת כותרת
        const dataArray = [];
        for (let i = 1; i < dataRows.length; i++) {
            if (dataRows[i].trim() !== '') {
                const row = parseCSVRow(dataRows[i]);
                dataArray.push(row);
            }
        }
        
        if (importType === 'work-logs') {
            // עיבוד ייבוא רישומי עבודה
            const importedLogs = [];
            
            dataArray.forEach(row => {
                if (row.length >= 10) {
                    const workLog = {
                        id: row[0] || Date.now().toString(),
                        date: row[1] || '',
                        client: row[2] ? row[2].replace(/^"|"$/g, '').replace(/""/g, '"') : '',
                        location: row[3] ? row[3].replace(/^"|"$/g, '').replace(/""/g, '"') : '',
                        tools: row[4] ? row[4].replace(/^"|"$/g, '').replace(/""/g, '"') : '',
                        operator: row[5] ? row[5].replace(/^"|"$/g, '').replace(/""/g, '"') : '',
                        dailyPrice: row[6] || '',
                        transportation: row[7] || 'כן',
                        transportationCost: row[8] || '',
                        notes: row[9] ? row[9].replace(/^"|"$/g, '').replace(/""/g, '"') : ''
                    };
                    
                    importedLogs.push(workLog);
                }
            });
            
            if (importedLogs.length > 0) {
                // מיזוג או החלפת רישומי עבודה קיימים בהתבסס על בחירת המשתמש
                const importAction = document.getElementById('import-action').value;
                
                if (importAction === 'merge') {
                    // מיזוג: הוספת רישומים חדשים (הימנעות מכפילויות לפי מזהה)
                    const existingIds = workLogs.map(log => log.id);
                    
                    importedLogs.forEach(log => {
                        if (!existingIds.includes(log.id)) {
                            workLogs.push(log);
                        }
                    });
                } else {
                    // החלפה: ניקוי רישומים קיימים והוספת המיובאים
                    workLogs = importedLogs;
                }
                
                // שמירה ב-localStorage ועדכון תצוגה
                localStorage.setItem('workLogs', JSON.stringify(workLogs));
                displayWorkLogs();
                
                alert(`יובאו ${importedLogs.length} רישומי עבודה בהצלחה`);
            } else {
                alert('לא נמצאו נתונים תקינים בקובץ');
            }
        } else if (importType === 'quotes') {
            // עיבוד ייבוא הצעות מחיר
            const importedQuotes = [];
            
            dataArray.forEach(row => {
                if (row.length >= 10) {
                    const quote = {
                        id: row[0] || Date.now().toString(),
                        date: row[1] || '',
                        client: row[2] ? row[2].replace(/^"|"$/g, '').replace(/""/g, '"') : '',
                        tools: row[3] ? row[3].replace(/^"|"$/g, '').replace(/""/g, '"') : '',
                        dailyPrice: row[4] || '',
                        location: row[5] ? row[5].replace(/^"|"$/g, '').replace(/""/g, '"') : '',
                        operator: row[6] ? row[6].replace(/^"|"$/g, '').replace(/""/g, '"') : '',
                        transportation: row[7] || 'כן',
                        transportationCost: row[8] || '',
                        notes: row[9] ? row[9].replace(/^"|"$/g, '').replace(/""/g, '"') : ''
                    };
                    
                    importedQuotes.push(quote);
                }
            });
            
            if (importedQuotes.length > 0) {
                // מיזוג או החלפת הצעות מחיר קיימות בהתבסס על בחירת המשתמש
                const importAction = document.getElementById('import-action').value;
                
                if (importAction === 'merge') {
                    // מיזוג: הוספת הצעות חדשות (הימנעות מכפילויות לפי מזהה)
                    const existingIds = quotes.map(quote => quote.id);
                    
                    importedQuotes.forEach(quote => {
                        if (!existingIds.includes(quote.id)) {
                            quotes.push(quote);
                        }
                    });
                } else {
                    // החלפה: ניקוי הצעות קיימות והוספת המיובאות
                    quotes = importedQuotes;
                }
                
                // שמירה ב-localStorage ועדכון תצוגה
                localStorage.setItem('quotes', JSON.stringify(quotes));
                displayQuotes();
                
                alert(`יובאו ${importedQuotes.length} הצעות מחיר בהצלחה`);
            } else {
                alert('לא נמצאו נתונים תקינים בקובץ');
            }
        }
        
        // איפוס קלט הקובץ
        fileInput.value = '';
    };
    
    reader.readAsText(file, 'UTF-8');
}

// פונקציית עזר לניתוח שורת CSV, טיפול בשדות במרכאות
function parseCSVRow(row) {
    const result = [];
    let inQuotes = false;
    let currentValue = '';
    
    for (let i = 0; i < row.length; i++) {
        const char = row[i];
        
        if (char === '"') {
            if (inQuotes && i < row.length - 1 && row[i + 1] === '"') {
                // מרכאות כפולות בתוך שדה מוקף במרכאות
                currentValue += '"';
                i++; // דילוג על המרכאות הבאות
            } else {
                // החלפת מצב המרכאות
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            // סוף שדה
            result.push(currentValue);
            currentValue = '';
        } else {
            // תו רגיל
            currentValue += char;
        }
    }
    
    // הוספת השדה האחרון
    result.push(currentValue);
    
    return result;
}

// גיבוי כל הנתונים לקובץ JSON
function backupAllData() {
    const backupData = {
        workLogs: workLogs,
        quotes: quotes,
        clients: clients || [],
        tools: tools || [],
        locations: locations || [],
        operators: operators || [],
        version: '1.0',
        timestamp: new Date().toISOString()
    };
    
    const jsonString = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // יצירת קישור הורדה
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const date = new Date().toISOString().split('T')[0];
    
    link.setAttribute('href', url);
    link.setAttribute('download', `workdiary_backup_${date}.json`);
    link.style.visibility = 'hidden';
    
    // הוספת הקישור לגוף הדף, הפעלת לחיצה והסרה
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// שחזור כל הנתונים מקובץ JSON
function restoreAllData() {
    const fileInput = document.getElementById('restore-file');
    
    if (!fileInput.files || fileInput.files.length === 0) {
        alert('נא לבחור קובץ גיבוי לשחזור');
        return;
    }
    
    const file = fileInput.files[0];
    const reader = new FileReader();
    
    reader.onload = function(event) {
        try {
            const backupData = JSON.parse(event.target.result);
            
            // אימות מבנה נתוני הגיבוי
            if (!backupData.workLogs || !backupData.quotes) {
                throw new Error('מבנה קובץ הגיבוי אינו תקין');
            }
            
            // אישור שחזור
            if (confirm('האם אתה בטוח שברצונך לשחזר נתונים מהגיבוי? כל הנתונים הקיימים יוחלפו.')) {
                // שחזור נתונים
                workLogs = backupData.workLogs;
                quotes = backupData.quotes;
                
                // שחזור לקוחות וכלים אם זמינים
                if (backupData.clients) {
                    clients = backupData.clients;
                    localStorage.setItem('clients', JSON.stringify(clients));
                    if (typeof loadClients === 'function') {
                        loadClients();
                    }
                }
                
                if (backupData.tools) {
                    tools = backupData.tools;
                    localStorage.setItem('tools', JSON.stringify(tools));
                    if (typeof loadTools === 'function') {
                        loadTools();
                    }
                }
                
                if (backupData.locations) {
                    locations = backupData.locations;
                    localStorage.setItem('locations', JSON.stringify(locations));
                    if (typeof loadLocations === 'function') {
                        loadLocations();
                    }
                }
                
                if (backupData.operators) {
                    operators = backupData.operators;
                    localStorage.setItem('operators', JSON.stringify(operators));
                    if (typeof loadOperators === 'function') {
                        loadOperators();
                    }
                }
                
                // שמירה ב-localStorage
                localStorage.setItem('workLogs', JSON.stringify(workLogs));
                localStorage.setItem('quotes', JSON.stringify(quotes));
                
                // עדכון תצוגות
                if (typeof displayWorkLogs === 'function') {
                    displayWorkLogs();
                }
                if (typeof displayQuotes === 'function') {
                    displayQuotes();
                }
                
                alert('הנתונים שוחזרו בהצלחה');
            }
        } catch (error) {
            alert('שגיאה בשחזור הנתונים: ' + error.message);
        }
        
        // איפוס קלט הקובץ
        fileInput.value = '';
    };
    
    reader.readAsText(file);
}