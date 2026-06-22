const API_BASE = 'https://apbugall.org';
const TOKEN = '31bc371dadca00f9f9475a36967d00';

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');

    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') performSearch();
    });
});

async function apiRequest(endpoint, params = {}) {
    const url = new URL(API_BASE + endpoint);
    Object.keys(params).forEach(key => {
        if (params[key]) url.searchParams.append(key, params[key]);
    });

    const res = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${TOKEN}`,
            'Accept': 'application/json'
        }
    });

    if (!res.ok) throw new Error('API Error');
    return await res.json();
}

async function performSearch() {
    const query = document.getElementById('search-input').value.trim();
    if (!query) return alert('Введите название');

    document.getElementById('results').classList.remove('hidden');
    const grid = document.getElementById('results-grid');
    grid.innerHTML = '<p>Ищем...</p>';

    try {
        const data = await apiRequest('/v2/movies/name/list', { name: query });
        
        grid.innerHTML = '';
        if (!data.data || data.data.length === 0) {
            grid.innerHTML = `<p>Ничего не найдено по запросу "${query}"</p>`;
            return;
        }

        data.data.forEach(movie => {
            const card = document.createElement('div');
            card.className = 'movie-card';
            card.innerHTML = `
                <img src="${movie.poster || ''}" alt="${movie.name}">
                <div class="info">
                    <div class="title">${movie.name}</div>
                    <div class="year">${movie.year || ''}</div>
                </div>
            `;
            card.onclick = () => showDetail(movie.token);
            grid.appendChild(card);
        });
    } catch (e) {
        console.error(e);
        grid.innerHTML = '<p>Ошибка подключения к API</p>';
    }
}

async function showDetail(token) {
    document.getElementById('results').classList.add('hidden');
    const detail = document.getElementById('detail');
    detail.classList.remove('hidden');
    detail.innerHTML = '<p>Загрузка...</p>';

    try {
        const data = await apiRequest('/v2/movies/search', { token });
        const m = data.data;

        detail.innerHTML = `
            <button onclick="goBack()" style="margin:10px 0; padding:10px 20px;">← Назад</button>
            <div style="display:flex; gap:30px; flex-wrap:wrap;">
                <img src="${m.poster}" style="width:280px; border-radius:12px;">
                <div>
                    <h1>${m.name} (${m.year})</h1>
                    <p><strong>Рейтинг КП:</strong> ${m.rating?.kp || '—'}</p>
                    ${m.description ? `<p>${m.description}</p>` : ''}
                    ${m.iframe ? `<iframe src="${m.iframe}" style="width:100%; height:600px; border:none; margin-top:20px;" allowfullscreen></iframe>` : ''}
                </div>
            </div>
        `;
    } catch (e) {
        detail.innerHTML = '<p>Ошибка загрузки</p>';
    }
}

function goBack() {
    document.getElementById('detail').classList.add('hidden');
    document.getElementById('results').classList.remove('hidden');
}
// ... (весь предыдущий код script.js остаётся)

// Добавь в самый конец файла:
function goHome() {
    document.getElementById('results').classList.add('hidden');
    document.getElementById('detail').classList.add('hidden');
    document.getElementById('main-page').classList.remove('hidden');
    
    // Очищаем поле поиска при возврате на главную
    document.getElementById('search-input').value = '';
}