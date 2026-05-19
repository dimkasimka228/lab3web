/**
 * Система "Обране" з використанням localStorage
 */

const FavoritesManager = (() => {
    const STORAGE_KEY = 'weblab_favorites';
    let favorites = [];
    
    /**
     * Завантаження обраного з localStorage
     */
    function loadFavorites() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                favorites = JSON.parse(saved);
            } catch (e) {
                favorites = [];
            }
        }
        return favorites;
    }
    
    /**
     * Збереження обраного в localStorage
     */
    function saveFavorites() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    }
    
    /**
     * Перевірка, чи є курс в обраному
     */
    function isFavorite(courseId) {
        return favorites.includes(courseId);
    }
    
    /**
     * Додавання курсу в обране
     */
    function addFavorite(courseId) {
        if (!isFavorite(courseId)) {
            favorites.push(courseId);
            saveFavorites();
            updateUI(courseId, true);
            showNotification('✅ Додано до обраного!');
        }
    }
    
    /**
     * Видалення курсу з обраного
     */
    function removeFavorite(courseId) {
        const index = favorites.indexOf(courseId);
        if (index !== -1) {
            favorites.splice(index, 1);
            saveFavorites();
            updateUI(courseId, false);
            showNotification('❌ Видалено з обраного');
        }
    }
    
    /**
     * Перемикання стану обраного
     */
    function toggleFavorite(courseId) {
        if (isFavorite(courseId)) {
            removeFavorite(courseId);
        } else {
            addFavorite(courseId);
        }
    }
    
    /**
     * Отримання всього списку обраного
     */
    function getAllFavorites() {
        return [...favorites];
    }
    
    /**
     * Оновлення UI (кнопок у каталозі)
     */
    function updateUI(courseId, isFav) {
        // Оновлення кнопок в каталозі
        const cards = document.querySelectorAll(`.lab-card[data-id="${courseId}"]`);
        cards.forEach(card => {
            const favBtn = card.querySelector('.favorite-btn');
            if (favBtn) {
                favBtn.textContent = isFav ? '💔 Видалити' : '❤️ В обране';
                favBtn.style.opacity = isFav ? '0.8' : '1';
            }
        });
        
        // Оновлення CatalogManager, якщо доступний
        if (window.CatalogManager && typeof window.CatalogManager.updateFavoriteStatus === 'function') {
            window.CatalogManager.updateFavoriteStatus(courseId, isFav);
        }
    }
    
    /**
     * Показ сповіщення
     */
    function showNotification(message) {
        // Перевірка на наявність існуючого сповіщення
        let notification = document.querySelector('.favorite-notification');
        if (notification) {
            notification.remove();
        }
        
        notification = document.createElement('div');
        notification.className = 'favorite-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            bottom: 80px;
            right: 20px;
            background: var(--accent-primary);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            font-size: 14px;
        `;
        
        // Додавання анімації
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }
    
    /**
     * Ініціалізація: завантаження обраного та оновлення UI
     */
    function init() {
        loadFavorites();
        
        // Оновлення всіх кнопок після завантаження сторінки
        setTimeout(() => {
            favorites.forEach(courseId => {
                updateUI(courseId, true);
            });
        }, 500);
        
        // Експортуємо функції для використання з інших модулів
        window.FavoritesManager = {
            isFavorite,
            addFavorite,
            removeFavorite,
            toggleFavorite,
            getAllFavorites,
            loadFavorites: loadFavorites
        };
    }
    
    return {
        init,
        isFavorite,
        addFavorite,
        removeFavorite,
        toggleFavorite,
        getAllFavorites
    };
})();

// Ініціалізація
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => FavoritesManager.init());
} else {
    FavoritesManager.init();
}