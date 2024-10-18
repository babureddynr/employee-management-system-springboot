const API_URL = 'http://localhost:8080/api/employees';
let employeeModal;
let toastNotification;

document.addEventListener('DOMContentLoaded', function() {
    employeeModal = new bootstrap.Modal(document.getElementById('employeeModal'));
    toastNotification = new bootstrap.Toast(document.getElementById('toastNotification'));
    loadEmployees();
    setupValidation();

    // Ensure modal form is cleared when modal is closed manually
    document.getElementById('employeeModal').addEventListener('hidden.bs.modal', function () {
        document.getElementById('employeeForm').reset();
        document.getElementById('employeeForm').classList.remove('was-validated');
    });
});

function setupValidation() {
    const forms = document.querySelectorAll('.needs-validation');
    Array.prototype.slice.call(forms).forEach(function(form) {
        form.addEventListener('submit', function(event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        }, false);
    });
}

function showNotification(title, message, success = true) {
    document.getElementById('toastTitle').textContent = title;
    document.getElementById('toastMessage').textContent = message;
    document.getElementById('toastNotification').className = 
        `toast ${success ? 'bg-success' : 'bg-danger'} text-white`;
    toastNotification.show();
}

function loadEmployees() {
    fetch(API_URL)
        .then(response => response.json())
        .then(employees => {
            const tableBody = document.getElementById('employeeTableBody');
            tableBody.innerHTML = '';
            
            employees.forEach(employee => {
                const row = `
                    <tr>
                        <td>${employee.id}</td>
                        <td>${employee.name}</td>
                        <td>${employee.email}</td>
                        <td>${formatDate(employee.dob)}</td>
                        <td>${employee.age}</td>
                        <td>$${employee.salary.toFixed(2)}</td>
                        <td>
                            <span class="badge ${employee.status ? 'bg-success' : 'bg-danger'} status-badge">
                                ${employee.status ? 'Active' : 'Inactive'}
                            </span>
                        </td>
                        <td class="action-buttons">
                            <button class="btn btn-warning btn-icon" onclick="editEmployee(${employee.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-danger btn-icon" onclick="deleteEmployee(${employee.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
                tableBody.innerHTML += row;
            });
        })
        .catch(error => {
            console.error('Error loading employees:', error);
            showNotification('Error', 'Failed to load employees', false);
        });
}

function showAddModal() {
    document.getElementById('employeeForm').reset();
    document.getElementById('employeeId').value = '';
    document.getElementById('modalTitle').textContent = 'Add Employee';
    document.getElementById('employeeForm').classList.remove('was-validated');
    employeeModal.show();
}

function editEmployee(id) {
    fetch(`${API_URL}/${id}`)
        .then(response => response.json())
        .then(employee => {
            document.getElementById('employeeId').value = employee.id;
            document.getElementById('name').value = employee.name;
            document.getElementById('email').value = employee.email;
            document.getElementById('dob').value = formatDate(employee.dob);
            document.getElementById('salary').value = employee.salary;
            document.getElementById('status').checked = employee.status;
            document.getElementById('modalTitle').textContent = 'Edit Employee';
            document.getElementById('employeeForm').classList.remove('was-validated');
            employeeModal.show();
        })
        .catch(error => {
            console.error('Error loading employee:', error);
            showNotification('Error', 'Failed to load employee details', false);
        });
}

function saveEmployee() {
    const form = document.getElementById('employeeForm');
    
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    const employeeId = document.getElementById('employeeId').value;
    const employee = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        dob: document.getElementById('dob').value,
        salary: parseFloat(document.getElementById('salary').value),
        status: document.getElementById('status').checked
    };

    const url = employeeId ? `${API_URL}/${employeeId}` : API_URL;
    const method = employeeId ? 'PUT' : 'POST';

    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(employee)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to save employee');
        }
        return response.json();
    })
    .then(() => {
        employeeModal.hide();
        loadEmployees();
        showNotification('Success', 
            `Employee successfully ${employeeId ? 'updated' : 'added'}!`, 
            true);

        // Reset form after successful submission
        form.reset();
        form.classList.remove('was-validated');
    })
    .catch(error => {
        console.error('Error saving employee:', error);
        showNotification('Error', 'Failed to save employee', false);
    });
}

function deleteEmployee(id) {
    if (confirm('Are you sure you want to delete this employee?')) {
        fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete employee');
            }
            loadEmployees();
            showNotification('Success', 'Employee successfully deleted!', true);
        })
        .catch(error => {
            console.error('Error deleting employee:', error);
            showNotification('Error', 'Failed to delete employee', false);
        });
    }
}

function searchEmployees() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const rows = document.querySelectorAll('#employeeTableBody tr');

    rows.forEach(row => {
        const name = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
        const email = row.querySelector('td:nth-child(3)').textContent.toLowerCase();
        
        // Filter based on name or email
        if (name.includes(searchTerm) || email.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
}

// Add event listener for search input
document.getElementById('searchInput').addEventListener('keyup', searchEmployees);
