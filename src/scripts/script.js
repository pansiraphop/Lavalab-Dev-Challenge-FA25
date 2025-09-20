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

    // Sample Data
    let materialsData = [
      { id: 1, name: 'Gildan T-Shirt - Red / S', sku: 'GIL-TS-RED-S', stock: 13, required: 24 },
      { id: 2, name: 'Gildan T-Shirt - Red / M', sku: 'GIL-TS-RED-M', stock: 36, required: 30 },
      { id: 3, name: 'Gildan T-Shirt - Red / L', sku: 'GIL-TS-RED-L', stock: 21, required: 24 },
      { id: 4, name: 'Gildan Hoodie - Black / S', sku: 'GIL-HD-BLK-S', stock: 34, required: 24 },
      { id: 5, name: 'Gildan Hoodie - Black / M', sku: 'GIL-HD-BLK-M', stock: 27, required: 30 },
      { id: 6, name: 'Gildan Hoodie - Black / L', sku: 'GIL-HD-BLK-L', stock: 34, required: 24 },
      { id: 7, name: 'Gildan Polo - White / S', sku: 'GIL-PO-WHT-S', stock: 51, required: 24 },
      { id: 8, name: 'Gildan Polo - White / M', sku: 'GIL-PO-WHT-M', stock: 22, required: 30 },
      { id: 9, name: 'Gildan Polo - White / L', sku: 'GIL-PO-WHT-L', stock: 29, required: 24 },
      { id: 10, name: 'Gildan Blanket - Black', sku: 'GIL-BLKT-BLK', stock: 15, required: 18 },
    ];

    const inventoryList = document.querySelector('.inventory-list');

    // Render Function
    function render(itemsToRender = materialsData) {
        inventoryList.innerHTML = '';
        itemsToRender.forEach(item => {
            const isLowStock = item.stock < item.required ? 'low-stock' : '';
            const exceedsStock = item.required > item.stock ? 'exceeds-stock' : '';
            const skuHTML = item.sku ? `<div class="item-sku">${item.sku}</div>` : '';

            const itemHTML = `
                <div class="inventory-item ${isLowStock}" data-id="${item.id}">
                    <button class="remove-btn" title="Remove Material">&times;</button>
                    <div>
                        <div class="item-name">${item.name}</div>
                        ${skuHTML}
                    </div>
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
        const sku = document.getElementById('new-sku').value; // Get the new SKU value
        const stock = parseInt(document.getElementById('new-stock').value, 10);
        if (name.trim() === '' || isNaN(stock)) {
            alert('Please fill out all fields correctly.');
            return;
        }
        materialsData.push({ id: Date.now(), name, sku, stock, required: 0 }); // Add SKU to new object
        render();
        addNewModal.style.display = 'none';
        addNewForm.reset();
    });

    // Search Bar Function
    const searchInput = document.getElementById('search-input');
    function handleSearch(searchTerm) {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        const filteredData = materialsData.filter(item => item.name.toLowerCase().includes(lowerCaseSearchTerm));
        render(filteredData);
    }
    searchInput.addEventListener('input', (event) => { handleSearch(event.target.value); });

    const orderQueueBtn = document.getElementById('order-queue-btn');
    const orderQueueModal = document.getElementById('order-queue-modal');
    const closeOrderQueueBtn = orderQueueModal.querySelector('.close-btn');
    const orderQueueList = document.getElementById('order-queue-list');

    //Order Queue Panel

    function openOrderQueueModal() {
        const itemsToOrder = materialsData.filter(item => item.required > item.stock);
        itemsToOrder.sort((a, b) => (b.required - b.stock) - (a.required - a.stock));

        orderQueueList.innerHTML = '';
        if (itemsToOrder.length === 0) {
            orderQueueList.innerHTML = '<p class="no-orders-message">No items currently need to be reordered.</p>';
        } else {
            itemsToOrder.forEach(item => {
                const deficit = item.required - item.stock;
                const suggestedOrder = Math.ceil(deficit + 25); //Defict plus standard buffer stock of 25 units
                const itemHTML = `
                    <div class="order-queue-item" data-id="${item.id}" data-order-amount="${suggestedOrder}">
                        <span class="order-queue-name">${item.name}</span>
                        <span class="order-queue-details">Deficit: ${deficit}</span>
                        <div class="order-queue-suggestion">
                            <span>Order: ${suggestedOrder}</span>
                            <button class="eoq-calculator-btn" title="Calculate EOQ">⚙️</button>
                        </div>
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
        const target = event.target;
        const queueItem = target.closest('.order-queue-item');
        if (!queueItem) return;

        //Stock Order Fulfilled Button
        if (target.classList.contains('fulfilled-btn')) {
            const itemId = parseInt(queueItem.dataset.id, 10);
            const orderAmount = parseInt(queueItem.dataset.orderAmount, 10);
            const item = materialsData.find(d => d.id === itemId);
            if (item) {
                item.stock += orderAmount;
                item.required = 0;
            }
            const searchTerm = document.getElementById('search-input').value;
            handleSearch(searchTerm);
            openOrderQueueModal(); // Refresh the queue
        }

        // Economical Order Quantity (EoQ) Calculator Button
        if (target.classList.contains('eoq-calculator-btn')) {
            currentQueueItemForEoq = queueItem;
            eoqModal.style.display = 'flex';
        }
    });
    
    // EoQ Calculator 
    const eoqModal = document.getElementById('eoq-modal');
    const closeEoqModalBtn = eoqModal.querySelector('.close-btn');
    const eoqForm = document.getElementById('eoq-form');
    const eoqResultInput = document.getElementById('eoq-result');
    let currentQueueItemForEoq = null;

    function calculateEOQ() {
        const D = parseFloat(document.getElementById('monthly-demand').value);
        const S = parseFloat(document.getElementById('ordering-cost').value);
        const H = parseFloat(document.getElementById('holding-cost').value);
        if (D > 0 && S > 0 && H > 0) {
            const eoq = Math.round(Math.sqrt((2 * D * S) / H));
            eoqResultInput.value = eoq;
        } else {
            eoqResultInput.value = 0;
        }
    }
    // Input for calculation of EoQ
    ['monthly-demand', 'ordering-cost', 'holding-cost'].forEach(id => {
        document.getElementById(id).addEventListener('input', calculateEOQ);
    });
    
    //EoQ input into Order Queue
    eoqForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const newOrderAmount = parseInt(eoqResultInput.value, 10);
        if (currentQueueItemForEoq && !isNaN(newOrderAmount) && newOrderAmount > 0) {
            currentQueueItemForEoq.dataset.orderAmount = newOrderAmount;
            currentQueueItemForEoq.querySelector('.order-queue-suggestion span').textContent = `Order: ${newOrderAmount}`;
        }
        eoqModal.style.display = 'none';
        eoqForm.reset();
    });

    closeEoqModalBtn.addEventListener('click', () => { eoqModal.style.display = 'none'; });
    eoqModal.addEventListener('click', (event) => { if (event.target === eoqModal) eoqModal.style.display = 'none'; });

    render();
});