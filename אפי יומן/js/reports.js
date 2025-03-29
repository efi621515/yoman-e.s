// פונקציית הפורמט תאריך
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

// פונקציה להפקת דוח
function generateReport() {
    console.log("מפיק דוח...");
    
    const reportType = document.getElementById('report-type').value;
    const dateFrom = document.getElementById('report-date-from').value;
    const dateTo = document.getElementById('report-date-to').value;
    const client = document.getElementById('report-client')?.value || "";
    const operator = document.getElementById('report-operator')?.value || "";
    const location = document.getElementById('report-location')?.value || "";
    
    console.log("פרמטרי דוח:", { reportType, dateFrom, dateTo, client, operator, location });
    
    if (!dateFrom || !dateTo) {
        alert('נא לבחור טווח תאריכים');
        return;
    }
    
    // וודא שיש מערך workLogs מוגדר
    if (typeof workLogs === 'undefined' || !workLogs) {
        console.error("מערך workLogs אינו מוגדר");
        // יוזם מערך ריק אם לא קיים
        window.workLogs = [];
    }
    
    // סינון רישומי עבודה לפי תאריך
    let filteredLogs = workLogs.filter(log => 
        log && log.date && log.date >= dateFrom && log.date <= dateTo
    );
    
    console.log(`סוננו ${filteredLogs.length} רשומות לפי תאריך`);
    
    // סינון לפי לקוח אם צוין
    if (client) {
        filteredLogs = filteredLogs.filter(log => 
            log.client === client
        );
        console.log(`סוננו ${filteredLogs.length} רשומות לפי לקוח`);
    }
    
    // סינון לפי מפעיל אם צוין
    if (operator) {
        filteredLogs = filteredLogs.filter(log => log.operator === operator);
        console.log(`סוננו ${filteredLogs.length} רשומות לפי מפעיל`);
    }
    
    // סינון לפי מקום אם צוין
    if (location) {
        filteredLogs = filteredLogs.filter(log => log.location === location);
        console.log(`סוננו ${filteredLogs.length} רשומות לפי מקום`);
    }
    
    // קבלת מיכל הדוח
    let reportResult = document.getElementById('report-result');
    if (!reportResult) {
        console.error('מיכל דוח לא נמצא');
        
        // ניסיון ליצור את האלמנט אם הוא לא קיים
        const reportsTab = document.getElementById('reports');
        if (reportsTab) {
            const newResult = document.createElement('div');
            newResult.id = 'report-result';
            newResult.className = 'print-section';
            reportsTab.appendChild(newResult);
            console.log("נוצר אלמנט report-result חדש");
            reportResult = newResult;
        } else {
            alert("שגיאה: מיכל הדוח לא נמצא בעמוד");
            return;
        }
    }
    
    // בדיקה נוספת לוודא שיש לנו אלמנט דוח
    if (!reportResult) {
        alert("שגיאה: לא ניתן ליצור אלמנט דוח");
        return;
    }
    
    // הפקת דוח לפי סוג
    try {
        switch(reportType) {
            case 'monthly-income':
                generateMonthlyIncomeReport(filteredLogs, reportResult);
                break;
            case 'client-summary':
                generateClientSummaryReport(filteredLogs, reportResult);
                break;
            case 'tools-usage':
                generateToolsUsageReport(filteredLogs, reportResult);
                break;
            case 'detailed-all-jobs':
                generateDetailedAllJobsReport(filteredLogs, reportResult);
                break;
            case 'detailed-client-report':
                generateDetailedClientReport(filteredLogs, reportResult, client);
                break;
            case 'operator-history':
                generateOperatorHistoryReport(filteredLogs, reportResult, operator);
                break;
            case 'location-history':
                generateLocationHistoryReport(filteredLogs, reportResult, location);
                break;
            default:
                // דוח כללי פשוט
                generateDefaultReport(filteredLogs, reportResult);
                break;
        }
    
        console.log("הדוח הופק בהצלחה");
        
        // הוספת כפתור הדפסה לדוח אם אין כבר
        if (!reportResult.querySelector('.print-section')) {
            const printSection = document.createElement('div');
            printSection.className = 'print-section';
            printSection.innerHTML = '<button class="print-btn no-print" onclick="printReport()">הדפס דוח</button>';
            reportResult.appendChild(printSection);
        }
        
        // עדכון כפתורי הדפסה
        updatePrintButtons();
        
        // הוספת כפתור ייצוא ל-PDF
        addPDFExportButton();
    } catch (e) {
        console.error("שגיאה בהפקת הדוח:", e);
        
        // דוח בסיסי במקרה של שגיאה
        reportResult.innerHTML = `
            <h3>שגיאה בהפקת הדוח</h3>
            <p>אירעה שגיאה בעת הפקת הדוח: ${e.message}</p>
            <p>אנא נסה סוג דוח אחר או צור קשר עם תמיכה טכנית.</p>
            <pre class="error-details no-print">${e.stack || ''}</pre>
        `;
    }
}

// Function to print the current report
function printReport() {
    console.log("מדפיס דוח...");
    
    // Get the report content
    const reportContent = document.getElementById('report-result');
    if (!reportContent) {
        console.error('אלמנט report-result לא נמצא');
        return;
    }
    
    // Store the current page content
    const originalContent = document.body.innerHTML;
    
    // Create print-only content
    const printContent = `
        <div class="print-container">
            <h1>יומן עבודה ומערכת הצעות מחיר</h1>
            ${reportContent.innerHTML}
        </div>
    `;
    
    // Replace the page content with print content
    document.body.innerHTML = printContent;
    
    // Print the page
    window.print();
    
    // Restore original content after print dialog closes
    document.body.innerHTML = originalContent;
    
    // Reinitialize necessary event listeners and functionality
    if (typeof init === 'function') {
        init();
    } else {
        console.warn('פונקציית init לא מוגדרת, מנסה להפעיל את showTab');
        if (typeof showTab === 'function') {
            showTab('reports');
        }
    }
}

// Update all print buttons to use the new print function
function updatePrintButtons() {
    // Get all print buttons within the reports tab
    const printButtons = document.querySelectorAll('#reports .print-btn');
    console.log(`מעדכן ${printButtons.length} כפתורי הדפסה`);
    
    // Update each print button to use the custom print function
    printButtons.forEach(button => {
        button.onclick = function(e) {
            e.preventDefault();
            printReport();
        };
    });
}

// פונקציית עזר לקבלת שם חודש בעברית
function getHebrewMonthName(monthNumber) {
    const months = [
        'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
        'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
    ];
    return months[monthNumber - 1] || 'חודש לא ידוע';
}

// פונקציית דוח הכנסה חודשית
function generateMonthlyIncomeReport(logs, container) {
    // קיבוץ לפי חודש ושנה
    const monthlyData = {};
    
    logs.forEach(log => {
        if (!log.date) return;
        
        const [year, month] = log.date.split('-');
        const monthKey = `${year}-${month}`;
        
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = {
                totalDaily: 0,
                totalTransport: 0,
                count: 0
            };
        }
        
        monthlyData[monthKey].totalDaily += parseFloat(log.dailyPrice) || 0;
        monthlyData[monthKey].totalTransport += parseFloat(log.transportationCost) || 0;
        monthlyData[monthKey].count++;
    });
    
    // סידור מפתחות לפי סדר כרונולוגי
    const sortedMonths = Object.keys(monthlyData).sort();
    
    let reportHTML = `
        <h3>דוח הכנסה חודשית</h3>
        <p>תאריכים: ${formatDate(document.getElementById('report-date-from').value)} עד ${formatDate(document.getElementById('report-date-to').value)}</p>
        
        <table>
            <thead>
                <tr>
                    <th>חודש</th>
                    <th>מספר ימי עבודה</th>
                    <th>הכנסה מימי עבודה</th>
                    <th>הכנסה מהובלות</th>
                    <th>סה"כ</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    let grandTotalDaily = 0;
    let grandTotalTransport = 0;
    let grandTotalCount = 0;
    
    sortedMonths.forEach(monthKey => {
        const [year, month] = monthKey.split('-');
        const hebrewMonth = getHebrewMonthName(parseInt(month));
        const data = monthlyData[monthKey];
        
        const totalMonthly = data.totalDaily + data.totalTransport;
        
        grandTotalDaily += data.totalDaily;
        grandTotalTransport += data.totalTransport;
        grandTotalCount += data.count;
        
        reportHTML += `
            <tr>
                <td>${hebrewMonth} ${year}</td>
                <td>${data.count}</td>
                <td>₪${data.totalDaily.toFixed(2)}</td>
                <td>₪${data.totalTransport.toFixed(2)}</td>
                <td>₪${totalMonthly.toFixed(2)}</td>
            </tr>
        `;
    });
    
    // הוספת שורת סיכום
    const grandTotal = grandTotalDaily + grandTotalTransport;
    
    reportHTML += `
            <tr style="font-weight: bold; background-color: #f0f0f0;">
                <td>סה"כ</td>
                <td>${grandTotalCount}</td>
                <td>₪${grandTotalDaily.toFixed(2)}</td>
                <td>₪${grandTotalTransport.toFixed(2)}</td>
                <td>₪${grandTotal.toFixed(2)}</td>
            </tr>
        </tbody>
    </table>
    
    <div class="print-section">
        <button class="print-btn no-print">הדפס דוח</button>
    </div>
    `;
    
    container.innerHTML = reportHTML;
}

// פונקציית דוח סיכום לקוחות
function generateClientSummaryReport(logs, container) {
    // קיבוץ לוגים לפי לקוח
    const clientData = {};
    
    logs.forEach(log => {
        if (!log.client) return;
        
        if (!clientData[log.client]) {
            clientData[log.client] = {
                totalDailyPrice: 0,
                totalTransportation: 0,
                count: 0,
                locations: new Set()
            };
        }
        
        clientData[log.client].totalDailyPrice += parseFloat(log.dailyPrice) || 0;
        clientData[log.client].totalTransportation += parseFloat(log.transportationCost) || 0;
        clientData[log.client].count++;
        
        if (log.location) {
            clientData[log.client].locations.add(log.location);
        }
    });
    
    // יצירת HTML לדוח
    let reportHTML = `
        <h3>דוח סיכום לקוחות</h3>
        <p>תאריכים: ${formatDate(document.getElementById('report-date-from').value)} עד ${formatDate(document.getElementById('report-date-to').value)}</p>
        
        <table>
            <thead>
                <tr>
                    <th>לקוח</th>
                    <th>מספר עבודות</th>
                    <th>סה"כ מחיר ימי עבודה</th>
                    <th>סה"כ הובלות</th>
                    <th>סה"כ</th>
                    <th>מקומות עבודה</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    // מיון לקוחות אלפביתית
    const sortedClients = Object.keys(clientData).sort();
    
    let grandTotalDaily = 0;
    let grandTotalTransport = 0;
    
    sortedClients.forEach(client => {
        const data = clientData[client];
        const totalClient = data.totalDailyPrice + data.totalTransportation;
        
        grandTotalDaily += data.totalDailyPrice;
        grandTotalTransport += data.totalTransportation;
        
        reportHTML += `
            <tr>
                <td>${client}</td>
                <td>${data.count}</td>
                <td>₪${data.totalDailyPrice.toFixed(2)}</td>
                <td>₪${data.totalTransportation.toFixed(2)}</td>
                <td>₪${totalClient.toFixed(2)}</td>
                <td>${Array.from(data.locations).join(', ') || '-'}</td>
            </tr>
        `;
    });
    
    // הוספת סך הכל
    const grandTotal = grandTotalDaily + grandTotalTransport;
    
    reportHTML += `
            <tr style="font-weight: bold; background-color: #f0f0f0;">
                <td>סה"כ</td>
                <td>${logs.length}</td>
                <td>₪${grandTotalDaily.toFixed(2)}</td>
                <td>₪${grandTotalTransport.toFixed(2)}</td>
                <td>₪${grandTotal.toFixed(2)}</td>
                <td>-</td>
            </tr>
        </tbody>
    </table>
    
    <div class="print-section">
        <button class="print-btn no-print">הדפס דוח</button>
    </div>
    `;
    
    container.innerHTML = reportHTML;
}
// פונקציית דוח שימוש בכלי עבודה
function generateToolsUsageReport(logs, container) {
    // קיבוץ לוגים לפי כלי עבודה
    const toolsData = {};
    
    logs.forEach(log => {
        if (!log.tools) return;
        
        // פיצול המחרוזת tools במקרה שיש כמה כלים מופרדים בפסיקים
        const toolsList = typeof log.tools === 'string' ? 
            log.tools.split(',').map(tool => tool.trim()) : 
            [log.tools];
        
        toolsList.forEach(tool => {
            if (!tool) return;
            
            if (!toolsData[tool]) {
                toolsData[tool] = {
                    count: 0,
                    clients: new Set(),
                    revenue: 0
                };
            }
            
            toolsData[tool].count++;
            if (log.client) toolsData[tool].clients.add(log.client);
            // הוספת הכנסה חלקית (בהנחה שמחלקים שווה בשווה בין הכלים)
            toolsData[tool].revenue += (parseFloat(log.dailyPrice) || 0) / toolsList.length;
        });
    });
    
    // יצירת HTML לדוח
    let reportHTML = `
        <h3>דוח שימוש בכלי עבודה</h3>
        <p>תאריכים: ${formatDate(document.getElementById('report-date-from').value)} עד ${formatDate(document.getElementById('report-date-to').value)}</p>
        
        <table>
            <thead>
                <tr>
                    <th>כלי עבודה</th>
                    <th>מספר שימושים</th>
                    <th>הכנסה משוערת</th>
                    <th>לקוחות</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    // מיון כלים לפי כמות שימושים (בסדר יורד)
    const sortedTools = Object.keys(toolsData).sort((a, b) => 
        toolsData[b].count - toolsData[a].count
    );
    
    let totalUsage = 0;
    let totalRevenue = 0;
    
    sortedTools.forEach(tool => {
        const data = toolsData[tool];
        totalUsage += data.count;
        totalRevenue += data.revenue;
        
        reportHTML += `
            <tr>
                <td>${tool}</td>
                <td>${data.count}</td>
                <td>₪${data.revenue.toFixed(2)}</td>
                <td>${Array.from(data.clients).join(', ')}</td>
            </tr>
        `;
    });
    
    // הוספת שורת סיכום
    reportHTML += `
            <tr style="font-weight: bold; background-color: #f0f0f0;">
                <td>סה"כ</td>
                <td>${totalUsage}</td>
                <td>₪${totalRevenue.toFixed(2)}</td>
                <td>-</td>
            </tr>
        </tbody>
    </table>
    
    <div class="print-section">
        <button class="print-btn no-print">הדפס דוח</button>
    </div>
    `;
    
    container.innerHTML = reportHTML;
}

// פונקציית דוח מפורט לכל העבודות
function generateDetailedAllJobsReport(logs, container) {
    // מיון לוגים לפי תאריך (חדש לישן)
    const sortedLogs = [...logs].sort((a, b) => {
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(b.date) - new Date(a.date);
    });
    
    // חישוב סכומים
    let totalDailyPrice = 0;
    let totalTransportation = 0;
    
    sortedLogs.forEach(log => {
        totalDailyPrice += parseFloat(log.dailyPrice) || 0;
        totalTransportation += parseFloat(log.transportationCost) || 0;
    });
    
    const totalWithoutVat = totalDailyPrice + totalTransportation;
    const vat = totalWithoutVat * 0.18;
    const totalWithVat = totalWithoutVat + vat;
    
    // יצירת HTML לדוח
    let reportHTML = `
        <h3>דוח מפורט לכל העבודות</h3>
        <p>תאריכים: ${formatDate(document.getElementById('report-date-from').value)} עד ${formatDate(document.getElementById('report-date-to').value)}</p>
        
        <div class="summary-box">
            <div class="summary-item">
                <span class="summary-label">סה"כ עבודות:</span>
                <span class="summary-value">${sortedLogs.length}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">סה"כ לפני מע"מ:</span>
                <span class="summary-value">₪${totalWithoutVat.toFixed(2)}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">מע"מ (18%):</span>
                <span class="summary-value">₪${vat.toFixed(2)}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">סה"כ כולל מע"מ:</span>
                <span class="summary-value">₪${totalWithVat.toFixed(2)}</span>
            </div>
        </div>
        
        <table class="detailed-table">
            <thead>
                <tr>
                    <th>תאריך</th>
                    <th>לקוח</th>
                    <th>מקום העבודה</th>
                    <th>כלי עבודה</th>
                    <th>מפעיל</th>
                    <th>מחיר ליום</th>
                    <th>הובלה</th>
                    <th>מחיר הובלה</th>
                    <th>סה"כ</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    sortedLogs.forEach(log => {
        const logTotal = (parseFloat(log.dailyPrice) || 0) + (parseFloat(log.transportationCost) || 0);
        const formattedDate = formatDate(log.date);
        
        reportHTML += `
            <tr>
                <td>${formattedDate}</td>
                <td>${log.client || '-'}</td>
                <td>${log.location || '-'}</td>
                <td>${log.tools || '-'}</td>
                <td>${log.operator || '-'}</td>
                <td>₪${log.dailyPrice ? parseFloat(log.dailyPrice).toFixed(2) : '0.00'}</td>
                <td>${log.transportation || 'לא'}</td>
                <td>₪${log.transportationCost ? parseFloat(log.transportationCost).toFixed(2) : '0.00'}</td>
                <td>₪${logTotal.toFixed(2)}</td>
            </tr>
        `;
        
        if (log.notes) {
            reportHTML += `
                <tr class="notes-row">
                    <td colspan="9">
                        <strong>הערות:</strong> ${log.notes}
                    </td>
                </tr>
            `;
        }
    });
    
    reportHTML += `
            </tbody>
        </table>
        
        <div class="print-section">
            <button class="print-btn no-print">הדפס דוח</button>
        </div>
    `;
    
    container.innerHTML = reportHTML;
}

// פונקציית דוח מפורט ללקוח
function generateDetailedClientReport(logs, container, clientName) {
    // קיבוץ לוגים לפי לקוח
    const clientsData = {};
    
    logs.forEach(log => {
        const client = log.client;
        
        if (!client) return;
        
        if (!clientsData[client]) {
            clientsData[client] = {
                logs: [],
                totalDailyPrice: 0,
                totalTransportation: 0,
                locations: new Set()
            };
        }
        
        clientsData[client].logs.push(log);
        clientsData[client].totalDailyPrice += parseFloat(log.dailyPrice) || 0;
        clientsData[client].totalTransportation += parseFloat(log.transportationCost) || 0;
        
        if (log.location) {
            clientsData[client].locations.add(log.location);
        }
    });
    
    // אם נבחר לקוח ספציפי, סנן רק אותו
    let clients = Object.keys(clientsData);
    if (clientName) {
        clients = clients.filter(client => 
            client.toLowerCase().includes(clientName.toLowerCase())
        );
    }
    
    // מיון לקוחות אלפביתית
    clients.sort();
    
    // יצירת HTML לדוח
    let reportHTML = `
        <h3>דוח מפורט ללקוח</h3>
        <p>תאריכים: ${formatDate(document.getElementById('report-date-from').value)} עד ${formatDate(document.getElementById('report-date-to').value)}</p>
    `;
    
    clients.forEach(client => {
        const clientData = clientsData[client];
        const totalDailyPrice = clientData.totalDailyPrice;
        const totalTransportation = clientData.totalTransportation;
        const totalWithoutVat = totalDailyPrice + totalTransportation;
        const vat = totalWithoutVat * 0.18;
        const totalWithVat = totalWithoutVat + vat;
        
        // מיון לוגים לפי תאריך (חדש לישן)
        const sortedLogs = [...clientData.logs].sort((a, b) => {
            if (!a.date) return 1;
            if (!b.date) return -1;
            return new Date(b.date) - new Date(a.date);
        });
        
        reportHTML += `
            <div class="client-section">
                <h4>לקוח: ${client}</h4>
                
                <div class="summary-box">
                    <div class="summary-item">
                        <span class="summary-label">סה"כ עבודות:</span>
                        <span class="summary-value">${sortedLogs.length}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">מקומות עבודה:</span>
                        <span class="summary-value">${Array.from(clientData.locations).join(', ') || '-'}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">סה"כ לפני מע"מ:</span>
                        <span class="summary-value">₪${totalWithoutVat.toFixed(2)}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">מע"מ (18%):</span>
                        <span class="summary-value">₪${vat.toFixed(2)}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">סה"כ כולל מע"מ:</span>
                        <span class="summary-value">₪${totalWithVat.toFixed(2)}</span>
                    </div>
                </div>
                
                <table class="detailed-table">
                    <thead>
                        <tr>
                            <th>תאריך</th>
                            <th>מקום העבודה</th>
                            <th>כלי עבודה</th>
                            <th>מפעיל</th>
                            <th>מחיר ליום</th>
                            <th>הובלה</th>
                            <th>מחיר הובלה</th>
                            <th>סה"כ</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        sortedLogs.forEach(log => {
            const logTotal = (parseFloat(log.dailyPrice) || 0) + (parseFloat(log.transportationCost) || 0);
            const formattedDate = formatDate(log.date);
            
            reportHTML += `
                <tr>
                <tr>
                    <td>${formattedDate}</td>
                    <td>${log.location || '-'}</td>
                    <td>${log.tools || '-'}</td>
                    <td>${log.operator || '-'}</td>
                    <td>₪${log.dailyPrice ? parseFloat(log.dailyPrice).toFixed(2) : '0.00'}</td>
                    <td>${log.transportation || 'לא'}</td>
                    <td>₪${log.transportationCost ? parseFloat(log.transportationCost).toFixed(2) : '0.00'}</td>
                    <td>₪${logTotal.toFixed(2)}</td>
                </tr>
            `;
            
            if (log.notes) {
                reportHTML += `
                    <tr class="notes-row">
                        <td colspan="8">
                            <strong>הערות:</strong> ${log.notes}
                        </td>
                    </tr>
                `;
            }
        });
        
        reportHTML += `
                    </tbody>
                </table>
            </div>
        `;
    });
    
    reportHTML += `
        <div class="print-section">
            <button class="print-btn no-print">הדפס דוח</button>
        </div>
    `;
    
    container.innerHTML = reportHTML;
}

// פונקציית דוח היסטוריית מפעיל
function generateOperatorHistoryReport(logs, container, operatorName) {
    // סינון לוגים לפי מפעיל אם לא סוננו כבר
    let filteredLogs = logs;
    if (operatorName) {
        filteredLogs = logs.filter(log => log.operator === operatorName);
    }
    
    // מיון לוגים לפי תאריך (חדש לישן)
    const sortedLogs = [...filteredLogs].sort((a, b) => {
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(b.date) - new Date(a.date);
    });
    
    // חישוב סכומים וסטטיסטיקה
    let totalDailyPrice = 0;
    let totalTransportation = 0;
    let clients = new Set();
    let locations = new Set();
    
    sortedLogs.forEach(log => {
        totalDailyPrice += parseFloat(log.dailyPrice) || 0;
        totalTransportation += parseFloat(log.transportationCost) || 0;
        if (log.client) clients.add(log.client);
        if (log.location) locations.add(log.location);
    });
    
    const totalWithoutVat = totalDailyPrice + totalTransportation;
    const vat = totalWithoutVat * 0.18;
    const totalWithVat = totalWithoutVat + vat;
    
    // יצירת HTML לדוח
    let reportHTML = `
        <h3>דוח היסטוריית מפעיל${operatorName ? ': ' + operatorName : ''}</h3>
        <p>תאריכים: ${formatDate(document.getElementById('report-date-from').value)} עד ${formatDate(document.getElementById('report-date-to').value)}</p>
        
        <div class="summary-box">
            <div class="summary-item">
                <span class="summary-label">סה"כ עבודות:</span>
                <span class="summary-value">${sortedLogs.length}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">מספר לקוחות:</span>
                <span class="summary-value">${clients.size}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">מספר אתרים:</span>
                <span class="summary-value">${locations.size}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">סה"כ לפני מע"מ:</span>
                <span class="summary-value">₪${totalWithoutVat.toFixed(2)}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">מע"מ (18%):</span>
                <span class="summary-value">₪${vat.toFixed(2)}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">סה"כ כולל מע"מ:</span>
                <span class="summary-value">₪${totalWithVat.toFixed(2)}</span>
            </div>
        </div>
        
        <table class="detailed-table">
            <thead>
                <tr>
                    <th>תאריך</th>
                    <th>לקוח</th>
                    <th>מקום העבודה</th>
                    <th>כלי עבודה</th>
                    <th>מחיר ליום</th>
                    <th>הובלה</th>
                    <th>מחיר הובלה</th>
                    <th>סה"כ</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    sortedLogs.forEach(log => {
        const logTotal = (parseFloat(log.dailyPrice) || 0) + (parseFloat(log.transportationCost) || 0);
        const formattedDate = formatDate(log.date);
        
        reportHTML += `
            <tr>
                <td>${formattedDate}</td>
                <td>${log.client || '-'}</td>
                <td>${log.location || '-'}</td>
                <td>${log.tools || '-'}</td>
                <td>₪${log.dailyPrice ? parseFloat(log.dailyPrice).toFixed(2) : '0.00'}</td>
                <td>${log.transportation || 'לא'}</td>
                <td>₪${log.transportationCost ? parseFloat(log.transportationCost).toFixed(2) : '0.00'}</td>
                <td>₪${logTotal.toFixed(2)}</td>
            </tr>
        `;
        
        if (log.notes) {
            reportHTML += `
                <tr class="notes-row">
                    <td colspan="8">
                        <strong>הערות:</strong> ${log.notes}
                    </td>
                </tr>
            `;
        }
    });
    
    reportHTML += `
            </tbody>
        </table>
        
        <div class="print-section">
            <button class="print-btn no-print">הדפס דוח</button>
        </div>
    `;
    
    container.innerHTML = reportHTML;
}

// פונקציית דוח היסטוריית מקום עבודה
function generateLocationHistoryReport(logs, container, locationName) {
    // סינון לוגים לפי מקום העבודה אם לא סוננו כבר
    let filteredLogs = logs;
    if (locationName) {
        filteredLogs = logs.filter(log => log.location === locationName);
    }
    
    // מיון לוגים לפי תאריך (חדש לישן)
    const sortedLogs = [...filteredLogs].sort((a, b) => {
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(b.date) - new Date(a.date);
    });
    
    // חישוב סכומים וסטטיסטיקה
    let totalDailyPrice = 0;
    let totalTransportation = 0;
    let operators = new Set();
    let clients = new Set();
    
    sortedLogs.forEach(log => {
        totalDailyPrice += parseFloat(log.dailyPrice) || 0;
        totalTransportation += parseFloat(log.transportationCost) || 0;
        if (log.operator) operators.add(log.operator);
        if (log.client) clients.add(log.client);
    });
    
    const totalWithoutVat = totalDailyPrice + totalTransportation;
    const vat = totalWithoutVat * 0.18;
    const totalWithVat = totalWithoutVat + vat;
    
    // מצא פרטי מקום עבודה אם זמינים
    const locationDetails = locationName && typeof locations !== 'undefined' ? 
        locations.find(loc => loc.name === locationName) : null;

    // יצירת HTML לדוח
    let reportHTML = `
        <h3>דוח היסטוריית מקום עבודה${locationName ? ': ' + locationName : ''}</h3>
        <p>תאריכים: ${formatDate(document.getElementById('report-date-from').value)} עד ${formatDate(document.getElementById('report-date-to').value)}</p>
    `;
    
    // הוספת פרטי מקום העבודה אם זמינים
    if (locationDetails) {
        reportHTML += `
            <div class="details-box">
                <div class="detail-row">
                    <div class="detail-label">עיר:</div>
                    <div class="detail-value">${locationDetails.city || '-'}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">כתובת:</div>
                    <div class="detail-value">${locationDetails.address || '-'}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">איש קשר:</div>
                    <div class="detail-value">${locationDetails.contact || '-'}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">טלפון:</div>
                    <div class="detail-value">${locationDetails.contactPhone || '-'}</div>
                </div>
            </div>
        `;
        
        // הוספת תמונה אם זמינה
        if (locationDetails.imageFile) {
            reportHTML += `
                <div class="location-image-container no-print">
                    <h4>תמונת מקום העבודה</h4>
                    <img src="${locationDetails.imageFile.data}" alt="תמונת מקום העבודה" class="location-image">
                </div>
            `;
        }
    }
    
    reportHTML += `
        <div class="summary-box">
            <div class="summary-item">
                <span class="summary-label">סה"כ עבודות:</span>
                <span class="summary-value">${sortedLogs.length}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">סה"כ מפעילים:</span>
                <span class="summary-value">${operators.size}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">סה"כ לקוחות:</span>
                <span class="summary-value">${clients.size}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">סה"כ לפני מע"מ:</span>
                <span class="summary-value">₪${totalWithoutVat.toFixed(2)}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">מע"מ (18%):</span>
                <span class="summary-value">₪${vat.toFixed(2)}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">סה"כ כולל מע"מ:</span>
                <span class="summary-value">₪${totalWithVat.toFixed(2)}</span>
            </div>
        </div>
        
        <table class="detailed-table">
            <thead>
                <tr>
                    <th>תאריך</th>
                    <th>לקוח</th>
                    <th>מפעיל</th>
                    <th>כלי עבודה</th>
                    <th>מחיר ליום</th>
                    <th>הובלה</th>
                    <th>מחיר הובלה</th>
                    <th>סה"כ</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    sortedLogs.forEach(log => {
        const logTotal = (parseFloat(log.dailyPrice) || 0) + (parseFloat(log.transportationCost) || 0);
        const formattedDate = formatDate(log.date);
        
        reportHTML += `
            <tr>
                <td>${formattedDate}</td>
                <td>${log.client || '-'}</td>
                <td>${log.operator || '-'}</td>
                <td>${log.tools || '-'}</td>
                <td>₪${log.dailyPrice ? parseFloat(log.dailyPrice).toFixed(2) : '0.00'}</td>
                <td>${log.transportation || 'לא'}</td>
                <td>₪${log.transportationCost ? parseFloat(log.transportationCost).toFixed(2) : '0.00'}</td>
                <td>₪${logTotal.toFixed(2)}</td>
            </tr>
        `;
        
        if (log.notes) {
            reportHTML += `
                <tr class="notes-row">
                    <td colspan="8">
                        <strong>הערות:</strong> ${log.notes}
                    </td>
                </tr>
            `;
        }
    });
    
    reportHTML += `
            </tbody>
        </table>
        
        <div class="print-section">
            <button class="print-btn no-print">הדפס דוח</button>
        </div>
    `;
    
    container.innerHTML = reportHTML;
}

// פונקציה להפקת דוח כללי פשוט
function generateDefaultReport(logs, container) {
    // חישוב סה"כ
    let totalAmount = 0;
    logs.forEach(log => {
        const dailyPrice = parseFloat(log.dailyPrice) || 0;
        const transportCost = parseFloat(log.transportationCost) || 0;
        totalAmount += dailyPrice + transportCost;
    });
    
    // מיון לוגים לפי תאריך (חדש לישן)
    const sortedLogs = [...logs].sort((a, b) => {
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(b.date) - new Date(a.date);
    });
    
    let reportHTML = `
        <h3>דוח כללי</h3>
        <p>תאריכים: ${formatDate(document.getElementById('report-date-from').value)} עד ${formatDate(document.getElementById('report-date-to').value)}</p>
        <p>נמצאו ${logs.length} רישומי עבודה בטווח המבוקש.</p>
        
        <div class="summary-box">
            <div class="summary-item">
                <span class="summary-label">סה"כ עבודות:</span>
                <span class="summary-value">${logs.length}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">סה"כ:</span>
                <span class="summary-value">₪${totalAmount.toFixed(2)}</span>
            </div>
        </div>
        
        <table class="detailed-table">
            <thead>
                <tr>
                    <th>תאריך</th>
                    <th>לקוח</th>
                    <th>מקום עבודה</th>
                    <th>כלי עבודה</th>
                    <th>מפעיל</th>
                    <th>מחיר ליום</th>
                    <th>סה"כ</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    sortedLogs.forEach(log => {
        const logTotal = (parseFloat(log.dailyPrice) || 0) + (parseFloat(log.transportationCost) || 0);
        const formattedDate = formatDate(log.date);
        
        reportHTML += `
            <tr>
                <td>${formattedDate}</td>
                <td>${log.client || '-'}</td>
                <td>${log.location || '-'}</td>
                <td>${log.tools || '-'}</td>
                <td>${log.operator || '-'}</td>
                <td>₪${log.dailyPrice ? parseFloat(log.dailyPrice).toFixed(2) : '0.00'}</td>
                <td>₪${logTotal.toFixed(2)}</td>
            </tr>
        `;
    });
    
    reportHTML += `
            </tbody>
        </table>
        
        <div class="print-section">
            <button class="print-btn no-print">הדפס דוח</button>
        </div>
    `;
    
    container.innerHTML = reportHTML;
}

// פונקציה לאתחול דוחות
function initReports() {
    console.log("אתחול מודול דוחות");
    
    // הגדרת תאריכים ברירת מחדל אם ריקים (מחודש קודם עד היום)
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(today.getMonth() - 1);
    
    const fromDateInput = document.getElementById('report-date-from');
    const toDateInput = document.getElementById('report-date-to');
    
    if (fromDateInput && !fromDateInput.value) {
        fromDateInput.value = lastMonth.toISOString().split('T')[0];
        console.log(`נקבע תאריך התחלה לדוחות: ${fromDateInput.value}`);
    }
    
    if (toDateInput && !toDateInput.value) {
        toDateInput.value = today.toISOString().split('T')[0];
        console.log(`נקבע תאריך סיום לדוחות: ${toDateInput.value}`);
    }
    
    // וידוא שכפתור הפקת הדוח מתפקד כראוי
    const reportButton = document.querySelector('button[onclick="generateReport()"]');
    if (reportButton) {
        console.log("נמצא כפתור הפקת דוח, מוודא תפקוד תקין");
        reportButton.onclick = function(e) {
            e.preventDefault();
            generateReport();
        };
    }
    
    // בדיקה וודא שקיים אלמנט לתוצאות הדוח
    const reportResult = document.getElementById('report-result');
    if (!reportResult) {
        console.log("חסר אלמנט תוצאות דוח, מנסה ליצור אותו");
        const reportsTab = document.getElementById('reports');
        if (reportsTab) {
            const newResult = document.createElement('div');
            newResult.id = 'report-result';
            newResult.className = 'print-section';
            reportsTab.appendChild(newResult);
            console.log("נוצר אלמנט report-result");
        }
    }
    
    // אתחול מאזיני אירועים לשינוי בסוג הדוח
    const reportTypeSelect = document.getElementById('report-type');
    if (reportTypeSelect) {
        reportTypeSelect.addEventListener('change', function() {
            // עדכון תצוגת שדות סינון בהתאם לסוג הדוח
            const selectedType = this.value;
            
            // הצגה/הסתרה של שדות סינון רלוונטיים
            const clientField = document.getElementById('report-client')?.parentElement;
            const operatorField = document.getElementById('report-operator')?.parentElement;
            const locationField = document.getElementById('report-location')?.parentElement;
            
            if (clientField) {
                clientField.style.display = (selectedType === 'detailed-client-report' || selectedType === 'client-summary') ? 'block' : 'none';
            }
            
            if (operatorField) {
                operatorField.style.display = (selectedType === 'operator-history') ? 'block' : 'none';
            }
            
            if (locationField) {
                locationField.style.display = (selectedType === 'location-history') ? 'block' : 'none';
            }
        });
        
        // הפעלת אירוע שינוי כדי להגדיר את המצב ההתחלתי
        reportTypeSelect.dispatchEvent(new Event('change'));
    }
    
    // אתחול כפתורי הדפסה אם יש כבר דוח מוצג
    updatePrintButtons();
    
    console.log("אתחול מודול דוחות הושלם");
}

// הוספת כפתור PDF לדוחות
function addPDFExportButton() {
    const reportResult = document.getElementById('report-result');
    if (!reportResult) return;
    
    // בדוק אם כבר קיים כפתור ייצוא ל-PDF
    if (!reportResult.querySelector('.pdf-export-btn')) {
        const printSection = reportResult.querySelector('.print-section');
        
        if (printSection) {
            const pdfButton = document.createElement('button');
            pdfButton.className = 'pdf-export-btn no-print';
            pdfButton.innerHTML = 'ייצא ל-PDF';
            pdfButton.onclick = function() {
                alert("פונקציית ייצוא PDF אינה זמינה. ניתן להשתמש בפונקציית הדפסה ולבחור 'שמור כ-PDF'.");
            };
            
            printSection.appendChild(pdfButton);
        }
    }
}

// קריאה לפונקציית האתחול בטעינת הדף
document.addEventListener('DOMContentLoaded', function() {
    // וודא שפונקציית initReports מופעלת בטעינת הדף
    if (document.getElementById('reports')) {
        console.log("נמצא אלמנט reports, מפעיל אתחול מודול דוחות");
        setTimeout(initReports, 300); // תוספת השהייה קטנה לוודא שכל האלמנטים נטענו
    }
    
    // הוספת מאזין אירוע ללשונית דוחות
    const reportsTab = document.querySelector('.tab[onclick="showTab(\'reports\')"]');
    if (reportsTab) {
        reportsTab.addEventListener('click', function() {
            // אתחול מודול דוחות בעת לחיצה על הלשונית
            console.log("מאזין: לחיצה על לשונית דוחות, מאתחל מחדש");
            setTimeout(initReports, 300); // תוספת השהייה קטנה
        });
    }
});