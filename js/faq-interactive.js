// FAQ Interactive Script for VOCALIA
// Handles accordion functionality, search, and category filtering

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const faqItems = document.querySelectorAll('.faq-item');
    const categoryCards = document.querySelectorAll('.category-card');
    const noResults = document.getElementById('noResults');
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.querySelector('.nav-links');
    const languageBtn = document.getElementById('languageBtn');
    const languageDropdown = document.getElementById('languageDropdown');

    let currentCategory = 'all';

    // ===== ACCORDION FUNCTIONALITY =====
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            // Close all other items
            if (!item.classList.contains('active')) {
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                    }
                });
            }
            
            // Toggle current item
            item.classList.toggle('active');
        });
    });

    // ===== SEARCH FUNCTIONALITY =====
    searchInput?.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        filterFAQ(searchTerm, currentCategory);
    });

    // ===== CATEGORY FILTERING =====
    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            // Update active category
            categoryCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            
            // Get selected category
            currentCategory = card.getAttribute('data-category');
            
            // Filter FAQ
            const searchTerm = searchInput?.value.toLowerCase().trim() || '';
            filterFAQ(searchTerm, currentCategory);
        });
    });

    // ===== FILTER FAQ ITEMS =====
    function filterFAQ(searchTerm, category) {
        let visibleCount = 0;

        faqItems.forEach(item => {
            const questionText = item.querySelector('.faq-question-text').textContent.toLowerCase();
            const answerText = item.querySelector('.faq-answer-content').textContent.toLowerCase();
            const itemCategory = item.getAttribute('data-category');
            
            // Check if item matches search and category
            const matchesSearch = searchTerm === '' || 
                                questionText.includes(searchTerm) || 
                                answerText.includes(searchTerm);
            const matchesCategory = category === 'all' || itemCategory === category;
            
            // Show/hide item
            if (matchesSearch && matchesCategory) {
                item.classList.remove('hidden');
                visibleCount++;
            } else {
                item.classList.add('hidden');
                item.classList.remove('active'); // Close if hidden
            }
        });

        // Show/hide no results message
        if (noResults) {
            noResults.style.display = visibleCount === 0 ? 'block' : 'none';
        }

        // Update category count
        updateCategoryCounts();
    }

    // ===== UPDATE CATEGORY COUNTS =====
    function updateCategoryCounts() {
        categoryCards.forEach(card => {
            const category = card.getAttribute('data-category');
            const countElement = card.querySelector('.category-count');
            
            if (category === 'all') {
                const totalVisible = Array.from(faqItems).filter(item => 
                    !item.classList.contains('hidden')
                ).length;
                countElement.textContent = `${totalVisible} question${totalVisible !== 1 ? 's' : ''}`;
            } else {
                const categoryVisible = Array.from(faqItems).filter(item => 
                    item.getAttribute('data-category') === category && 
                    !item.classList.contains('hidden')
                ).length;
                countElement.textContent = `${categoryVisible} question${categoryVisible !== 1 ? 's' : ''}`;
            }
        });
    }

    // ===== MOBILE MENU TOGGLE =====
    menuToggle?.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        navLinks?.classList.toggle('active');
    });

    // ===== LANGUAGE DROPDOWN =====
    languageBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        languageDropdown?.classList.toggle('active');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
        languageDropdown?.classList.remove('active');
    });

    languageDropdown?.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // ===== KEYBOARD ACCESSIBILITY =====
    // Allow Enter key to toggle FAQ items
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.setAttribute('tabindex', '0');
        question.setAttribute('role', 'button');
        question.setAttribute('aria-expanded', 'false');
        
        question.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                question.click();
                const isExpanded = item.classList.contains('active');
                question.setAttribute('aria-expanded', isExpanded.toString());
            }
        });
    });

    // ===== SEARCH SHORTCUT (CTRL/CMD + K) =====
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            searchInput?.focus();
        }
    });

    // ===== SMOOTH SCROLL TO FAQ FROM URL HASH =====
    if (window.location.hash) {
        const faqId = window.location.hash.substring(1);
        const targetFaq = document.getElementById(faqId);
        if (targetFaq) {
            setTimeout(() => {
                targetFaq.scrollIntoView({ behavior: 'smooth', block: 'center' });
                targetFaq.click(); // Open the FAQ item
            }, 300);
        }
    }

    // ===== INITIAL COUNT UPDATE =====
    updateCategoryCounts();

    // ===== SET ACTIVE CATEGORY ON PAGE LOAD =====
    const firstCategory = document.querySelector('.category-card[data-category="all"]');
    if (firstCategory) {
        firstCategory.classList.add('active');
    }
});

// ===== EXPORT FOR USE IN OTHER SCRIPTS =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { filterFAQ };
}