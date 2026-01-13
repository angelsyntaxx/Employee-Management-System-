(() => {
  // ===== STORAGE KEYS =====
  const STORAGE_USERS = 'ems_users';
  const STORAGE_EMPLOYEES = 'ems_employees';
  const STORAGE_ATTENDANCE = 'ems_attendance';

  // ===== DOM ELEMENTS =====
  const loginPage = document.getElementById('loginPage');
  const registerPage = document.getElementById('registerPage');
  const app = document.getElementById('app');

  // Login
  const loginForm = document.getElementById('loginForm');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const showRegisterBtn = document.getElementById('showRegisterBtn');

  // Register
  const registerForm = document.getElementById('registerForm');
  const regUsernameInput = document.getElementById('regUsername');
  const regPasswordInput = document.getElementById('regPassword');
  const regRoleSelect = document.getElementById('regRole');
  const showLoginBtn = document.getElementById('showLoginBtn');

  // App
  const logoutBtn = document.getElementById('logoutBtn');
  const welcomeMsg = document.getElementById('welcomeMsg');
  const adminControls = document.getElementById('adminControls');

  // Employee Management
  const addEmployeeForm = document.getElementById('addEmployeeForm');
  const employeeTableBody = document.querySelector('#employeeTable tbody');
  const searchInput = document.getElementById('searchInput');

  // Attendance Tracking
  const attendanceDateInput = document.getElementById('attendanceDate');
  const saveAttendanceBtn = document.getElementById('saveAttendanceBtn');

  // Attendance Report
  const reportMonthInput = document.getElementById('reportMonth');
  const generateReportBtn = document.getElementById('generateReportBtn');
  const reportContent = document.getElementById('reportContent');
  const downloadPdfBtn = document.getElementById('downloadPdfBtn');
  const downloadCsvBtn = document.getElementById('downloadCsvBtn');

  // ===== GLOBAL STATE =====
  let users = [];
  let employees = [];
  let attendanceData = {};
  let currentUser = null;
  let currentAttendanceMarks = {};

  // ===== UTILITIES =====
  function saveToStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  function loadFromStorage(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  // ===== INITIAL SETUP =====

  // Load users or create default admin
  function initUsers() {
    users = loadFromStorage(STORAGE_USERS) || [];
    if (users.length === 0) {
      // Create default admin user
      users.push({ username: 'admin', password: 'password123', role: 'Admin' });
      saveToStorage(STORAGE_USERS, users);
    }
  }

  // Load employees and attendance
  function initData() {
    employees = loadFromStorage(STORAGE_EMPLOYEES) || [];
    attendanceData = loadFromStorage(STORAGE_ATTENDANCE) || {};
  }

  // ===== AUTH HANDLERS =====

  function showLoginPage() {
    loginPage.style.display = 'flex';
    registerPage.style.display = 'none';
    app.style.display = 'none';
    clearAllForms();
  }

  function showRegisterPage() {
    loginPage.style.display = 'none';
    registerPage.style.display = 'flex';
    app.style.display = 'none';
    clearAllForms();
  }

  function showApp() {
    loginPage.style.display = 'none';
    registerPage.style.display = 'none';
    app.style.display = 'block';
  }

  function clearAllForms() {
    loginForm.reset();
    registerForm.reset();
    addEmployeeForm.reset();
    searchInput.value = '';
    attendanceDateInput.value = '';
    reportMonthInput.value = '';
    reportContent.innerHTML = '';
    downloadPdfBtn.style.display = 'none';
    downloadCsvBtn.style.display = 'none';
  }

  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      currentUser = user;
      welcomeMsg.textContent = `Welcome, ${currentUser.username} (${currentUser.role})`;
      updateUIByRole();
      showApp();
      renderEmployeeTable();
      currentAttendanceMarks = {};
    } else {
      alert('Invalid username or password.');
    }
  });

  logoutBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to logout?')) {
      currentUser = null;
      showLoginPage();
    }
  });

  showRegisterBtn.addEventListener('click', () => {
    showRegisterPage();
  });

  showLoginBtn.addEventListener('click', () => {
    showLoginPage();
  });

  registerForm.addEventListener('submit', e => {
    e.preventDefault();
    const username = regUsernameInput.value.trim();
    const password = regPasswordInput.value.trim();
    const role = regRoleSelect.value;

    if (!username || !password || !role) {
      alert('Please fill in all fields.');
      return;
    }
    if (users.find(u => u.username === username)) {
      alert('Username already exists. Please choose another.');
      return;
    }
    users.push({ username, password, role });
    saveToStorage(STORAGE_USERS, users);
    alert('Registration successful! You can now login.');
    showLoginPage();
  });

  // ===== UI UPDATE =====

  function updateUIByRole() {
    if (!currentUser) return;
    if (currentUser.role === 'Admin') {
      adminControls.style.display = 'block';
      attendanceDateInput.disabled = false;
      saveAttendanceBtn.disabled = false;
    } else {
      adminControls.style.display = 'none';
      attendanceDateInput.disabled = true;
      saveAttendanceBtn.disabled = true;
    }
  }

  // ===== EMPLOYEE MANAGEMENT =====

  function renderEmployeeTable(filteredEmployees = null) {
    const list = filteredEmployees || employees;
    employeeTableBody.innerHTML = '';
    list.forEach((emp, index) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${emp.name}</td>
        <td>${emp.role}</td>
        <td>${emp.department}</td>
        <td>
          <select data-empid="${employees.indexOf(emp)}" class="attendance-select" ${currentUser.role === 'Staff' ? 'disabled' : ''}>
            <option value="">--Select--</option>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
          </select>
        </td>
      `;
      employeeTableBody.appendChild(tr);
    });
    loadAttendanceForSelectedDate();
  }

  addEmployeeForm.addEventListener('submit', e => {
    e.preventDefault();
    if (currentUser.role !== 'Admin') {
      alert('Only Admins can add employees.');
      return;
    }
    const name = document.getElementById('empName').value.trim();
    const role = document.getElementById('empRole').value.trim();
    const department = document.getElementById('empDept').value.trim();

    if (name && role && department) {
      employees.push({ name, role, department });
      saveToStorage(STORAGE_EMPLOYEES, employees);
      renderEmployeeTable();
      addEmployeeForm.reset();
    } else {
      alert('Please fill in all employee details.');
    }
  });

  // ===== SEARCH/FILTER EMPLOYEES =====

  searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim().toLowerCase();
    if (!query) {
      renderEmployeeTable();
      return;
    }
    const filtered = employees.filter(emp =>
      emp.name.toLowerCase().includes(query) ||
      emp.role.toLowerCase().includes(query) ||
      emp.department.toLowerCase().includes(query)
    );
    renderEmployeeTable(filtered);
  });

  // ===== ATTENDANCE TRACKING =====

  attendanceDateInput.addEventListener('change', loadAttendanceForSelectedDate);

  function loadAttendanceForSelectedDate() {
    currentAttendanceMarks = {};
    const date = attendanceDateInput.value;
    if (!date) return;
    const dayData = attendanceData[date] || {};
    document.querySelectorAll('.attendance-select').forEach(sel => {
      const empId = sel.getAttribute('data-empid');
      sel.value = dayData[empId] || '';
      currentAttendanceMarks[empId] = dayData[empId] || '';
    });
  }

  employeeTableBody.addEventListener('change', e => {
    if (e.target.classList.contains('attendance-select')) {
      const empId = e.target.getAttribute('data-empid');
      const val = e.target.value;
      currentAttendanceMarks[empId] = val;
    }
  });

  saveAttendanceBtn.addEventListener('click', () => {
    if (currentUser.role !== 'Admin') {
      alert('Only Admins can save attendance.');
      return;
    }
    const date = attendanceDateInput.value;
    if (!date) {
      alert('Please select a date for attendance.');
      return;
    }
    attendanceData[date] = { ...currentAttendanceMarks };
    saveToStorage(STORAGE_ATTENDANCE, attendanceData);
    alert('Attendance saved for ' + date);
  });

  // ===== ATTENDANCE REPORT =====

  generateReportBtn.addEventListener('click', () => {
    const month = reportMonthInput.value;
    if (!month) {
      alert('Please select a month.');
      return;
    }
    generateMonthlyReport(month);
  });

  function generateMonthlyReport(month) {
    const year = month.split('-')[0];
    const mon = month.split('-')[1];
    const daysInMonth = new Date(year, mon, 0).getDate();

    let html = `<table border="1" cellspacing="0" cellpadding="5"><thead><tr><th>Employee</th>`;
    for (let day = 1; day <= daysInMonth; day++) {
      html += `<th>${day}</th>`;
    }
    html += `<th>Present</th><th>Absent</th></tr></thead><tbody>`;

    employees.forEach((emp, empId) => {
      html += `<tr><td>${emp.name}</td>`;
      let presentCount = 0;
      let absentCount = 0;

      for (let day = 1; day <= daysInMonth; day++) {
        const dayStr = day.toString().padStart(2, '0');
        const dateKey = `${year}-${mon}-${dayStr}`;
        const status = attendanceData[dateKey]?.[empId] || '';
        if (status === 'present') presentCount++;
        if (status === 'absent') absentCount++;
        const cellClass = status === 'present' ? 'present' : (status === 'absent' ? 'absence' : '');
        html += `<td class="${cellClass}">${status ? status.charAt(0).toUpperCase() : ''}</td>`;
      }
      html += `<td>${presentCount}</td><td>${absentCount}</td></tr>`;
    });

    html += '</tbody></table>';
    reportContent.innerHTML = html;
    downloadPdfBtn.style.display = 'inline-block';
    downloadCsvBtn.style.display = 'inline-block';
  }

  // ===== EXPORT PDF =====

  downloadPdfBtn.addEventListener('click', () => {
    if (!reportContent.innerHTML) {
      alert('Please generate a report first.');
      return;
    }
    generatePDF();
  });

  async function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "a4"
    });

    const month = reportMonthInput.value;
    doc.setFontSize(18);
    doc.text(`Monthly Attendance Report - ${month}`, 40, 40);

    const year = month.split('-')[0];
    const mon = month.split('-')[1];
    const daysInMonth = new Date(year, mon, 0).getDate();

    const headers = ['Employee'];
    for(let day=1; day<=daysInMonth; day++){
      headers.push(day.toString());
    }
    headers.push('Present', 'Absent');

    const rows = employees.map((emp, empId) => {
      let presentCount = 0;
      let absentCount = 0;
      const row = [emp.name];
      for(let day=1; day<=daysInMonth; day++){
        const dayStr = day.toString().padStart(2, '0');
        const dateKey = `${year}-${mon}-${dayStr}`;
        const status = attendanceData[dateKey]?.[empId] || '';
        if (status === 'present') presentCount++;
        if (status === 'absent') absentCount++;
        row.push(status ? status.charAt(0).toUpperCase() : '');
      }
      row.push(presentCount, absentCount);
      return row;
    });

    if (doc.autoTable) {
      doc.autoTable({
        head: [headers],
        body: rows,
        startY: 60,
        styles: { fontSize: 8 },
        theme: 'striped'
      });
      doc.save(`Attendance_Report_${month}.pdf`);
    } else {
      // Fallback if autoTable is not loaded
      let y = 60;
      doc.setFontSize(10);
      doc.text(headers.join('  '), 40, y);
      y += 15;
      rows.forEach(row => {
        doc.text(row.join('  '), 40, y);
        y += 15;
        if (y > 550) {
          doc.addPage();
          y = 40;
        }
      });
      doc.save(`Attendance_Report_${month}.pdf`);
    }
  }

  // ===== EXPORT CSV =====

  downloadCsvBtn.addEventListener('click', () => {
    if (!reportContent.innerHTML) {
      alert('Please generate a report first.');
      return;
    }
    generateCSV();
  });

  function generateCSV() {
    const month = reportMonthInput.value;
    if (!month) {
      alert('Select month first');
      return;
    }

    const year = month.split('-')[0];
    const mon = month.split('-')[1];
    const daysInMonth = new Date(year, mon, 0).getDate();

    const headers = ['Employee'];
    for(let day=1; day<=daysInMonth; day++){
      headers.push(day.toString());
    }
    headers.push('Present', 'Absent');

    const rows = employees.map((emp, empId) => {
      let presentCount = 0;
      let absentCount = 0;
      const row = [emp.name];
      for(let day=1; day<=daysInMonth; day++){
        const dayStr = day.toString().padStart(2, '0');
        const dateKey = `${year}-${mon}-${dayStr}`;
        const status = attendanceData[dateKey]?.[empId] || '';
        if (status === 'present') presentCount++;
        if (status === 'absent') absentCount++;
        row.push(status ? status.charAt(0).toUpperCase() : '');
      }
      row.push(presentCount, absentCount);
      return row;
    });

    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `Attendance_Report_${month}.csv`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // ===== INITIALIZATION =====

  function init() {
    initUsers();
    initData();
    showLoginPage();
  }

  init();
})();