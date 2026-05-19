/**
 * Каталог курсів з асинхронним завантаженням даних
 */

const CatalogManager = (() => {
    let coursesData = [];
    let filteredData = [];
    
    let gridContainer = null;
    let emptyState = null;
    let loadingState = null;
    let searchInput = null;
    let categoryFilter = null;
    let sortSelect = null;
    
    /**
     * Завантаження курсів з JSON-файлу
     */
    async function loadCourses() {
        try {
            showLoading(true);
            
            const response = await fetch('assets/data/items.json');
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            coursesData = data;
            filteredData = [...coursesData];
            
            applyFilters();
            
            showLoading(false);
            
        } catch (error) {
            console.error('Помилка завантаження курсів:', error);
            showLoading(false);
            
            if (gridContainer) {
                gridContainer.innerHTML = `
                    <div class="empty-state" style="grid-column: 1/-1;">
                        <p>❌ Помилка завантаження даних: ${error.message}</p>
                        <button class="btn btn-primary" id="retryLoad">Спробувати знову</button>
                    </div>
                `;
                
                const retryBtn = document.getElementById('retryLoad');
                if (retryBtn) {
                    retryBtn.addEventListener('click', () => loadCourses());
                }
            }
        }
    }
    
    /**
     * Показ/приховування стану завантаження
     */
    function showLoading(isLoading) {
        if (loadingState) {
            loadingState.style.display = isLoading ? 'block' : 'none';
        }
        if (gridContainer && !isLoading) {
            gridContainer.style.display = 'grid';
        }
    }
    
    /**
     * Рендеринг карток курсів
     */
    function renderCourses(courses) {
        if (!gridContainer) return;
        
        if (!courses || courses.length === 0) {
            gridContainer.style.display = 'none';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }
        
        gridContainer.style.display = 'grid';
        if (emptyState) emptyState.style.display = 'none';
        
        // Функція для отримання кольору категорії
        const getCategoryClass = (category) => {
            const map = {
                'html': 'badge-html',
                'css': 'badge-html',
                'js': 'badge-js',
                'react': 'badge-react',
                'vue': 'badge-react',
                'backend': 'badge-js'
            };
            return map[category] || 'badge-html';
        };
        
        const getCategoryLabel = (category) => {
            const map = {
                'html': 'HTML/CSS',
                'css': 'HTML/CSS',
                'js': 'JavaScript',
                'react': 'React',
                'vue': 'Vue.js',
                'backend': 'Node.js',
                'ts': 'TypeScript'
            };
            return map[category] || category.toUpperCase();
        };
        
        gridContainer.innerHTML = courses.map(course => `
            <div class="lab-card" data-id="${course.id}">
                <span class="lab-badge ${getCategoryClass(course.category)}">${getCategoryLabel(course.category)}</span>
                <h3>${course.title}</h3>
                <p>${course.description}</p>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem;">
                    <div>
                        <span style="color: var(--accent-primary); font-weight: 700; font-size: 1.25rem;">$${course.price}</span>
                        <span style="color: var(--text-muted); font-size: 0.8rem;"> / ${course.duration}</span>
                    </div>
                    <div style="display: flex; gap: 0.5rem;">
                        <span style="color: gold;">★</span>
                        <span style="color: var(--text-muted);">${course.rating}</span>
                    </div>
                </div>
                <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                    <button class="btn btn-primary favorite-btn" data-id="${course.id}" style="padding: 0.5rem; font-size: 0.8rem;">❤️ В обране</button>
                    <button class="btn btn-secondary details-btn" data-id="${course.id}" style="padding: 0.5rem; font-size: 0.8rem;">Детальніше</button>
                </div>
            </div>
        `).join('');
        
        // Додавання обробників для кнопок (буде викликано ззовні)
        attachButtonHandlers();
    }
    
    /**
     * Прив'язка обробників до кнопок
     */
    function attachButtonHandlers() {
        // Кнопки "В обране" - обробник буде в favorites.js
        const favButtons = document.querySelectorAll('.favorite-btn');
        favButtons.forEach(btn => {
            btn.removeEventListener('click', handleFavoriteClick);
            btn.addEventListener('click', handleFavoriteClick);
        });
        
        // Кнопки "Детальніше"
        const detailsButtons = document.querySelectorAll('.details-btn');
        detailsButtons.forEach(btn => {
            btn.removeEventListener('click', handleDetailsClick);
            btn.addEventListener('click', handleDetailsClick);
        });
    }
    
    /**
     * Обробник додавання в обране
     */
    function handleFavoriteClick(event) {
        event.stopPropagation();
        const btn = event.currentTarget;
        const courseId = parseInt(btn.dataset.id);
        
        if (window.FavoritesManager && typeof window.FavoritesManager.toggleFavorite === 'function') {
            window.FavoritesManager.toggleFavorite(courseId);
        } else {
            console.warn('FavoritesManager не ініціалізовано');
        }
    }
    
    /**
     * Обробник перегляду деталей
     */
    function handleDetailsClick(event) {
        event.stopPropagation();
        const btn = event.currentTarget;
        const courseId = parseInt(btn.dataset.id);
        const course = coursesData.find(c => c.id === courseId);
        
        if (course) {
            showModal(course);
        }
    }
    
    /**
     * Показ модального вікна з деталями курсу
     */
    function showModal(course) {
        // Створення модального вікна
        const modal = document.createElement('div');
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.style.zIndex = '2000';
        
        modal.innerHTML = `
            <div style="background: var(--bg-card); border-radius: 1rem; max-width: 500px; width: 90%; padding: 2rem; position: relative;">
                <button style="position: absolute; top: 1rem; right: 1rem; background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-primary);">&times;</button>
                <h2 style="margin-bottom: 1rem;">${course.title}</h2>
                <p><strong>Категорія:</strong> ${course.category.toUpperCase()}</p>
                <p><strong>Рівень:</strong> ${course.level}</p>
                <p><strong>Тривалість:</strong> ${course.duration}</p>
                <p><strong>Ціна:</strong> $${course.price}</p>
                <p><strong>Рейтинг:</strong> ${course.rating} ★</p>
                <p><strong>Опис:</strong> ${course.description}</p>
                <button class="btn btn-primary" style="margin-top: 1rem; width: 100%;" id="closeModal">Закрити</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const closeBtn = modal.querySelector('button');
        closeBtn.addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }
    
    /**
     * Фільтрація та сортування
     */
    function applyFilters() {
        let result = [...coursesData];
        
        // Пошук
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        if (searchTerm) {
            result = result.filter(course => 
                course.title.toLowerCase().includes(searchTerm) ||
                course.description.toLowerCase().includes(searchTerm)
            );
        }
        
        // Фільтр за категорією
        const category = categoryFilter ? categoryFilter.value : 'all';
        if (category !== 'all') {
            result = result.filter(course => course.category === category);
        }
        
        // Сортування
        const sortBy = sortSelect ? sortSelect.value : 'default';
        switch (sortBy) {
            case 'price-asc':
                result.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                result.sort((a, b) => b.price - a.price);
                break;
            case 'rating':
                result.sort((a, b) => b.rating - a.rating);
                break;
            default:
                result.sort((a, b) => a.id - b.id);
        }
        
        filteredData = result;
        renderCourses(filteredData);
    }
    
    /**
     * Скидання фільтрів
     */
    function resetFilters() {
        if (searchInput) searchInput.value = '';
        if (categoryFilter) categoryFilter.value = 'all';
        if (sortSelect) sortSelect.value = 'default';
        applyFilters();
    }
    
    /**
     * Ініціалізація каталогу
     */
    async function init() {
        gridContainer = document.getElementById('catalogGrid');
        emptyState = document.getElementById('catalogEmpty');
        loadingState = document.getElementById('loadingState');
        searchInput = document.getElementById('catalogSearch');
        categoryFilter = document.getElementById('categoryFilter');
        sortSelect = document.getElementById('sortBy');
        
        if (!gridContainer) return;
        
        // Додавання обробників подій
        if (searchInput) searchInput.addEventListener('input', () => applyFilters());
        if (categoryFilter) categoryFilter.addEventListener('change', () => applyFilters());
        if (sortSelect) sortSelect.addEventListener('change', () => applyFilters());
        
        const resetBtn = document.getElementById('resetCatalogFilters');
        if (resetBtn) resetBtn.addEventListener('click', () => resetFilters());
        
        // Завантаження даних
        await loadCourses();
    }
    
    /**
     * Оновлення стану обраного (викликається з favorites.js)
     */
    function updateFavoriteStatus(courseId, isFavorite) {
        const card = document.querySelector(`.lab-card[data-id="${courseId}"]`);
        if (card) {
            const favBtn = card.querySelector('.favorite-btn');
            if (favBtn) {
                favBtn.textContent = isFavorite ? '💔 Видалити' : '❤️ В обране';
                favBtn.style.opacity = isFavorite ? '0.8' : '1';
            }
        }
    }
    
    /**
     * Отримання даних курсу за ID
     */
    function getCourseById(id) {
        return coursesData.find(c => c.id === id);
    }
    
    return {
        init,
        applyFilters,
        resetFilters,
        updateFavoriteStatus,
        getCourseById,
        getCourses: () => coursesData
    };
})();

// Ініціалізація
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => CatalogManager.init());
} else {
    CatalogManager.init();
}