// Global variables
// Load cart from localStorage or initialize empty
let cart = JSON.parse(localStorage.getItem('laModaCristaCart')) || [];
let products = {};

// Function to save cart to localStorage
function saveCart() {
    localStorage.setItem('laModaCristaCart', JSON.stringify(cart));
}

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
            <img src="${product.image}" alt="${product.name}" onclick="openImageZoom('${product.image}', '${product.name}')" style="cursor: pointer;">
        </div>
        <div class="product-card-info">
            <h3>${product.name}</h3>
            <p class="product-description">${product.description}</p>
            <p class="product-sizes"><strong>Tamanhos:</strong> ${product.sizes.join(', ')}</p>
            <p class="product-colors"><strong>Cores:</strong> ${product.colors.join(', ')}</p>
            <p class="price">R$ ${product.price.toFixed(2)}</p>
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
        
        // Initialize cart display
        updateCartDisplay();
        
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
        
        // Listen for admin updates
        window.addEventListener('storage', function(e) {
            if (e.key === 'laModaCristaProducts') {
                console.log('Admin products updated, reloading...');
                loadProducts().then(() => {
                    if (category) {
                        loadCategoryProducts(category);
                    }
                });
            }
        });
        
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

// Load products - FIREBASE + ADMIN + GOOGLE SHEETS
async function loadProducts() {
    console.log('Loading products...');
    
    try {
        // Primeiro: tentar carregar do Firebase
        // Aguardar o Firebase estar disponível
        let firebaseReady = false;
        let attempts = 0;
        const maxAttempts = 100; // 10 segundos máximo
        
        while (!firebaseReady && attempts < maxAttempts) {
            if (typeof window.firebase !== 'undefined') {
                firebaseReady = true;
                console.log('Firebase is ready!');
            } else {
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }
        }
        
        if (firebaseReady) {
            console.log('Trying to load from Firebase...');
            try {
                const { getDocs, collection } = window.firebase;
                const productsSnapshot = await getDocs(collection(window.firebase.db, 'products'));
                
                console.log('Firebase snapshot size:', productsSnapshot.size);
                console.log('Firebase snapshot empty?', productsSnapshot.empty);
                
                if (!productsSnapshot.empty) {
                    products = {};
                    productsSnapshot.forEach(doc => {
                        const productData = doc.data();
                        const category = productData.category || 'vestido';
                        
                        console.log(`Product: ${productData.name}, Category: ${category}`);
                        
                        if (!products[category]) {
                            products[category] = [];
                        }
                        
                        products[category].push({
                            id: doc.id,
                            name: productData.name,
                            price: productData.price,
                            image: productData.image,
                            description: productData.description,
                            sizes: productData.sizes || ['P', 'M', 'G'],
                            colors: productData.colors || ['Preto']
                        });
                    });
                    console.log('Products loaded from Firebase:', products);
                    return;
                } else {
                    console.log('No products found in Firebase');
                }
            } catch (firebaseError) {
                console.log('Firebase error:', firebaseError);
            }
        } else {
            console.log('Firebase not available after waiting');
        }
        
        // Segundo: tentar carregar do admin (localStorage)
        const adminProducts = localStorage.getItem('laModaCristaProducts');
        if (adminProducts) {
            products = JSON.parse(adminProducts);
            console.log('Products loaded from admin:', products);
            return;
        }
        
        // Terceiro: tentar Google Sheets
        console.log('No admin products found, trying Google Sheets...');
        console.log('WARNING: This will override Firebase data!');
        const spreadsheetUrl = 'https://docs.google.com/spreadsheets/d/1YF7pYBBAqYoUQQc9hzrAAWcWXKjWxKb59sHYcrNxox4/gviz/tq?tqx=out:json';
        
        const response = await fetch(spreadsheetUrl);
        if (response.ok) {
            const text = await response.text();
            const json = JSON.parse(text.substring(47, text.length - 2));
            
            if (json.table && json.table.rows) {
                products = processSheetData(json);
                console.log('Products loaded from Google Sheets:', products);
                return;
            }
        }
        
        // Fallback: produtos básicos
        console.log('Using fallback products...');
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
        
    } catch (error) {
        console.error('Error loading products:', error);
        products = {};
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
        
        if (row.c && row.c.length >= 6) {
            // Get product data (sem ID)
            const name = row.c[0]?.v || 'Produto';
            const price = parseFloat(row.c[1]?.v) || 0;
            const image = row.c[2]?.v || 'https://i.imgur.com/O7TC8aZ.png';
            const description = row.c[3]?.v || 'Descrição do produto';
            const sizes = row.c[4]?.v ? row.c[4].v.split(',').map(s => s.trim()) : ['P', 'M', 'G'];
            const colors = row.c[5]?.v ? row.c[5].v.split(',').map(c => c.trim()) : ['Preto'];
            
            // Determine category from product name
            let category = 'vestido'; // default
            const nameLower = name.toLowerCase();
            if (nameLower.includes('vestido')) category = 'vestido';
            else if (nameLower.includes('conjunto')) category = 'conjunto';
            else if (nameLower.includes('t-shirt') || nameLower.includes('camiseta') || nameLower.includes('tshirt')) category = 'tshirt';
            else if (nameLower.includes('macacão') || nameLower.includes('macacao')) category = 'macacao';
            else if (nameLower.includes('blusa')) category = 'blusa';
            else if (nameLower.includes('camisa')) category = 'camisa';
            else if (nameLower.includes('saia jeans') || nameLower.includes('saia-jeans')) category = 'saia-jeans';
            else if (nameLower.includes('saia social') || nameLower.includes('saia-social')) category = 'saia-social';
            else if (nameLower.includes('calça') || nameLower.includes('calca')) category = 'calca';
            else if (nameLower.includes('pijama')) category = 'pijama';
            
            // Create product object
            const product = {
                id: `P${i}`, // ID automático
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
    let productCategory = null;
    for (const category in products) {
        product = products[category].find(p => p.id === productId);
        if (product) {
            productCategory = category;
            break;
        }
    }
    
    if (product) {
        // Create cart item with all product information
        const cartItem = {
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            image: product.image,
            sizes: product.sizes,
            colors: product.colors,
            category: productCategory,
            quantity: 1
        };
        
        // Check if item already exists in cart
        const existingItemIndex = cart.findIndex(item => item.id === productId);
        
        if (existingItemIndex > -1) {
            // Increase quantity
            cart[existingItemIndex].quantity += 1;
        } else {
            // Add new item
            cart.push(cartItem);
        }
        
        saveCart(); // Save to localStorage
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
        
        if (cart.length === 0) {
            cartItems.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">Carrinho vazio</p>';
        } else {
            cart.forEach((item, index) => {
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.innerHTML = `
                    <img src="${item.image}" alt="${item.name}">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <p class="cart-item-description">${item.description}</p>
                        <p class="cart-item-details">
                            <strong>Categoria:</strong> ${item.category}<br>
                            <strong>Tamanhos:</strong> ${item.sizes.join(', ')}<br>
                            <strong>Cores:</strong> ${item.colors.join(', ')}<br>
                            <strong>Quantidade:</strong> ${item.quantity}
                        </p>
                        <p class="cart-item-price">R$ ${item.price.toFixed(2)}</p>
                    </div>
                    <button onclick="removeFromCart(${index})">×</button>
                `;
                cartItems.appendChild(cartItem);
            });
        }
    }
    
    // Calculate and update total
    const cartTotal = document.getElementById('cartTotal');
    if (cartTotal) {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = total.toFixed(2).replace('.', ',');
    }
}

function removeFromCart(index) {
    if (index >= 0 && index < cart.length) {
        cart.splice(index, 1);
        saveCart(); // Save to localStorage
        updateCartDisplay();
    }
}

function checkout() {
    if (cart.length === 0) {
        alert('Seu carrinho está vazio!');
        return;
    }
    
    let message = '🛍️ *PEDIDO - LA MODA CRISTÃ*\n\n';
    message += 'Olá! Gostaria de fazer um pedido:\n\n';
    
    let total = 0;
    cart.forEach((item, index) => {
        message += `*${index + 1}. ${item.name}*\n`;
        message += `📝 Descrição: ${item.description}\n`;
        message += `🏷️ Categoria: ${item.category}\n`;
        message += `📏 Tamanhos: ${item.sizes.join(', ')}\n`;
        message += `🎨 Cores: ${item.colors.join(', ')}\n`;
        message += `🔢 Quantidade: ${item.quantity}\n`;
        message += `💰 Preço: R$ ${item.price.toFixed(2)}\n`;
        message += `💰 Subtotal: R$ ${(item.price * item.quantity).toFixed(2)}\n\n`;
        
        total += item.price * item.quantity;
    });
    
    message += `*TOTAL: R$ ${total.toFixed(2)}*\n\n`;
    message += 'Por favor, confirme a disponibilidade e me informe sobre o pagamento e entrega.\n';
    message += 'Obrigada! 🙏';
    
    const whatsappUrl = `https://wa.me/5563992271991?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

// Product modal functions
// Image zoom modal functions
function openImageZoom(imageSrc, productName) {
    // Create image zoom modal
    const imageModal = document.createElement('div');
    imageModal.className = 'image-zoom-modal';
    imageModal.innerHTML = `
        <button class="close-image-zoom" onclick="closeImageZoom()">
            <i class="fas fa-times"></i>
        </button>
        <img src="${imageSrc}" alt="${productName}" class="zoomed-image">
        <div class="image-zoom-info">
            <h3>${productName}</h3>
        </div>
    `;
    
    document.body.appendChild(imageModal);
    
    // Add styles
    imageModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s ease;
    `;
    
    const closeBtn = imageModal.querySelector('.close-image-zoom');
    closeBtn.style.cssText = `
        position: absolute;
        top: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        border: none;
        width: 45px;
        height: 45px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.3rem;
        transition: all 0.3s ease;
        z-index: 10001;
    `;
    
    const img = imageModal.querySelector('.zoomed-image');
    img.style.cssText = `
        width: 100vw;
        height: 100vh;
        object-fit: contain;
        object-position: center;
    `;
    
    const info = imageModal.querySelector('.image-zoom-info');
    info.style.cssText = `
        position: absolute;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        color: white;
        text-align: center;
        background: rgba(0, 0, 0, 0.7);
        padding: 10px 20px;
        border-radius: 25px;
        backdrop-filter: blur(10px);
    `;
    
    info.querySelector('h3').style.cssText = `
        font-size: 1.5rem;
        margin: 0;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
    `;
    
    // Close on click outside
    imageModal.addEventListener('click', (e) => {
        if (e.target === imageModal) {
            closeImageZoom();
        }
    });
    
    // Add hover effect to close button
    closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.background = 'rgba(255, 68, 68, 0.8)';
        closeBtn.style.transform = 'scale(1.1)';
    });
    
    closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.background = 'rgba(0, 0, 0, 0.7)';
        closeBtn.style.transform = 'scale(1)';
    });
    
    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeImageZoom();
        }
    });
}

function closeImageZoom() {
    const modal = document.querySelector('.image-zoom-modal');
    if (modal) {
        modal.remove();
    }
}

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