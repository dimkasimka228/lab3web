/**
 * API-шар для роботи з REST API
 * Використовує json-server на порту 3000
 */

const API_BASE = 'http://localhost:3000';

const API = {
    /**
     * Отримання всіх курсів
     */
    async getAllCourses() {
        const response = await fetch(`${API_BASE}/courses`);
        if (!response.ok) throw new Error('Помилка завантаження курсів');
        return response.json();
    },
    
    /**
     * Отримання курсу за ID
     */
    async getCourseById(id) {
        const response = await fetch(`${API_BASE}/courses/${id}`);
        if (!response.ok) throw new Error('Курс не знайдено');
        return response.json();
    },
    
    /**
     * Створення нового курсу (POST)
     */
    async createCourse(course) {
        const response = await fetch(`${API_BASE}/courses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(course)
        });
        if (!response.ok) throw new Error('Помилка створення курсу');
        return response.json();
    },
    
    /**
     * Оновлення курсу (PUT)
     */
    async updateCourse(id, course) {
        const response = await fetch(`${API_BASE}/courses/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(course)
        });
        if (!response.ok) throw new Error('Помилка оновлення курсу');
        return response.json();
    },
    
    /**
     * Видалення курсу (DELETE)
     */
    async deleteCourse(id) {
        const response = await fetch(`${API_BASE}/courses/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Помилка видалення курсу');
        return true;
    }
};

// Експорт для використання в інших файлах
window.API = API;