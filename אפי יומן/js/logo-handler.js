/**
 * logo-handler.js
 * קובץ JavaScript לניהול לוגואים במערכת
 */

/**
 * פונקציה שטוענת את הלוגו הנכון לתצוגת הדפסה
 * @param {string} logoType - סוג הלוגו (default, client, quote, report)
 * @param {string} clientId - מזהה הלקוח (אופציונלי)
 */
function setLogoForPrinting(logoType = 'default', clientId = null) {
    // הנתיב הבסיסי לתיקיית התמונות
    const basePath = 'images/logos/';
    let logoPath = basePath + 'logo-default.png'; // לוגו ברירת מחדל
    
    // בדיקה אם יש לוגו בלוקל סטורג'
    const savedLogo = localStorage.getItem('logo-' + logoType);
    
    if (savedLogo) {
        // עדכן את כל תגי התמונה עם המחלקה print-logo-img
        const logoImages = document.querySelectorAll('.print-logo-img');
        logoImages.forEach(img => {
            img.src = savedLogo;
        });
        return;
    }
    
    // בחירת לוגו לפי סוג
    switch(logoType) {
        case 'client':
            // אם יש מזהה לקוח, בדוק אם יש לוגו ספציפי ללקוח
            if (clientId) {
                // בדוק אם יש לוגו ספציפי ללקוח במערכת
                const client = getClientById(clientId);
                if (client && client.hasCustomLogo) {
                    logoPath = basePath + 'client-' + clientId + '.png';
                }
            }
            break;
        case 'quote':
            logoPath = basePath + 'logo-quote.png';
            break;
        case 'report':
            logoPath = basePath + 'logo-report.png';
            break;
        case 'invoice':
            logoPath = basePath + 'logo-invoice.png';
            break;
    }
    
    // עדכן את כל תגי התמונה עם המחלקה print-logo-img
    const logoImages = document.querySelectorAll('.print-logo-img');
    logoImages.forEach(img => {
        img.src = logoPath;
        
        // בדוק אם התמונה קיימת, אם לא - השתמש בברירת מחדל
        img.onerror = function() {
            this.src = basePath + 'logo-default.png';
            this.onerror = null; // למנוע לולאה אינסופית
        };
    });
}

/**
 * פונקציה שמכינה את המסמך להדפסה עם הלוגו הנכון
 * @param {string} documentType - סוג המסמך (quote, report, worklog)
 * @param {string} entityId - מזהה הישות (למשל, מזהה הצעת מחיר)
 */
function preparePrintDocument(documentType, entityId = null) {
    let logoType = 'default';
    let clientId = null;
    
    // קבע את סוג הלוגו ומזהה הלקוח לפי סוג המסמך
    switch(documentType) {
        case 'quote':
            logoType = 'quote';
            // אם יש מזהה הצעת מחיר, קבל את מזהה הלקוח
            if (entityId) {
                const quote = getQuoteById(entityId);
                if (quote) {
                    clientId = quote.clientId;
                }
            }
            break;
        case 'report':
            logoType = 'report';
            // אם זה דוח ספציפי ללקוח, קבל את מזהה הלקוח
            const reportClient = document.getElementById('report-client').value;
            if (reportClient && reportClient !== '') {
                clientId = reportClient;
            }
            break;
        case 'worklog':
            logoType = 'default';
            // אם יש מזהה רישום עבודה, קבל את מזהה הלקוח
            if (entityId) {
                const worklog = getWorklogById(entityId);
                if (worklog) {
                    clientId = worklog.clientId;
                }
            }
            break;
    }
    
    // הגדר את הלוגו המתאים
    setLogoForPrinting(logoType, clientId);
    
    // פתח את חלון ההדפסה אחרי שהלוגו נטען
    setTimeout(() => {
        window.print();
    }, 200);
}

/**
 * פונקציה להעלאת לוגו חדש
 */
function uploadLogo() {
    const logoType = document.getElementById('logo-type').value;
    const logoFile = document.getElementById('logo-file').files[0];
    
    if (!logoFile) {
        alert('נא לבחור קובץ לוגו');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        // שמירה בדפדפן 
        localStorage.setItem('logo-' + logoType, e.target.result);
        
        // עדכון תצוגה מקדימה
        document.getElementById('logo-preview-img').src = e.target.result;
        
        alert('הלוגו נשמר בהצלחה!');
    };
    reader.readAsDataURL(logoFile);
}

/**
 * פונקציה לייצוא הגדרות לוגו
 */
function exportLogoSettings() {
    const settings = {};
    
    // איסוף כל הלוגואים השמורים
    const logoTypes = ['default', 'quote', 'report', 'invoice'];
    
    logoTypes.forEach(type => {
        const savedLogo = localStorage.getItem('logo-' + type);
        if (savedLogo) {
            settings[type] = savedLogo;
        }
    });
    
    // יצירת קובץ JSON להורדה
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(settings));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "logo-settings.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

/**
 * פונקציה לייבוא הגדרות לוגו
 */
function importLogoSettings(fileInput) {
    const file = fileInput.files[0];
    
    if (!file) {
        alert('נא לבחור קובץ הגדרות');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const settings = JSON.parse(e.target.result);
            
            // שמירת כל הלוגואים בלוקל סטורג'
            for (const type in settings) {
                localStorage.setItem('logo-' + type, settings[type]);
            }
            
            alert('הגדרות הלוגו יובאו בהצלחה!');
            
            // עדכון תצוגה מקדימה אם קיימת
            const logoPreview = document.getElementById('logo-preview-img');
            if (logoPreview) {
                const currentType = document.getElementById('logo-type').value;
                const savedLogo = localStorage.getItem('logo-' + currentType);
                if (savedLogo) {
                    logoPreview.src = savedLogo;
                }
            }
            
        } catch (error) {
            alert('שגיאה בקריאת הקובץ: ' + error.message);
        }
    };
    reader.readAsText(file);
}

// הגדרת מאזיני אירועים כאשר הדף נטען
document.addEventListener('DOMContentLoaded', function() {
    // טיפול בשינוי בבחירת סוג לוגו
    const logoTypeSelect = document.getElementById('logo-type');
    if (logoTypeSelect) {
        logoTypeSelect.addEventListener('change', function() {
            const logoType = this.value;
            const savedLogo = localStorage.getItem('logo-' + logoType);
            const logoPreview = document.getElementById('logo-preview-img');
            
            if (savedLogo && logoPreview) {
                logoPreview.src = savedLogo;
            } else if (logoPreview) {
                // אם אין לוגו שמור, הצג את ברירת המחדל
                logoPreview.src = 'images/logos/logo-default.png';
            }
        });
    }

    // טיפול בטעינת קובץ לוגו חדש לתצוגה מקדימה
    const logoFileInput = document.getElementById('logo-file');
    if (logoFileInput) {
        logoFileInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                const logoPreview = document.getElementById('logo-preview-img');
                
                if (logoPreview) {
                    reader.onload = function(e) {
                        logoPreview.src = e.target.result;
                    };
                    reader.readAsDataURL(this.files[0]);
                }
            }
        });
    }
});