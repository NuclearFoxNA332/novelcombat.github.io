// Состояние игры
const game = {
    clicks: 0,
    clickPower: 1,
    autoClickers: 0,
    cps: 0,
    characters: {
        novel: { unlocked: true, selected: true },
        befridi: { unlocked: false, selected: false }
    },
    lastUpdate: Date.now()
};

// Элементы интерфейса
const counterEl = document.getElementById('counter');
const cpsEl = document.getElementById('cps');
const clickPowerEl = document.getElementById('clickPower');
const autoClickersEl = document.getElementById('autoClickers');
const characterImageEl = document.getElementById('characterImage');
const upgradeClickPowerBtn = document.getElementById('upgradeClickPower');
const upgradeAutoClickerBtn = document.getElementById('upgradeAutoClicker');
const themeToggleBtn = document.getElementById('themeToggle');

// Инициализация
function init() {
    loadGame();
    setupEventListeners();
    requestAnimationFrame(gameLoop);
    updateUI();
}

// Игровой цикл
function gameLoop(timestamp) {
    const deltaTime = (timestamp - game.lastUpdate) / 1000;
    game.lastUpdate = timestamp;
    
    if (game.autoClickers > 0) {
        game.clicks += game.autoClickers * deltaTime;
        game.cps = game.autoClickers;
        updateUI();
        saveGame();
    }
    
    requestAnimationFrame(gameLoop);
}

// Обработчики событий
function setupEventListeners() {
    // Клик по персонажу
    characterImageEl.addEventListener('click', () => {
        game.clicks += game.clickPower;
        updateUI();
        saveGame();
    });

    // Улучшение силы клика
    upgradeClickPowerBtn.addEventListener('click', () => {
        const cost = 50 * game.clickPower;
        if (game.clicks >= cost) {
            game.clicks -= cost;
            game.clickPower++;
            updateUI();
            saveGame();
        }
    });

    // Улучшение авто-кликера
    upgradeAutoClickerBtn.addEventListener('click', () => {
        const cost = 100 + (game.autoClickers * 50);
        if (game.clicks >= cost) {
            game.clicks -= cost;
            game.autoClickers++;
            updateUI();
            saveGame();
        }
    });

    // Переключение темы
    themeToggleBtn.addEventListener('click', toggleTheme);

    // Выбор персонажа
    document.querySelectorAll('.character-card').forEach(card => {
        card.addEventListener('click', () => {
            const character = card.dataset.character;
            
            // Если персонаж заблокирован
            if (!game.characters[character].unlocked) {
                const cost = parseInt(card.dataset.cost);
                if (game.clicks >= cost) {
                    game.clicks -= cost;
                    game.characters[character].unlocked = true;
                } else {
                    return;
                }
            }
            
            // Снимаем выделение со всех
            Object.keys(game.characters).forEach(char => {
                game.characters[char].selected = false;
            });
            
            // Выбираем текущего
            game.characters[character].selected = true;
            characterImageEl.src = `${character}.png`;
            
            updateUI();
            saveGame();
        });
    });
}

// Обновление интерфейса
function updateUI() {
    counterEl.textContent = Math.floor(game.clicks);
    cpsEl.textContent = game.cps.toFixed(1);
    clickPowerEl.textContent = game.clickPower;
    autoClickersEl.textContent = game.autoClickers;
    
    // Обновляем кнопки улучшений
    const clickPowerCost = 50 * game.clickPower;
    upgradeClickPowerBtn.textContent = `Buy (${clickPowerCost})`;
    upgradeClickPowerBtn.disabled = game.clicks < clickPowerCost;
    
    const autoClickerCost = 100 + (game.autoClickers * 50);
    upgradeAutoClickerBtn.textContent = `Buy (${autoClickerCost})`;
    upgradeAutoClickerBtn.disabled = game.clicks < autoClickerCost;
    
    // Обновляем персонажей
    document.querySelectorAll('.character-card').forEach(card => {
        const character = card.dataset.character;
        
        if (game.characters[character].unlocked) {
            card.innerHTML = `
                <img src="${character}.png" class="character-preview">
                <div class="character-name">${character.charAt(0).toUpperCase() + character.slice(1)}</div>
                <div class="character-status">${game.characters[character].selected ? 'Selected' : ''}</div>
            `;
            card.classList.toggle('active', game.characters[character].selected);
        } else {
            const cost = parseInt(card.dataset.cost);
            const btn = card.querySelector('.unlock-btn');
            btn.textContent = `${cost} clicks`;
            btn.disabled = game.clicks < cost;
        }
    });
}

// Переключение темы
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    themeToggleBtn.textContent = newTheme === 'light' ? '🌙 Dark' : '☀️ Light';
    localStorage.setItem('theme', newTheme);
}

// Сохранение игры
function saveGame() {
    localStorage.setItem('novelKombat', JSON.stringify({
        clicks: game.clicks,
        clickPower: game.clickPower,
        autoClickers: game.autoClickers,
        characters: game.characters
    }));
}

// Загрузка игры
function loadGame() {
    const savedGame = localStorage.getItem('novelKombat');
    if (savedGame) {
        const parsed = JSON.parse(savedGame);
        game.clicks = parsed.clicks || 0;
        game.clickPower = parsed.clickPower || 1;
        game.autoClickers = parsed.autoClickers || 0;
        
        if (parsed.characters) {
            Object.keys(parsed.characters).forEach(char => {
                if (game.characters[char]) {
                    game.characters[char].unlocked = parsed.characters[char].unlocked;
                    game.characters[char].selected = parsed.characters[char].selected;
                }
            });
        }
    }
    
    // Загрузка темы
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeToggleBtn.textContent = savedTheme === 'light' ? '🌙 Dark' : '☀️ Light';
    
    // Установка текущего персонажа
    const selectedChar = Object.keys(game.characters).find(
        char => game.characters[char].selected
    );
    if (selectedChar) {
        characterImageEl.src = `${selectedChar}.png`;
    }
}

// Запуск игры
document.addEventListener('DOMContentLoaded', init);