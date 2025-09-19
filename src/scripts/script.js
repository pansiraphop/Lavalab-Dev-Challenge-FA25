document.addEventListener('DOMContentLoaded', () => {

    const sidebar = document.querySelector('.sidebar');
    const toggleButton = document.getElementById('toggle-sidebar');
    
    if (toggleButton) {
        toggleButton.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
        });
    }

    const userProfileName = document.querySelector('.user-profile span');
    const userIcon = document.querySelector('.user-icon-placeholder');

    if (userProfileName && userIcon) {
        const name = userProfileName.textContent.trim();
        const nameParts = name.split(' ');
        let initials = '';
        if (nameParts.length > 1) {
            initials = nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0);
        } else if (nameParts.length === 1 && nameParts[0] !== '') {
            initials = nameParts[0].substring(0, 2);
        }
        userIcon.textContent = initials.toUpperCase();
    }

    // --- Data: Changed to 'let' to allow removing items ---
    let materialsData = [
      { id: 1, name: 'Gildan T-Shirt - Red / S', stock: 13, required: 24 },
      { id: 2, name: 'Gildan T-Shirt - Red / M', stock: 36, required: 30 },
      { id: 3, name: 'Gildan T-Shirt - Red / L', stock: 21, required: 24 },
      { id: 4, name: 'Gildan Hoodie - Black / S', stock: 34, required: 24 },
      { id: 5, name: 'Gildan Hoodie - Black / M', stock: 27, required: 30 },
      { id: 6, name: 'Gildan Hoodie - Black / L', stock: 34, required: 24 },
      { id: 7, name: 'Gildan Polo - White / S', stock: 51, required: 24 },
      { id: 8, name: 'Gildan Polo - White / M', stock: 22, required: 30 },
      { id: 9, name: 'Gildan Polo - White / L', stock: 29, required: 24 },
      { id: 10, name: 'Gildan Blanket - Black', stock: 15, required: 18 },
    ];

    const inventoryList = document.querySelector('.inventory-list');

    // --- Render Function: Updated to include a remove button ---
    function render(itemsToRender = materialsData) {
        inventoryList.innerHTML = '';
        itemsToRender.forEach(item => {
            const isLowStock = item.stock < item.required ? 'low-stock' : '';
            const exceedsStock = item.required > item.stock ? 'exceeds-stock' : '';
            const itemHTML = `
                <div class="inventory-item ${isLowStock}" data-id="${item.id}">
                    <button class="remove-btn" title="Remove Material">&times;</button>
                    <span class="item-name">${item.name}</span>
                    <div class="item-details">
                        <div class="item-stock">
                            <span class="stock-count">${item.stock}</span>
                            <span class="stock-required">IN STOCK</span>
                            <div class="stock-controls">
                                <button class="stock-btn stock-up" title="Increase stock">▲</button>
                                <button class="stock-btn stock-down" title="Decrease stock">▼</button>
                            </div>
                        </div>
                        <div class="quantity-controls">
                            <button class="quantity-btn minus-btn" title="Decrease orders">-</button>
                            <span class="order-quantity ${exceedsStock}" title="Orders">${item.required}</span>
                            <button class="quantity-btn plus-btn" title="Increase orders">+</button>
                        </div>
                    </div>
                </div>
            `;
            inventoryList.insertAdjacentHTML('beforeend', itemHTML);
        });
    }

    // --- Event Listener for all buttons inside the list ---
    inventoryList.addEventListener('click', (event) => {
        const target = event.target;
        const inventoryItem = target.closest('.inventory-item');
        if (!inventoryItem) return;

        const itemId = parseInt(inventoryItem.dataset.id, 10);
        let item = materialsData.find(d => d.id === itemId);
        if (!item) return;
        
        if (target.classList.contains('remove-btn')) {
            if (confirm(`Are you sure you want to remove "${item.name}"?`)) {
                materialsData = materialsData.filter(d => d.id !== itemId);
            }
        }
        
        item = materialsData.find(d => d.id === itemId);
        if (item) {
            if (target.classList.contains('plus-btn')) item.required++;
            if (target.classList.contains('minus-btn') && item.required > 0) item.required--;
            if (target.classList.contains('stock-up')) item.stock++;
            if (target.classList.contains('stock-down') && item.stock > 0) item.stock--;
        }

        const searchTerm = document.getElementById('search-input').value;
        handleSearch(searchTerm);
    });

    // --- "Add New" Modal Logic ---
    const addNewBtn = document.getElementById('add-new-btn');
    const addNewModal = document.getElementById('add-new-modal');
    const closeAddNewModalBtn = addNewModal.querySelector('.close-btn');
    const addNewForm = document.getElementById('add-new-form');

    addNewBtn.addEventListener('click', () => { addNewModal.style.display = 'flex'; });
    closeAddNewModalBtn.addEventListener('click', () => { addNewModal.style.display = 'none'; });
    addNewModal.addEventListener('click', (event) => { if (event.target === addNewModal) addNewModal.style.display = 'none'; });
    
    addNewForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const name = document.getElementById('new-name').value;
        const stock = parseInt(document.getElementById('new-stock').value, 10);
        
        if (name.trim() === '' || isNaN(stock)) {
            alert('Please fill out all fields correctly.');
            return;
        }

        materialsData.push({ id: Date.now(), name, stock, required: 0 });
        render();
        addNewModal.style.display = 'none';
        addNewForm.reset();
    });

    // --- Search Bar Logic ---
    const searchInput = document.getElementById('search-input');
    function handleSearch(searchTerm) {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        const filteredData = materialsData.filter(item => item.name.toLowerCase().includes(lowerCaseSearchTerm));
        render(filteredData);
    }
    searchInput.addEventListener('input', (event) => { handleSearch(event.target.value); });

    // --- Order Queue Logic ---
    const orderQueueBtn = document.getElementById('order-queue-btn');
    const orderQueueModal = document.getElementById('order-queue-modal');
    const closeOrderQueueBtn = orderQueueModal.querySelector('.close-btn');
    const orderQueueList = document.getElementById('order-queue-list');

    function openOrderQueueModal() {
        const itemsToOrder = materialsData.filter(item => item.required > item.stock);
        itemsToOrder.sort((a, b) => (b.required - b.stock) - (a.required - a.stock));

        orderQueueList.innerHTML = '';
        if (itemsToOrder.length === 0) {
            orderQueueList.innerHTML = '<p class="no-orders-message">No items currently need to be reordered.</p>';
        } else {
            itemsToOrder.forEach(item => {
                const deficit = item.required - item.stock;
                const suggestedOrder = Math.ceil(item.required * 1.5);
                const itemHTML = `
                    <div class="order-queue-item" data-id="${item.id}" data-order-amount="${suggestedOrder}">
                        <span class="order-queue-name">${item.name}</span>
                        <span class="order-queue-details">Deficit: ${deficit}</span>
                        <span class="order-queue-suggestion">Order: ${suggestedOrder}</span>
                        <button class="fulfilled-btn">Fulfilled</button>
                    </div>
                `;
                orderQueueList.insertAdjacentHTML('beforeend', itemHTML);
            });
        }
        orderQueueModal.style.display = 'flex';
    }

    orderQueueBtn.addEventListener('click', openOrderQueueModal);
    closeOrderQueueBtn.addEventListener('click', () => { orderQueueModal.style.display = 'none'; });
    orderQueueModal.addEventListener('click', (event) => { if (event.target === orderQueueModal) orderQueueModal.style.display = 'none'; });

    orderQueueList.addEventListener('click', (event) => {
        if (event.target.classList.contains('fulfilled-btn')) {
            const queueItem = event.target.closest('.order-queue-item');
            const itemId = parseInt(queueItem.dataset.id, 10);
            const orderAmount = parseInt(queueItem.dataset.orderAmount, 10);
            const item = materialsData.find(d => d.id === itemId);
            if (item) {
                item.stock += orderAmount;
                item.required = 0;
            }
            const searchTerm = document.getElementById('search-input').value;
            handleSearch(searchTerm);
            openOrderQueueModal();
        }
    });

    render();
});