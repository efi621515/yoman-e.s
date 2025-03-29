// מערכים גלובליים
let workLogs = [];
let quotes = [];
let clients = [];
let tools = [];
let locations = [];
let operators = [];

// פונקציית אתחול
function init() {
    console.log('מאתחל אפליקציה...');
    
    // טעינת נתונים מ-localStorage
    try {
        console.log('טוען נתונים מ-localStorage...');
        
        // טעינת נתונים עם בדיקות שגיאה
        try {
            workLogs = JSON.parse(localStorage.getItem('workLogs')) || [];
            console.log(`נטענו ${workLogs.length} רישומי עבודה`);
        } catch (e) {
            console.error('שגיאה בטעינת רישומי עבודה:', e);
            workLogs = [];
        }
        
        try {
            quotes = JSON.parse(localStorage.getItem('quotes')) || [];
            console.log(`נטענו ${quotes.length} הצעות מחיר`);
        } catch (e) {
            console.error('שגיאה בטעינת הצעות מחיר:', e);
            quotes = [];
        }
        
        try {
            clients = JSON.parse(localStorage.getItem('clients')) || [];
            console.log(`נטענו ${clients.length} לקוחות`);
        } catch (e) {
            console.error('שגיאה בטעינת לקוחות:', e);
            clients = [];
        }
        
        try {
            tools = JSON.parse(localStorage.getItem('tools')) || [];
            console.log(`נטענו ${tools.length} כלי עבודה`);
        } catch (e) {
            console.error('שגיאה בטעינת כלי עבודה:', e);
            tools = [];
        }
        
        try {
            locations = JSON.parse(localStorage.getItem('locations')) || [];
            console.log(`נטענו ${locations.length} מקומות עבודה`);
        } catch (e) {
            console.error('שגיאה בטעינת מקומות עבודה:', e);
            locations = [];
        }
        
        try {
            operators = JSON.parse(localStorage.getItem('operators')) || [];
            console.log(`נטענו ${operators.length} מפעילים`);
        } catch (e) {
            console.error('שגיאה בטעינת מפעילים:', e);
            operators = [];
        }
    } catch (e) {
        console.error('שגיאה כללית בטעינה מ-localStorage:', e);
        
        // אתחול מערכים ריקים במקרה של שגיאה
        workLogs = [];
        quotes = [];
        clients = [];
        tools = [];
        locations = [];
        operators = [];
    }
    
    // איתחול לשוניות
    showTab('daily-log');
    
    // הגדרת תאריך היום בשדות תאריך
    try {
        const today = new Date().toISOString().split('T')[0];
        const dateInputs = document.querySelectorAll('input[type="date"]');
        dateInputs.forEach(input => {
            if (!input.value) {
                input.value = today;
            }
        });
    } catch (e) {
        console.error('שגיאה באתחול שדות תאריך:', e);
    }
    
    // הצגת רשימות ואיתחול טפסים - עם בדיקות שגיאה
    try {
        if (typeof displayWorkLogs === 'function') {
            displayWorkLogs();
        } else {
            console.warn('פונקציית displayWorkLogs לא נמצאה');
        }
    } catch (e) {
        console.error('שגיאה בהצגת רישומי עבודה:', e);
    }
    
    try {
        if (typeof displayQuotes === 'function') {
            displayQuotes();
        } else {
            console.warn('פונקציית displayQuotes לא נמצאה');
        }
    } catch (e) {
        console.error('שגיאה בהצגת הצעות מחיר:', e);
    }
    
    try {
        if (typeof displayClients === 'function') {
            displayClients();
        } else {
            console.warn('פונקציית displayClients לא נמצאה');
        }
    } catch (e) {
        console.error('שגיאה בהצגת לקוחות:', e);
    }
    
    try {
        if (typeof displayTools === 'function') {
            displayTools();
        } else {
            console.warn('פונקציית displayTools לא נמצאה');
        }
    } catch (e) {
        console.error('שגיאה בהצגת כלי עבודה:', e);
    }
    
    try {
        if (typeof displayLocations === 'function') {
            displayLocations();
        } else {
            console.warn('פונקציית displayLocations לא נמצאה');
        }
    } catch (e) {
        console.error('שגיאה בהצגת מקומות עבודה:', e);
    }
    
    try {
        if (typeof displayOperators === 'function') {
            displayOperators();
        } else {
            console.warn('פונקציית displayOperators לא נמצאה');
        }
    } catch (e) {
        console.error('שגיאה בהצגת מפעילים:', e);
    }
    
    // איתחול רשימות נגללות - עם בדיקות שגיאה
    try {
        if (typeof populateClientDropdowns === 'function') {
            populateClientDropdowns();
        } else {
            console.warn('פונקציית populateClientDropdowns לא נמצאה');
        }
    } catch (e) {
        console.error('שגיאה באתחול רשימות לקוחות:', e);
    }
    
    try {
        if (typeof populateToolsDropdowns === 'function') {
            populateToolsDropdowns();
        } else {
            console.warn('פונקציית populateToolsDropdowns לא נמצאה');
        }
    } catch (e) {
        console.error('שגיאה באתחול רשימות כלי עבודה:', e);
    }
    
    try {
        if (typeof populateLocationDropdowns === 'function') {
            populateLocationDropdowns();
        } else {
            console.warn('פונקציית populateLocationDropdowns לא נמצאה');
        }
    } catch (e) {
        console.error('שגיאה באתחול רשימות מקומות עבודה:', e);
    }
    
    try {
        if (typeof populateOperatorDropdowns === 'function') {
            populateOperatorDropdowns();
        } else {
            console.warn('פונקציית populateOperatorDropdowns לא נמצאה');
        }
    } catch (e) {
        console.error('שגיאה באתחול רשימות מפעילים:', e);
    }
    
    // איתחול התראות תחזוקה
    try {
        if (typeof updateMaintenanceAlerts === 'function') {
            updateMaintenanceAlerts();
        } else {
            console.warn('פונקציית updateMaintenanceAlerts לא נמצאה');
        }
    } catch (e) {
        console.error('שגיאה באתחול התראות תחזוקה:', e);
    }
    
    // איתחול דוחות
    try {
        if (typeof initReports === 'function') {
            initReports();
        } else {
            console.warn('פונקציית initReports לא נמצאה');
        }
    } catch (e) {
        console.error('שגיאה באתחול דוחות:', e);
    }
    
    console.log('האפליקציה אותחלה בהצלחה');
}

// פונקציה מוגנת לשמירת נתונים ב-localStorage
function safeLocalStorageSave(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (e) {
        console.error(`שגיאה בשמירת נתונים ל-${key}:`, e);
        alert(`שגיאה בשמירת נתונים: ${e.message}\nייתכן שמקום האחסון המקומי מלא או לא זמין.`);
        return false;
    }
}

// פונקציה לפתיחת טאבים - חסרה בקוד המקורי
function showTab(tabId) {
    // הסרת המחלקה 'active' מכל הטאבים והתוכן
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // הוספת המחלקה 'active' לטאב הנבחר ולתוכן שלו
    const selectedTab = document.querySelector(`.tab[onclick="showTab('${tabId}')"]`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    const selectedContent = document.getElementById(tabId);
    if (selectedContent) {
        selectedContent.classList.add('active');
    }
}

// פונקציה לפורמט תאריך
function formatDate(dateStr) {
    if (!dateStr) return '-';
    
    try {
        const parts = dateStr.split('-');
        if (parts.length !== 3) return dateStr;
        
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    } catch (e) {
        console.error('שגיאה בפורמט תאריך:', e);
        return dateStr;
    }
}

// אתחול אפליקציה בטעינת העמוד
document.addEventListener('DOMContentLoaded', function() {
    init();
    // עדכון פונקציית showTab לאתחול מודול תעודות משלוח
function showTab(tabId) {
    // הסרת המחלקה 'active' מכל הטאבים והתוכן
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // הוספת המחלקה 'active' לטאב הנבחר ולתוכן שלו
    const selectedTab = document.querySelector(`.tab[onclick="showTab('${tabId}')"]`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    const selectedContent = document.getElementById(tabId);
    if (selectedContent) {
        selectedContent.classList.add('active');
    }
    
    // אתחול מודולים ספציפיים לפי לשונית
    if (tabId === 'delivery-notes') {
        if (typeof loadDeliveryNotes === 'function') {
            loadDeliveryNotes();
            
            // אתחול אירועים לכפתורים
            const addItemButton = document.getElementById('add-item-btn');
            if (addItemButton) {
                addItemButton.onclick = addNewItemRow;
            }
            
            // איתחול טבלת מוצרים אם ריקה
            const itemsTable = document.querySelector('#delivery-items-table tbody');
            if (itemsTable && itemsTable.children.length === 0) {
                resetItemsTable();
            }
        }
    }
}
});