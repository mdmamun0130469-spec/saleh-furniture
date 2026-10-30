const STORAGE_KEYS = {
  catalog: 'salehCatalog',
  inventory: 'salehInventory',
  orders: 'salehOrders'
};

const defaultCatalog = [
  { id: 1, name: 'Modern Royal Bedroom Set', price: 4500, description: 'Premium wooden finish • King size', badge: 'Best Seller', icon: 'fa-bed' },
  { id: 2, name: 'Custom L-Shaped Wardrobe', price: 3200, description: 'Walnut finish • LED integrated', badge: 'Custom', icon: 'fa-door-closed' },
  { id: 3, name: 'Luxury Sofa Lounge', price: 2800, description: 'Cream comfort • Modern design', badge: 'New', icon: 'fa-couch' }
];

const defaultInventory = [
  { id: 1, name: 'Modern Royal Bedroom Set', stock: 10, price: 4500 },
  { id: 2, name: 'Custom L-Shaped Wardrobe', stock: 16, price: 3200 },
  { id: 3, name: 'Luxury Sofa Lounge', stock: 12, price: 2800 },
  { id: 4, name: 'Luxury Dining Table', stock: 7, price: 6100 },
  { id: 5, name: 'Custom Coffee Table', stock: 18, price: 2200 }
];

let catalog = JSON.parse(localStorage.getItem(STORAGE_KEYS.catalog) || JSON.stringify(defaultCatalog));
let inventory = JSON.parse(localStorage.getItem(STORAGE_KEYS.inventory) || JSON.stringify(defaultInventory));
let currentOrders = JSON.parse(localStorage.getItem(STORAGE_KEYS.orders) || '[]');
let adminMode = false;
let editingProductId = null;

function saveCatalog() {
  localStorage.setItem(STORAGE_KEYS.catalog, JSON.stringify(catalog));
}

function saveInventory() {
  localStorage.setItem(STORAGE_KEYS.inventory, JSON.stringify(inventory));
}

function saveOrders() {
  localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify(currentOrders));
}

function renderCatalog() {
  const grid = document.getElementById('catalogGrid');
  grid.innerHTML = '';

  catalog.forEach((product) => {
    const article = document.createElement('article');
    article.className = 'luxury-card rounded-[26px] overflow-hidden';

    article.innerHTML = `
      <div class="product-image h-56 flex items-center justify-center text-slate-500">
        <i class="fas ${product.icon} text-5xl text-amber-600"></i>
      </div>
      <div class="p-5">
        <div class="flex justify-between items-start gap-3">
          <div>
            <h4 class="font-black text-xl mb-1">${product.name}</h4>
            <p class="text-xs text-slate-500">${product.description}</p>
          </div>
          <span class="bg-amber-50 text-amber-700 px-2 py-1 rounded-full text-[10px] font-bold">${product.badge}</span>
        </div>

        <div class="mt-5 flex items-center justify-between">
          <span class="text-amber-600 font-black text-2xl">SAR ${Number(product.price).toLocaleString()}</span>
          <button onclick="addToOrder('${product.name}', ${product.price})" class="bg-slate-900 hover:bg-amber-600 transition text-white px-4 py-2 rounded-xl text-xs font-bold">অর্ডার করুন</button>
        </div>
      </div>
    `;

    grid.appendChild(article);
  });
}

function switchTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
  document.getElementById('tab-' + tabName).classList.remove('hidden');
  document.getElementById('tabBtn-' + tabName).classList.add('active');
}

function calculateConfigPrice() {
  const wood = document.getElementById('configWood').value;
  const size = document.getElementById('configSize').value;
  let base = 3000;

  if (wood === 'Dark Walnut') base += 450;
  if (wood === 'Glossy Cream') base += 300;
  if (wood === 'Natural Oak') base += 520;
  if (size === '250cm x 220cm') base += 700;

  document.getElementById('configPrice').textContent = 'SAR ' + base.toLocaleString();
  return base;
}

function addToOrder(itemName, price) {
  currentOrders.push({ name: itemName, price: Number(price) });
  saveOrders();
  updateOrderView();
  updateDashboard();
}

function updateOrderView() {
  const listContainer = document.getElementById('orderList');
  const totalContainer = document.getElementById('invoiceTotal');

  if (currentOrders.length === 0) {
    listContainer.innerHTML = '<p class="text-sm text-slate-500">কোনো নতুন অর্ডার যুক্ত করা হয়নি।</p>';
    totalContainer.classList.add('hidden');
    return;
  }

  listContainer.innerHTML = '';
  let total = 0;

  currentOrders.forEach((item, index) => {
    total += Number(item.price);

    const row = document.createElement('div');
    row.className = 'flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl';

    const left = document.createElement('div');
    left.className = 'text-sm font-semibold';
    left.textContent = item.name;

    const rightWrap = document.createElement('div');
    rightWrap.className = 'flex items-center gap-3';

    const priceLabel = document.createElement('span');
    priceLabel.className = 'text-amber-600 font-bold';
    priceLabel.textContent = 'SAR ' + Number(item.price).toLocaleString();

    if (adminMode) {
      const removeBtn = document.createElement('button');
      removeBtn.className = 'text-red-500 hover:text-red-700 text-xs px-2 py-1 bg-red-50 rounded';
      removeBtn.innerHTML = '<i class="fas fa-trash"></i>';
      removeBtn.onclick = () => removeOrder(index);
      rightWrap.appendChild(priceLabel);
      rightWrap.appendChild(removeBtn);
    } else {
      rightWrap.appendChild(priceLabel);
    }

    row.appendChild(left);
    row.appendChild(rightWrap);
    listContainer.appendChild(row);
  });

  totalContainer.classList.remove('hidden');
  document.getElementById('totalAmount').textContent = 'SAR ' + total.toLocaleString();
}

function removeOrder(index) {
  currentOrders.splice(index, 1);
  saveOrders();
  updateOrderView();
  updateDashboard();
}

function submitCustomConfig() {
  const wood = document.getElementById('configWood').value;
  const size = document.getElementById('configSize').value;
  const price = calculateConfigPrice();

  const itemName = `Custom Configuration (${wood} / ${size})`;
  addToOrder(itemName, price);

  const message = encodeURIComponent(
    `Hello Saleh Furniture,\nI would like a custom configuration:\n- Finish: ${wood}\n- Size: ${size}\n- Estimated Price: SAR ${price.toLocaleString()}\nPlease send me a quote on WhatsApp.`
  );

  window.open(`https://wa.me/966500000000?text=${message}`, '_blank');
}

function submitCheckout() {
  if (currentOrders.length === 0) {
    alert('Please add at least one product before checkout.');
    return;
  }

  const customerName = document.getElementById('customerName').value.trim();
  const phone = document.getElementById('customerPhone').value.trim();
  const city = document.getElementById('customerCity').value.trim();
  const notes = document.getElementById('customerNotes').value.trim();

  if (!customerName || !phone || !city) {
    alert('Please fill Name, Phone Number, and City before submitting the order.');
    return;
  }

  let body = `Hello Saleh Furniture,\n\nNew Order Request\nCustomer Name: ${customerName}\nPhone: ${phone}\nCity: ${city}\nNotes: ${notes || 'N/A'}\n\nItems:\n`;

  currentOrders.forEach((item, idx) => {
    body += `${idx + 1}. ${item.name} - SAR ${Number(item.price).toLocaleString()}\n`;
  });

  const total = currentOrders.reduce((sum, item) => sum + Number(item.price), 0);
  body += `\nTotal: SAR ${total.toLocaleString()}\n\nPlease confirm this order.`;

  window.open(`https://wa.me/966500000000?text=${encodeURIComponent(body)}`, '_blank');
}

function verifyPin() {
  const pin = document.getElementById('pinInput').value.trim();

  if (pin === '1234') {
    alert('সফলভাবে Admin হিসেবে লগইন হয়েছে!');
    document.getElementById('roleBadge').innerText = 'Admin Mode';
    adminMode = true;
    document.getElementById('adminLoginPanel').classList.add('hidden');
    document.getElementById('adminDashboard').classList.remove('hidden');
    switchTab('orders');
    updateOrderView();
    updateDashboard();
  } else if (pin === '0000') {
    alert('সফলভাবে Staff হিসেবে লগইন হয়েছে!');
    document.getElementById('roleBadge').innerText = 'Staff Mode';
    adminMode = false;
    document.getElementById('adminLoginPanel').classList.add('hidden');
    document.getElementById('adminDashboard').classList.remove('hidden');
    switchTab('orders');
    updateOrderView();
    updateDashboard();
  } else {
    alert('ভুল পিন দিয়েছেন! সঠিক পিন ব্যবহার করুন।');
  }
}

function renderInventoryTable() {
  const tbody = document.getElementById('inventoryTable');
  tbody.innerHTML = '';

  inventory.forEach(item => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td class="py-2 text-right">${item.name}</td>
      <td class="py-2 text-right">${item.stock}</td>
      <td class="py-2 text-right">SAR ${Number(item.price).toLocaleString()}</td>
      <td class="py-2 text-right">
        <div class="flex justify-end gap-2">
          <button onclick="editProduct(${item.id})" class="text-blue-600 hover:text-blue-800"><i class="fas fa-edit"></i></button>
          <button onclick="deleteProduct(${item.id})" class="text-red-500 hover:text-red-700"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function renderRecentOrders() {
  const wrap = document.getElementById('recentOrdersList');
  wrap.innerHTML = '';

  if (currentOrders.length === 0) {
    wrap.innerHTML = '<p class="text-sm text-slate-500">No recent orders.</p>';
    return;
  }

  currentOrders.slice().reverse().slice(0, 5).forEach(item => {
    const el = document.createElement('div');
    el.className = 'p-3 bg-slate-50 rounded-xl border border-slate-200';
    el.innerHTML = `
      <div class="flex justify-between items-center">
        <span class="font-semibold text-sm">${item.name}</span>
        <span class="text-amber-600 font-bold text-sm">SAR ${Number(item.price).toLocaleString()}</span>
      </div>
    `;
    wrap.appendChild(el);
  });
}

function updateDashboard() {
  const totalSales = currentOrders.reduce((sum, item) => sum + Number(item.price), 0);
  const ordersCount = currentOrders.length;

  document.getElementById('totalSalesValue').textContent = totalSales.toLocaleString();
  document.getElementById('ordersCountValue').textContent = ordersCount;
  document.getElementById('inventoryCountValue').textContent = inventory.reduce((sum, item) => sum + Number(item.stock), 0);

  renderInventoryTable();
  renderRecentOrders();
}

function showAddProductModal() {
  editingProductId = null;
  document.getElementById('modalProductName').value = '';
  document.getElementById('modalProductStock').value = '';
  document.getElementById('modalProductPrice').value = '';
  document.getElementById('productModal').classList.remove('hidden');
  document.getElementById('productModal').classList.add('flex');
}

function closeProductModal() {
  document.getElementById('productModal').classList.add('hidden');
  document.getElementById('productModal').classList.remove('flex');
}

function editProduct(id) {
  const product = inventory.find(item => item.id === id);
  if (!product) return;

  editingProductId = id;
  document.getElementById('modalProductName').value = product.name;
  document.getElementById('modalProductStock').value = product.stock;
  document.getElementById('modalProductPrice').value = product.price;
  document.getElementById('productModal').classList.remove('hidden');
  document.getElementById('productModal').classList.add('flex');
}

function saveProduct() {
  const name = document.getElementById('modalProductName').value.trim();
  const stock = Number(document.getElementById('modalProductStock').value);
  const price = Number(document.getElementById('modalProductPrice').value);

  if (!name || !Number.isFinite(stock) || !Number.isFinite(price)) {
    alert('Please fill valid product name, stock, and price.');
    return;
  }

  if (editingProductId === null) {
    inventory.push({
      id: Date.now(),
      name,
      stock,
      price
    });
  } else {
    const item = inventory.find(i => i.id === editingProductId);
    if (item) {
      item.name = name;
      item.stock = stock;
      item.price = price;
    }
  }

  saveInventory();
  updateDashboard();
  closeProductModal();
}

function deleteProduct(id) {
  inventory = inventory.filter(item => item.id !== id);
  saveInventory();
  updateDashboard();
}

function clearOrders() {
  currentOrders = [];
  saveOrders();
  updateOrderView();
  updateDashboard();
}

document.addEventListener('DOMContentLoaded', () => {
  renderCatalog();
  document.getElementById('configWood').addEventListener('change', calculateConfigPrice);
  document.getElementById('configSize').addEventListener('change', calculateConfigPrice);

  calculateConfigPrice();
  updateOrderView();
  updateDashboard();
});