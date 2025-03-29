// פונקציית ייבוא מאקסל
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
        
        // השתמש ב-Papa Parse במקום לנתח ידנית
        Papa.parse(csvData, {
            header: true,
            skipEmptyLines: true,
            encoding: "UTF-8",
            delimitersToGuess: [',', ';', '\t'], // נחש את המפריד אוטומטית
            complete: function(results) {
                console.log("תוצאות ניתוח CSV:", results);
                
                if (results.errors && results.errors.length > 0) {
                    console.error("שגיאות בניתוח CSV:", results.errors);
                    alert(`שגיאה בניתוח הקובץ: ${results.errors[0].message}`);
                    return;
                }
                
                const parsedData = results.data;
                
                if (parsedData.length === 0) {
                    alert('הקובץ ריק או בפורמט לא תקין');
                    return;
                }
                
                if (importType === 'work-logs') {
                    processWorkLogsImport(parsedData);
                } else if (importType === 'quotes') {
                    processQuotesImport(parsedData);
                }
            },
            error: function(error) {
                console.error("שגיאה בניתוח CSV:", error);
                alert(`שגיאה בניתוח הקובץ: ${error.message}`);
            }
        });
    };
    
    reader.onerror = function(event) {
        console.error("שגיאה בקריאת הקובץ:", event.target.error);
        alert(`שגיאה בקריאת הקובץ: ${event.target.error}`);
    };
    
    reader.readAsText(file, 'UTF-8');
}

// עיבוד נתוני רישומי עבודה מייבוא
function processWorkLogsImport(parsedData) {
    console.log("מעבד נתוני רישומי עבודה:", parsedData);
    
    const importedLogs = [];
    const importAction = document.getElementById('import-action').value;
    
    // מיפוי שמות שדות אפשריים
    const fieldMappings = {
        id: ['id', 'מזהה', 'ID'],
        date: ['date', 'תאריך', 'יום'],
        client: ['client', 'לקוח', 'שם לקוח'],
        location: ['location', 'מקום', 'מקום עבודה', 'אתר'],
        tools: ['tools', 'כלים', 'כלי עבודה', 'ציוד'],
        operator: ['operator', 'מפעיל', 'עובד'],
        dailyPrice: ['dailyPrice', 'מחיר ליום', 'תעריף יומי', 'תעריף'],
        transportation: ['transportation', 'הובלה', 'שינוע'],
        transportationCost: ['transportationCost', 'מחיר הובלה', 'עלות הובלה', 'עלות שינוע'],
        notes: ['notes', 'הערות', 'הערה']
    };
    
    // מצא את המפתחות המתאימים מהכותרות של הקובץ
    const headers = Object.keys(parsedData[0] || {});
    const mappedFields = {};
    
    for (const field in fieldMappings) {
        const possibleNames = fieldMappings[field];
        const foundHeader = headers.find(header => 
            possibleNames.some(name => 
                header.trim().toLowerCase() === name.toLowerCase() ||
                header.trim().includes(name)
            )
        );
        
        if (foundHeader) {
            mappedFields[field] = foundHeader;
        }
    }
    
    console.log("מיפוי שדות:", mappedFields);
    
    // עבור על כל שורה ובנה רישום עבודה
    parsedData.forEach((row, index) => {
        try {
            // וודא שיש מספיק נתונים בשורה
            if (Object.keys(row).length < 3) {
                console.warn(`שורה ${index + 1} לא מכילה מספיק נתונים, מדלג`);
                return;
            }
            
            // יצירת רישום עבודה חדש
            const workLog = {
                id: (mappedFields.id && row[mappedFields.id]) || Date.now().toString() + index,
                date: mappedFields.date ? row[mappedFields.date] : '',
                client: mappedFields.client ? row[mappedFields.client] : '',
                location: mappedFields.location ? row[mappedFields.location] : '',
                tools: mappedFields.tools ? row[mappedFields.tools] : '',
                operator: mappedFields.operator ? row[mappedFields.operator] : '',
                dailyPrice: mappedFields.dailyPrice ? row[mappedFields.dailyPrice] : '',
                transportation: mappedFields.transportation ? row[mappedFields.transportation] : 'כן',
                transportationCost: mappedFields.transportationCost ? row[mappedFields.transportationCost] : '',
                notes: mappedFields.notes ? row[mappedFields.notes] : ''
            };
            
            // עיבוד תאריך אם הוא בפורמט שונה
            if (workLog.date && workLog.date.includes('/')) {
                const parts = workLog.date.split('/');
                if (parts.length === 3) {
                    // הנחה שהפורמט הוא DD/MM/YYYY
                    const day = parts[0].padStart(2, '0');
                    const month = parts[1].padStart(2, '0');
                    let year = parts[2];
                    
                    // טיפול בשנה בפורמט 2 ספרות
                    if (year.length === 2) {
                        year = '20' + year;
                    }
                    
                    workLog.date = `${year}-${month}-${day}`;
                }
            }
            
            // המר מספרים מטקסט למספר
            if (workLog.dailyPrice) {
                workLog.dailyPrice = workLog.dailyPrice.toString().replace(/[^\d.-]/g, '');
            }
            
            if (workLog.transportationCost) {
                workLog.transportationCost = workLog.transportationCost.toString().replace(/[^\d.-]/g, '');
            }
            
            // אימות נתונים בסיסיים
            if (!workLog.date || !workLog.client) {
                console.warn(`שורה ${index + 1} חסרים נתונים בסיסיים (תאריך או לקוח), מדלג`);
                return;
            }
            
            importedLogs.push(workLog);
        } catch (e) {
            console.error(`שגיאה בעיבוד שורה ${index + 1}:`, e);
        }
    });
    
    if (importedLogs.length === 0) {
        alert('לא הצלחתי לייבא רישומים. וודא שהקובץ מכיל את העמודות הנדרשות: תאריך, לקוח');
        return;
    }
    
    // שמירת הרישומים לפי פעולת הייבוא שנבחרה
    if (importAction === 'merge') {
        // מיזוג עם רישומים קיימים
        const existingIds = workLogs.map(log => log.id);
        importedLogs.forEach(log => {
            if (!existingIds.includes(log.id)) {
                workLogs.push(log);
            }
        });
    } else {
        // החלפת רישומים קיימים
        workLogs = importedLogs;
    }
    
    // שמירה ב-localStorage
    localStorage.setItem('workLogs', JSON.stringify(workLogs));
    displayWorkLogs();
    
    alert(`יובאו ${importedLogs.length} רישומי עבודה בהצלחה`);
}

// עיבוד נתוני הצעות מחיר מייבוא
function processQuotesImport(parsedData) {
    console.log("מעבד נתוני הצעות מחיר:", parsedData);
    
    const importedQuotes = [];
    const importAction = document.getElementById('import-action').value;
    
    // מיפוי שמות שדות אפשריים
    const fieldMappings = {
        id: ['id', 'מזהה', 'ID'],
        date: ['date', 'תאריך', 'יום'],
        client: ['client', 'לקוח', 'שם לקוח'],
        tools: ['tools', 'כלים', 'כלי עבודה', 'ציוד'],
        dailyPrice: ['dailyPrice', 'מחיר ליום', 'תעריף יומי', 'תעריף'],
        location: ['location', 'מקום', 'מקום עבודה', 'אתר'],
        operator: ['operator', 'מפעיל', 'עובד'],
        transportation: ['transportation', 'הובלה', 'שינוע'],
        transportationCost: ['transportationCost', 'מחיר הובלה', 'עלות הובלה', 'עלות שינוע'],
        notes: ['notes', 'הערות', 'הערה']
    };
    
    // מצא את המפתחות המתאימים מהכותרות של הקובץ
    const headers = Object.keys(parsedData[0] || {});
    const mappedFields = {};
    
    for (const field in fieldMappings) {
        const possibleNames = fieldMappings[field];
        const foundHeader = headers.find(header => 
            possibleNames.some(name => 
                header.trim().toLowerCase() === name.toLowerCase() ||
                header.trim().includes(name)
            )
        );
        
        if (foundHeader) {
            mappedFields[field] = foundHeader;
        }
    }
    
    console.log("מיפוי שדות:", mappedFields);
    
    // עבור על כל שורה ובנה הצעת מחיר
    parsedData.forEach((row, index) => {
        try {
            // וודא שיש מספיק נתונים בשורה
            if (Object.keys(row).length < 3) {
                console.warn(`שורה ${index + 1} לא מכילה מספיק נתונים, מדלג`);
                return;
            }
            
            // יצירת הצעת מחיר חדשה
            const quote = {
                id: (mappedFields.id && row[mappedFields.id]) || Date.now().toString() + index,
                date: mappedFields.date ? row[mappedFields.date] : '',
                client: mappedFields.client ? row[mappedFields.client] : '',
                tools: mappedFields.tools ? row[mappedFields.tools] : '',
                dailyPrice: mappedFields.dailyPrice ? row[mappedFields.dailyPrice] : '',
                location: mappedFields.location ? row[mappedFields.location] : '',
                operator: mappedFields.operator ? row[mappedFields.operator] : '',
                transportation: mappedFields.transportation ? row[mappedFields.transportation] : 'כן',
                transportationCost: mappedFields.transportationCost ? row[mappedFields.transportationCost] : '',
                notes: mappedFields.notes ? row[mappedFields.notes] : ''
            };
            
            // עיבוד תאריך אם הוא בפורמט שונה
            if (quote.date && quote.date.includes('/')) {
                const parts = quote.date.split('/');
                if (parts.length === 3) {
                    // הנחה שהפורמט הוא DD/MM/YYYY
                    const day = parts[0].padStart(2, '0');
                    const month = parts[1].padStart(2, '0');
                    let year = parts[2];
                    
                    // טיפול בשנה בפורמט 2 ספרות
                    if (year.length === 2) {
                        year = '20' + year;
                    }
                    
                    quote.date = `${year}-${month}-${day}`;
                }
            }
            
            // המר מספרים מטקסט למספר
            if (quote.dailyPrice) {
                quote.dailyPrice = quote.dailyPrice.toString().replace(/[^\d.-]/g, '');
            }
            
            if (quote.transportationCost) {
                quote.transportationCost = quote.transportationCost.toString().replace(/[^\d.-]/g, '');
            }
            
            // אימות נתונים בסיסיים
            if (!quote.date || !quote.client) {
                console.warn(`שורה ${index + 1} חסרים נתונים בסיסיים (תאריך או לקוח), מדלג`);
                return;
            }
            
            importedQuotes.push(quote);
        } catch (e) {
            console.error(`שגיאה בעיבוד שורה ${index + 1}:`, e);
        }
    });
    
    if (importedQuotes.length === 0) {
        alert('לא הצלחתי לייבא הצעות מחיר. וודא שהקובץ מכיל את העמודות הנדרשות: תאריך, לקוח');
        return;
    }
    
    // שמירת ההצעות לפי פעולת הייבוא שנבחרה
    if (importAction === 'merge') {
        // מיזוג עם הצעות קיימות
        const existingIds = quotes.map(quote => quote.id);
        importedQuotes.forEach(quote => {
            if (!existingIds.includes(quote.id)) {
                quotes.push(quote);
            }
        });
    } else {
        // החלפת הצעות קיימות
        quotes = importedQuotes;
    }
    
    // שמירה ב-localStorage
    localStorage.setItem('quotes', JSON.stringify(quotes));
    displayQuotes();
    
    alert(`יובאו ${importedQuotes.length} הצעות מחיר בהצלחה`);
}

// הגדלת והקטנת גופן
function changeFontSize(change) {
    // קבלת גודל הגופן הנוכחי
    let currentSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    
    // שינוי הגודל
    const newSize = currentSize + change;
    
    // הגבלת גודל מינימלי ומקסימלי
    if (newSize < 10) return;
    if (newSize > 24) return;
    
    // עדכון גודל הגופן
    document.documentElement.style.fontSize = newSize + 'px';
    
    // שמירת ההעדפה
    localStorage.setItem('fontSize', newSize);
    
    // עדכון תצוגת גודל נוכחי
    const fontSizeDisplay = document.getElementById('current-font-size');
    if (fontSizeDisplay) {
        fontSizeDisplay.textContent = newSize.toFixed(1);
    }
}

// אתחול גודל גופן בטעינת העמוד
function initFontSize() {
    const savedSize = localStorage.getItem('fontSize');
    if (savedSize) {
        document.documentElement.style.fontSize = savedSize + 'px';
        
        // עדכון תצוגת גודל נוכחי
        const fontSizeDisplay = document.getElementById('current-font-size');
        if (fontSizeDisplay) {
            fontSizeDisplay.textContent = parseFloat(savedSize).toFixed(1);
        }
    }
}

// הוספת האתחול לטעינת הדף
document.addEventListener('DOMContentLoaded', function() {
    // אתחול גודל גופן
    initFontSize();
    
    // בדיקה אם יש צורך להוסיף ספריית Papa Parse
    if (typeof Papa === 'undefined') {
        console.log("טוען ספריית Papa Parse");
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.0/papaparse.min.js';
        script.async = true;
        document.head.appendChild(script);
    }
});