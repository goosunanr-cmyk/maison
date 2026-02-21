const categoryOrder = ['meat', 'vegetable', 'soup', 'staple', 'snack'];
const categoryNames = {
    meat: '肉菜',
    vegetable: '素菜',
    soup: '汤品',
    staple: '主食',
    snack: '小吃甜点'
};

let dishes = [];

document.addEventListener('DOMContentLoaded', function() {
    init();
});

async function init() {
    await loadDishes();
    renderDishes();
    setupEventListeners();
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

async function saveDishes() {
}

function renderDishes() {
    const dishWaterfall = document.getElementById('dishWaterfall');
    const emptyState = document.getElementById('emptyState');
    
    if (dishes.length === 0) {
        dishWaterfall.innerHTML = '';
        emptyState.classList.add('show');
        return;
    }
    
    emptyState.classList.remove('show');
    dishWaterfall.innerHTML = dishes.map((dish, index) => `
        <div class="dish-card" style="animation-delay: ${index * 0.05}s">
            <div class="dish-image-wrapper">
                <img class="dish-image" src="${dish.image}" alt="${dish.name}">
            </div>
            <div class="dish-info">
                <div class="dish-name">${dish.name}</div>
                <div class="dish-category-tag">${dish.category_name}</div>
            </div>
            <div class="dish-actions">
                <button class="dish-action-btn edit-btn" onclick="openEditModal('${dish.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="dish-action-btn delete-btn" onclick="openDeleteModal('${dish.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function setupEventListeners() {
    document.getElementById('navHome').addEventListener('click', function() {
        window.location.href = 'index.html';
    });
    
    document.getElementById('navMenu').addEventListener('click', function() {
        window.location.href = 'history.html';
    });
    
    document.getElementById('navManage').addEventListener('click', function() {
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        this.classList.add('active');
    });
    
    document.getElementById('addDishFab').addEventListener('click', function() {
        openAddModal();
    });
}

function openAddModal() {
    showDishModal(null);
}

function openEditModal(dishId) {
    const dish = dishes.find(d => d.id === dishId);
    if (dish) {
        showDishModal(dish);
    }
}

function showDishModal(dish) {
    const isEdit = dish !== null;
    const title = isEdit ? '编辑菜品' : '添加菜品';
    
    const modal = document.createElement('div');
    modal.className = 'dish-modal-overlay';
    modal.innerHTML = `
        <div class="dish-modal">
            <div class="dish-modal-header">
                <h3 class="dish-modal-title">${title}</h3>
                <button class="dish-modal-close" onclick="closeDishModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="dish-modal-body">
                <div class="form-group">
                    <label>菜品图片</label>
                    <div class="image-upload-area" id="imageUploadArea">
                        <input type="file" id="imageInput" accept="image/*" style="display: none;">
                        <div class="upload-placeholder" id="uploadPlaceholder" onclick="document.getElementById('imageInput').click()">
                            <i class="fas fa-camera"></i>
                            <span>拍照或上传</span>
                        </div>
                        <img id="previewImage" style="display: none;">
                    </div>
                </div>
                <div class="form-group">
                    <label>菜品名称</label>
                    <input type="text" id="dishName" class="form-input" placeholder="请输入菜品名称" value="${isEdit ? dish.name : ''}">
                </div>
                <div class="form-group">
                    <label>菜品分类</label>
                    <select id="dishCategory" class="form-input">
                        ${categoryOrder.map(cat => `
                            <option value="${cat}" ${isEdit && dish.category === cat ? 'selected' : ''}>${categoryNames[cat]}</option>
                        `).join('')}
                    </select>
                </div>
            </div>
            <div class="dish-modal-footer">
                <button class="dish-modal-btn cancel-btn" onclick="closeDishModal()">取消</button>
                <button class="dish-modal-btn save-btn" onclick="saveDish('${isEdit ? dish.id : ''}')">保存</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const imageInput = document.getElementById('imageInput');
    imageInput.addEventListener('change', function(e) {
        handleImageUpload(e, isEdit ? dish : null);
    });
    
    if (isEdit && dish.image) {
        showPreviewImage(dish.image);
    }
}

function handleImageUpload(e, dish) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const imageData = e.target.result;
        showPreviewImage(imageData);
        
        showToast('AI识别中...');
        
        setTimeout(() => {
            const aiResult = simulateAIRecognition(file.name);
            document.getElementById('dishName').value = aiResult.name;
            document.getElementById('dishCategory').value = aiResult.category;
            showToast('AI识别完成！');
        }, 1500);
    };
    reader.readAsDataURL(file);
}

function showPreviewImage(src) {
    const placeholder = document.getElementById('uploadPlaceholder');
    const previewImage = document.getElementById('previewImage');
    
    placeholder.style.display = 'none';
    previewImage.style.display = 'block';
    previewImage.src = src;
    previewImage.onclick = function() {
        document.getElementById('imageInput').click();
    };
}

function simulateAIRecognition(fileName) {
    const sampleResults = [
        { name: '红烧肉', category: 'meat' },
        { name: '宫保鸡丁', category: 'meat' },
        { name: '清炒时蔬', category: 'vegetable' },
        { name: '番茄炒蛋', category: 'vegetable' },
        { name: '酸辣汤', category: 'soup' },
        { name: '蛋炒饭', category: 'staple' },
        { name: '芒果班戟', category: 'snack' }
    ];
    
    return sampleResults[Math.floor(Math.random() * sampleResults.length)];
}

function closeDishModal() {
    const modal = document.querySelector('.dish-modal-overlay');
    if (modal) {
        modal.remove();
    }
}

async function saveDish(dishId) {
    const name = document.getElementById('dishName').value.trim();
    const category = document.getElementById('dishCategory').value;
    const previewImage = document.getElementById('previewImage');
    
    if (!name) {
        showToast('请输入菜品名称');
        return;
    }
    
    let image = '';
    if (previewImage && previewImage.style.display !== 'none') {
        image = previewImage.src;
    } else if (dishId) {
        const existingDish = dishes.find(d => d.id === dishId);
        if (existingDish) {
            image = existingDish.image;
        }
    }
    
    if (!image) {
        showToast('请上传菜品图片');
        return;
    }
    
    if (dishId) {
        const { error } = await db
            .from('dishes')
            .update({
                name: name,
                category: category,
                category_name: categoryNames[category],
                image: image
            })
            .eq('id', dishId);
        
        if (error) {
            console.error('Error updating dish:', error);
            showToast('更新失败');
            return;
        }
        
        const index = dishes.findIndex(d => d.id === dishId);
        if (index !== -1) {
            dishes[index] = {
                ...dishes[index],
                name: name,
                category: category,
                category_name: categoryNames[category],
                image: image
            };
        }
        showToast('菜品已更新');
    } else {
        const { data, error } = await db
            .from('dishes')
            .insert({
                name: name,
                category: category,
                category_name: categoryNames[category],
                image: image
            })
            .select();
        
        if (error) {
            console.error('Error adding dish:', error);
            showToast('添加失败');
            return;
        }
        
        if (data && data.length > 0) {
            dishes.unshift(data[0]);
        }
        showToast('菜品已添加');
    }
    
    renderDishes();
    closeDishModal();
}

function openDeleteModal(dishId) {
    const dish = dishes.find(d => d.id === dishId);
    if (!dish) return;
    
    const modal = document.createElement('div');
    modal.className = 'dish-modal-overlay';
    modal.innerHTML = `
        <div class="dish-modal delete-modal">
            <div class="delete-modal-icon">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h3 class="delete-modal-title">确认删除</h3>
            <p class="delete-modal-text">确定要删除《${dish.name}》吗？</p>
            <div class="dish-modal-footer">
                <button class="dish-modal-btn cancel-btn" onclick="closeDishModal()">取消</button>
                <button class="dish-modal-btn delete-confirm-btn" onclick="deleteDish('${dishId}')">确认删除</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

async function deleteDish(dishId) {
    const { error } = await db
        .from('dishes')
        .delete()
        .eq('id', dishId);
    
    if (error) {
        console.error('Error deleting dish:', error);
        showToast('删除失败');
        return;
    }
    
    const index = dishes.findIndex(d => d.id === dishId);
    if (index !== -1) {
        dishes.splice(index, 1);
        renderDishes();
        showToast('菜品已删除');
    }
    closeDishModal();
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}
