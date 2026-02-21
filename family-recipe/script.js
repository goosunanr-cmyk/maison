const familyMembers = [
    { id: 1, name: '爸爸', icon: 'fa-user' },
    { id: 2, name: '妈妈', icon: 'fa-user' },
    { id: 3, name: '孩子1', icon: 'fa-child' },
    { id: 4, name: '孩子2', icon: 'fa-child' }
];

const categoryOrder = ['meat', 'vegetable', 'soup', 'staple', 'snack'];
const categoryNames = {
    meat: '🥩 肉菜',
    vegetable: '🥬 素菜',
    soup: '🍲 汤品',
    staple: '🍚 主食',
    snack: '🍰 小吃甜点'
};

let dishes = [];
let currentCategory = 'all';
let searchKeyword = '';
let selectedDishes = [];
let isDrawerOpen = false;

document.addEventListener('DOMContentLoaded', function() {
    init();
});

async function init() {
    await loadDishes();
    await loadSelectedDishes();
    renderDishes();
    updateAllBadges();
    setupEventListeners();
}

function getCurrentUserRole() {
    const saved = localStorage.getItem('userRole');
    if (saved) {
        return JSON.parse(saved);
    }
    return familyMembers[0];
}

async function loadDishes() {
    const { data, error } = await db
        .from('dishes')
        .select('*')
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error('Error loading dishes:', error);
        return;
    }
    
    dishes = data || [];
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

async function saveConfirmedMenu(mealType, mealName) {
    const stats = calculateStats();
    
    const { error } = await db
        .from('confirmed_menus')
        .insert({
            meal_type: mealType,
            meal_name: mealName,
            dishes: selectedDishes,
            stats: stats
        });
    
    if (error) {
        console.error('Error saving confirmed menu:', error);
        return;
    }
    
    const oldSelectedDishes = [...selectedDishes];
    selectedDishes = [];
    await saveSelectedDishes();
    updateAllBadges();
    
    oldSelectedDishes.forEach(sd => {
        const btn = document.querySelector(`.add-to-menu-btn[data-dish-id="${sd.dishId}"]`);
        if (btn) {
            btn.classList.remove('added');
            btn.innerHTML = '<i class="fas fa-plus"></i>';
        }
    });
    
    closeDrawer();
    showToast('菜单已确认！');
    
    setTimeout(() => {
        window.location.href = 'history.html';
    }, 500);
}

function updateAllBadges() {
    const fabBadge = document.getElementById('menuFabBadge');
    const menuFab = document.getElementById('menuFab');
    
    const totalCount = selectedDishes.length;
    
    if (totalCount > 0) {
        fabBadge.textContent = totalCount;
        fabBadge.style.display = 'flex';
        menuFab.style.display = 'flex';
    } else {
        fabBadge.style.display = 'none';
        menuFab.style.display = 'flex';
    }
    
    updateDrawerStats();
}

function updateDrawerStats() {
    const stats = calculateStats();
    
    document.getElementById('drawerTotalCount').textContent = stats.total;
    document.getElementById('drawerMeatCount').textContent = stats.categories.meat;
    document.getElementById('drawerVegetableCount').textContent = stats.categories.vegetable;
    document.getElementById('drawerSoupCount').textContent = stats.categories.soup;
    document.getElementById('drawerStapleCount').textContent = stats.categories.staple;
    document.getElementById('drawerSnackCount').textContent = stats.categories.snack;
}

function calculateStats() {
    const stats = {
        total: selectedDishes.length,
        categories: { meat: 0, vegetable: 0, soup: 0, staple: 0, snack: 0 }
    };
    
    selectedDishes.forEach(sd => {
        const dish = dishes.find(d => d.id === sd.dishId);
        if (dish && stats.categories.hasOwnProperty(dish.category)) {
            stats.categories[dish.category]++;
        }
    });
    
    return stats;
}

function setupEventListeners() {
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            switchCategory(this.dataset.category);
        });
    });
    
    const searchInput = document.getElementById('searchInput');
    let searchTimer;
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
            searchDishes(this.value);
        }, 300);
    });
    
    document.getElementById('navHome').addEventListener('click', function() {
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        this.classList.add('active');
    });
    
    document.getElementById('navMenu').addEventListener('click', function() {
        window.location.href = 'history.html';
    });
    
    document.getElementById('navManage').addEventListener('click', function() {
        window.location.href = 'dish-management.html';
    });
    
    document.getElementById('menuFab').addEventListener('click', openDrawer);
    document.getElementById('menuDrawerOverlay').addEventListener('click', closeDrawer);
    document.getElementById('confirmMenuBtn').addEventListener('click', confirmMenu);
    
    document.getElementById('dishWaterfall').addEventListener('click', function(e) {
        const btn = e.target.closest('.add-to-menu-btn');
        if (btn) {
            const dishId = btn.dataset.dishId;
            toggleAddToMenu(e, dishId);
        }
    });
    
    document.getElementById('menuDrawerContent').addEventListener('click', function(e) {
        const btn = e.target.closest('.drawer-dish-remove');
        if (btn) {
            const dishId = btn.dataset.dishId;
            removeFromDrawer(dishId);
        }
    });
}

function openDrawer() {
    isDrawerOpen = true;
    document.getElementById('menuDrawerOverlay').classList.add('show');
    document.getElementById('menuDrawer').classList.add('show');
    renderDrawerContent();
}

function closeDrawer() {
    isDrawerOpen = false;
    document.getElementById('menuDrawerOverlay').classList.remove('show');
    document.getElementById('menuDrawer').classList.remove('show');
}

function renderDrawerContent() {
    const content = document.getElementById('menuDrawerContent');
    const footer = document.getElementById('menuDrawerFooter');
    
    if (selectedDishes.length === 0) {
        content.innerHTML = `
            <div class="drawer-empty">
                <i class="fas fa-clipboard-list"></i>
                <span>还没有选菜哦</span>
            </div>
        `;
        footer.style.display = 'none';
        return;
    }
    
    footer.style.display = 'block';
    
    const grouped = {};
    categoryOrder.forEach(cat => grouped[cat] = []);
    
    selectedDishes.forEach(sd => {
        const dish = dishes.find(d => d.id === sd.dishId);
        if (dish && grouped.hasOwnProperty(dish.category)) {
            grouped[dish.category].push({ ...sd, dish });
        }
    });
    
    content.innerHTML = categoryOrder.filter(cat => grouped[cat].length > 0).map(cat => `
        <div class="drawer-dish-group">
            <div class="drawer-group-title">${categoryNames[cat]}</div>
            <div class="drawer-dish-list">
                ${grouped[cat].map(item => `
                    <div class="drawer-dish-item">
                        <div class="drawer-dish-info">
                            <span class="drawer-dish-name">${item.dish.name}</span>
                            <span class="drawer-dish-person">${item.familyMemberName}</span>
                        </div>
                        <button class="drawer-dish-remove" data-dish-id="${item.dishId}">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

async function removeFromDrawer(dishId) {
    const index = selectedDishes.findIndex(sd => sd.dishId === dishId);
    if (index !== -1) {
        selectedDishes.splice(index, 1);
        await saveSelectedDishes();
        updateAllBadges();
        
        const btn = document.querySelector(`.add-to-menu-btn[data-dish-id="${dishId}"]`);
        if (btn) {
            btn.classList.remove('added');
            btn.innerHTML = '<i class="fas fa-plus"></i>';
        }
        
        renderDrawerContent();
    }
}

function confirmMenu() {
    if (selectedDishes.length === 0) return;
    
    showMealSelector();
}

function showMealSelector() {
    const overlay = document.createElement('div');
    overlay.className = 'meal-selector-overlay';
    overlay.innerHTML = `
        <div class="meal-selector">
            <h3 class="meal-selector-title">请选择用餐时段</h3>
            <div class="meal-options">
                <button class="meal-option" data-meal="breakfast">早餐</button>
                <button class="meal-option" data-meal="lunch">午餐</button>
                <button class="meal-option" data-meal="dinner">晚餐</button>
                <button class="meal-option" data-meal="midnight">夜宵</button>
            </div>
            <button class="meal-cancel-btn" id="cancelMeal">取消</button>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    overlay.querySelectorAll('.meal-option').forEach(btn => {
        btn.addEventListener('click', function() {
            const mealType = this.dataset.meal;
            const mealNames = { breakfast: '早餐', lunch: '午餐', dinner: '晚餐', midnight: '夜宵' };
            saveConfirmedMenu(mealType, mealNames[mealType]);
            overlay.remove();
        });
    });
    
    document.getElementById('cancelMeal').addEventListener('click', function() {
        overlay.remove();
    });
    
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            overlay.remove();
        }
    });
}

function switchCategory(category) {
    currentCategory = category;
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.category === category);
    });
    renderDishes();
}

function searchDishes(keyword) {
    searchKeyword = keyword.toLowerCase().trim();
    renderDishes();
}

function renderDishes() {
    let filteredDishes = dishes;
    if (currentCategory !== 'all') {
        filteredDishes = filteredDishes.filter(dish => dish.category === currentCategory);
    }
    if (searchKeyword) {
        filteredDishes = filteredDishes.filter(dish => 
            dish.name.toLowerCase().includes(searchKeyword)
        );
    }
    renderDishesWithFilter(filteredDishes);
}

function renderDishesWithFilter(filteredDishes) {
    const dishWaterfall = document.getElementById('dishWaterfall');
    const emptyState = document.getElementById('emptyState');
    
    if (filteredDishes.length === 0) {
        dishWaterfall.innerHTML = '';
        emptyState.classList.add('show');
        return;
    }
    
    emptyState.classList.remove('show');
    dishWaterfall.innerHTML = filteredDishes.map((dish, index) => {
        const isAdded = selectedDishes.some(sd => sd.dishId === dish.id);
        return `
            <div class="dish-card" style="animation-delay: ${index * 0.05}s" data-dish-id="${dish.id}">
                <div class="dish-image-wrapper">
                    <img class="dish-image" src="${dish.image}" alt="${dish.name}">
                    <button class="add-to-menu-btn ${isAdded ? 'added' : ''}" data-dish-id="${dish.id}">
                        <i class="fas ${isAdded ? 'fa-check' : 'fa-plus'}"></i>
                    </button>
                </div>
                <div class="dish-info">
                    <div class="dish-name">${dish.name}</div>
                </div>
            </div>
        `;
    }).join('');
}

async function toggleAddToMenu(event, dishId) {
    event.stopPropagation();
    
    const userRole = getCurrentUserRole();
    const existingIndex = selectedDishes.findIndex(sd => sd.dishId === dishId);
    const btn = event.target.closest('.add-to-menu-btn');
    
    if (existingIndex !== -1) {
        selectedDishes.splice(existingIndex, 1);
        const dish = dishes.find(d => d.id === dishId);
        showToast(`已取消${dish.name}`);
        btn.classList.remove('added');
        btn.innerHTML = '<i class="fas fa-plus"></i>';
    } else {
        const dish = dishes.find(d => d.id === dishId);
        selectedDishes.push({
            dishId: dishId,
            dishName: dish.name,
            familyMemberId: userRole.id,
            familyMemberName: userRole.name
        });
        showToast(`${userRole.name}点了${dish.name}`);
        btn.classList.add('added');
        btn.innerHTML = '<i class="fas fa-check"></i>';
    }
    
    await saveSelectedDishes();
    updateAllBadges();
    
    if (isDrawerOpen) {
        renderDrawerContent();
    }
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}
