// Global variables
let cart = [];
let products = {};

// Function to load products for a specific category page
function loadCategoryProducts(category) {
    console.log('Loading products for category:', category);
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) {
        console.log('Products grid not found');
        return;
    }
    
    productsGrid.innerHTML = '';
    
    if (products[category] && products[category].length > 0) {
        console.log('Found products for', category, ':', products[category].length);
        products[category].forEach(product => {
            const productCard = createProductCard(product);
            productsGrid.appendChild(productCard);
        });
    } else {
        console.log('No products found for category:', category);
        productsGrid.innerHTML = '<p style="text-align: center; color: #8b5a7a; font-size: 1.2rem;">Nenhum produto encontrado nesta categoria.</p>';
    }
}

// Create product card
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
        <div class="product-image">
            <img src="${product.image}" alt="${product.name}" onclick="openProductModal('${product.id}')">
        </div>
        <div class="product-info">
            <h3>${product.name}</h3>
            <p class="product-price">R$ ${product.price.toFixed(2)}</p>
            <button class="btn-add-cart" onclick="addToCart('${product.id}')">Adicionar ao Carrinho</button>
        </div>
    `;
    return card;
}

// Initialize the application
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM loaded, starting app...');
    
    try {
        // Splash screen logic
        const hasVisited = sessionStorage.getItem('hasVisited');
        
        if (!hasVisited) {
            setTimeout(() => {
                const splashScreen = document.getElementById('splashScreen');
                if (splashScreen) {
                    splashScreen.classList.add('fade-out');
                    setTimeout(() => {
                        splashScreen.style.display = 'none';
                    }, 500);
                }
            }, 3000);
            sessionStorage.setItem('hasVisited', 'true');
        } else {
            const splashScreen = document.getElementById('splashScreen');
            if (splashScreen) {
                splashScreen.style.display = 'none';
            }
        }

        // Initialize app safely
        console.log('Initializing app...');
        initializeApp();
        
        // Load products
        console.log('Loading products...');
        await loadProducts();
        
        // Check if this is a category page
        const category = document.body.getAttribute('data-category');
        console.log('Category attribute:', category);
        if (category) {
            console.log('Loading category products for:', category);
            loadCategoryProducts(category);
        }
        
        console.log('App initialization complete!');
    } catch (error) {
        console.error('Error during initialization:', error);
    }
});

// Safe initialization function
function initializeApp() {
    console.log('Initializing app safely...');
    
    // Cart functionality - only if elements exist
    const cartIcon = document.getElementById('cartIcon');
    if (cartIcon) {
        console.log('Adding cart icon listener');
        cartIcon.addEventListener('click', toggleCart);
    }

    const closeCart = document.getElementById('closeCart');
    if (closeCart) {
        console.log('Adding close cart listener');
        closeCart.addEventListener('click', closeCartSidebar);
    }

    const cartOverlay = document.getElementById('cartOverlay');
    if (cartOverlay) {
        console.log('Adding cart overlay listener');
        cartOverlay.addEventListener('click', closeCartSidebar);
    }

    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        console.log('Adding checkout listener');
        checkoutBtn.addEventListener('click', checkout);
    }

    // Product modal
    const productModal = document.getElementById('productModal');
    if (productModal) {
        productModal.addEventListener('click', function(e) {
            if (e.target === productModal) {
                closeProductModal();
            }
        });
    }
    
    console.log('App initialized successfully');
}

// Load products - GOOGLE SHEETS SIMPLES E FUNCIONAL
async function loadProducts() {
    console.log('Loading products from Google Sheets...');
    
    try {
        // URL da planilha - SIMPLES E DIRETO
        const spreadsheetUrl = 'https://docs.google.com/spreadsheets/d/1YF7pYBBAqYoUQQc9hzrAAWcWXKjWxKb59sHYcrNxox4/gviz/tq?tqx=out:json';
        
        console.log('Fetching from:', spreadsheetUrl);
        
        const response = await fetch(spreadsheetUrl);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const text = await response.text();
        console.log('Raw response length:', text.length);
        
        // Parse JSON response
        const json = JSON.parse(text.substring(47, text.length - 2));
        console.log('Parsed JSON:', json);
        
        if (json.table && json.table.rows) {
            products = processSheetData(json);
            console.log('Products processed successfully:', products);
        } else {
            throw new Error('No data found in spreadsheet');
        }
        
    } catch (error) {
        console.error('Error loading from Google Sheets:', error);
        console.log('Using fallback products...');
        
        // Fallback: produtos básicos
        products = {
            vestido: [
                {
                    id: 'VEST001',
                    name: 'Vestido Floral Elegante',
                    price: 89.90,
                    image: 'https://i.imgur.com/O7TC8aZ.png',
                    description: 'Vestido feminino com estampa floral delicada',
                    sizes: ['P', 'M', 'G', 'GG'],
                    colors: ['Rosa', 'Azul', 'Verde']
                }
            ]
        };
    }
}

// Process Google Sheets data - VERSÃO SIMPLIFICADA
function processSheetData(json) {
    const products = {};
    
    if (!json.table || !json.table.rows) {
        return products;
    }
    
    console.log('Processing rows:', json.table.rows.length);
    
    // Process each row (skip header)
    for (let i = 1; i < json.table.rows.length; i++) {
        const row = json.table.rows[i];
        console.log(`Processing row ${i}:`, row);
        
        if (row.c && row.c.length >= 7) {
            // Get product data
            const id = row.c[0]?.v || `P${i}`;
            const name = row.c[1]?.v || 'Produto';
            const price = parseFloat(row.c[2]?.v) || 0;
            const image = row.c[3]?.v || 'https://i.imgur.com/O7TC8aZ.png';
            const description = row.c[4]?.v || 'Descrição do produto';
            const sizes = row.c[5]?.v ? row.c[5].v.split(',').map(s => s.trim()) : ['P', 'M', 'G'];
            const colors = row.c[6]?.v ? row.c[6].v.split(',').map(c => c.trim()) : ['Preto'];
            
            // Determine category from ID
            let category = 'vestido'; // default
            if (id.startsWith('VEST')) category = 'vestido';
            else if (id.startsWith('CONJ')) category = 'conjunto';
            else if (id.startsWith('TSH')) category = 'tshirt';
            else if (id.startsWith('MAC')) category = 'macacao';
            else if (id.startsWith('BLU')) category = 'blusa';
            else if (id.startsWith('CAM')) category = 'camisa';
            else if (id.startsWith('SJ')) category = 'saia-jeans';
            else if (id.startsWith('SS')) category = 'saia-social';
            else if (id.startsWith('CAL')) category = 'calca';
            else if (id.startsWith('PIJ')) category = 'pijama';
            
            // Create product object
            const product = {
                id: id,
                name: name,
                price: price,
                image: image,
                description: description,
                sizes: sizes,
                colors: colors
            };
            
            // Add to category
            if (!products[category]) {
                products[category] = [];
            }
            products[category].push(product);
            
            console.log(`Added product ${id} to category ${category}`);
        }
    }
    
    console.log('Final products:', products);
    return products;
}

// Cart functions
function toggleCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    if (cartSidebar) {
        cartSidebar.classList.toggle('active');
    }
}

function closeCartSidebar() {
    const cartSidebar = document.getElementById('cartSidebar');
    if (cartSidebar) {
        cartSidebar.classList.remove('active');
    }
}

function addToCart(productId) {
    console.log('Adding to cart:', productId);
    
    // Find product in all categories
    let product = null;
    for (const category in products) {
        product = products[category].find(p => p.id === productId);
        if (product) break;
    }
    
    if (product) {
        cart.push(product);
        updateCartDisplay();
        console.log('Product added to cart:', product.name);
    }
}

function updateCartDisplay() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        cartCount.textContent = cart.length;
    }
    
    const cartItems = document.getElementById('cartItems');
    if (cartItems) {
        cartItems.innerHTML = '';
        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>R$ ${item.price.toFixed(2)}</p>
                </div>
                <button onclick="removeFromCart('${item.id}')">×</button>
            `;
            cartItems.appendChild(cartItem);
        });
    }
}

function removeFromCart(productId) {
    const index = cart.findIndex(item => item.id === productId);
    if (index > -1) {
        cart.splice(index, 1);
        updateCartDisplay();
    }
}

function checkout() {
    if (cart.length === 0) {
        alert('Seu carrinho está vazio!');
        return;
    }
    
    let message = '🛍️ *Nova Compra - La Moda Cristã*\n\n';
    let total = 0;
    
    cart.forEach(item => {
        message += `• ${item.name}\n`;
        message += `   Preço: R$ ${item.price.toFixed(2)}\n\n`;
        total += item.price;
    });
    
    message += `💰 *Total: R$ ${total.toFixed(2)}*\n\n`;
    message += 'Por favor, confirme os itens e finalize o pedido!';
    
    const whatsappUrl = `https://wa.me/5563992271991?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

// Product modal functions
function openProductModal(productId) {
    let product = null;
    for (const category in products) {
        product = products[category].find(p => p.id === productId);
        if (product) break;
    }
    
    if (product) {
        const modal = document.getElementById('productModal');
        const modalContent = document.getElementById('modalContent');
        
        if (modal && modalContent) {
            modalContent.innerHTML = `
                <div class="modal-header">
                    <h2>${product.name}</h2>
                    <button onclick="closeProductModal()" class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="product-image-large">
                        <img src="${product.image}" alt="${product.name}" id="productImage">
                    </div>
                    <div class="product-details">
                        <p class="product-description">${product.description}</p>
                        <p class="product-price">R$ ${product.price.toFixed(2)}</p>
                        
                        <div class="size-selection">
                            <h4>Tamanhos:</h4>
                            <div class="size-options">
                                ${product.sizes.map(size => `<button class="size-btn" onclick="selectSize('${size}')">${size}</button>`).join('')}
                            </div>
                        </div>
                        
                        <div class="color-selection">
                            <h4>Cores:</h4>
                            <div class="color-options">
                                ${product.colors.map(color => `<button class="color-btn" style="background-color: ${color.toLowerCase()}" onclick="selectColor('${color}')"></button>`).join('')}
                            </div>
                        </div>
                        
                        <button class="btn-add-cart-modal" onclick="addToCart('${product.id}'); closeProductModal();">
                            Adicionar ao Carrinho
                        </button>
                    </div>
                </div>
            `;
            
            modal.style.display = 'flex';
        }
    }
}

function closeProductModal() {
    const modal = document.getElementById('productModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function selectSize(size) {
    document.querySelectorAll('.size-btn').forEach(btn => btn.classList.remove('selected'));
    event.target.classList.add('selected');
}

function selectColor(color) {
    document.querySelectorAll('.color-btn').forEach(btn => btn.classList.remove('selected'));
    event.target.classList.add('selected');
}