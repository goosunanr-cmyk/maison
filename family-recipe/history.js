let historyMenus = [];

document.addEventListener('DOMContentLoaded', function() {
    init();
});

async function init() {
    await loadHistoryMenus();
    renderHistoryList();
    setupEventListeners();
}

async function loadHistoryMenus() {
    const { data, error } = await db
        .from('confirmed_menus')
        .select('*')
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error('Error loading history menus:', error);
        return;
    }
    
    historyMenus = data || [];
}

function renderHistoryList() {
    const historyList = document.getElementById('historyList');
    const emptyState = document.getElementById('emptyState');
    
    if (historyMenus.length === 0) {
        historyList.innerHTML = '';
        emptyState.classList.add('show');
        return;
    }
    
    emptyState.classList.remove('show');
    
    historyList.innerHTML = historyMenus.map(menu => {
        const date = new Date(menu.created_at);
        const dateStr = date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' });
        const timeStr = date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
        
        return `
            <div class="history-card">
                <div class="history-header">
                    <div class="history-meal">
                        <i class="fas fa-utensils"></i>
                        <span>${menu.meal_name}</span>
                    </div>
                    <div class="history-date">
                        <span>${dateStr}</span>
                        <span>${timeStr}</span>
                    </div>
                </div>
                <div class="history-dishes">
                    ${renderMenuDishes(menu.dishes)}
                </div>
                <div class="history-footer">
                    <div class="history-stats">
                        <span class="history-stat">
                            🥘
                            ${menu.stats.total}道菜
                        </span>
                        <span class="history-stat">
                            🥩
                            肉${menu.stats.categories.meat}
                        </span>
                        <span class="history-stat">
                            🥬
                            素${menu.stats.categories.vegetable}
                        </span>
                    </div>
                    <button class="history-delete-btn" onclick="deleteMenu('${menu.id}')">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function renderMenuDishes(dishes) {
    const grouped = {};
    dishes.forEach(item => {
        const memberName = item.family_member_name || item.familyMemberName;
        const dishName = item.dish_name || item.dishName;
        if (!grouped[memberName]) {
            grouped[memberName] = [];
        }
        grouped[memberName].push({ ...item, memberName, dishName });
    });
    
    return Object.keys(grouped).map(memberName => `
        <div class="history-dish-group">
            <div class="history-dish-member">
                <i class="fas fa-user"></i>
                ${memberName}
            </div>
            <div class="history-dish-names">
                ${grouped[memberName].map(item => item.dishName).join('、')}
            </div>
        </div>
    `).join('');
}

async function deleteMenu(menuId) {
    const { error } = await db
        .from('confirmed_menus')
        .delete()
        .eq('id', menuId);
    
    if (error) {
        console.error('Error deleting menu:', error);
        showToast('删除失败');
        return;
    }
    
    const index = historyMenus.findIndex(m => m.id === menuId);
    if (index !== -1) {
        historyMenus.splice(index, 1);
        renderHistoryList();
        showToast('已删除该菜单记录');
    }
}

function setupEventListeners() {
    document.getElementById('navHome').addEventListener('click', function() {
        window.location.href = 'index.html';
    });
    
    document.getElementById('navMenu').addEventListener('click', function() {
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        this.classList.add('active');
    });
    
    document.getElementById('navManage').addEventListener('click', function() {
        window.location.href = 'dish-management.html';
    });
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}
