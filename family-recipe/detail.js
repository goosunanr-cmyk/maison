// 模拟菜品数据
const dishes = [
    {
        id: 1,
        name: '红烧肉',
        category: 'meat',
        categoryName: '肉菜',
        tags: ['下饭', '经典'],
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=delicious%20braised%20pork%20belly%20chinese%20food%20close%20up&image_size=square_hd'
    },
    {
        id: 2,
        name: '宫保鸡丁',
        category: 'meat',
        categoryName: '肉菜',
        tags: ['辣', '川菜'],
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=kung%20pao%20chicken%20spicy%20chinese%20cuisine%20colorful&image_size=square_hd'
    },
    {
        id: 3,
        name: '清炒时蔬',
        category: 'vegetable',
        categoryName: '素菜',
        tags: ['健康', '清淡'],
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20stir%20fried%20vegetables%20healthy%20green%20food&image_size=square_hd'
    },
    {
        id: 4,
        name: '番茄炒蛋',
        category: 'vegetable',
        categoryName: '素菜',
        tags: ['家常', '简单'],
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=tomato%20and%20egg%20stir%20fry%20classic%20chinese%20home%20cooking&image_size=square_hd'
    },
    {
        id: 5,
        name: '酸辣汤',
        category: 'soup',
        categoryName: '汤品',
        tags: ['开胃', '热汤'],
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=hot%20and%20sour%20soup%20chinese%20style%20steaming%20bowl&image_size=square_hd'
    },
    {
        id: 6,
        name: '紫菜蛋花汤',
        category: 'soup',
        categoryName: '汤品',
        tags: ['快手', '清淡'],
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=seaweed%20egg%20drop%20soup%20clear%20light%20broth&image_size=square_hd'
    },
    {
        id: 7,
        name: '蛋炒饭',
        category: 'staple',
        categoryName: '主食',
        tags: ['经典', '快手'],
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fried%20rice%20with%20egg%20golden%20color%20chinese%20style&image_size=square_hd'
    },
    {
        id: 8,
        name: '葱油拌面',
        category: 'staple',
        categoryName: '主食',
        tags: ['简单', '面食'],
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=scallion%20oil%20noodles%20shanghai%20style%20delicious&image_size=square_hd'
    },
    {
        id: 9,
        name: '芒果班戟',
        category: 'snack',
        categoryName: '小吃甜点',
        tags: ['甜点', '港式'],
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=mango%20pancake%20dessert%20sweet%20hong%20kong%20style&image_size=square_hd'
    },
    {
        id: 10,
        name: '炸鸡翅',
        category: 'snack',
        categoryName: '小吃甜点',
        tags: ['小吃', '酥脆'],
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=crispy%20fried%20chicken%20wings%20golden%20brown%20appetizing&image_size=square_hd'
    }
];

let currentDish = null;
let isLiked = false;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    init();
});

function init() {
    // 从URL参数获取菜品ID
    const urlParams = new URLSearchParams(window.location.search);
    const dishId = parseInt(urlParams.get('id'));
    
    if (dishId) {
        loadDishDetail(dishId);
    } else {
        // 如果没有ID，默认加载第一个菜品
        loadDishDetail(dishes[0].id);
    }
}

// 加载菜品详情
function loadDishDetail(dishId) {
    currentDish = dishes.find(d => d.id === dishId);
    
    if (!currentDish) {
        showToast('菜品不存在');
        return;
    }
    
    // 设置菜品图片
    const dishImage = document.getElementById('dishDetailImage');
    dishImage.style.backgroundImage = `url(${currentDish.image})`;
    dishImage.style.backgroundSize = 'cover';
    dishImage.style.backgroundPosition = 'center';
    
    // 设置菜品名称
    document.getElementById('dishDetailName').textContent = currentDish.name;
    
    // 设置分类
    document.getElementById('dishDetailCategory').textContent = currentDish.categoryName;
    
    // 设置标签
    const tagsContainer = document.getElementById('dishDetailTags');
    tagsContainer.innerHTML = currentDish.tags.map(tag => 
        `<span class="tag-pill">${tag}</span>`
    ).join('');
    
    // 设置描述（根据菜品生成不同的描述）
    const descriptions = {
        1: '肥瘦相间的五花肉，经过慢火炖煮，肉质软糯入味，酱香浓郁。一口下去，满满的幸福感！',
        2: '经典川菜代表作！鸡肉嫩滑，花生酥脆，麻辣鲜香，口感丰富，越吃越开胃。',
        3: '新鲜时令蔬菜，清炒保留食材的原汁原味，健康营养，清爽解腻。',
        4: '最简单也最经典的家常菜！番茄酸甜，鸡蛋滑嫩，百吃不厌的国民料理。',
        5: '酸辣开胃，暖身暖心！木耳、豆腐、鸡蛋丝，食材丰富，一口一碗超满足。',
        6: '清淡鲜美，快手好做！紫菜的鲜香搭配蛋花的滑嫩，简简单单的一碗好汤。',
        7: '粒粒分明，金黄诱人！鸡蛋、葱花、米饭的完美组合，一碗不够再来一碗！',
        8: '葱油飘香，面条劲道！简单的调料，不简单的味道，一碗面温暖整个胃。',
        9: '港式甜品经典！芒果的香甜搭配奶油的丝滑，每一口都是甜蜜的享受。',
        10: '外酥里嫩，金黄诱人！腌制入味的鸡翅，炸至酥脆，追剧必备小零食！'
    };
    
    document.getElementById('dishDescription').textContent = 
        descriptions[dishId] || '这是一道美味的家常菜，非常适合家庭聚餐。';
}

// 返回上一页
function goBack() {
    window.location.href = 'index.html';
}

// 喜欢菜品
function likeDish() {
    isLiked = !isLiked;
    const btn = document.querySelector('.action-btn');
    
    if (isLiked) {
        btn.classList.add('liked');
        btn.querySelector('i').className = 'fas fa-heart';
        showToast('已添加到喜欢');
    } else {
        btn.classList.remove('liked');
        btn.querySelector('i').className = 'fas fa-heart';
        showToast('已取消喜欢');
    }
}

// 分享菜品
function shareDish() {
    if (navigator.share) {
        navigator.share({
            title: currentDish.name,
            text: `快来看看这道美味的${currentDish.name}！`,
            url: window.location.href
        }).catch(console.error);
    } else {
        showToast('链接已复制到剪贴板');
    }
}

// 编辑菜品
function editDish() {
    showToast('跳转到编辑页面...');
}

// 显示Toast提示
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}