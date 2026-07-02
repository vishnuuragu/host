// Read a JSON value from localStorage, falling back if missing or corrupted
function loadJSON(key, fallback) {
    try {
        return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch (e) {
        return fallback;
    }
}

// Escape user-provided text before inserting it into innerHTML
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, ch => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
    ));
}

document.addEventListener('DOMContentLoaded', function() {
    const descriptionInput = document.getElementById('description-input');
    const amountInput = document.getElementById('amount-input');
    const typeSelect = document.getElementById('type-select');
    const categorySelect = document.getElementById('category-select');
    const addTransactionBtn = document.getElementById('add-transaction-btn');
    const transactionsList = document.getElementById('transactions-list');
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    const totalIncomeEl = document.getElementById('total-income');
    const totalExpensesEl = document.getElementById('total-expenses');
    const balanceEl = document.getElementById('balance');

    // Load transactions from local storage
    let transactions = loadJSON('transactions', []);
    let currentFilter = 'all';

    // Update summary
    function updateSummary() {
        const income = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const expenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const balance = income - expenses;

        totalIncomeEl.textContent = `$${income.toFixed(2)}`;
        totalExpensesEl.textContent = `$${expenses.toFixed(2)}`;
        balanceEl.textContent = `$${balance.toFixed(2)}`;
        
        // Update balance color
        balanceEl.className = balance >= 0 ? 'positive' : 'negative';
    }

    // Render transactions
    function renderTransactions() {
        transactionsList.innerHTML = '';
        const filteredTransactions = transactions.filter(transaction => {
            if (currentFilter === 'all') return true;
            return transaction.type === currentFilter;
        });

        filteredTransactions
            .sort((a, b) => b.timestamp - a.timestamp)
            .forEach((transaction, index) => {
                const originalIndex = transactions.indexOf(transaction);
                const transactionItem = document.createElement('li');
                transactionItem.classList.add('transaction-item', transaction.type);

                transactionItem.innerHTML = `
                    <div class="transaction-info">
                        <div class="transaction-description">${escapeHTML(transaction.description)}</div>
                        <div class="transaction-details">
                            <span class="category">${transaction.category}</span>
                            <span class="date">${new Date(transaction.timestamp).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div class="transaction-amount ${transaction.type}">
                        ${transaction.type === 'income' ? '+' : '-'}$${transaction.amount.toFixed(2)}
                    </div>
                    <button class="remove-btn" data-index="${originalIndex}">×</button>
                `;

                transactionsList.appendChild(transactionItem);
            });
    }

    // Save transactions to local storage
    function saveTransactions() {
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }

    // Add new transaction
    function addTransaction() {
        const description = descriptionInput.value.trim();
        const amount = parseFloat(amountInput.value);
        const type = typeSelect.value;
        const category = categorySelect.value;

        if (description && amount > 0) {
            transactions.push({
                description,
                amount,
                type,
                category,
                timestamp: Date.now()
            });

            // Clear inputs
            descriptionInput.value = '';
            amountInput.value = '';

            saveTransactions();
            renderTransactions();
            updateSummary();
        }
    }

    // Remove transaction
    transactionsList.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-btn')) {
            const index = e.target.dataset.index;
            transactions.splice(index, 1);
            saveTransactions();
            renderTransactions();
            updateSummary();
        }
    });

    // Filter functionality
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTransactions();
        });
    });

    // Export transactions as a CSV download
    document.getElementById('export-csv-btn').addEventListener('click', () => {
        if (transactions.length === 0) {
            alert('No transactions to export yet.');
            return;
        }

        const escapeCSV = value => `"${String(value).replace(/"/g, '""')}"`;
        const rows = [
            ['Date', 'Description', 'Category', 'Type', 'Amount'],
            ...transactions
                .slice()
                .sort((a, b) => a.timestamp - b.timestamp)
                .map(t => [
                    new Date(t.timestamp).toLocaleDateString(),
                    t.description,
                    t.category,
                    t.type,
                    t.amount.toFixed(2)
                ])
        ];

        const csv = rows.map(row => row.map(escapeCSV).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'transactions.csv';
        link.click();
        URL.revokeObjectURL(link.href);
    });

    // Add transaction on button click
    addTransactionBtn.addEventListener('click', addTransaction);

    // Add transaction on pressing Enter key
    [descriptionInput, amountInput].forEach(input => {
        input.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                addTransaction();
            }
        });
    });

    // Initial render
    renderTransactions();
    updateSummary();
});