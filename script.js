document.addEventListener('DOMContentLoaded', () => {
    // Dark mode toggle, persisted across visits
    const themeToggle = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' ||
        (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.body.classList.add('dark');
    }
    updateToggleIcon();

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark');
        localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
        updateToggleIcon();
    });

    function updateToggleIcon() {
        const dark = document.body.classList.contains('dark');
        themeToggle.textContent = dark ? '☀️' : '🌙';
        themeToggle.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    }

    // Live search over the app cards
    const searchInput = document.getElementById('app-search');
    const cards = document.querySelectorAll('.card');
    const noResults = document.getElementById('no-results');

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim().toLowerCase();
        let visible = 0;
        cards.forEach(card => {
            const match = card.textContent.toLowerCase().includes(query);
            card.hidden = !match;
            if (match) visible++;
        });
        noResults.hidden = visible > 0;
    });

    // Keep the footer year current
    document.getElementById('year').textContent = new Date().getFullYear();
});
