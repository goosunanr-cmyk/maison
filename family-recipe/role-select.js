let selectedRole = null;

document.addEventListener('DOMContentLoaded', function() {
    checkExistingRole();
    setupEventListeners();
});

function checkExistingRole() {
    const existingRole = localStorage.getItem('userRole');
    if (existingRole) {
        window.location.href = 'index.html';
    }
}

function setupEventListeners() {
    const roleCards = document.querySelectorAll('.role-card');
    const confirmBtn = document.getElementById('confirmRoleBtn');

    roleCards.forEach(card => {
        card.addEventListener('click', function() {
            roleCards.forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            
            selectedRole = {
                id: this.dataset.role,
                name: this.dataset.name
            };
            
            confirmBtn.classList.add('active');
            confirmBtn.disabled = false;
        });
    });

    confirmBtn.addEventListener('click', function() {
        if (selectedRole) {
            saveAndRedirect();
        }
    });
}

function saveAndRedirect() {
    localStorage.setItem('userRole', JSON.stringify(selectedRole));
    window.location.href = 'index.html';
}
