// אתחול יומן התזכורות
function initRemindersSystem() {
    console.log('מאתחל מערכת תזכורות...');
    
    // הוספת לשונית תזכורות לתפריט הניווט אם אינה קיימת
    const tabs = document.querySelector('.tabs');
    
    if (tabs && !document.querySelector('.tab[onclick="showTab(\'reminders\')"]')) {
        // יצירת לשונית תזכורות חדשה
        const reminderTab = document.createElement('div');
        reminderTab.className = 'tab';
        reminderTab.onclick = function() { showTab('reminders'); };
        reminderTab.textContent = 'תזכורות';
        
        // הוספת הלשונית לפני לשונית לוח שנה
        const calendarTab = document.querySelector('.tab[onclick="showTab(\'calendar\')"]');
        if (calendarTab) {
            tabs.insertBefore(reminderTab, calendarTab);
        } else {
            tabs.appendChild(reminderTab);
        }
    }
    
    // אתחול לוח השנה של התזכורות
    initReminderCalendar();
    
    // הצגת רשימת התזכורות
    displayReminders();
    
    // הוספת אתחול כפתורי גופן
    initFontSizeControls();
    
    // אתחול בדיקה תקופתית לתזכורות
    checkForDueReminders();
}

// אתחול לוח השנה של התזכורות
function initReminderCalendar() {
    const calendarEl = document.getElementById('reminder-calendar');
    if (!calendarEl) {
        console.error('אלמנט reminder-calendar לא נמצא');
        return;
    }
    
    const reminderCalendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        direction: 'rtl',
        locale: 'he',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
        },
        buttonText: {
            today: 'היום',
            month: 'חודש',
            week: 'שבוע',
            day: 'יום',
            list: 'רשימה'
        },
        dayMaxEvents: true,
        navLinks: true,
        editable: true,
        selectable: true,
        nowIndicator: true,
        events: function(fetchInfo, successCallback) {
            // קבלת התזכורות מ-localStorage
            const reminders = JSON.parse(localStorage.getItem('reminders') || '[]');
            
            // המרה לפורמט אירועים
            const events = reminders.map(reminder => {
                const eventColor = {
                    'high': '#f44336',
                    'normal': '#ff9800',
                    'low': '#4CAF50'
                }[reminder.priority || 'normal'];
                
                return {
                    id: 'reminder-' + reminder.id,
                    title: `⏰ ${reminder.title}`,
                    start: reminder.time
                        ? `${reminder.date}T${reminder.time}:00`
                        : reminder.date,
                    allDay: !reminder.time,
                    backgroundColor: eventColor,
                    borderColor: eventColor,
                    textColor: 'white',
                    className: reminder.completed ? 'completed-event' : '',
                    extendedProps: {
                        type: 'reminder',
                        description: reminder.description,
                        priority: reminder.priority,
                        completed: reminder.completed
                    }
                };
            });
            
            successCallback(events);
        },
        eventClick: function(info) {
            // הצגת פרטי התזכורת
            const reminderId = info.event.id.replace('reminder-', '');
            showReminderDetails(reminderId);
        },
        dateClick: function(info) {
            // פתיחת טופס תזכורת חדשה עם התאריך שנבחר
            document.getElementById('reminder-date').value = info.dateStr;
            document.getElementById('reminder-id').value = '';
            document.getElementById('reminder-title').value = '';
            document.getElementById('reminder-time').value = '';
            document.getElementById('reminder-description').value = '';
            document.getElementById('reminder-priority').value = 'normal';
            document.getElementById('add-reminder-btn').textContent = 'הוסף תזכורת';
            
            // גלילה לטופס
            document.getElementById('reminder-form').scrollIntoView({ behavior: 'smooth' });
        },
        eventDrop: function(info) {
            // עדכון תאריך התזכורת כאשר גוררים אותה
            const reminderId = info.event.id.replace('reminder-', '');
            const newDate = info.event.start.toISOString().split('T')[0];
            
            updateReminderDate(reminderId, newDate);
        }
    });
    
    reminderCalendar.render();
    
    // שמירת הלוח באובייקט גלובלי לשימוש מאוחר יותר
    window.reminderCalendar = reminderCalendar;
}

// הוספת תזכורת חדשה
function addReminder() {
    const reminderDate = document.getElementById('reminder-date').value;
    const reminderTime = document.getElementById('reminder-time').value;
    const reminderTitle = document.getElementById('reminder-title').value;
    const reminderDescription = document.getElementById('reminder-description').value;
    const reminderPriority = document.getElementById('reminder-priority').value;
    const reminderId = document.getElementById('reminder-id').value;
    
    if (!reminderDate || !reminderTitle) {
        alert('נא למלא לפחות תאריך וכותרת');
        return;
    }
    
    // קבלת התזכורות הקיימות
    const reminders = JSON.parse(localStorage.getItem('reminders') || '[]');
    
    if (reminderId) {
        // עדכון תזכורת קיימת
        const index = reminders.findIndex(r => r.id === reminderId);
        if (index !== -1) {
            reminders[index] = {
                ...reminders[index],
                date: reminderDate,
                time: reminderTime,
                title: reminderTitle,
                description: reminderDescription,
                priority: reminderPriority
            };
        }
    } else {
        // יצירת תזכורת חדשה
        const reminder = {
            id: Date.now().toString(),
            date: reminderDate,
            time: reminderTime || '',
            title: reminderTitle,
            description: reminderDescription,
            priority: reminderPriority,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        // הוספה למערך התזכורות
        reminders.push(reminder);
    }
    
    // שמירה ב-localStorage
    localStorage.setItem('reminders', JSON.stringify(reminders));
    
    // עדכון התצוגה
    displayReminders();
    
    // עדכון לוח השנה
    if (window.reminderCalendar) {
        window.reminderCalendar.refetchEvents();
    }
    
    // ניקוי הטופס
    document.getElementById('reminder-id').value = '';
    document.getElementById('reminder-date').value = '';
    document.getElementById('reminder-time').value = '';
    document.getElementById('reminder-title').value = '';
    document.getElementById('reminder-description').value = '';
    document.getElementById('reminder-priority').value = 'normal';
    document.getElementById('add-reminder-btn').textContent = 'הוסף תזכורת';
    
    alert('התזכורת ' + (reminderId ? 'עודכנה' : 'נוספה') + ' בהצלחה');
    
    // עדכון לוח השנה הראשי אם זמין
    if (typeof calendar !== 'undefined' && calendar) {
        calendar.refetchEvents();
    }
}

// עדכון תאריך תזכורת
function updateReminderDate(id, newDate) {
    const reminders = JSON.parse(localStorage.getItem('reminders') || '[]');
    const index = reminders.findIndex(reminder => reminder.id === id);
    
    if (index !== -1) {
        reminders[index].date = newDate;
        
        // שמירה ב-localStorage
        localStorage.setItem('reminders', JSON.stringify(reminders));
        
        // עדכון התצוגה
        displayReminders();
        
        // עדכון לוח השנה
        if (window.reminderCalendar) {
            window.reminderCalendar.refetchEvents();
        }
    }
}

// הצגת רשימת התזכורות
function displayReminders() {
    const remindersList = document.getElementById('reminders-list');
    if (!remindersList) {
        console.error("אלמנט reminders-list לא נמצא");
        return;
    }
    
    const reminders = JSON.parse(localStorage.getItem('reminders') || '[]');
    remindersList.innerHTML = '';
    
    if (reminders.length === 0) {
        remindersList.innerHTML = '<div class="no-items-message">אין תזכורות</div>';
        return;
    }
    
    // מיון לפי תאריך ושעה
    const sortedReminders = [...reminders].sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
        const dateB = new Date(`${b.date}T${b.time || '00:00'}`);
        return dateA - dateB;
    });
    
    // יצירת אלמנט לכל תזכורת
    sortedReminders.forEach(reminder => {
        const formattedDate = formatDate(reminder.date);
        
        const reminderItem = document.createElement('div');
        reminderItem.className = `reminder-item priority-${reminder.priority || 'normal'}`;
        if (reminder.completed) {
            reminderItem.classList.add('completed');
        }
        
        reminderItem.innerHTML = `
            <div class="reminder-header">
                <div class="reminder-title">${reminder.title}</div>
                <div class="reminder-actions">
                    <button class="edit-btn small" onclick="editReminder('${reminder.id}')">ערוך</button>
                    <button class="delete-btn small" onclick="deleteReminder('${reminder.id}')">מחק</button>
                </div>
            </div>
            <div class="reminder-date-time">
                <i class="reminder-icon">📅</i> ${formattedDate}
                ${reminder.time ? `<i class="reminder-icon">⏰</i> ${reminder.time}` : ''}
            </div>
            ${reminder.description ? `<div class="reminder-description">${reminder.description}</div>` : ''}
            <div class="reminder-footer">
                <label class="reminder-checkbox">
                    <input type="checkbox" ${reminder.completed ? 'checked' : ''} onchange="toggleReminderComplete('${reminder.id}', this.checked)">
                    <span>הושלם</span>
                </label>
            </div>
        `;
        
        remindersList.appendChild(reminderItem);
    });
}

// עריכת תזכורת
function editReminder(id) {
    const reminders = JSON.parse(localStorage.getItem('reminders') || '[]');
    const reminder = reminders.find(reminder => reminder.id === id);
    
    if (!reminder) {
        alert('התזכורת לא נמצאה');
        return;
    }
    
    // מילוי הטופס בנתוני התזכורת
    document.getElementById('reminder-id').value = reminder.id;
    document.getElementById('reminder-date').value = reminder.date;
    document.getElementById('reminder-time').value = reminder.time || '';
    document.getElementById('reminder-title').value = reminder.title;
    document.getElementById('reminder-description').value = reminder.description || '';
    document.getElementById('reminder-priority').value = reminder.priority || 'normal';
    
    // שינוי כפתור השמירה לעדכון
    document.getElementById('add-reminder-btn').textContent = 'עדכן תזכורת';
    
    // גלילה לטופס
    document.getElementById('reminder-form').scrollIntoView();
}

// מחיקת תזכורת
function deleteReminder(id) {
    if (confirm('האם אתה בטוח שברצונך למחוק את התזכורת?')) {
        const reminders = JSON.parse(localStorage.getItem('reminders') || '[]');
        const updatedReminders = reminders.filter(reminder => reminder.id !== id);
        
        // שמירה ב-localStorage
        localStorage.setItem('reminders', JSON.stringify(updatedReminders));
        
        // עדכון התצוגה
        displayReminders();
        
        // עדכון לוח השנה
        if (window.reminderCalendar) {
            window.reminderCalendar.refetchEvents();
        }
        
        // עדכון לוח השנה הראשי אם זמין
        if (typeof calendar !== 'undefined' && calendar) {
            calendar.refetchEvents();
        }
        
        alert('התזכורת נמחקה בהצלחה');
    }
}

// החלפת מצב השלמה של תזכורת
function toggleReminderComplete(id, isCompleted) {
    const reminders = JSON.parse(localStorage.getItem('reminders') || '[]');
    const index = reminders.findIndex(reminder => reminder.id === id);
    
    if (index !== -1) {
        reminders[index].completed = isCompleted;
        
        // שמירה ב-localStorage
        localStorage.setItem('reminders', JSON.stringify(reminders));
        
        // עדכון התצוגה
        displayReminders();
        
        // עדכון לוח השנה
        if (window.reminderCalendar) {
            window.reminderCalendar.refetchEvents();
        }
        
        // עדכון לוח השנה הראשי אם זמין
        if (typeof calendar !== 'undefined' && calendar) {
            calendar.refetchEvents();
        }
    }
}

// סינון תזכורות
function filterReminders() {
    const filterValue = document.getElementById('reminder-filter').value;
    const reminders = JSON.parse(localStorage.getItem('reminders') || '[]');
    
    let filteredReminders = [...reminders];
    const today = new Date().toISOString().split('T')[0];
    
    // סינון לפי הבחירה
    switch (filterValue) {
        case 'upcoming':
            filteredReminders = reminders.filter(reminder => reminder.date >= today);
            break;
        case 'past':
            filteredReminders = reminders.filter(reminder => reminder.date < today);
            break;
        case 'today':
            filteredReminders = reminders.filter(reminder => reminder.date === today);
            break;
        case 'high':
            filteredReminders = reminders.filter(reminder => reminder.priority === 'high');
            break;
        case 'notcompleted':
            filteredReminders = reminders.filter(reminder => !reminder.completed);
            break;
        case 'completed':
            filteredReminders = reminders.filter(reminder => reminder.completed);
            break;
        // case 'all' וכל מקרה אחר - להציג הכל
    }
    
    // הצגת התזכורות המסוננות
    displayFilteredReminders(filteredReminders);
}

// הצגת תזכורות מסוננות
function displayFilteredReminders(filteredReminders) {
    const remindersList = document.getElementById('reminders-list');
    if (!remindersList) {
        console.error("אלמנט reminders-list לא נמצא");
        return;
    }
    
    remindersList.innerHTML = '';
    
    if (filteredReminders.length === 0) {
        remindersList.innerHTML = '<div class="no-items-message">אין תזכורות להצגה</div>';
        return;
    }
    
    // מיון לפי תאריך ושעה
    const sortedReminders = [...filteredReminders].sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
        const dateB = new Date(`${b.date}T${b.time || '00:00'}`);
        return dateA - dateB;
    });
    
    // יצירת אלמנט לכל תזכורת
    sortedReminders.forEach(reminder => {
        const formattedDate = formatDate(reminder.date);
        
        const reminderItem = document.createElement('div');
        reminderItem.className = `reminder-item priority-${reminder.priority || 'normal'}`;
        if (reminder.completed) {
            reminderItem.classList.add('completed');
        }
        
        reminderItem.innerHTML = `
            <div class="reminder-header">
                <div class="reminder-title">${reminder.title}</div>
                <div class="reminder-actions">
                    <button class="edit-btn small" onclick="editReminder('${reminder.id}')">ערוך</button>
                    <button class="delete-btn small" onclick="deleteReminder('${reminder.id}')">מחק</button>
                </div>
            </div>
            <div class="reminder-date-time">
                <i class="reminder-icon">📅</i> ${formattedDate}
                ${reminder.time ? `<i class="reminder-icon">⏰</i> ${reminder.time}` : ''}
            </div>
            ${reminder.description ? `<div class="reminder-description">${reminder.description}</div>` : ''}
            <div class="reminder-footer">
                <label class="reminder-checkbox">
                    <input type="checkbox" ${reminder.completed ? 'checked' : ''} onchange="toggleReminderComplete('${reminder.id}', this.checked)">
                    <span>הושלם</span>
                </label>
            </div>
        `;
        
        remindersList.appendChild(reminderItem);
    });
}

// הצגת פרטי תזכורת
function showReminderDetails(id) {
    const reminders = JSON.parse(localStorage.getItem('reminders') || '[]');
    const reminder = reminders.find(reminder => reminder.id === id);
    
    if (!reminder) {
        alert('התזכורת לא נמצאה');
        return;
    }
    
    // מילוי הטופס בנתוני התזכורת
    document.getElementById('reminder-id').value = reminder.id;
    document.getElementById('reminder-date').value = reminder.date;
    document.getElementById('reminder-time').value = reminder.time || '';
    document.getElementById('reminder-title').value = reminder.title;
    document.getElementById('reminder-description').value = reminder.description || '';
    document.getElementById('reminder-priority').value = reminder.priority || 'normal';
    
    // שינוי כפתור השמירה לעדכון
    document.getElementById('add-reminder-btn').textContent = 'עדכן תזכורת';
    
    // גלילה לטופס
    document.getElementById('reminder-form').scrollIntoView({ behavior: 'smooth' });
}

// אתחול כפתורי שינוי גודל גופן
function initFontSizeControls() {
    const container = document.querySelector('.container');
    if (!container) return;
    
    // בדיקה אם הכפתורים כבר קיימים
    if (document.querySelector('.font-size-controls')) return;
    
    // יצירת קונטיינר לכפתורים
    const fontControls = document.createElement('div');
    fontControls.className = 'font-size-controls';
    fontControls.innerHTML = `
        <button class="font-btn" onclick="changeFontSize(-1)">א-</button>
        <span id="current-font-size">16.0</span>
        <button class="font-btn" onclick="changeFontSize(1)">א+</button>
    `;
    
    // הוספה לדף
    document.body.insertBefore(fontControls, document.body.firstChild);
    
    // הצגת גודל נוכחי
    const currentFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const fontSizeDisplay = document.getElementById('current-font-size');
    if (fontSizeDisplay) {
        fontSizeDisplay.textContent = currentFontSize.toFixed(1);
    }
}

// בדיקה תקופתית של תזכורות להיום
function checkForDueReminders() {
    // קבלת התזכורות מ-localStorage
    const reminders = JSON.parse(localStorage.getItem('reminders') || '[]');
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // מצא תזכורות שהגיע זמנן
    const dueReminders = reminders.filter(reminder => {
        if (reminder.completed) return false;
        if (reminder.date !== today) return false;
        
        // אם אין שעה מוגדרת, הראה הודעה רק פעם אחת ביום (אם לא הראינו כבר)
        if (!reminder.time) {
            return !reminder.notificationShown;
        }
        
        // אם יש שעה, בדוק אם הגיע הזמן
        const [hours, minutes] = reminder.time.split(':').map(Number);
        return (
            (currentHour > hours) || 
            (currentHour === hours && currentMinute >= minutes)
        ) && !reminder.notificationShown;
    });
    
    // הצג התראות לתזכורות שהגיע זמנן
    if (dueReminders.length > 0) {
        // עדכון דגל notificationShown
        const updatedReminders = reminders.map(reminder => {
            if (dueReminders.some(due => due.id === reminder.id)) {
                return { ...reminder, notificationShown: true };
            }
            return reminder;
        });
        
        // שמירה ב-localStorage
        localStorage.setItem('reminders', JSON.stringify(updatedReminders));
        
        // הצג התראות
        dueReminders.forEach(reminder => {
            showDesktopNotification(reminder);
        });
    }
    
    // בדיקה חוזרת כל דקה
    setTimeout(checkForDueReminders, 60000);
}

// הצגת התראת שולחן עבודה
function showDesktopNotification(reminder) {
    // בדיקה אם הדפדפן תומך בהתראות
    if (!('Notification' in window)) return;
    
    // בקשת אישור אם צריך
    if (Notification.permission === 'default') {
        Notification.requestPermission();
    }
    
    // הצגת ההתראה אם יש אישור
    if (Notification.permission === 'granted') {
        const notification = new Notification('תזכורת', {
            body: reminder.title,
            icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="%234CAF50"/><text x="50" y="60" font-size="40" text-anchor="middle" fill="white">⏰</text></svg>'
        });
        
        // סגירה אוטומטית אחרי 5 שניות
        setTimeout(() => {
            notification.close();
        }, 5000);
        
        // טיפול בלחיצה על ההתראה
        notification.onclick = function() {
            // פתיחת הלשונית המתאימה והצגת פרטי התזכורת
            showTab('reminders');
            showReminderDetails(reminder.id);
            
            // הבאת החלון לחזית
            window.focus();
            
            // סגירת ההתראה
            notification.close();
        };
    }
}

// הוספת תזכורת חדשה לקלנדר ראשי
function addQuickReminder() {
    const title = document.getElementById('quick-reminder-title').value;
    const date = document.getElementById('quick-reminder-date').value;
    const priority = document.getElementById('quick-reminder-priority').value;
    
    if (!title || !date) {
        alert('נא למלא כותרת ותאריך');
        return;
    }
    
    // יצירת תזכורת חדשה
    const reminder = {
        id: Date.now().toString(),
        date: date,
        time: '',
        title: title,
        description: '',
        priority: priority,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    // הוספה למערך התזכורות
    const reminders = JSON.parse(localStorage.getItem('reminders') || '[]');
    reminders.push(reminder);
    
    // שמירה ב-localStorage
    localStorage.setItem('reminders', JSON.stringify(reminders));
    
    // עדכון התצוגה
    if (window.reminderCalendar) {
        window.reminderCalendar.refetchEvents();
    }
    
    // עדכון לוח השנה הראשי
    if (typeof calendar !== 'undefined' && calendar) {
        calendar.refetchEvents();
    }
    
    // ניקוי השדה
    document.getElementById('quick-reminder-title').value = '';
    
    alert('התזכורת נוספה בהצלחה');
}

// עדכון לוח השנה הקיים להוספת תזכורות
function updateMainCalendar() {
    // בדיקה אם יש אובייקט calendar גלובלי
    if (typeof calendar === 'undefined' || !calendar) {
        console.log('אובייקט calendar לא מוגדר, מדלג על עדכון לוח השנה הראשי');
        return;
    }
    
    // הוספת מקור אירועים לתזכורות
    calendar.addEventSource({
        events: function(fetchInfo, successCallback) {
            // קבלת התזכורות מ-localStorage
            const reminders = JSON.parse(localStorage.getItem('reminders') || '[]');
            
            // המרה לפורמט אירועים
            const events = reminders.map(reminder => {
                const eventColor = {
                    'high': '#f44336',
                    'normal': '#ff9800',
                    'low': '#4CAF50'
                }[reminder.priority || 'normal'];
                
                return {
                    id: 'reminder-' + reminder.id,
                    title: `⏰ ${reminder.title}`,
                    start: reminder.time
                        ? `${reminder.date}T${reminder.time}:00`
                        : reminder.date,
                    allDay: !reminder.time,
                    backgroundColor: eventColor,
                    borderColor: eventColor,
                    textColor: 'white',
                    className: reminder.completed ? 'completed-event' : '',
                    extendedProps: {
                        type: 'reminder',
                        reminder: reminder
                    }
                };
            });
            
            successCallback(events);
        }
    });
    
    // עדכון הלוח
    calendar.refetchEvents();
}

// הוספת האתחול לטעינת הדף
document.addEventListener('DOMContentLoaded', function() {
    // אתחול לאחר מספר מילישניות לוודא שהתוכן הוטען
    setTimeout(initRemindersSystem, 500);
    
    // עדכון לוח השנה הראשי אם קיים
    setTimeout(updateMainCalendar, 1000);
});