const familyMembers = [
    { id: 1, name: '爸爸' },
    { id: 2, name: '妈妈' },
    { id: 3, name: '孩子1' },
    { id: 4, name: '孩子2' }
];

const categoryMap = {
    'meat': '🥩 肉菜',
    'vegetable': '🥬 素菜',
    'soup': '🍲 汤品',
    'staple': '🍚 主食',
    'snack': '🍰 小吃甜点'
};

const mealOptions = ['早餐', '午餐', '晚餐', '夜宵'];
let selectedDishes = [];
let allDishes = [];

document.addEventListener('DOMContentLoaded', function() {
    init();
});

async function init() {
    await loadAllDishes();
    await loadSelectedDishes();
    renderMenuList();
    renderStats();
    updateBadge();
    setupEventListeners();
}

async function loadAllDishes() {
    const { data, error } = await db
        .from('dishes')
        .select('*');
    
    if (error) {
        console.error('Error loading dishes:', error);
        return;
    }
    
    allDishes = data || [];
}

async function loadSelectedDishes() {
    const { data, error } = await db
        .from('selected_dishes')
        .select('*')
        .order('created_at', { ascending: true });
    
    if (error) {
        console.error('Error loading selected dishes:', error);
        return;
    }
    
    selectedDishes = (data || []).map(item => ({
        id: item.id,
        dishId: item.dish_id,
        dishName: item.dish_name,
        familyMemberId: item.family_member_id,
        familyMemberName: item.family_member_name
    }));
}

async function saveSelectedDishes() {
    const { error: deleteError } = await db
        .from('selected_dishes')
        .delete()
        .not('id', 'is', null);
    
    if (deleteError) {
        console.error('Error deleting selected dishes:', deleteError);
        return;
    }
    
    if (selectedDishes.length === 0) return;
    
    const dishesToInsert = selectedDishes.map(item => ({
        dish_id: item.dishId,
        dish_name: item.dishName,
        family_member_id: item.familyMemberId,
        family_member_name: item.familyMemberName
    }));
    
    const { error } = await db
        .from('selected_dishes')
        .insert(dishesToInsert);
    
    if (error) {
        console.error('Error saving selected dishes:', error);
    }
}

function renderMenuList() {
    const menuList = document.getElementById('menuList');
    const emptyState = document.getElementById('emptyState');
    const menuStats = document.getElementById('menuStats');
    const confirmSection = document.getElementById('confirmSection');
    
    if (selectedDishes.length === 0) {
        menuList.innerHTML = '';
        emptyState.classList.add('show');
        menuStats.style.display = 'none';
        confirmSection.style.display = 'none';
        return;
    }
    
    emptyState.classList.remove('show');
    menuStats.style.display = 'flex';
    confirmSection.style.display = 'block';
    
    const grouped = {};
    selectedDishes.forEach(item => {
        if (!grouped[item.familyMemberName]) {
            grouped[item.familyMemberName] = [];
        }
        grouped[item.familyMemberName].push(item);
    });
    
    menuList.innerHTML = Object.keys(grouped).map(memberName => `
        <div class="menu-group">
            <div class="menu-group-title">
                <i class="fas fa-user"></i>
                <span>${memberName}点的</span>
            </div>
            <div class="menu-items">
                ${grouped[memberName].map((item) => `
                    <div class="menu-item">
                        <span class="menu-item-name">${item.dishName}</span>
                        <button class="menu-item-remove" onclick="removeItemByDishId(${item.dishId})">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

function renderStats() {
    const menuStats = document.getElementById('menuStats');
    const totalDishes = document.getElementById('totalDishes');
    const categoryStats = document.getElementById('categoryStats');
    
    if (selectedDishes.length === 0) {
        menuStats.style.display = 'none';
        return;
    }
    
    menuStats.style.display = 'flex';
    totalDishes.textContent = selectedDishes.length;
    
    const categoryCount = {};
    selectedDishes.forEach(item => {
        const dish = allDishes.find(d => d.id === item.dishId);
        if (dish) {
            const categoryName = categoryMap[dish.category] || dish.category;
            categoryCount[categoryName] = (categoryCount[categoryName] || 0) + 1;
        }
    });
    
    categoryStats.innerHTML = `
        <div class="member-stat-list">
            ${Object.keys(categoryCount).map(name => `
                <div class="member-stat-item">
                    <span>${name}:</span>
                    <span class="member-stat-count">${categoryCount[name]}</span>
                    <span>道</span>
                </div>
            `).join('')}
        </div>
    `;
}

function updateBadge() {
    const badge = document.getElementById('menuBadge');
    if (selectedDishes.length > 0) {
        badge.style.display = 'flex';
        badge.textContent = selectedDishes.length;
    } else {
        badge.style.display = 'none';
    }
}

async function removeItemByDishId(dishId) {
    const index = selectedDishes.findIndex(item => item.dishId === dishId);
    if (index !== -1) {
        const removed = selectedDishes.splice(index, 1)[0];
        await saveSelectedDishes();
        renderMenuList();
        renderStats();
        updateBadge();
        showToast(`已取消${removed.dishName}`);
    }
}

function setupEventListeners() {
    document.getElementById('navHome').addEventListener('click', function() {
        window.location.href = 'index.html';
    });
    
    document.getElementById('confirmBtn').addEventListener('click', showMealSelector);
}

function showMealSelector() {
    let mealOptionsHTML = mealOptions.map(meal => `
        <button class="meal-option" onclick="confirmMenu('${meal}')">
            ${meal}
        </button>
    `).join('');
    
    const overlay = document.createElement('div');
    overlay.className = 'meal-selector-overlay';
    overlay.innerHTML = `
        <div class="meal-selector">
            <div class="meal-selector-title">选择用餐时间</div>
            <div class="meal-options">
                ${mealOptionsHTML}
            </div>
            <button class="meal-cancel-btn" onclick="closeMealSelector()">取消</button>
        </div>
    `;
    overlay.id = 'mealOverlay';
    document.body.appendChild(overlay);
}

async function confirmMenu(meal) {
    const categoryStats = {
        meat: 0,
        vegetable: 0,
        soup: 0,
        staple: 0,
        snack: 0
    };
    
    selectedDishes.forEach(item => {
        const dish = allDishes.find(d => d.id === item.dishId);
        if (dish) {
            categoryStats[dish.category]++;
        }
    });
    
    const menuData = {
        meal_name: meal,
        dishes: selectedDishes.map(item => ({
            dish_id: item.dishId,
            dish_name: item.dishName,
            family_member_id: item.familyMemberId,
            family_member_name: item.familyMemberName
        })),
        stats: {
            total: selectedDishes.length,
            categories: categoryStats
        }
    };
    
    const { error: insertError } = await db
        .from('confirmed_menus')
        .insert(menuData);
    
    if (insertError) {
        console.error('Error saving confirmed menu:', insertError);
        showToast('保存失败');
        return;
    }
    
    selectedDishes = [];
    await saveSelectedDishes();
    
    closeMealSelector();
    renderMenuList();
    renderStats();
    updateBadge();
    
    showToast(`${meal}菜单已确认！`);
}

function closeMealSelector() {
    const overlay = document.getElementById('mealOverlay');
    if (overlay) {
        overlay.remove();
    }
}

function goBack() {
    window.location.href = 'index.html';
}

function goToHistory() {
    window.location.href = 'history.html';
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}
