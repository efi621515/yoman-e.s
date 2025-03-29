/**
 * form-enhancements.js
 * קובץ זה כולל פונקציות לשיפור טפסים ואפשור הזנת טקסט חופשי בשדות שונים
 */

// פונקציה להוספת אפשרות טקסט חופשי לתיבות בחירה
function enhanceSelectFields() {
    console.log('מוסיף אפשרות טקסט חופשי לתיבות בחירה...');
    
    // רשימת כל אלמנטי בחירה שצריכים תמיכה בטקסט חופשי
    const allSelects = {
        // רישום עבודה יומי
        'log-client': "בחר או הזן שם לקוח",
        'log-location': "בחר או הזן מקום עבודה",
        'log-tools': "בחר או הזן כלי עבודה",
        'log-operator': "בחר או הזן שם מפעיל",
        
        // הצעות מחיר
        'quote-client': "בחר או הזן שם לקוח",
        'quote-location': "בחר או הזן מקום עבודה",
        'quote-tools': "בחר או הזן כלי עבודה",
        'quote-operator': "בחר או הזן שם מפעיל",
        
        // תעודות משלוח
        'delivery-client': "בחר או הזן שם לקוח",
        'delivery-location': "בחר או הזן מקום",
        'delivery-destination': "הזן יעד",
        
        // אירועי לוח שנה
        'event-client': "בחר או הזן שם לקוח",
        'event-location': "בחר או הזן מקום עבודה",
        'event-tools': "בחר או הזן כלי עבודה",
        'event-operator': "בחר או הזן שם מפעיל",
        
        // חיפוש
        'search-client': "כל הלקוחות או הזן לחיפוש",
        'search-quote-client': "כל הלקוחות או הזן לחיפוש",
        'search-delivery-client': "כל הלקוחות או הזן לחיפוש",
        'filter-clients': "כל הלקוחות",
        'filter-tools': "כל הכלים",
        
        // דוחות
        'report-client': "כל הלקוחות או הזן שם לקוח",
        'report-operator': "כל המפעילים או הזן שם מפעיל",
        'report-location': "כל המקומות או הזן מקום עבודה"
    };
    
    // הפוך כל תיבת בחירה לשדה שמשלב רשימת בחירה עם אפשרות לטקסט חופשי
    for (const selectId in allSelects) {
        transformSelectToCombo(selectId, allSelects[selectId]);
    }
    
    // הפוך שדות מחיר לקבל גם טקסט
    convertPriceFieldsToText();
}

// פונקציה להמרת תיבת בחירה לשדה משולב (תיבת בחירה + טקסט חופשי)
function transformSelectToCombo(selectId, placeholder) {
    const select = document.getElementById(selectId);
    if (!select) {
        console.log(`שדה עם מזהה ${selectId} לא נמצא, מדלג...`);
        return;
    }
    
    console.log(`מעדכן שדה ${selectId}...`);
    
    // שמור את האלמנט ההורה והסגנון של התיבה המקורית
    const parentElement = select.parentElement;
    const selectClassName = select.className;
    
    // שמור את האפשרות הנבחרת הנוכחית
    const currentValue = select.value;
    
    // שמור את כל האפשרויות הקיימות
    const options = [];
    for (let i = 0; i < select.options.length; i++) {
        options.push({
            value: select.options[i].value,
            text: select.options[i].text
        });
    }
    
    // צור אלמנט של רשימת datalist שיכיל את האופציות
    const dataListId = `${selectId}-list`;
    let dataList = document.getElementById(dataListId);
    
    if (!dataList) {
        dataList = document.createElement('datalist');
        dataList.id = dataListId;
        document.body.appendChild(dataList);
    } else {
        dataList.innerHTML = '';
    }
    
    // הוסף את האופציות לרשימה
    options.forEach(option => {
        if (option.value) { // אל תכלול אופציות ריקות
            const optionElement = document.createElement('option');
            optionElement.value = option.text;
            dataList.appendChild(optionElement);
        }
    });
    
    // צור שדה טקסט שיחליף את תיבת הבחירה
    const input = document.createElement('input');
    input.type = 'text';
    input.id = selectId;
    input.className = selectClassName;
    input.setAttribute('list', dataListId);
    input.placeholder = placeholder;
    input.value = currentValue;
    
    // החלף את תיבת הבחירה בשדה הטקסט
    parentElement.replaceChild(input, select);
    
    console.log(`השדה ${selectId} הוחלף בהצלחה.`);
}

// המרת שדות מחיר לקבל גם טקסט
function convertPriceFieldsToText() {
    const priceFields = [
        // רישום עבודה
        'log-daily-price', 'log-transportation-cost',
        
        // הצעות מחיר
        'quote-daily-price', 'quote-transportation-cost',
        
        // אירועי לוח שנה
        'event-daily-price', 'event-transportation-cost',
        
        // כלי עבודה
        'tool-purchase-price', 
        
        // תחזוקה
        'maintenance-cost',
        
        // תעודות משלוח - שדות מחיר בטבלת פריטים
        // מטופל בנפרד דרך מאזין אירועים להוספת שורה
    ];
    
    priceFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            console.log(`ממיר שדה מחיר ${fieldId} לטקסט...`);
            
            // שינוי סוג השדה מ-number ל-text
            field.type = 'text';
            
            // הסרת מגבלות מספריות
            field.removeAttribute('min');
            
            // עדכון placeholder
            field.placeholder = "הזן מחיר או טקסט";
            
            // הוספת מחלקת CSS לסימון שדה מחיר טקסטואלי
            field.classList.add('price-text-field');
        } else {
            console.log(`שדה מחיר ${fieldId} לא נמצא, מדלג...`);
        }
    });
    
    // טיפול בשדות מחיר בתעודות משלוח
    setupDeliveryItemsListener();
}

// הוספת מאזין אירועים להוספת שורות פריטים בתעודות משלוח
function setupDeliveryItemsListener() {
    // מאזין לכפתור הוספת פריט בתעודות משלוח
    const addItemBtn = document.getElementById('add-item-btn');
    if (addItemBtn) {
        console.log('מגדיר מאזין לכפתור הוספת שורת פריט...');
        
        // שמירת הפונקציה המקורית
        const originalAddItemRow = addItemBtn.onclick || function() {
            if (typeof addNewItemRow === 'function') {
                addNewItemRow();
            }
        };
        
        // החלפת הפונקציה בגרסה משופרת
        addItemBtn.onclick = function() {
            // קריאה לפונקציה המקורית
            if (typeof originalAddItemRow === 'function') {
                originalAddItemRow();
            }
            
            // עדכון השדות בשורה החדשה
            const rows = document.querySelectorAll('#delivery-items-table tbody tr');
            const lastRow = rows[rows.length - 1];
            
            if (lastRow) {
                const priceInput = lastRow.querySelector('input.item-price');
                if (priceInput && priceInput.type === 'number') {
                    priceInput.type = 'text';
                    priceInput.removeAttribute('min');
                    priceInput.placeholder = "הזן מחיר או טקסט";
                    priceInput.classList.add('price-text-field');
                }
            }
        };
    }
    
    // עדכון שדות מחיר בטבלאות קיימות
    updateExistingPriceFields();
}

// עדכון שדות מחיר בטבלאות פריטים קיימות
function updateExistingPriceFields() {
    // מצא את כל שדות המחיר בטבלאות פריטים
    const priceInputs = document.querySelectorAll('input.item-price');
    
    priceInputs.forEach(input => {
        if (input.type === 'number') {
            input.type = 'text';
            input.removeAttribute('min');
            input.placeholder = "הזן מחיר או טקסט";
            input.classList.add('price-text-field');
        }
    });
}

// פונקציה לעדכון קוד שמירת הנתונים כדי לתמוך בטקסט חופשי
function updateSaveFunctions() {
    console.log('מעדכן פונקציות שמירה לתמיכה בטקסט חופשי...');
    
    // אין צורך לעדכן את פונקציות השמירה כי הן כבר אוספות את הערכים כטקסט
    // וההמרה של שדות המתרחשת ברמת ה-DOM
    
    // לוגיקת הצגה/הדפסה צריכה להתנהג בהתאם לערכים טקסטואליים
    updateDisplayFunctions();
}

// פונקציה לעדכון פונקציות הצגה והדפסה
function updateDisplayFunctions() {
    console.log('מעדכן פונקציות הצגה והדפסה לתמיכה בטקסט חופשי...');
    
    // עדכון פונקציית תצוגת לוגים (אם קיימת)
    if (typeof displayWorkLogs === 'function') {
        const originalDisplayWorkLogs = displayWorkLogs;
        
        window.displayWorkLogs = function(logsToDisplay) {
            console.log('משתמש בפונקציית תצוגת רישומי עבודה מעודכנת');
            
            // שימוש בפונקציה המקורית כי היא כבר מציגה ערכים כמחרוזות
            return originalDisplayWorkLogs.apply(this, arguments);
        };
    }
    
    // עדכון פונקציית תצוגת הצעות מחיר (אם קיימת)
    if (typeof displayQuotes === 'function') {
        const originalDisplayQuotes = displayQuotes;
        
        window.displayQuotes = function(quotesToDisplay) {
            console.log('משתמש בפונקציית תצוגת הצעות מחיר מעודכנת');
            
            // שימוש בפונקציה המקורית כי היא כבר מציגה ערכים כמחרוזות
            return originalDisplayQuotes.apply(this, arguments);
        };
    }
}

// הוספת סגנונות CSS דינמיים לשיפור התצוגה של שדות תמיכה בטקסט חופשי
function addDynamicStyles() {
    console.log('מוסיף סגנונות CSS לשדות טקסט חופשי...');
    
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        /* סגנונות לשדות טקסט חופשי */
        .price-text-field {
            direction: rtl;
            text-align: right;
            font-family: 'Heebo', 'Segoe UI', Arial, sans-serif;
        }
        
        /* הדגשת שדות שהומרו לטקסט חופשי */
        input[list] {
            background-color: #f7fffa;
            border-color: #4CAF50;
        }
        
        input[list]:focus {
            box-shadow: 0 0 5px rgba(76, 175, 80, 0.3);
        }
        
        /* טיפ חזותי להצעות */
        input[list]::after {
            content: '🔍';
            position: absolute;
            left: 10px;
            top: 50%;
            transform: translateY(-50%);
            color: #ccc;
            pointer-events: none;
        }
    `;
    
    document.head.appendChild(styleElement);
}

// פונקציה ראשית לעדכון כל הטפסים
function enhanceForms() {
    console.log('מתחיל לשפר טפסים לתמיכה בטקסט חופשי...');
    
    // הוסף סגנונות דינמיים
    addDynamicStyles();
    
    // הוסף אפשרות טקסט חופשי לתיבות בחירה
    enhanceSelectFields();
    
    // עדכן פונקציות שמירה ותצוגה
    updateSaveFunctions();
    
    console.log('שיפור טפסים הושלם בהצלחה!');
}

// הוסף האזנה לטעינת הדף כדי להפעיל את השיפורים
document.addEventListener('DOMContentLoaded', function() {
    // הפעל את השיפורים לאחר 500 מילישניות כדי לתת לשאר הקוד להיטען
    setTimeout(enhanceForms, 500);
});