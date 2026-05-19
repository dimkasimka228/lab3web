/**
 * Головний JavaScript файл
 * Включає: бургер-меню, кнопку "вгору", акордеон, фільтри, форму
 */

// ========== DOM Utilities ==========
const DOMUtils = {
    $(selector) {
        return document.querySelector(selector);
    },
    
    $$(selector) {
        return document.querySelectorAll(selector);
    },
    
    onReady(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }
};

// ========== Mobile Menu (Бургер-меню) ==========
const MobileMenu = {
    burgerBtn: null,
    mobileNav: null,
    body: null,
    
    init() {
        this.burgerBtn = document.getElementById('burgerMenu');
        this.mobileNav = document.getElementById('mobileNav');
        this.body = document.body;
        
        if (!this.burgerBtn || !this.mobileNav) return;
        
        this.burgerBtn.addEventListener('click', () => this.toggle());
        
        // Закриття меню при кліку на посилання
        const links = this.mobileNav.querySelectorAll('.mobile-nav-link');
        links.forEach(link => {
            link.addEventListener('click', () => this.close());
        });
        
        // Закриття при кліку поза меню
        document.addEventListener('click', (e) => {
            if (this.mobileNav.classList.contains('active') &&
                !this.mobileNav.contains(e.target) &&
                !this.burgerBtn.contains(e.target)) {
                this.close();
            }
        });
    },
    
    toggle() {
        this.mobileNav.classList.toggle('active');
        this.burgerBtn.classList.toggle('active');
        this.body.style.overflow = this.mobileNav.classList.contains('active') ? 'hidden' : '';
    },
    
    close() {
        this.mobileNav.classList.remove('active');
        this.burgerBtn.classList.remove('active');
        this.body.style.overflow = '';
    }
};

// ========== Back to Top Button (Кнопка "Вгору") ==========
const BackToTop = {
    button: null,
    
    init() {
        this.button = document.getElementById('backToTop');
        if (!this.button) return;
        
        window.addEventListener('scroll', () => this.toggleVisibility());
        this.button.addEventListener('click', () => this.scrollToTop());
        this.toggleVisibility();
    },
    
    toggleVisibility() {
        if (window.scrollY > 300) {
            this.button.classList.add('visible');
        } else {
            this.button.classList.remove('visible');
        }
    },
    
    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
};

// ========== Accordion (Акордеон для FAQ) ==========
const Accordion = {
    init() {
        const headers = document.querySelectorAll('.accordion-header');
        
        headers.forEach(header => {
            header.addEventListener('click', () => {
                const isActive = header.classList.contains('active');
                
                // Закриття всіх інших (опціонально)
                // headers.forEach(h => {
                //     if (h !== header && h.classList.contains('active')) {
                //         this.closeAccordion(h);
                //     }
                // });
                
                if (isActive) {
                    this.closeAccordion(header);
                } else {
                    this.openAccordion(header);
                }
            });
        });
    },
    
    openAccordion(header) {
        header.classList.add('active');
        const content = header.nextElementSibling;
        if (content) {
            content.classList.add('active');
            content.style.maxHeight = content.scrollHeight + 'px';
        }
    },
    
    closeAccordion(header) {
        header.classList.remove('active');
        const content = header.nextElementSibling;
        if (content) {
            content.classList.remove('active');
            content.style.maxHeight = null;
        }
    }
};

// ========== Dynamic Footer Year ==========
function setFooterYear() {
    const yearSpans = document.querySelectorAll('#currentYear, #footerYear');
    const currentYear = new Date().getFullYear();
    yearSpans.forEach(span => {
        if (span) span.textContent = currentYear;
    });
}

// ========== Active Navigation Highlight ==========
function setActiveNavLink() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && (currentPath.endsWith(href) || 
            (currentPath.endsWith('/') && href === 'index.html') ||
            (href === 'index.html' && currentPath.split('/').pop() === ''))) {
            link.classList.add('active');
        } else if (href === 'index.html' && (currentPath === '/' || currentPath.endsWith('/index.html'))) {
            link.classList.add('active');
        }
    });
}

// ========== Labs Page Logic (Фільтрація лабораторних) ==========
const LabsManager = {
    labsData: [
        { id: 1, title: "HTML5 та семантична верстка", category: "html", description: "Створення структури документа, використання семантичних тегів, форм та медіа-елементів.", duration: "2 год", level: "Початковий" },
        { id: 2, title: "CSS3 та адаптивний дизайн", category: "html", description: "Flexbox, Grid, Media Queries, анімації та трансформації.", duration: "3 год", level: "Початковий" },
        { id: 3, title: "JavaScript: DOM та події", category: "js", description: "Робота з DOM-деревом, обробка подій, створення інтерактивних компонентів.", duration: "4 год", level: "Середній" },
        { id: 4, title: "Асинхронний JavaScript", category: "js", description: "Promise, async/await, fetch API, робота з API сервера.", duration: "3 год", level: "Середній" },
        { id: 5, title: "React: компоненти та стан", category: "react", description: "Створення React-компонентів, управління станом, хуки.", duration: "5 год", level: "Просунутий" },
        { id: 6, title: "React Router та маршрутизація", category: "react", description: "Навігація в React-додатках, динамічні маршрути.", duration: "3 год", level: "Просунутий" }
    ],
    
    init() {
        this.searchInput = document.getElementById('labSearch');
        this.filterSelect = document.getElementById('labFilter');
        this.labsGrid = document.getElementById('labsGrid');
        this.emptyState = document.getElementById('emptyState');
        this.resetBtn = document.getElementById('resetFilters');
        
        if (!this.labsGrid) return;
        
        this.renderLabs(this.labsData);
        
        if (this.searchInput) {
            this.searchInput.addEventListener('input', () => this.filterLabs());
        }
        
        if (this.filterSelect) {
            this.filterSelect.addEventListener('change', () => this.filterLabs());
        }
        
        if (this.resetBtn) {
            this.resetBtn.addEventListener('click', () => this.resetFilters());
        }
    },
    
    filterLabs() {
        const searchTerm = this.searchInput ? this.searchInput.value.toLowerCase() : '';
        const category = this.filterSelect ? this.filterSelect.value : 'all';
        
        const filtered = this.labsData.filter(lab => {
            const matchesSearch = lab.title.toLowerCase().includes(searchTerm) ||
                                  lab.description.toLowerCase().includes(searchTerm);
            const matchesCategory = category === 'all' || lab.category === category;
            return matchesSearch && matchesCategory;
        });
        
        this.renderLabs(filtered);
    },
    
    renderLabs(labs) {
        if (!this.labsGrid) return;
        
        if (labs.length === 0) {
            this.labsGrid.style.display = 'none';
            if (this.emptyState) this.emptyState.style.display = 'block';
            return;
        }
        
        this.labsGrid.style.display = 'grid';
        if (this.emptyState) this.emptyState.style.display = 'none';
        
        const categoryLabels = {
            html: 'HTML/CSS',
            js: 'JavaScript',
            react: 'React'
        };
        
        const categoryClasses = {
            html: 'badge-html',
            js: 'badge-js',
            react: 'badge-react'
        };
        
        this.labsGrid.innerHTML = labs.map(lab => `
            <div class="lab-card">
                <span class="lab-badge ${categoryClasses[lab.category]}">${categoryLabels[lab.category]}</span>
                <h3>${lab.title}</h3>
                <p>${lab.description}</p>
                <div style="display: flex; justify-content: space-between; margin-top: 1rem; color: var(--text-muted); font-size: 0.875rem;">
                    <span>⏱ ${lab.duration}</span>
                    <span>📊 ${lab.level}</span>
                </div>
            </div>
        `).join('');
    },
    
    resetFilters() {
        if (this.searchInput) this.searchInput.value = '';
        if (this.filterSelect) this.filterSelect.value = 'all';
        this.filterLabs();
    }
};

// ========== Audio Player Enhancement ==========
function initAudioPlayer() {
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(audio => {
        audio.addEventListener('play', () => {
            audioElements.forEach(other => {
                if (other !== audio && !other.paused) {
                    other.pause();
                }
            });
        });
    });
}

// ========== Ініціалізація всього ==========
DOMUtils.onReady(() => {
    MobileMenu.init();
    BackToTop.init();
    Accordion.init();
    setFooterYear();
    setActiveNavLink();
    LabsManager.init();
    initAudioPlayer();
    
    // Додаткові ефекти для карток
    const cards = document.querySelectorAll('.feature-card, .lab-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });
    
    console.log('🚀 WebLab ініціалізовано!');
});