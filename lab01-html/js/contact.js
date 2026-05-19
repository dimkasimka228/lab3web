/**
 * Модуль роботи з формою контактів
 * Включає: валідацію, localStorage чернетку, лічильник символів
 */

const ContactForm = (() => {
    const STORAGE_KEY = 'contactFormDraft';
    
    let form = null;
    let nameInput = null;
    let emailInput = null;
    let phoneInput = null;
    let messageTextarea = null;
    let agreementCheckbox = null;
    let charCountSpan = null;
    let successDiv = null;
    
    /**
     * Показ помилки для поля
     */
    function showError(fieldId, message) {
        const errorDiv = document.getElementById(fieldId + 'Error');
        if (errorDiv) {
            errorDiv.textContent = message;
        }
    }
    
    /**
     * Очищення помилки для поля
     */
    function clearError(fieldId) {
        const errorDiv = document.getElementById(fieldId + 'Error');
        if (errorDiv) {
            errorDiv.textContent = '';
        }
    }
    
    /**
     * Валідація імені
     */
    function validateName() {
        const name = nameInput ? nameInput.value.trim() : '';
        if (name.length < 2) {
            showError('name', 'Ім\'я має містити щонайменше 2 символи');
            return false;
        }
        if (name.length > 50) {
            showError('name', 'Ім\'я не може перевищувати 50 символів');
            return false;
        }
        clearError('name');
        return true;
    }
    
    /**
     * Валідація email
     */
    function validateEmail() {
        const email = emailInput ? emailInput.value.trim() : '';
        const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
        
        if (!email) {
            showError('email', 'Email є обов\'язковим');
            return false;
        }
        if (!emailRegex.test(email)) {
            showError('email', 'Введіть коректний email (наприклад, name@domain.com)');
            return false;
        }
        clearError('email');
        return true;
    }
    
    /**
     * Валідація телефону (опціональна)
     */
    function validatePhone() {
        const phone = phoneInput ? phoneInput.value.trim() : '';
        if (phone && !/^[\+\d\s\-\(\)]{10,20}$/.test(phone)) {
            showError('phone', 'Введіть коректний номер телефону');
            return false;
        }
        clearError('phone');
        return true;
    }
    
    /**
     * Валідація повідомлення
     */
    function validateMessage() {
        const message = messageTextarea ? messageTextarea.value.trim() : '';
        if (message.length < 10) {
            showError('message', 'Повідомлення має містити щонайменше 10 символів');
            return false;
        }
        if (message.length > 500) {
            showError('message', 'Повідомлення не може перевищувати 500 символів');
            return false;
        }
        clearError('message');
        return true;
    }
    
    /**
     * Валідація згоди
     */
    function validateAgreement() {
        const isChecked = agreementCheckbox ? agreementCheckbox.checked : false;
        if (!isChecked) {
            showError('agreement', 'Потрібно погодитись з правилами');
            return false;
        }
        clearError('agreement');
        return true;
    }
    
    /**
     * Повна валідація форми
     */
    function validateForm() {
        const isNameValid = validateName();
        const isEmailValid = validateEmail();
        const isPhoneValid = validatePhone();
        const isMessageValid = validateMessage();
        const isAgreementValid = validateAgreement();
        
        return isNameValid && isEmailValid && isPhoneValid && isMessageValid && isAgreementValid;
    }
    
    /**
     * Оновлення лічильника символів
     */
    function updateCharCount() {
        if (messageTextarea && charCountSpan) {
            const length = messageTextarea.value.length;
            charCountSpan.textContent = length;
            
            if (length > 450) {
                charCountSpan.style.color = 'var(--accent-warning)';
            } else if (length > 490) {
                charCountSpan.style.color = 'var(--accent-danger)';
            } else {
                charCountSpan.style.color = 'var(--text-muted)';
            }
        }
    }
    
    /**
     * Збереження чернетки в localStorage
     */
    function saveDraft() {
        if (!form) return;
        
        const draft = {
            name: nameInput ? nameInput.value : '',
            email: emailInput ? emailInput.value : '',
            phone: phoneInput ? phoneInput.value : '',
            topic: document.getElementById('topic') ? document.getElementById('topic').value : 'study',
            contactWay: document.querySelector('input[name="contactWay"]:checked')?.value || 'email',
            message: messageTextarea ? messageTextarea.value : '',
            agreement: agreementCheckbox ? agreementCheckbox.checked : false
        };
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    }
    
    /**
     * Завантаження чернетки з localStorage
     */
    function loadDraft() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) return;
        
        try {
            const draft = JSON.parse(saved);
            
            if (nameInput) nameInput.value = draft.name || '';
            if (emailInput) emailInput.value = draft.email || '';
            if (phoneInput) phoneInput.value = draft.phone || '';
            
            const topicSelect = document.getElementById('topic');
            if (topicSelect && draft.topic) topicSelect.value = draft.topic;
            
            const radioBtn = document.querySelector(`input[name="contactWay"][value="${draft.contactWay}"]`);
            if (radioBtn) radioBtn.checked = true;
            
            if (messageTextarea) messageTextarea.value = draft.message || '';
            if (agreementCheckbox) agreementCheckbox.checked = draft.agreement || false;
            
            updateCharCount();
        } catch (e) {
            console.warn('Помилка завантаження чернетки:', e);
        }
    }
    
    /**
     * Очищення чернетки
     */
    function clearDraft() {
        if (confirm('Ви впевнені, що хочете очистити всі поля форми?')) {
            if (form) form.reset();
            if (messageTextarea) updateCharCount();
            localStorage.removeItem(STORAGE_KEY);
            
            // Очищення помилок
            ['name', 'email', 'phone', 'message', 'agreement'].forEach(field => {
                clearError(field);
            });
            
            // Показ повідомлення
            if (successDiv) {
                successDiv.textContent = '✅ Форму очищено!';
                successDiv.style.display = 'block';
                setTimeout(() => {
                    successDiv.style.display = 'none';
                }, 2000);
            }
        }
    }
    
    /**
     * Обробка відправлення форми
     */
    async function handleSubmit(event) {
        event.preventDefault();
        
        if (!validateForm()) {
            if (successDiv) {
                successDiv.style.display = 'none';
            }
            return;
        }
        
        // Збір даних з форми
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Показ успішного повідомлення
        if (successDiv) {
            successDiv.innerHTML = `
                ✅ <strong>Повідомлення відправлено!</strong><br>
                Дякуємо, ${data.name}! Ми зв'яжемося з вами через ${data.contactWay === 'email' ? data.email : data.phone || 'вказаний телефон'}.
            `;
            successDiv.style.display = 'block';
            
            // Очищення чернетки після успішної відправки
            localStorage.removeItem(STORAGE_KEY);
            
            // Опціонально: очищення форми
            // form.reset();
            // updateCharCount();
            
            // Автоматичне приховування через 5 секунд
            setTimeout(() => {
                successDiv.style.display = 'none';
            }, 5000);
        }
        
        console.log('Дані форми:', data);
    }
    
    /**
     * Ініціалізація форми
     */
    function init() {
        form = document.getElementById('contactForm');
        if (!form) return;
        
        nameInput = document.getElementById('name');
        emailInput = document.getElementById('email');
        phoneInput = document.getElementById('phone');
        messageTextarea = document.getElementById('message');
        agreementCheckbox = document.getElementById('agreement');
        charCountSpan = document.getElementById('charCount');
        successDiv = document.getElementById('formSuccess');
        
        // Додавання обробників подій для валідації в реальному часі
        if (nameInput) nameInput.addEventListener('input', () => { validateName(); saveDraft(); });
        if (emailInput) emailInput.addEventListener('input', () => { validateEmail(); saveDraft(); });
        if (phoneInput) phoneInput.addEventListener('input', () => { validatePhone(); saveDraft(); });
        if (messageTextarea) {
            messageTextarea.addEventListener('input', () => {
                validateMessage();
                updateCharCount();
                saveDraft();
            });
        }
        if (agreementCheckbox) agreementCheckbox.addEventListener('change', () => { validateAgreement(); saveDraft(); });
        
        // Додаткові поля для збереження чернетки
        const topicSelect = document.getElementById('topic');
        if (topicSelect) topicSelect.addEventListener('change', saveDraft);
        
        const radioButtons = document.querySelectorAll('input[name="contactWay"]');
        radioButtons.forEach(radio => radio.addEventListener('change', saveDraft));
        
        // Обробка відправлення
        form.addEventListener('submit', handleSubmit);
        
        // Кнопка очищення чернетки
        const clearBtn = document.getElementById('clearDraft');
        if (clearBtn) clearBtn.addEventListener('click', clearDraft);
        
        // Завантаження збереженої чернетки
        loadDraft();
        updateCharCount();
        
        console.log('📝 Контактна форма ініціалізована');
    }
    
    return { init };
})();

// Ініціалізація після завантаження DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ContactForm.init());
} else {
    ContactForm.init();
}