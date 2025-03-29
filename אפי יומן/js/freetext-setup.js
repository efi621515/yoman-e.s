/**
 * data-processing-updates.js
 * קובץ זה מכיל עדכונים לפונקציות עיבוד נתונים כדי לתמוך בטקסט חופשי בשדות
 */

// פונקציה לעדכון החיפוש של רישומי עבודה
function updateWorkLogSearch() {
    console.log('מעדכן חיפוש רישומי עבודה לתמיכה בטקסט חופשי...');
    
    // שמירת הפונקציה המקורית
    if (typeof searchWorkLogs === 'function') {
        const originalSearchWorkLogs = searchWorkLogs;
        
        // החלפת הפונקציה המקורית בגרסה משופרת
        window.searchWorkLogs = function() {
            console.log('משתמש בפונקציית חיפוש רישום עבודה מעודכנת');
            
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
            
            // עדכון לתמיכה בחיפוש חלקי של שם לקוח (במקום התאמה מדויקת)
            if (client) {
                filteredLogs = filteredLogs.filter(log => {
                    if (!log.client) return false;
                    // בדיקה חלקית ומקל על זיהוי טקסט
                    return log.client.toLowerCase().includes(client.toLowerCase()) || 
                           client.toLowerCase().includes(log.client.toLowerCase());
                });
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
        };
    }
}

// פונקציה לעדכון חיפוש הצעות מחיר
function updateQuoteSearch() {
    console.log('מעדכן חיפוש הצעות מחיר לתמיכה בטקסט חופשי...');
    
    if (typeof searchQuotes === 'function') {
        const originalSearchQuotes = searchQuotes;
        
        window.searchQuotes = function() {
            console.log('משתמש בפונקציית חיפוש הצעות מחיר מעודכנת');
            
            const client = document.getElementById('search-quote-client').value;
            const dateFrom = document.getElementById('search-quote-date-from').value;
            const dateTo = document.getElementById('search-quote-date-to').value;
            
            let filteredQuotes = quotes;
            
            // עדכון לתמיכה בחיפוש חלקי של שם לקוח
            if (client) {
                filteredQuotes = filteredQuotes.filter(quote => {
                    if (!quote.client) return false;
                    return quote.client.toLowerCase().includes(client.toLowerCase()) || 
                           client.toLowerCase().includes(quote.client.toLowerCase());
                });
            }
            
            if (dateFrom) {
                filteredQuotes = filteredQuotes.filter(quote => 
                    quote.date >= dateFrom
                );
            }
            
            if (dateTo) {
                filteredQuotes = filteredQuotes.filter(quote => 
                    quote.date <= dateTo
                );
            }
            
            // עדכון התצוגה
            displayQuotes(filteredQuotes);
        };
    }
}

// פונקציה לעדכון חיפוש תעודות משלוח
function updateDeliverySearch() {
    console.log('מעדכן חיפוש תעודות משלוח לתמיכה בטקסט חופשי...');
    
    if (typeof searchDeliveryNotes === 'function') {
        const originalSearchDelivery = searchDeliveryNotes;
        
        window.searchDeliveryNotes = function() {
            console.log('משתמש בפונקציית חיפוש תעודות משלוח מעודכנת');
            
            const clientFilter = document.getElementById('search-delivery-client').value;
            const dateFromFilter = document.getElementById('search-delivery-date-from').value;
            const dateToFilter = document.getElementById('search-delivery-date-to').value;
            
            // סינון לפי הקריטריונים
            let filteredNotes = [...deliveryNotes];
            
            if (clientFilter) {
                filteredNotes = filteredNotes.filter(note => {
                    if (!note.client) return false;
                    return note.client.toLowerCase().includes(clientFilter.toLowerCase()) || 
                           clientFilter.toLowerCase().includes(note.client.toLowerCase());
                });
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
            
            // הצגת התוצאות המסוננות בטבלה
            const tableBody = document.getElementById('delivery-notes-table').querySelector('tbody');
            
            // המשך מימוש כמו בפונקציה המקורית
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
            
            // הצג את הרשומות המסוננות
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
        };
    }
}

// פונקציה לעדכון חיפוש לקוחות
function updateClientSearch() {
    console.log('מעדכן חיפוש לקוחות לתמיכה בטקסט חופשי...');
    
    if (typeof searchClients === 'function') {
        const originalSearchClients = searchClients;
        
        window.searchClients = function() {
            const searchText = document.getElementById('search-client-text').value.toLowerCase();
            
            if (!searchText) {
                displayClients();
                return;
            }
            
            // חיפוש גמיש יותר עבור כל שדות הלקוח
            const filteredClients = clients.filter(client => 
                (client.name && client.name.toLowerCase().includes(searchText)) ||
                (client.phone && client.phone.toLowerCase().includes(searchText)) ||
                (client.email && client.email.toLowerCase().includes(searchText)) ||
                (client.address && client.address.toLowerCase().includes(searchText))
            );
            
            displayFilteredClients(filteredClients);
        };
    }
}

// פונקציה לעדכון חיפוש כלי עבודה
function updateToolsSearch() {
    console.log('מעדכן חיפוש כלי עבודה לתמיכה בטקסט חופשי...');
    
    if (typeof searchTools === 'function') {
        const originalSearchTools = searchTools;
        
        window.searchTools = function() {
            const searchText = document.getElementById('search-tool-text').value.toLowerCase();
            const filterValue = document.getElementById('tool-filter').value;
            
            let filteredTools = tools || [];
            
            // סינון לפי סטטוס
            if (filterValue !== 'all') {
                filteredTools = filteredTools.filter(tool => tool.status === filterValue);
            }
            
            // חיפוש גמיש יותר
            if (searchText) {
                filteredTools = filteredTools.filter(tool => 
                    (tool.name && tool.name.toLowerCase().includes(searchText)) ||
                    (tool.type && tool.type.toLowerCase().includes(searchText)) ||
                    (tool.location && tool.location.toLowerCase().includes(searchText)) ||
                    (tool.serialNumber && tool.serialNumber.toLowerCase().includes(searchText))
                );
            } else if (!filterValue || filterValue === 'all') {
                // אם אין פילטרים, הצג הכל
                displayTools();
                return;
            }
            
            displayTools(filteredTools);
        };
    }
}

// פונקציה לעדכון חיפוש מפעילים
function updateOperatorSearch() {
    console.log('מעדכן חיפוש מפעילים לתמיכה בטקסט חופשי...');
    
    if (typeof searchOperators === 'function') {
        const originalSearchOperators = searchOperators;
        
        window.searchOperators = function() {
            const searchText = document.getElementById('search-operator-text').value.toLowerCase();
            
            if (!searchText) {
                displayOperators();
                return;
            }
            
            // חיפוש גמיש יותר
            const filteredOperators = operators.filter(operator => 
                (operator.name && operator.name.toLowerCase().includes(searchText)) ||
                (operator.phone && operator.phone.toLowerCase().includes(searchText)) ||
                (operator.email && operator.email.toLowerCase().includes(searchText)) ||
                (operator.license && operator.license.toLowerCase().includes(searchText))
            );
            
            displayOperators(filteredOperators);
        };
    }
}

// פונקציה לעדכון חיפוש מקומות עבודה
function updateLocationSearch() {
    console.log('מעדכן חיפוש מקומות עבודה לתמיכה בטקסט חופשי...');
    
    if (typeof searchLocations === 'function') {
        const originalSearchLocations = searchLocations;
        
        window.searchLocations = function() {
            const searchText = document.getElementById('search-location-text').value.toLowerCase();
            
            if (!searchText) {
                displayLocations();
                return;
            }
            
            // חיפוש גמיש יותר
            const filteredLocations = locations.filter(location => 
                (location.name && location.name.toLowerCase().includes(searchText)) ||
                (location.city && location.city.toLowerCase().includes(searchText)) ||
                (location.address && location.address.toLowerCase().includes(searchText)) ||
                (location.contact && location.contact.toLowerCase().includes(searchText))
            );
            
            displayLocations(filteredLocations);
        };
    }
}

// פונקציה ראשית לעדכון כל פונקציות החיפוש והסינון
function updateAllSearchFunctions() {
    console.log('מעדכן את כל פונקציות החיפוש והסינון...');
    
    updateWorkLogSearch();
    updateQuoteSearch();
    updateDeliverySearch();
    updateClientSearch();
    updateToolsSearch();
    updateOperatorSearch();
    updateLocationSearch();
    
    console.log('כל פונקציות החיפוש והסינון עודכנו בהצלחה!');
}

// הרץ את כל העדכונים כשהמסמך טעון
document.addEventListener('DOMContentLoaded', function() {
    // מפעיל את העדכונים אחרי 1 שניה לתת לשאר הקוד להיטען
    setTimeout(updateAllSearchFunctions, 1000);
});