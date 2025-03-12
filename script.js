// Переключение темы
const toggleButton = document.getElementById('theme-toggle');
const body = document.body;
const icon = toggleButton.querySelector('.icon');

const savedTheme = localStorage.getItem('theme') || 'light';
body.setAttribute('data-theme', savedTheme);
icon.textContent = savedTheme === 'light' ? '☀️' : '🌙';

toggleButton.addEventListener('click', () => {
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    icon.textContent = newTheme === 'light' ? '☀️' : '🌙';
});

// Логика анализа SEO
const analyzeButton = document.getElementById('analyze-seo');
const urlInput = document.getElementById('competitor-url');
const headingsCheckbox = document.getElementById('headings');
const metaCheckbox = document.getElementById('meta');
const linksCheckbox = document.getElementById('links');
const seoStatusOutput = document.getElementById('seo-status');
const downloadCsvButton = document.getElementById('download-csv');

let seoData = {};

analyzeButton.addEventListener('click', () => {
    const url = urlInput.value.trim();

    if (!url || !isValidUrl(url)) {
        alert('Please enter a valid URL (e.g., https://example.com)');
        return;
    }

    seoStatusOutput.textContent = 'Analyzing SEO data...';
    downloadCsvButton.disabled = true;

    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;

    fetch(proxyUrl, {
        method: 'GET',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    })
    .then(response => {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return response.text();
    })
    .then(html => {
        seoData = analyzeSeo(html, url);
        seoStatusOutput.textContent = 'SEO analysis completed successfully!';
        downloadCsvButton.disabled = false;
    })
    .catch(err => {
        seoStatusOutput.textContent = `Error: Failed to fetch page. ${err.message}. Try another URL or check site availability.`;
        console.error('Fetch error:', err);
    });
});

// Анализ SEO данных
function analyzeSeo(html, baseUrl) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html || '', 'text/html');
    const result = {};
    const urlObj = new URL(baseUrl);
    const baseOrigin = urlObj.origin;

    if (headingsCheckbox.checked) {
        result.headings = {};
        ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach(tag => {
            const elements = doc.querySelectorAll(tag);
            result.headings[tag] = elements.length > 0 ? Array.from(elements).map(el => el.textContent.trim()) : ['None found'];
        });
    }

    if (metaCheckbox.checked) {
        result.meta = {
            title: doc.querySelector('title')?.textContent.trim() || 'No title',
            description: doc.querySelector('meta[name="description"]')?.getAttribute('content') || 'No description',
            keywords: doc.querySelector('meta[name="keywords"]')?.getAttribute('content') || 'No keywords'
        };
    }

    if (linksCheckbox.checked) {
        const links = doc.querySelectorAll('a[href]');
        const linkArray = Array.from(links);
        result.links = {
            total: linkArray.length,
            internal: linkArray.filter(a => {
                try {
                    const linkUrl = new URL(a.href, baseUrl);
                    return linkUrl.origin === baseOrigin;
                } catch {
                    return false; // Игнорируем невалидные ссылки
                }
            }).length,
            external: linkArray.filter(a => {
                try {
                    const linkUrl = new URL(a.href, baseUrl);
                    return linkUrl.origin !== baseOrigin && linkUrl.protocol.startsWith('http');
                } catch {
                    return false; // Игнорируем невалидные ссылки
                }
            }).length
        };
    }

    return result;
}

// Генерация CSV
function generateCsv(data) {
    let csv = 'Category,Details\n';
    
    if (data.headings) {
        for (const [tag, contents] of Object.entries(data.headings)) {
            csv += `${tag},${contents.join('; ')}\n`;
        }
    }
    
    if (data.meta) {
        csv += `Title,${data.meta.title}\n`;
        csv += `Description,${data.meta.description}\n`;
        csv += `Keywords,${data.meta.keywords}\n`;
    }
    
    if (data.links) {
        csv += `Total Links,${data.links.total}\n`;
        csv += `Internal Links,${data.links.internal}\n`;
        csv += `External Links,${data.links.external}\n`;
    }

    return csv;
}

// Скачивание файла с поддержкой UTF-8 + BOM
function downloadFile(content, fileName, contentType) {
    const bom = '\uFEFF'; // Добавляем BOM для UTF-8
    const blob = new Blob([bom + content], { type: contentType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Остальной код остаётся без изменений

downloadCsvButton.addEventListener('click', () => {
    if (Object.keys(seoData).length > 0) {
        const csv = generateCsv(seoData);
        downloadFile(csv, 'seo_analysis.csv', 'text/csv');
    }
});

// Проверка валидности URL
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// Копирование Bitcoin-адреса
const copyBtcButton = document.querySelector('.btc-address .copy-btn');
copyBtcButton.addEventListener('click', () => {
    const btcCode = document.getElementById('btc-code').textContent;
    navigator.clipboard.writeText(btcCode).then(() => {
        copyBtcButton.textContent = 'Copied!';
        setTimeout(() => {
            copyBtcButton.textContent = 'Copy';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
});
