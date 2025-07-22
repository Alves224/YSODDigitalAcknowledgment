// Data
const mockAdminList = [
    { title: 'amer.alsomali@domain.com', role: 'Admin' },
    { title: 'admin2@domain.com', role: 'Admin' }
];

const mockSupervisorList = [
    { employeeName: 'Ahmed Khaled', supervisorEmail: 'supervisorA@domain.com', unit: 'YSOD Unit #1' },
    { employeeName: 'Reem Abdullah', supervisorEmail: 'supervisorB@domain.com', unit: 'YSOD Unit #2' },
    { employeeName: 'Mohammed Hassan', supervisorEmail: 'supervisorA@domain.com', unit: 'YSOD Unit #3' },
    { employeeName: 'Sara Ahmed', supervisorEmail: 'supervisorB@domain.com', unit: 'YSOD Unit #4' },
    { employeeName: 'Omar Khalil', supervisorEmail: 'supervisorC@domain.com', unit: 'YST Unit & Day Concept' }
];

const mockUsers = [
    'amer.alsomali@domain.com',
    'supervisorA@domain.com', 
    'supervisorB@domain.com',
    'supervisorC@domain.com',
    'ahmed.khaled@domain.com',
    'reem.abdullah@domain.com',
    'mohammed.hassan@domain.com',
    'sara.ahmed@domain.com',
    'omar.khalil@domain.com'
];

const acknowledgmentTypes = [
    {
        id: 'remote-work',
        title: 'Remote Area Working Acknowledgement',
        description: 'إقرار إلتزام بتعليمات العمل في المناطق النائية',
        icon: '💻'
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

// State
let currentUser = null;
let submissions = [];
let emailNotifications = [];
let selectedType = null;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadSavedUser();
});

function initializeApp() {
    populateUserSelects();
    setupTabs();
    checkAuth();
}

function setupEventListeners() {
    document.getElementById('loginBtn').addEventListener('click', handleLogin);
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    document.getElementById('userSwitcher').addEventListener('change', handleUserSwitch);
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('cancelModal').addEventListener('click', closeModal);
    document.getElementById('submitAcknowledgment').addEventListener('click', handleSubmitAcknowledgment);
}

function populateUserSelects() {
    const selects = [document.getElementById('userSelect'), document.getElementById('userSwitcher')];
    selects.forEach(select => {
        select.innerHTML = '<option value="">Select User</option>';
        mockUsers.forEach(user => {
            const option = document.createElement('option');
            option.value = user;
            option.textContent = user;
            select.appendChild(option);
        });
    });
}

function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tabId = e.target.id.replace('Tab', '');
            switchTab(tabId);
        });
    });
}

function switchTab(tabId) {
    // Update active tab button
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(tabId + 'Tab').classList.add('active');
    
    // Update active tab content
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(tabId + 'Content').classList.add('active');
}

function determineUserRole(email) {
    // Check if admin
    const isAdmin = mockAdminList.find(admin => admin.title === email);
    if (isAdmin) {
        return {
            email,
            name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
            role: 'Admin'
        };
    }

    // Check if supervisor
    const supervisorUnits = mockSupervisorList.filter(item => item.supervisorEmail === email);
    if (supervisorUnits.length > 0) {
        return {
            email,
            name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
            role: 'Supervisor',
            unit: supervisorUnits[0].unit
        };
    }

    // Check if employee
    const employeeInfo = mockSupervisorList.find(item => 
        item.employeeName.toLowerCase().replace(' ', '.') + '@domain.com' === email
    );
    if (employeeInfo) {
        return {
            email,
            name: employeeInfo.employeeName,
            role: 'Employee',
            unit: employeeInfo.unit,
            supervisorEmail: employeeInfo.supervisorEmail
        };
    }

    return null;
}

function handleLogin() {
    const email = document.getElementById('userSelect').value;
    if (!email) return;

    const user = determineUserRole(email);
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        showMainApp();
    }
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showLoginForm();
}

function handleUserSwitch() {
    const email = document.getElementById('userSwitcher').value;
    if (!email) return;

    const user = determineUserRole(email);
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        updateUserInterface();
    }
}

function loadSavedUser() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showMainApp();
    }
}

function checkAuth() {
    if (currentUser) {
        showMainApp();
    } else {
        showLoginForm();
    }
}

function showLoginForm() {
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('mainApp').classList.add('hidden');
}

function showMainApp() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
    updateUserInterface();
}

function updateUserInterface() {
    // Update user info
    document.getElementById('currentUserInfo').textContent = `${currentUser.name} (${currentUser.role})`;
    document.getElementById('userSwitcher').value = currentUser.email;
    
    // Update role description
    const descriptions = {
        'Admin': 'Full system administration and management',
        'Supervisor': 'Manage your team acknowledgments and submissions',
        'Employee': 'Select the type of acknowledgment you need to complete'
    };
    document.getElementById('roleDescription').textContent = descriptions[currentUser.role];

    // Show/hide tabs based on role
    const dashboardTab = document.getElementById('dashboardTab');
    const submitTab = document.getElementById('submitTab');
    
    if (currentUser.role === 'Employee') {
        dashboardTab.classList.add('hidden');
        submitTab.textContent = 'Acknowledgments';
        switchTab('submit');
    } else {
        dashboardTab.classList.remove('hidden');
        submitTab.textContent = 'Submit Acknowledgment';
    }

    // Show/hide add type button
    const addTypeBtn = document.getElementById('addTypeBtn');
    if (currentUser.role === 'Admin') {
        addTypeBtn.classList.remove('hidden');
    } else {
        addTypeBtn.classList.add('hidden');
    }

    renderAcknowledmentTypes();
    renderDashboard();
    renderEmailNotifications();
}

function renderAcknowledmentTypes() {
    const grid = document.getElementById('acknowledgmentGrid');
    grid.innerHTML = '';

    acknowledgmentTypes.forEach(type => {
        const card = document.createElement('div');
        card.className = 'acknowledgment-card';
        card.innerHTML = `
            <div class="icon">${type.icon}</div>
            <h3>${type.title}</h3>
            <p>${type.description}</p>
        `;
        card.addEventListener('click', () => openAcknowledmentModal(type));
        grid.appendChild(card);
    });
}

function openAcknowledmentModal(type) {
    selectedType = type;
    const isRemoteWorking = type.title === 'Remote Area Working Acknowledgement';
    const requestNo = `${new Date().getFullYear()}/${Math.floor(Math.random() * 1000000)}`;
    
    document.getElementById('modalTitle').textContent = type.title;
    document.getElementById('modalContent').innerHTML = `
        <div class="acknowledgment-header">
            <div class="acknowledgment-title-ar">
                ${isRemoteWorking ? 'إقرار الإلتزام بتعليمات العمل في المناطق النائية' : type.title}
            </div>
            <div class="acknowledgment-title-en">
                ${type.title}
            </div>
        </div>
        
        <div class="acknowledgment-content">
            ${isRemoteWorking ? `
                <p>أقر أنني تقدمت بناءً على رغبتي وإختياري بطلب الإنتقال للعمل في المنطقة النائية لمدة ستين أو في أي وقت يحدد حسب متطلبات مراحلة العمل إستناداً إلى تطبيق الإئتمة الخاصة بالعمل في المناطق النائية:</p>
                
                <ol class="acknowledgment-rules">
                    <li>إستخدام السكن المؤمن من قبل الشركة طيلة فترة النوبة الأسبوعية.</li>
                    <li>إستخدام المواصلات المؤمنة من قبل الشركة وعدم إستخدام المركبة الشخصية للتنقل للعمل.</li>
                    <li>الإلتزام وإتباع جميع أنظمة وتعليمات السلامة وفق سياسات وأنظمة الشركة.</li>
                </ol>
            ` : `<p>${type.description}</p>`}
            
            <div class="info-notice">
                ℹ️ The content of this item will be sent as an e-mail message to the person or group assigned to the item.
            </div>
        </div>
        
        <div class="request-section">
            <h3>Request Information</h3>
            <div class="form-row">
                <label class="form-label">Request No:</label>
                <input type="text" id="requestNoField" value="${requestNo}" readonly class="form-input" style="background: #1f2937; color: white;">
            </div>
            
            <div class="form-row">
                <label class="form-label">Employee Name:</label>
                <input type="text" id="employeeNameField" value="${currentUser.name}" readonly class="form-input">
            </div>
            
            <div class="acknowledgment-checkbox">
                <input type="checkbox" id="acknowledgeCheckbox">
                <label for="acknowledgeCheckbox">I acknowledge that I have read, understood and agree to the above policies and procedures</label>
            </div>
        </div>
    `;
    
    document.getElementById('acknowledgeCheckbox').checked = false;
    document.getElementById('modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('modal').classList.add('hidden');
    selectedType = null;
}

function handleSubmitAcknowledgment() {
    if (!document.getElementById('acknowledgeCheckbox').checked) {
        alert('Please check the acknowledgment box to continue.');
        return;
    }

    const submission = {
        id: Date.now().toString(),
        type: selectedType.title,
        employeeName: currentUser.name,
        employeeEmail: currentUser.email,
        requestNo: `${new Date().getFullYear()}/${Math.floor(Math.random() * 1000000)}`,
        date: new Date().toLocaleDateString(),
        status: 'Completed',
        unit: currentUser.unit
    };

    submissions.push(submission);
    
    // Add email notifications
    const notification = {
        to: currentUser.email,
        subject: `Acknowledgment Confirmation - ${submission.requestNo}`,
        body: `Your acknowledgment submission has been successfully received and processed.\n\nDetails:\n- Type: ${submission.type}\n- Request No: ${submission.requestNo}\n- Date: ${submission.date}\n- Status: ${submission.status}`
    };
    emailNotifications.push(notification);

    closeModal();
    alert('Acknowledgment submitted successfully!');
    renderDashboard();
    renderEmailNotifications();
}

function renderDashboard() {
    let filteredSubmissions = submissions;
    
    if (currentUser.role === 'Employee') {
        filteredSubmissions = submissions.filter(sub => sub.employeeEmail === currentUser.email);
    } else if (currentUser.role === 'Supervisor') {
        const supervisorUnits = mockSupervisorList
            .filter(item => item.supervisorEmail === currentUser.email)
            .map(item => item.unit);
        filteredSubmissions = submissions.filter(sub => supervisorUnits.includes(sub.unit));
    }

    document.getElementById('totalSubmissions').textContent = filteredSubmissions.length;
    document.getElementById('completedSubmissions').textContent = filteredSubmissions.filter(s => s.status === 'Completed').length;

    const submissionsList = document.getElementById('submissionsList');
    submissionsList.innerHTML = '';
    
    filteredSubmissions.forEach(submission => {
        const item = document.createElement('div');
        item.className = 'submission-item';
        item.innerHTML = `
            <div class="submission-info">
                <h4>${submission.employeeName} - ${submission.type}</h4>
                <p>Request: ${submission.requestNo} • ${submission.date} • ${submission.unit}</p>
            </div>
            <div class="submission-status status-completed">${submission.status}</div>
        `;
        submissionsList.appendChild(item);
    });
}

function renderEmailNotifications() {
    const emailList = document.getElementById('emailNotifications');
    emailList.innerHTML = '';
    
    emailNotifications.forEach(email => {
        const item = document.createElement('div');
        item.className = 'email-item';
        item.innerHTML = `
            <div class="email-subject">${email.subject}</div>
            <div class="email-body">${email.body}</div>
        `;
        emailList.appendChild(item);
    });
}

function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', newTheme);
    document.getElementById('themeToggle').textContent = newTheme === 'dark' ? '☀️' : '🌙';
    localStorage.setItem('theme', newTheme);
}

// Load saved theme
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    document.body.setAttribute('data-theme', savedTheme);
    document.getElementById('themeToggle').textContent = savedTheme === 'dark' ? '☀️' : '🌙';
}