// Application State
let acknowledgmentTypes = [
    {
        id: 'remote-work',
        title: 'Remote Area Working Acknowledgement',
        description: 'إقرار إلتزام بتعليمات العمل في المناطق النائية',
        icon: '💻',
        content: {
            arabic: 'إقرار إلتزام بتعليمات العمل في المناطق النائية',
            subtitle: 'Remote Area Working Acknowledgement',
            description: `أقر بأنني تقدمت بناءاً على رغبتي واختياري بطلب الأنتقال للعمل في المنطقة النائية لمدة سنتين او في اي وقت يحدد حسب مايتطلبه العمل إستناداً إلى أنظمة التنقل في إدارة الأمن الصناعي

كما أنني أوافق على الشروط الواردة أدناه الخاصة بالعمل في المناطق النائية:-`,
            rules: [
                'إستخدام السكن الموفر من قبل الشركة طيلة فترة النوبة الأسبوعية.',
                'إستخدام المواصلات الموفرة من قبل الشركة وعدم إستخدام المركبة الشخصية للتنقل للعمل',
                'الإلتزام واتباع جميع أنظمة وتعليمات السلامة وفق سياسات وأنظمة الشركة.'
            ]
        }
    },
    {
        id: 'transfer',
        title: 'Transfer Acknowledgment',
        description: 'Acknowledge transfer policies and procedures',
        icon: '📄'
    },
    {
        id: 'safety',
        title: 'Safety Acknowledgment',
        description: 'Acknowledge safety protocols and guidelines',
        icon: '🛡️'
    },
    {
        id: 'security',
        title: 'Security Acknowledgment',
        description: 'Acknowledge security policies and data protection',
        icon: '⚠️'
    },
    {
        id: 'training',
        title: 'Training Acknowledgment',
        description: 'Acknowledge completion of mandatory training',
        icon: '👥'
    }
];

let submissions = [];
let currentSelectedType = '';
let currentFormData = {
    requestNo: '',
    employeeName: '',
    acknowledged: false
};

// DOM Elements
const acknowledgmentGrid = document.getElementById('acknowledgmentGrid');
const submissionsSection = document.getElementById('submissionsSection');
const submissionsList = document.getElementById('submissionsList');
const searchInput = document.getElementById('searchInput');
const acknowledgmentModal = document.getElementById('acknowledgmentModal');
const addTypeModal = document.getElementById('addTypeModal');
const submissionModal = document.getElementById('submissionModal');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    renderAcknowledmentTypes();
    setupEventListeners();
    updateSubmissionsDisplay();
});

// Event Listeners
function setupEventListeners() {
    // Add new type button
    document.getElementById('addNewTypeBtn').addEventListener('click', openAddTypeModal);
    
    // Search input
    searchInput.addEventListener('input', handleSearch);
    
    // Modal close buttons
    document.getElementById('closeModal').addEventListener('click', closeAcknowledmentModal);
    document.getElementById('closeAddTypeModal').addEventListener('click', closeAddTypeModal);
    document.getElementById('closeSubmissionModal').addEventListener('click', closeSubmissionModal);
    
    // Add type modal buttons
    document.getElementById('saveNewTypeBtn').addEventListener('click', saveNewType);
    document.getElementById('cancelNewTypeBtn').addEventListener('click', closeAddTypeModal);
    document.getElementById('addSectionBtn').addEventListener('click', addSection);
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === acknowledgmentModal) {
            closeAcknowledmentModal();
        }
        if (event.target === addTypeModal) {
            closeAddTypeModal();
        }
        if (event.target === submissionModal) {
            closeSubmissionModal();
        }
    });
}

// Render acknowledgment types
function renderAcknowledmentTypes() {
    acknowledgmentGrid.innerHTML = '';
    
    acknowledgmentTypes.forEach(type => {
        const card = document.createElement('div');
        card.className = 'acknowledgment-card';
        card.onclick = () => selectAcknowledmentType(type.id);
        
        card.innerHTML = `
            ${type.id.startsWith('custom-') ? 
                `<button class="delete-btn" onclick="event.stopPropagation(); deleteType('${type.id}')">×</button>` : 
                ''
            }
            <div class="acknowledgment-icon">${type.icon}</div>
            <h3>${type.title}</h3>
            <p>${type.description}</p>
        `;
        
        acknowledgmentGrid.appendChild(card);
    });
}

// Select acknowledgment type
function selectAcknowledmentType(typeId) {
    currentSelectedType = typeId;
    currentFormData = {
        requestNo: `${new Date().getFullYear()}/${Math.floor(Math.random() * 1000000)}`,
        employeeName: '',
        acknowledged: false
    };
    openAcknowledmentModal();
}

// Open acknowledgment modal
function openAcknowledmentModal() {
    const selectedType = acknowledgmentTypes.find(t => t.id === currentSelectedType);
    if (!selectedType) return;
    
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = selectedType.title;
    
    if (selectedType.id === 'remote-work' && selectedType.content) {
        modalBody.innerHTML = generateRemoteWorkForm(selectedType);
    } else {
        modalBody.innerHTML = generateStandardForm(selectedType);
    }
    
    acknowledgmentModal.style.display = 'block';
    updateFormInputs();
}

// Generate remote work form
function generateRemoteWorkForm(type) {
    return `
        <div class="remote-work-content">
            <div class="remote-work-header">
                <h1 class="arabic-title">${type.content.arabic}</h1>
                <h2 class="subtitle">${type.content.subtitle}</h2>
            </div>
            
            <div class="content-section">
                <div class="arabic-content">
                    <p>${type.content.description}</p>
                </div>
                
                ${type.content.rules ? `
                <div class="arabic-content">
                    <ol class="rules-list">
                        ${type.content.rules.map(rule => `<li>${rule}</li>`).join('')}
                    </ol>
                </div>
                ` : ''}
            </div>
            
            <div class="notice">
                <div class="notice-content">
                    <div class="notice-dot"></div>
                    <p class="notice-text">
                        The content of this item will be sent as an e-mail message to the person or group assigned to the item.
                    </p>
                </div>
            </div>
            
            <div class="form-section">
                <h3>Request Information</h3>
                
                <div class="form-row">
                    <label class="form-label">Request No:</label>
                    <input type="text" id="requestNoInput" class="form-input" value="${currentFormData.requestNo}">
                </div>
                
                <div class="form-row">
                    <label class="form-label">Employee Name:</label>
                    <input type="text" id="employeeNameInput" class="form-input" placeholder="Enter employee name" value="${currentFormData.employeeName}">
                </div>
                
                <div class="form-row">
                    <label class="form-label">Acknowledgment *</label>
                    <div class="checkbox-group">
                        <input type="checkbox" id="acknowledgedCheckbox" class="checkbox" ${currentFormData.acknowledged ? 'checked' : ''}>
                        <label for="acknowledgedCheckbox" class="checkbox-label">
                            I acknowledge that I have read, understood and agree to the above policies and procedures
                        </label>
                    </div>
                </div>
            </div>
            
            <div class="form-actions">
                <button onclick="submitAcknowledgment()" class="btn btn-green">Submit</button>
                <button onclick="closeAcknowledmentModal()" class="btn btn-red">Cancel</button>
            </div>
        </div>
    `;
}

// Generate standard form
function generateStandardForm(type) {
    return `
        <div class="content-section">
            <p>${type.description}</p>
            ${type.content ? `
                <div style="margin-top: 1rem;">
                    <p>${type.content.description || ''}</p>
                    ${type.content.rules ? `
                        <ul style="margin-top: 1rem; padding-left: 1rem;">
                            ${type.content.rules.map(rule => `<li style="margin-bottom: 0.5rem;">${rule}</li>`).join('')}
                        </ul>
                    ` : ''}
                </div>
            ` : ''}
        </div>
        
        <div class="form-section">
            <h3>Request Information</h3>
            
            <div class="form-row">
                <label class="form-label">Request No:</label>
                <input type="text" id="requestNoInput" class="form-input" value="${currentFormData.requestNo}">
            </div>
            
            <div class="form-row">
                <label class="form-label">Employee Name:</label>
                <input type="text" id="employeeNameInput" class="form-input" placeholder="Enter employee name" value="${currentFormData.employeeName}">
            </div>
            
            <div class="form-row">
                <label class="form-label">Acknowledgment *</label>
                <div class="checkbox-group">
                    <input type="checkbox" id="acknowledgedCheckbox" class="checkbox" ${currentFormData.acknowledged ? 'checked' : ''}>
                    <label for="acknowledgedCheckbox" class="checkbox-label">
                        I acknowledge that I have read, understood and agree to the above policies and procedures
                    </label>
                </div>
            </div>
        </div>
        
        <div class="form-actions">
            <button onclick="submitAcknowledgment()" class="btn btn-green">Submit</button>
            <button onclick="closeAcknowledmentModal()" class="btn btn-red">Cancel</button>
        </div>
    `;
}

// Update form inputs
function updateFormInputs() {
    setTimeout(() => {
        const requestNoInput = document.getElementById('requestNoInput');
        const employeeNameInput = document.getElementById('employeeNameInput');
        const acknowledgedCheckbox = document.getElementById('acknowledgedCheckbox');
        
        if (requestNoInput) {
            requestNoInput.addEventListener('input', (e) => {
                currentFormData.requestNo = e.target.value;
            });
        }
        
        if (employeeNameInput) {
            employeeNameInput.addEventListener('input', (e) => {
                currentFormData.employeeName = e.target.value;
            });
        }
        
        if (acknowledgedCheckbox) {
            acknowledgedCheckbox.addEventListener('change', (e) => {
                currentFormData.acknowledged = e.target.checked;
            });
        }
    }, 100);
}

// Submit acknowledgment
function submitAcknowledgment() {
    // Update form data from inputs
    const requestNoInput = document.getElementById('requestNoInput');
    const employeeNameInput = document.getElementById('employeeNameInput');
    const acknowledgedCheckbox = document.getElementById('acknowledgedCheckbox');
    
    if (requestNoInput) currentFormData.requestNo = requestNoInput.value;
    if (employeeNameInput) currentFormData.employeeName = employeeNameInput.value;
    if (acknowledgedCheckbox) currentFormData.acknowledged = acknowledgedCheckbox.checked;
    
    if (!currentFormData.acknowledged) {
        showToast('Please check the acknowledgment box to continue.', 'error');
        return;
    }
    
    if (!currentFormData.employeeName.trim()) {
        showToast('Please enter the employee name.', 'error');
        return;
    }
    
    const selectedType = acknowledgmentTypes.find(t => t.id === currentSelectedType);
    const newSubmission = {
        id: Date.now().toString(),
        type: selectedType.title,
        employeeName: currentFormData.employeeName,
        requestNo: currentFormData.requestNo,
        date: new Date().toLocaleDateString(),
        acknowledged: currentFormData.acknowledged
    };
    
    submissions.push(newSubmission);
    closeAcknowledmentModal();
    updateSubmissionsDisplay();
    showToast('Your acknowledgment has been successfully recorded.', 'success');
}

// Close acknowledgment modal
function closeAcknowledmentModal() {
    acknowledgmentModal.style.display = 'none';
}

// Open add type modal
function openAddTypeModal() {
    resetAddTypeForm();
    addTypeModal.style.display = 'block';
}

// Close add type modal
function closeAddTypeModal() {
    addTypeModal.style.display = 'none';
}

// Reset add type form
function resetAddTypeForm() {
    document.getElementById('newTypeTitle').value = '';
    document.getElementById('newTypeDescription').value = '';
    document.getElementById('newTypeContent').value = '';
    
    const sectionsContainer = document.getElementById('sectionsContainer');
    sectionsContainer.innerHTML = `
        <div class="section-input-group">
            <input type="text" class="section-input" placeholder="Enter section/rule">
            <button type="button" class="btn-remove-section" onclick="removeSection(this)">Remove</button>
        </div>
    `;
}

// Add section
function addSection() {
    const sectionsContainer = document.getElementById('sectionsContainer');
    const newSection = document.createElement('div');
    newSection.className = 'section-input-group';
    newSection.innerHTML = `
        <input type="text" class="section-input" placeholder="Enter section/rule">
        <button type="button" class="btn-remove-section" onclick="removeSection(this)">Remove</button>
    `;
    sectionsContainer.appendChild(newSection);
}

// Remove section
function removeSection(button) {
    const sectionsContainer = document.getElementById('sectionsContainer');
    const sectionGroups = sectionsContainer.querySelectorAll('.section-input-group');
    
    if (sectionGroups.length > 1) {
        button.parentElement.remove();
    }
}

// Save new type
function saveNewType() {
    const title = document.getElementById('newTypeTitle').value.trim();
    const description = document.getElementById('newTypeDescription').value.trim();
    const content = document.getElementById('newTypeContent').value.trim();
    
    if (!title || !description) {
        showToast('Please fill in all required fields.', 'error');
        return;
    }
    
    const sectionInputs = document.querySelectorAll('.section-input');
    const rules = Array.from(sectionInputs)
        .map(input => input.value.trim())
        .filter(value => value !== '');
    
    const newType = {
        id: `custom-${Date.now()}`,
        title: title,
        description: description,
        icon: '📄',
        content: {
            description: content,
            rules: rules
        }
    };
    
    acknowledgmentTypes.push(newType);
    renderAcknowledmentTypes();
    closeAddTypeModal();
    showToast('New acknowledgment type has been created successfully.', 'success');
}

// Delete type
function deleteType(typeId) {
    acknowledgmentTypes = acknowledgmentTypes.filter(type => type.id !== typeId);
    renderAcknowledmentTypes();
    showToast('Acknowledgment type has been deleted successfully.', 'success');
}

// Handle search
function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase();
    updateSubmissionsDisplay(searchTerm);
}

// Update submissions display
function updateSubmissionsDisplay(searchTerm = '') {
    if (submissions.length === 0) {
        submissionsSection.style.display = 'none';
        return;
    }
    
    submissionsSection.style.display = 'block';
    
    const filteredSubmissions = submissions.filter(submission => 
        searchTerm === '' || 
        submission.employeeName.toLowerCase().includes(searchTerm)
    );
    
    if (filteredSubmissions.length === 0 && searchTerm) {
        submissionsList.innerHTML = `
            <div class="empty-state">
                <div class="icon">🔍</div>
                <p>No submissions found for "${searchTerm}"</p>
                <p style="font-size: 0.875rem;">Try searching with a different employee name</p>
            </div>
        `;
    } else if (filteredSubmissions.length === 0) {
        submissionsList.innerHTML = `
            <div class="empty-state">
                <p>Enter an employee name to search for submissions</p>
            </div>
        `;
    } else {
        submissionsList.innerHTML = filteredSubmissions.map(submission => `
            <div class="submission-item" onclick="openSubmissionModal('${submission.id}')">
                <div class="submission-left">
                    <h3>${submission.type}</h3>
                    <p>Request No: ${submission.requestNo}</p>
                    <p>Employee: ${submission.employeeName}</p>
                </div>
                <div class="submission-right">
                    <p>${submission.date}</p>
                    <span class="submission-status">
                        ✓ Acknowledged
                    </span>
                </div>
            </div>
        `).join('');
    }
}

// Open submission modal
function openSubmissionModal(submissionId) {
    const submission = submissions.find(s => s.id === submissionId);
    if (!submission) return;
    
    const modalBody = document.getElementById('submissionModalBody');
    const ackType = acknowledgmentTypes.find(type => type.title === submission.type);
    
    modalBody.innerHTML = `
        <div class="submission-details">
            <div class="detail-row">
                <span class="detail-label">Type:</span>
                <span class="detail-value">${submission.type}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Request No:</span>
                <span class="detail-value">${submission.requestNo}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Employee Name:</span>
                <span class="detail-value">${submission.employeeName}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span class="detail-value">${submission.date}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="detail-value">${submission.acknowledged ? 'Acknowledged' : 'Not Acknowledged'}</span>
            </div>
        </div>
        
        ${ackType?.content ? `
            <div class="content-section">
                <h3 style="margin-bottom: 1rem; font-weight: 600;">Content:</h3>
                ${ackType.content.description ? `<p style="margin-bottom: 1rem;">${ackType.content.description}</p>` : ''}
                ${ackType.content.rules ? `
                    <div>
                        <h4 style="margin-bottom: 0.5rem; font-weight: 600;">Rules/Sections:</h4>
                        <ol style="padding-left: 1rem;">
                            ${ackType.content.rules.map(rule => `<li style="margin-bottom: 0.5rem;">${rule}</li>`).join('')}
                        </ol>
                    </div>
                ` : ''}
            </div>
        ` : ''}
        
        <div class="export-button">
            <button onclick="exportSubmissionToPDF('${submission.id}')" class="btn btn-blue">
                📄 Export PDF
            </button>
        </div>
    `;
    
    submissionModal.style.display = 'block';
}

// Close submission modal
function closeSubmissionModal() {
    submissionModal.style.display = 'none';
}

// Export submission to PDF
function exportSubmissionToPDF(submissionId) {
    const submission = submissions.find(s => s.id === submissionId);
    if (!submission) return;
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('YSOD Digital Acknowledgment Form Hub', pageWidth / 2, 30, { align: 'center' });
    
    // Submission details
    doc.setFontSize(16);
    doc.text('Acknowledgment Submission', pageWidth / 2, 50, { align: 'center' });
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    let yPosition = 80;
    doc.text(`Type: ${submission.type}`, 20, yPosition);
    yPosition += 15;
    doc.text(`Request No: ${submission.requestNo}`, 20, yPosition);
    yPosition += 15;
    doc.text(`Employee Name: ${submission.employeeName}`, 20, yPosition);
    yPosition += 15;
    doc.text(`Date: ${submission.date}`, 20, yPosition);
    yPosition += 15;
    doc.text(`Status: ${submission.acknowledged ? 'Acknowledged' : 'Not Acknowledged'}`, 20, yPosition);
    
    // Find the acknowledgment type details
    const ackType = acknowledgmentTypes.find(type => type.title === submission.type);
    if (ackType?.content) {
        yPosition += 30;
        doc.setFont('helvetica', 'bold');
        doc.text('Content:', 20, yPosition);
        yPosition += 15;
        doc.setFont('helvetica', 'normal');
        
        if (ackType.content.description) {
            const lines = doc.splitTextToSize(ackType.content.description, pageWidth - 40);
            doc.text(lines, 20, yPosition);
            yPosition += lines.length * 8;
        }
        
        if (ackType.content.rules && ackType.content.rules.length > 0) {
            yPosition += 10;
            doc.setFont('helvetica', 'bold');
            doc.text('Rules/Sections:', 20, yPosition);
            yPosition += 15;
            doc.setFont('helvetica', 'normal');
            
            ackType.content.rules.forEach((rule, index) => {
                const ruleText = `${index + 1}. ${rule}`;
                const lines = doc.splitTextToSize(ruleText, pageWidth - 40);
                doc.text(lines, 20, yPosition);
                yPosition += lines.length * 8 + 5;
            });
        }
    }
    
    // Footer
    yPosition += 30;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, yPosition);
    
    doc.save(`acknowledgment_${submission.requestNo}.pdf`);
    showToast('Acknowledgment has been exported successfully.', 'success');
}

// Show toast notification
function showToast(message, type = 'success') {
    toastMessage.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}