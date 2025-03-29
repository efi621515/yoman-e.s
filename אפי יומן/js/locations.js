// Global locations array
locations = JSON.parse(localStorage.getItem('locations')) || [];

// Check if localStorage is available
function checkLocationsStorage() {
    try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return true;
    } catch (e) {
        return false;
    }
}

// Load locations on page load
function loadLocations() {
    console.log('Loading locations...');
    console.log('Current locations:', locations);
    displayLocations();
    populateLocationDropdowns();
}

// שמירת מקום עבודה
function saveLocation() {
    console.log('שומר מקום עבודה...');
    
    if (!checkLocationsStorage()) {
        alert('שגיאה: לא ניתן לגשת ל-localStorage. וודא שהדפדפן תומך בו ושהוא מופעל.');
        return;
    }
    
    const locationId = document.getElementById('location-id').value;
    const locationName = document.getElementById('location-name').value;
    const locationAddress = document.getElementById('location-address').value;
    const locationCity = document.getElementById('location-city').value;
    const locationContact = document.getElementById('location-contact').value;
    const locationContactPhone = document.getElementById('location-contact-phone').value;
    const locationNotes = document.getElementById('location-notes').value;
    
    console.log('נתוני מקום עבודה:', { locationId, locationName, locationAddress, locationCity });
    
    if (!locationName) {
        alert('נא להזין שם מקום עבודה');
        return;
    }
    
    // טיפול בהעלאת התמונה
    const imageFileInput = document.getElementById('location-image-file');
    let imageFile = null;
    
    // אם עורכים, שמור על התמונה הקיימת
    if (locationId) {
        const existingLocation = locations.find(loc => loc.id === locationId);
        if (existingLocation && existingLocation.imageFile) {
            imageFile = existingLocation.imageFile;
        }
    }
    
    // בדיקה אם יש קובץ תמונה חדש
    if (imageFileInput.files && imageFileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imageFile = {
                name: imageFileInput.files[0].name,
                type: imageFileInput.files[0].type,
                data: e.target.result
            };
            
            completeLocationSave(locationId, locationName, locationAddress, locationCity, 
                                locationContact, locationContactPhone, locationNotes, imageFile);
        };
        reader.readAsDataURL(imageFileInput.files[0]);
    } else {
        // אין תמונה חדשה, המשך לשמירה
        completeLocationSave(locationId, locationName, locationAddress, locationCity, 
                            locationContact, locationContactPhone, locationNotes, imageFile);
    }
}

// פונקציית עזר להשלמת שמירת מקום העבודה
function completeLocationSave(locationId, locationName, locationAddress, locationCity, 
                            locationContact, locationContactPhone, locationNotes, imageFile) {
    // בדיקה אם עורכים מקום קיים או מוסיפים חדש
    if (locationId) {
        // עריכת מקום קיים
        const index = locations.findIndex(location => location.id === locationId);
        if (index !== -1) {
            locations[index] = {
                id: locationId,
                name: locationName,
                address: locationAddress,
                city: locationCity,
                contact: locationContact,
                contactPhone: locationContactPhone,
                notes: locationNotes,
                imageFile: imageFile,
                createdAt: locations[index].createdAt,
                updatedAt: new Date().toISOString()
            };
        }
    } else {
        // הוספת מקום חדש
        const newLocation = {
            id: Date.now().toString(),
            name: locationName,
            address: locationAddress,
            city: locationCity,
            contact: locationContact,
            contactPhone: locationContactPhone,
            notes: locationNotes,
            imageFile: imageFile,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        locations.push(newLocation);
    }
    
    // שמירה ב-localStorage
    try {
        localStorage.setItem('locations', JSON.stringify(locations));
        console.log('מקומות עבודה נשמרו בהצלחה');
        
        // ניקוי טופס
        clearLocationForm();
        
        // עדכון תצוגה
        displayLocations();
        populateLocationDropdowns();
        
        alert('מקום העבודה נשמר בהצלחה');
    } catch (e) {
        console.error('שגיאה בשמירת מקום העבודה:', e);
        alert('שגיאה בשמירת מקום העבודה: ' + e.message);
    }
}

// Clear location form
function clearLocationForm() {
    document.getElementById('location-id').value = '';
    document.getElementById('location-name').value = '';
    document.getElementById('location-address').value = '';
    document.getElementById('location-city').value = '';
    document.getElementById('location-contact').value = '';
    document.getElementById('location-contact-phone').value = '';
    document.getElementById('location-notes').value = '';
    document.getElementById('location-image-file').value = '';
    
    // Reset image indicator
    const imageFileIndicator = document.getElementById('image-file-indicator');
    if (imageFileIndicator) imageFileIndicator.textContent = 'אין תמונה';
    
    // Reset button text
    document.getElementById('save-location-btn').textContent = 'שמור מקום עבודה';
}

// Populate location dropdowns in forms
function populateLocationDropdowns() {
    // Get all location dropdown elements
    const locationDropdowns = document.querySelectorAll('.location-dropdown');
    
    locationDropdowns.forEach(dropdown => {
        // Save current selection if exists
        const currentSelection = dropdown.value;
        
        // Clear existing options (except the empty default option)
        while (dropdown.options.length > 1) {
            dropdown.remove(1);
        }
        
        // Sort locations alphabetically by name
        const sortedLocations = [...locations].sort((a, b) => a.name.localeCompare(b.name));
        
        // Add options for each location
        sortedLocations.forEach(location => {
            const option = document.createElement('option');
            option.value = location.name;
            option.textContent = location.name;
            dropdown.appendChild(option);
        });
        
        // Restore previous selection if it exists
        if (currentSelection && dropdown.querySelector(`option[value="${currentSelection}"]`)) {
            dropdown.value = currentSelection;
        }
    });
}

// Get location name by ID
function getLocationNameById(id) {
    const location = locations.find(location => location.id === id);
    return location ? location.name : '';
}

// Get location ID by name
function getLocationIdByName(name) {
    const location = locations.find(location => location.name === name);
    return location ? location.id : '';
}

// Show location details
function showLocationDetails(id) {
    const location = locations.find(location => location.id === id);
    
    if (!location) {
        alert('מקום העבודה לא נמצא');
        return;
    }
    
    // Get location history from work logs
    const locationLogs = workLogs.filter(log => log.location === location.name);
    
    // Show location details modal
    const locationDetailsContainer = document.getElementById('location-details');
    const locationDetailsContent = document.getElementById('location-details-content');
    
    if (!locationDetailsContainer || !locationDetailsContent) {
        console.error('location-details or location-details-content elements not found');
        return;
    }
    
    // Format dates
    const createdAtDate = new Date(location.createdAt);
    const formattedCreatedAt = `${createdAtDate.getDate()}/${createdAtDate.getMonth() + 1}/${createdAtDate.getFullYear()}`;
    
    // Generate HTML for location details
    let detailsHTML = `
        <div class="location-profile">
            <h3>פרטי מקום עבודה: ${location.name}</h3>
            <div class="location-info">
                <div class="location-details-grid">
                    <div class="info-group">
                        <label>עיר:</label>
                        <div>${location.city || '-'}</div>
                    </div>
                    <div class="info-group">
                        <label>כתובת:</label>
                        <div>${location.address || '-'}</div>
                    </div>
                    <div class="info-group">
                        <label>איש קשר:</label>
                        <div>${location.contact || '-'}</div>
                    </div>
                    <div class="info-group">
                        <label>טלפון איש קשר:</label>
                        <div>${location.contactPhone || '-'}</div>
                    </div>
                    <div class="info-group">
                        <label>הערות:</label>
                        <div>${location.notes || '-'}</div>
                    </div>
                    <div class="info-group">
                        <label>תאריך הוספה:</label>
                        <div>${formattedCreatedAt}</div>
                    </div>
                </div>
            `;
            
    // Add location image if available
    if (location.imageFile) {
        detailsHTML += `
                <div class="location-image-container">
                    <h4>תמונה</h4>
                    <img src="${location.imageFile.data}" alt="תמונת מקום העבודה" class="location-image">
                </div>
            `;
    }
    
    detailsHTML += `</div>`;
    
    // Add work history if available
    if (locationLogs.length > 0) {
        // Sort by date (newest first)
        const sortedLogs = [...locationLogs].sort((a, b) => new Date(b.date) - new Date(a.date));
        const recentLogs = sortedLogs.slice(0, 5); // Show 5 most recent
        
        detailsHTML += `
            <div class="location-history">
                <h4>היסטוריית עבודה במקום</h4>
                <table class="details-table">
                    <thead>
                        <tr>
                            <th>תאריך</th>
                            <th>לקוח</th>
                            <th>כלי עבודה</th>
                            <th>מפעיל</th>
                            <th>מחיר</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        recentLogs.forEach(log => {
            const formattedDate = formatDate(log.date);
            const totalPrice = (parseFloat(log.dailyPrice) || 0) + (parseFloat(log.transportationCost) || 0);
            
            detailsHTML += `
                <tr>
                    <td>${formattedDate}</td>
                    <td>${log.client}</td>
                    <td>${log.tools || '-'}</td>
                    <td>${log.operator || '-'}</td>
                    <td>₪${totalPrice.toFixed(2)}</td>
                </tr>
            `;
        });
        
        detailsHTML += `
                    </tbody>
                </table>
                ${locationLogs.length > 5 ? `<div class="see-more-link"><a href="#" onclick="showAllLocationHistory('${location.id}')">צפה בכל ההיסטוריה</a></div>` : ''}
            </div>
        `;
    }
    
    // Add action buttons
    detailsHTML += `
        <div class="modal-actions">
            <button class="edit-btn" onclick="editLocation('${location.id}'); closeLocationDetails();">ערוך</button>
            <button onclick="closeLocationDetails()">סגור</button>
        </div>
    `;
    
    // Update modal content and show it
    locationDetailsContent.innerHTML = detailsHTML;
    locationDetailsContainer.style.display = 'block';
}

// Close location details modal
function closeLocationDetails() {
    const locationDetailsContainer = document.getElementById('location-details');
    if (locationDetailsContainer) {
        locationDetailsContainer.style.display = 'none';
    }
}

// Show all location history
function showAllLocationHistory(locationId) {
    const location = locations.find(location => location.id === locationId);
    
    if (!location) return;
    
    // Navigate to reports tab
    showTab('reports');
    
    // Set report parameters
    document.getElementById('report-type').value = 'location-history';
    document.getElementById('report-location').value = location.name;
    
    // Close modal
    closeLocationDetails();
    
    // Generate report
    generateReport();
}

// Search locations
function searchLocations() {
    const searchText = document.getElementById('search-location-text').value.toLowerCase();
    
    if (!searchText) {
        displayLocations();
        return;
    }
    
    const filteredLocations = locations.filter(location => 
        location.name.toLowerCase().includes(searchText) ||
        (location.city && location.city.toLowerCase().includes(searchText)) ||
        (location.address && location.address.toLowerCase().includes(searchText)) ||
        (location.contact && location.contact.toLowerCase().includes(searchText))
    );
    
    displayLocations(filteredLocations);
}

// Display locations in table
function displayLocations(locationsToDisplay = null) {
    const tableBody = document.getElementById('locations-body');
    if (!tableBody) {
        console.error('locations-body element not found');
        return;
    }
    
    tableBody.innerHTML = '';
    
    const displayLocations = locationsToDisplay || locations;
    
    // Sort locations alphabetically by name
    const sortedLocations = [...displayLocations].sort((a, b) => a.name.localeCompare(b.name));
    
    if (sortedLocations.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="6" class="text-center">לא נמצאו מקומות עבודה</td>`;
        tableBody.appendChild(row);
        return;
    }
    
    sortedLocations.forEach(location => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${location.name}</td>
            <td>${location.city || '-'}</td>
            <td>${location.address || '-'}</td>
            <td>${location.contact || '-'}</td>
            <td>${location.imageFile ? '<span class="file-indicator">✓</span>' : '-'}</td>
            <td class="actions">
                <button class="edit-btn" onclick="editLocation('${location.id}')">ערוך</button>
                <button class="delete-btn" onclick="deleteLocation('${location.id}')">מחק</button>
                <button class="info-btn" onclick="showLocationDetails('${location.id}')">פרטים</button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Edit location
function editLocation(id) {
    const location = locations.find(location => location.id === id);
    
    if (location) {
        document.getElementById('location-id').value = location.id;
        document.getElementById('location-name').value = location.name;
        document.getElementById('location-address').value = location.address || '';
        document.getElementById('location-city').value = location.city || '';
        document.getElementById('location-contact').value = location.contact || '';
        document.getElementById('location-contact-phone').value = location.contactPhone || '';
        document.getElementById('location-notes').value = location.notes || '';
        
        // Update image indicator
        const imageFileIndicator = document.getElementById('image-file-indicator');
        if (imageFileIndicator) {
            imageFileIndicator.textContent = location.imageFile ? 'תמונה קיימת: ' + location.imageFile.name : 'אין תמונה';
        }
        
        // Change button text
        document.getElementById('save-location-btn').textContent = 'עדכן מקום עבודה';
        
        // Scroll to form
        document.getElementById('location-form').scrollIntoView();
    }
}

// Delete location
function deleteLocation(id) {
    // Check if location is used in work logs
    const workLogsWithLocation = workLogs.filter(log => log.location === getLocationNameById(id));
    
    if (workLogsWithLocation.length > 0) {
        const message = `לא ניתן למחוק את מקום העבודה מכיוון שהוא משויך ל-${workLogsWithLocation.length} רישומי עבודה.`;
        alert(message);
        return;
    }
    
    if (confirm('האם אתה בטוח שברצונך למחוק את מקום העבודה הזה?')) {
        locations = locations.filter(location => location.id !== id);
        localStorage.setItem('locations', JSON.stringify(locations));
        
        displayLocations();
        populateLocationDropdowns();
        
        alert('מקום העבודה נמחק בהצלחה');
    }
}

// Initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing locations module');
    loadLocations();
});