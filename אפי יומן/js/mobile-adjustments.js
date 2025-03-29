// התאמות JavaScript למכשירים ניידים

// בדיקה אם המכשיר הוא נייד
function isMobileDevice() {
    return (window.innerWidth <= 768);
}

// הוספת התאמות מובייל בזמן טעינת העמוד
document.addEventListener('DOMContentLoaded', function() {
    // בודק אם המכשיר הוא נייד
    if (isMobileDevice()) {
        setupMobileNavigation();
        enhanceMobileTables();
        adjustFormsForMobile();
    }
    
    // הוספת טיפול באירוע שינוי גודל מסך
    window.addEventListener('resize', function() {
        if (isMobileDevice()) {
            setupMobileNavigation();
            enhanceMobileTables();
        }
    });
});

// הוספת ניווט משופר למובייל
function setupMobileNavigation() {
    // בדיקה אם כבר קיים תפריט ניווט למובייל
    if (document.querySelector('.mobile-nav-menu')) {
        return;
    }
    
    // הוספת כפתור לתפריט אקורדיון
    const menuToggle = document.createElement('button');
    menuToggle.className = 'mobile-menu-toggle';
    menuToggle.textContent = 'תפריט ניווט';
    menuToggle.addEventListener('click', function() {
        const tabsContainer = document.querySelector('.mobile-tabs-container');
        tabsContainer.classList.toggle('open');
    });
    
    // יצירת קונטיינר לתפריט אקורדיון
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'mobile-tabs-container';
    
    // העברת הלשוניות הקיימות לתפריט החדש
    const originalTabs = document.querySelector('.tabs');
    if (originalTabs) {
        tabsContainer.appendChild(originalTabs.cloneNode(true));
        
        // הוספת מאזיני אירועים חדשים ללשוניות
        const newTabs = tabsContainer.querySelectorAll('.tab');
        newTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const targetId = this.getAttribute('onclick').match(/'(.*?)'/)[1];
                showTab(targetId);
                tabsContainer.classList.remove('open');
            });
        });
    }
    
    // הוספת תפריט מהיר קבוע בתחתית המסך
    const mobileNav = document.createElement('div');
    mobileNav.className = 'mobile-nav-menu';
    
    // הוספת פריטי ניווט מרכזיים
    const mainNavItems = [
        { id: 'daily-log', label: 'עבודה', icon: '📝' },
        { id: 'quotes', label: 'הצעות', icon: '💰' },
        { id: 'clients', label: 'לקוחות', icon: '👥' },
        { id: 'tools', label: 'כלים', icon: '🔧' },
        { id: 'calendar', label: 'יומן', icon: '📅' }
    ];
    
    mainNavItems.forEach(item => {
        const navItem = document.createElement('div');
        navItem.className = 'mobile-nav-item';
        navItem.setAttribute('onclick', `showTab('${item.id}')`);
        
        const icon = document.createElement('span');
        icon.className = 'mobile-nav-icon';
        icon.textContent = item.icon;
        
        const label = document.createElement('div');
        label.textContent = item.label;
        
        navItem.appendChild(icon);
        navItem.appendChild(label);
        mobileNav.appendChild(navItem);
    });
    
    // הוספת התפריטים לעמוד
    const container = document.querySelector('.container');
    container.insertBefore(menuToggle, container.firstChild);
    container.insertBefore(tabsContainer, container.children[1]);
    document.body.appendChild(mobileNav);
    
    // הסתרת התפריט המקורי
    if (originalTabs) {
        originalTabs.style.display = 'none';
    }
}

// שיפור טבלאות למובייל
function enhanceMobileTables() {
    const tables = document.querySelectorAll('table:not(.items-table)');
    
    tables.forEach(table => {
        // הוספת מחלקת responsive-table רק אם עוד לא נוספה
        if (!table.classList.contains('responsive-table')) {
            table.classList.add('responsive-table');
            
            // הוספת תוויות לתאים בהתבסס על כותרות העמודות
            const headerCells = table.querySelectorAll('thead th');
            const headerTexts = Array.from(headerCells).map(th => th.textContent.trim());
            
            const rows = table.querySelectorAll('tbody tr');
            rows.forEach(row => {
                const cells = row.querySelectorAll('td');
                cells.forEach((cell, index) => {
                    if (index < headerTexts.length) {
                        cell.setAttribute('data-label', headerTexts[index]);
                    }
                });
            });
        }
    });
}

// התאמות נוספות לטפסים במובייל
function adjustFormsForMobile() {
    // התאמת גודל כפתורים בטפסים
    const formButtons = document.querySelectorAll('.form-container button');
    formButtons.forEach(button => {
        button.style.fontSize = '16px';
        button.style.padding = '12px';
    });
    
    // הגדרת מקלדת מספרית לשדות מספריים
    const numberInputs = document.querySelectorAll('input[type="number"]');
    numberInputs.forEach(input => {
        input.setAttribute('inputmode', 'numeric');
    });
    
    // הגדרת מקלדת טלפון לשדות טלפון
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
        input.setAttribute('inputmode', 'tel');
    });
}

// פונקציה לתמיכה בשמירת הגדרות בזמן התנתקות מהאפליקציה
function saveMobileAppState() {
    // שמירת הלשונית הנוכחית
    const activeTab = document.querySelector('.tab-content.active');
    if (activeTab) {
        localStorage.setItem('lastActiveTab', activeTab.id);
    }
    
    // שמירת מידע נוסף על מצב האפליקציה
    // ...
}

// שחזור מצב האפליקציה בעת טעינה מחדש
function restoreMobileAppState() {
    const lastActiveTab = localStorage.getItem('lastActiveTab');
    if (lastActiveTab) {
        showTab(lastActiveTab);
    }
}

// עדכון מצב האפליקציה בזמן סגירה/מעבר מהאפליקציה
window.addEventListener('beforeunload', saveMobileAppState);

// שחזור מצב האפליקציה בזמן טעינה
document.addEventListener('DOMContentLoaded', restoreMobileAppState);