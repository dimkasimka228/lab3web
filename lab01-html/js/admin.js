/**
 * Адмін-панель з CRUD-операціями
 */

const AdminManager = (() => {
    let courses = [];
    let editMode = false;
    let editId = null;
    
    let tableBody = null;
    let form = null;
    let formTitle = null;
    let statusDiv = null;
    let cancelBtn = null;
    
    /**
     * Показ повідомлення про статус
     */
    function showStatus(message, isError = false) {
        if (statusDiv) {
            statusDiv.textContent = message;
            statusDiv.style.display = 'block';
            statusDiv.style.background = isError ? 'var(--accent-danger)' : 'var(--accent-success)';
            setTimeout(() => {
                statusDiv.style.display = 'none';
            }, 3000);
        }
    }
    
    /**
     * Завантаження курсів з API
     */
    async function loadCourses() {
        if (!tableBody) return;
        
        try {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">⏳ Завантаження...</td></tr>';
            
            // Перевірка доступності API
            const response = await fetch('http://localhost:3000/courses').catch(() => null);
            if (!response) {
                tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">⚠️ Сервер не запущено! Запустіть: json-server --watch db.json --port 3000</td></tr>';
                return;
            }
            
            courses = await API.getAllCourses();
            renderTable();
        } catch (error) {
            console.error(error);
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">❌ Помилка завантаження даних</td></tr>';
        }
    }
    
    /**
     * Рендеринг таблиці
     */
    function renderTable() {
        if (!tableBody) return;
        
        if (!courses || courses.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">📭 Немає курсів. Додайте перший!</td></tr>';
            return;
        }
        
        tableBody.innerHTML = courses.map(course => `
            <tr>
                <td>${course.id}</td>
                <td>${escapeHtml(course.title)}</td>
                <td>${course.category}</td>
                <td>$${course.price}</td>
                <td style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-secondary edit-course" data-id="${course.id}" style="padding: 0.25rem 0.75rem; font-size: 0.8rem;">✏️</button>
                    <button class="btn btn-secondary delete-course" data-id="${course.id}" style="padding: 0.25rem 0.75rem; font-size: 0.8rem; background: var(--accent-danger); border-color: var(--accent-danger);">🗑️</button>
                </td>
            </tr>
        `).join('');
        
        // Додавання обробників
        document.querySelectorAll('.edit-course').forEach(btn => {
            btn.addEventListener('click', () => editCourse(parseInt(btn.dataset.id)));
        });
        
        document.querySelectorAll('.delete-course').forEach(btn => {
            btn.addEventListener('click', () => deleteCourse(parseInt(btn.dataset.id)));
        });
    }
    
    /**
     * Захист від XSS
     */
    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }
    
    /**
     * Редагування курсу
     */
    async function editCourse(id) {
        const course = courses.find(c => c.id === id);
        if (!course) return;
        
        editMode = true;
        editId = id;
        
        if (formTitle) formTitle.textContent = '✏️ Редагувати курс';
        if (cancelBtn) cancelBtn.style.display = 'inline-block';
        
        document.getElementById('editId').value = id;
        document.getElementById('title').value = course.title;
        document.getElementById('category').value = course.category;
        document.getElementById('description').value = course.description;
        document.getElementById('price').value = course.price;
        document.getElementById('duration').value = course.duration || '';
        document.getElementById('level').value = course.level || 'Початковий';
        
        const submitBtn = document.getElementById('submitBtn');
        if (submitBtn) submitBtn.textContent = '💾 Оновити';
    }
    
    /**
     * Видалення курсу
     */
    async function deleteCourse(id) {
        if (confirm('Ви впевнені, що хочете видалити цей курс?')) {
            try {
                await API.deleteCourse(id);
                showStatus('✅ Курс видалено успішно!');
                await loadCourses();
                
                // Очищення форми, якщо редагували видалений курс
                if (editMode && editId === id) {
                    resetForm();
                }
            } catch (error) {
                showStatus('❌ Помилка видалення: ' + error.message, true);
            }
        }
    }
    
    /**
     * Скидання форми
     */
    function resetForm() {
        editMode = false;
        editId = null;
        
        if (form) form.reset();
        if (formTitle) formTitle.textContent = '➕ Додати курс';
        if (cancelBtn) cancelBtn.style.display = 'none';
        
        const submitBtn = document.getElementById('submitBtn');
        if (submitBtn) submitBtn.textContent = 'Додати';
        
        document.getElementById('editId').value = '';
    }
    
    /**
     * Обробка відправлення форми
     */
    async function handleSubmit(event) {
        event.preventDefault();
        
        const courseData = {
            title: document.getElementById('title').value.trim(),
            category: document.getElementById('category').value,
            description: document.getElementById('description').value.trim(),
            price: parseInt(document.getElementById('price').value),
            duration: document.getElementById('duration').value || '20 год',
            level: document.getElementById('level').value
        };
        
        // Валідація
        if (!courseData.title || !courseData.description || !courseData.price) {
            showStatus('❌ Будь ласка, заповніть обов\'язкові поля', true);
            return;
        }
        
        try {
            if (editMode && editId) {
                await API.updateCourse(editId, { ...courseData, id: editId });
                showStatus('✅ Курс оновлено успішно!');
            } else {
                await API.createCourse(courseData);
                showStatus('✅ Курс додано успішно!');
            }
            
            resetForm();
            await loadCourses();
        } catch (error) {
            showStatus('❌ Помилка: ' + error.message, true);
        }
    }
    
    /**
     * Ініціалізація адмін-панелі
     */
    function init() {
        tableBody = document.getElementById('adminTableBody');
        form = document.getElementById('adminForm');
        formTitle = document.getElementById('formTitle');
        statusDiv = document.getElementById('adminStatus');
        cancelBtn = document.getElementById('cancelEdit');
        
        if (!tableBody) return;
        
        if (form) form.addEventListener('submit', handleSubmit);
        if (cancelBtn) cancelBtn.addEventListener('click', resetForm);
        
        loadCourses();
    }
    
    return { init };
})();

// Ініціалізація
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AdminManager.init());
} else {
    AdminManager.init();
}