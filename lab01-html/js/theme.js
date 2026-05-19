/**
 * Модуль керування темами (світла/темна)
 * Зберігає вибір користувача в localStorage
 */

const ThemeManager = (() => {
    const STORAGE_KEY = 'weblab-theme';
    const THEME_ATTR = 'data-theme';
    
    // Доступні теми
    const THEMES = {
        LIGHT: 'light',
        DARK: 'dark'
    };
    
    /**
     * Отримання поточної теми
     */
    function getCurrentTheme() {
        return document.documentElement.getAttribute(THEME_ATTR) || THEMES.LIGHT;
    }
    
    /**
     * Встановлення теми
     */
    function setTheme(theme) {
        if (theme === THEMES.DARK) {
            document.documentElement.setAttribute(THEME_ATTR, THEMES.DARK);
        } else {
            document.documentElement.removeAttribute(THEME_ATTR);
        }
        localStorage.setItem(STORAGE_KEY, theme);
        updateThemeToggleButton(theme);
    }
    
    /**
     * Оновлення вигляду кнопки перемикача
     */
    function updateThemeToggleButton(theme) {
        const toggleBtn = document.getElementById('themeToggle');
        if (toggleBtn) {
            const isDark = theme === THEMES.DARK;
            toggleBtn.setAttribute('aria-label', isDark ? 'Перемкнути на світлу тему' : 'Перемкнути на темну тему');
        }
    }
    
    /**
     * Перемикання теми
     */
    function toggleTheme() {
        const current = getCurrentTheme();
        const newTheme = current === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
        setTheme(newTheme);
    }
    
    /**
     * Ініціалізація теми
     */
    function init() {
        // Перевірка системних налаштувань або збереженої теми
        const savedTheme = localStorage.getItem(STORAGE_KEY);
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        let initialTheme = THEMES.LIGHT;
        
        if (savedTheme) {
            initialTheme = savedTheme;
        } else if (prefersDark) {
            initialTheme = THEMES.DARK;
        }
        
        setTheme(initialTheme);
        
        // Додавання обробника події для кнопки
        const toggleBtn = document.getElementById('themeToggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', toggleTheme);
        }
        
        // Слідкування за системними змінами теми
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem(STORAGE_KEY)) {
                setTheme(e.matches ? THEMES.DARK : THEMES.LIGHT);
            }
        });
    }
    
    // Публічне API
    return {
        init,
        toggleTheme,
        getCurrentTheme,
        setTheme
    };
})();

// Автоматична ініціалізація після завантаження DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ThemeManager.init());
} else {
    ThemeManager.init();
}