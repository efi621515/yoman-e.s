// משתנים גלובליים
let calendar;
let selectedEvent = null;
let draggedWorkLogId = null;

// אתחול לוח השנה
function initCalendar() {
    // קבלת האלמנט שיכיל את הלוח
    const calendarEl = document.getElementById('work-calendar');
    if (!calendarEl) return;
    
    // יצירת אובייקט הלוח
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        direction: 'rtl',
        locale: 'he',
        headerToolbar: false, // נשתמש בפקדים שלנו במקום
        dayMaxEvents: true, // אפשר לקבל טקסט "עוד X" כאשר יש יותר מדי אירועים
        eventTimeFormat: {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        },
        buttonText: {
            today: 'היום',
            month: 'חודש',
            week: 'שבוע',
            day: 'יום',
            list: 'רשימה'
        },
        views: {
            dayGridMonth: {
                titleFormat: { year: 'numeric', month: 'long' }
            },
            timeGridWeek: {
                titleFormat: { year: 'numeric', month: 'short', day: 'numeric' }
            },
            timeGridDay: {
                titleFormat: { year: 'numeric', month: 'long', day: 'numeric' }
            }
        },
        navLinks: true, // מאפשר ניווט בלחיצה על תאריכים
        editable: true, // אפשר לגרור ולשנות אירועים
        selectable: true, // אפשר לבחור טווח תאריכים
        nowIndicator: true, // מראה קו בזמן הנוכחי
        dayMaxEvents: true, // מציג "עוד" כאשר יש יותר מדי אירועים
        eventSources: [
            // מקור הנתונים הוא העבודות המתוכננות
            function(fetchInfo, successCallback) {
                // המרת רשימת העבודות לפורמט של אירועים בלוח השנה
                const events = workLogs.filter(log => {
                    // כאן אפשר להוסיף פילטרים לפי הצורך
                    if (!log.date) return false;
                    
                    // בדיקה אם יש פילטר כלי עבודה
                    const toolFilter = document.getElementById('filter-tools').value;
                    if (toolFilter !== 'all' && (!log.tools || !log.tools.includes(toolFilter))) {
                        return false;
                    }
                    
                    // בדיקה אם יש פילטר לקוחות
                    const clientFilter = document.getElementById('filter-clients').value;
                    if (clientFilter !== 'all' && log.client !== clientFilter) {
                        return false;
                    }
                    
                    return true;
                }).map(log => {
                    return {
                        id: log.id,
                        title: `${log.client} - ${log.location || ''}`,
                        start: log.date,
                        allDay: true,
                        backgroundColor: getClientColor(log.client),
                        borderColor: getClientColor(log.client),
                        extendedProps: {
                            workLogId: log.id,
                            client: log.client,
                            location: log.location,
                            tools: log.tools,
                            operator: log.operator,
                            dailyPrice: log.dailyPrice,
                            transportation: log.transportation,
                            transportationCost: log.transportationCost,
                            notes: log.notes
                        }
                    };
                });
                
                successCallback(events);
            }
        ],
        // טיפול באירועים
        eventClick: function(info) {
            // לחיצה על אירוע
            showEventDetails(info.event);
        },
        eventDrop: function(info) {
            // גרירת אירוע
            updateWorkLogDate(
                info.event.extendedProps.workLogId,
                info.event.start
            );
        },
        eventResize: function(info) {
            // שינוי גודל אירוע (לא רלוונטי לאירועים של יום שלם)
            updateWorkLogDate(
                info.event.extendedProps.workLogId,
                info.event.start
            );
        },
        dateClick: function(info) {
            // לחיצה על תאריך - אפשר ליצור אירוע חדש
            openCreateEventModal(info.date);
        },
        select: function(info) {
            // בחירת טווח תאריכים
            openCreateEventModal(info.start);
        }
    });
    
    // הצגת הלוח
    calendar.render();
    
    // עדכון הטקסט של החודש הנוכחי
    updateCurrentMonthDisplay();
    
    // הוספת מאזינים לכפתורי הניווט
    document.getElementById('prev-month').addEventListener('click', function() {
        calendar.prev();
        updateCurrentMonthDisplay();
    });
    
    document.getElementById('next-month').addEventListener('click', function() {
        calendar.next();
        updateCurrentMonthDisplay();
    });
    
    document.getElementById('today-btn').addEventListener('click', function() {
        calendar.today();
        updateCurrentMonthDisplay();
    });
    
    // מאזין לשינוי תצוגה
    document.getElementById('calendar-view-select').addEventListener('change', function() {
        calendar.changeView(this.value);
        updateCurrentMonthDisplay();
    });
    
    // מאזין לכפתור יצירת עבודה חדשה
    document.getElementById('create-work-btn').addEventListener('click', function() {
        openCreateEventModal(new Date());
    });
    
    // מאזינים לשינוי פילטרים
    document.getElementById('filter-tools').addEventListener('change', function() {
        calendar.refetchEvents();
    });
    
    document.getElementById('filter-clients').addEventListener('change', function() {
        calendar.refetchEvents();
    });
    
    // אתחול עבודות לתכנון
    loadUnscheduledWork();
}

// פונקציה להצגת החודש הנוכחי
function updateCurrentMonthDisplay() {
    const headerTitle = calendar.view.title;
    document.getElementById('current-month-display').textContent = headerTitle;
}

// פונקציה לטעינת עבודות לא מתוכננות (ללא תאריך)
function loadUnscheduledWork() {
    const container = document.getElementById('unscheduled-work');
    if (!container) return;
    
    // נקה את התוכן הקיים
    container.innerHTML = '';
    
    // סנן רק עבודות ללא תאריך
    const unscheduled = workLogs.filter(log => !log.date);
    
    if (unscheduled.length === 0) {
        container.innerHTML = '<div class="no-items-message">אין עבודות לתכנון</div>';
        return;
    }
    
    // צור אלמנט לכל עבודה לא מתוכננת
    unscheduled.forEach(log => {
        const workItem = document.createElement('div');
        workItem.className = 'dragable-work-item';
        workItem.setAttribute('data-id', log.id);
        workItem.innerHTML = `
            <div class="work-item-title">${log.client}</div>
            <div class="work-item-details">
                ${log.location ? `<div>מקום: ${log.location}</div>` : ''}
                ${log.tools ? `<div>כלי: ${log.tools}</div>` : ''}
            </div>
        `;
        
        // הפוך את האלמנט לניתן לגרירה
        new FullCalendar.Draggable(workItem, {
            itemSelector: '.dragable-work-item',
            eventData: function(el) {
                const id = el.getAttribute('data-id');
                const log = workLogs.find(l => l.id === id);
                
                draggedWorkLogId = id;
                
                return {
                    id: id,
                    title: `${log.client} - ${log.location || ''}`,
                    backgroundColor: getClientColor(log.client),
                    borderColor: getClientColor(log.client),
                    allDay: true,
                    extendedProps: {
                        workLogId: id,
                        client: log.client,
                        location: log.location,
                        tools: log.tools,
                        operator: log.operator,
                        dailyPrice: log.dailyPrice,
                        transportation: log.transportation,
                        transportationCost: log.transportationCost,
                        notes: log.notes
                    }
                };
            }
        });
        
        // הוסף מאזין ללחיצה שיפתח את פרטי העבודה
        workItem.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const log = workLogs.find(l => l.id === id);
            if (log) {
                showWorkLogDetails(log);
            }
        });
        
        container.appendChild(workItem);
    });
}

// פונקציה לעדכון תאריך של עבודה
function updateWorkLogDate(workLogId, newDate) {
    const index = workLogs.findIndex(log => log.id === workLogId);
    if (index !== -1) {
        // צור עותק של העבודה
        const updatedLog = {...workLogs[index]};
        
        // קבל את התאריך בפורמט YYYY-MM-DD
        const formattedDate = newDate.toISOString().split('T')[0];
        updatedLog.date = formattedDate;
        
        // עדכן את העבודה במערך
        workLogs[index] = updatedLog;
        
        // שמור את השינויים ב-localStorage
        localStorage.setItem('workLogs', JSON.stringify(workLogs));
        
        // עדכן תצוגות
        displayWorkLogs();
        loadUnscheduledWork();
        
        // אם זה היה אירוע שנגרר מהעבודות הלא מתוכננות
        if (draggedWorkLogId === workLogId) {
            draggedWorkLogId = null;
            calendar.refetchEvents();
        }
    }
}

// פונקציה להצגת פרטי אירוע
function showEventDetails(event) {
    selectedEvent = event;
    const log = workLogs.find(log => log.id === event.extendedProps.workLogId);
    if (!log) return;
    
    const modalContent = document.getElementById('event-details-content');
    if (!modalContent) return;
    
    // חישוב הסכום הכולל
    const dailyPrice = parseFloat(log.dailyPrice) || 0;
    const transportationCost = parseFloat(log.transportationCost) || 0;
    const totalPrice = dailyPrice + transportationCost;
    
    // הצג את פרטי האירוע
    modalContent.innerHTML = `
        <h3>פרטי עבודה</h3>
        
        <div class="event-details-grid">
            <div class="event-detail">
                <span class="detail-label">תאריך:</span>
                <span class="detail-value">${formatDate(log.date)}</span>
            </div>
            
            <div class="event-detail">
                <span class="detail-label">לקוח:</span>
                <span class="detail-value">${log.client}</span>
            </div>
            
            <div class="event-detail">
                <span class="detail-label">מקום עבודה:</span>
                <span class="detail-value">${log.location || '-'}</span>
            </div>
            
            <div class="event-detail">
                <span class="detail-label">כלי עבודה:</span>
                <span class="detail-value">${log.tools || '-'}</span>
            </div>
            
            <div class="event-detail">
                <span class="detail-label">מפעיל:</span>
                <span class="detail-value">${log.operator || '-'}</span>
            </div>
            
            <div class="event-detail">
                <span class="detail-label">מחיר ליום:</span>
                <span class="detail-value">${log.dailyPrice ? '₪' + log.dailyPrice : '-'}</span>
            </div>
            
            <div class="event-detail">
                <span class="detail-label">הובלה:</span>
                <span class="detail-value">${log.transportation}</span>
            </div>
            
            <div class="event-detail">
                <span class="detail-label">מחיר הובלה:</span>
                <span class="detail-value">${log.transportationCost ? '₪' + log.transportationCost : '-'}</span>
            </div>
            
            <div class="event-detail">
                <span class="detail-label">סה"כ:</span>
                <span class="detail-value">₪${totalPrice.toFixed(2)}</span>
            </div>
        </div>
        
        ${log.notes ? `
            <div class="event-notes">
                <span class="detail-label">הערות:</span>
                <div class="notes-content">${log.notes}</div>
            </div>
        ` : ''}
        
        <div class="event-actions">
            <button class="edit-btn" onclick="editWorkLog('${log.id}'); closeEventModal();">ערוך</button>
            <button class="delete-btn" onclick="confirmDeleteEvent('${log.id}')">מחק</button>
            <button onclick="closeEventModal()">סגור</button>
        </div>
    `;
    
    // הצג את המודאל
    document.getElementById('event-details-modal').style.display = 'block';
}

// פונקציה לסגירת מודאל פרטי אירוע
function closeEventModal() {
    document.getElementById('event-details-modal').style.display = 'none';
    selectedEvent = null;
}

// פונקציה לפתיחת מודאל יצירת אירוע
function openCreateEventModal(date) {
    // אתחל את הערכים בטופס
    document.getElementById('event-date').value = date.toISOString().split('T')[0];
    document.getElementById('event-client').value = '';
    document.getElementById('event-location').value = '';
    document.getElementById('event-tools').value = '';
    document.getElementById('event-operator').value = '';
    document.getElementById('event-daily-price').value = '';
    document.getElementById('event-transportation').value = 'כן';
    document.getElementById('event-transportation-cost').value = '';
    document.getElementById('event-notes').value = '';
    
    // הצג את המודאל
    document.getElementById('create-event-modal').style.display = 'block';
}

// פונקציה לסגירת מודאל יצירת אירוע
function closeCreateEventModal() {
    document.getElementById('create-event-modal').style.display = 'none';
}

// פונקציה לשמירת אירוע חדש
function saveCalendarEvent() {
    const date = document.getElementById('event-date').value;
    const client = document.getElementById('event-client').value;
    
    if (!date || !client) {
        alert('נא למלא את התאריך והלקוח');
        return;
    }
    
    const workLog = {
        id: Date.now().toString(),
        date: date,
        client: client,
        location: document.getElementById('event-location').value,
        tools: document.getElementById('event-tools').value,
        operator: document.getElementById('event-operator').value,
        dailyPrice: document.getElementById('event-daily-price').value,
        transportation: document.getElementById('event-transportation').value,
        transportationCost: document.getElementById('event-transportation-cost').value,
        notes: document.getElementById('event-notes').value
    };
    
    // הוסף את העבודה למערך
    workLogs.push(workLog);
    
    // שמור את השינויים ב-localStorage
    localStorage.setItem('workLogs', JSON.stringify(workLogs));
    
    // סגור את המודאל
    closeCreateEventModal();
    
    // עדכן את הלוח ואת התצוגות
    calendar.refetchEvents();
    displayWorkLogs();
    
    alert('העבודה נוספה בהצלחה ללוח השנה');
}

// פונקציה לאישור מחיקת אירוע
function confirmDeleteEvent(id) {
    if (confirm('האם אתה בטוח שברצונך למחוק את העבודה מלוח השנה?')) {
        deleteWorkLog(id);
        closeEventModal();
        calendar.refetchEvents();
    }
}

// פונקציה לקבלת צבע עקבי לכל לקוח
function getClientColor(clientName) {
    // אלגוריתם פשוט שממיר את שם הלקוח למספר וממנו לצבע
    let hash = 0;
    for (let i = 0; i < clientName.length; i++) {
        hash = clientName.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // שומר על צבעים בהירים פחות
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 60%)`;
}

// הוספת האתחול לקוד האתחול של האפליקציה
document.addEventListener('DOMContentLoaded', function() {
    // אם לוח שנה מופיע, אתחל אותו
    if (document.getElementById('work-calendar')) {
        setTimeout(() => {
            initCalendar();
        }, 100); // קצת זמן לטעינה
    }
});