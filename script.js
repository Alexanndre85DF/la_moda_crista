// Versão: 20250103w - Texto PIX Simples
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
            ${product.description && product.description !== 'Sem descrição' ? `<p class="product-description">${product.description}</p>` : ''}
            ${product.colors && product.colors.length > 0 && product.colors[0] !== 'Não especificado' ? `<p class="product-colors"><strong>Cores:</strong> ${product.colors.join(', ')}</p>` : ''}
            <p class="price">R$ ${formatPrice(product.price)}</p>
            
            ${product.paymentSettings && product.paymentSettings.pixDiscount > 0 ? 
                `<p style="background: #e8f5e8; color: #4CAF50; padding: 8px; border-radius: 5px; text-align: center; margin: 10px 0; font-weight: bold;">
                    💳 PIX com ${product.paymentSettings.pixDiscount}% de desconto
                </p>` : ''}
            
            <div class="size-selection">
                <label for="size-${product.id}"><strong>Selecione o tamanho:</strong></label>
                <select id="size-${product.id}" class="size-dropdown" onchange="enableAddToCart('${product.id}')">
                    <option value="">Escolha um tamanho</option>
                    ${product.sizes.map(size => `<option value="${size}">${size}</option>`).join('')}
                </select>
            </div>
            
            <!-- Opções de pagamento -->
            <div class="installment-options">
                <label for="installment-${product.id}"><strong>Forma de pagamento:</strong></label>
                <select id="installment-${product.id}" class="installment-dropdown" onchange="updateInstallmentDisplay('${product.id}')">
                    ${generatePaymentOptionsHTML(product.price, product)}
                </select>
            </div>
            
            <button class="btn-add-cart" id="btn-${product.id}" onclick="addToCart('${product.id}')" disabled>
                Selecione um tamanho
            </button>
        </div>
    `;
    return card;
}

// Function to format price with comma instead of dot
function formatPrice(price) {
    return price.toFixed(2).replace('.', ',');
}

// Load payment methods from admin
function loadPaymentMethods() {
    const exportData = localStorage.getItem('laModaCristaExport');
    if (exportData) {
        const data = JSON.parse(exportData);
        return data.paymentMethods || [];
    }
    return [];
}

// Generate payment options based on configured methods
function generatePaymentOptions(productPrice) {
    const paymentMethods = loadPaymentMethods();
    let options = [];
    
    paymentMethods.forEach(method => {
        if (!method.active) return;
        
        if (method.type === 'pix') {
            const discountAmount = productPrice * (method.discount / 100);
            const finalPrice = productPrice - discountAmount;
            options.push({
                value: method.id,
                text: `${method.name} - R$ ${formatPrice(finalPrice)} (${method.discount}% desconto)`,
                type: 'pix',
                discount: method.discount,
                finalPrice: finalPrice
            });
        } else if (method.type === 'credit') {
            // À vista no cartão
            options.push({
                value: method.id + '_1',
                text: `${method.name} - R$ ${formatPrice(productPrice)}`,
                type: 'credit',
                installments: 1,
                finalPrice: productPrice
            });
            
            // Parcelado
            for (let i = 2; i <= method.installments; i++) {
                const installmentPrice = productPrice / i;
                options.push({
                    value: method.id + '_' + i,
                    text: `${i}x de R$ ${formatPrice(installmentPrice)} sem juros`,
                    type: 'credit',
                    installments: i,
                    finalPrice: productPrice
                });
            }
        } else if (method.type === 'debit') {
            options.push({
                value: method.id,
                text: `${method.name} - R$ ${formatPrice(productPrice)}`,
                type: 'debit',
                finalPrice: productPrice
            });
        }
    });
    
    return options;
}

// Generate HTML for payment options
function generatePaymentOptionsHTML(productPrice, product = null) {
    let options = [];
    
    // Se o produto tem configurações de pagamento, usar elas
    if (product && product.paymentSettings) {
        const settings = product.paymentSettings;
        
        // PIX com desconto
        if (settings.enablePixDiscount && settings.pixDiscount > 0) {
            const discountAmount = productPrice * (settings.pixDiscount / 100);
            const finalPrice = productPrice - discountAmount;
            options.push({
                value: 'pix_discount',
                text: `PIX - R$ ${formatPrice(finalPrice)} (${settings.pixDiscount}% desconto)`,
                type: 'pix',
                discount: settings.pixDiscount,
                finalPrice: finalPrice
            });
        }
        
        // Cartão à vista
        options.push({
            value: 'credit_1',
            text: `Cartão de Crédito - R$ ${formatPrice(productPrice)}`,
            type: 'credit',
            installments: 1,
            finalPrice: productPrice
        });
        
        // Parcelamento no cartão
        if (settings.enableCardInstallments && settings.maxInstallments > 1) {
            for (let i = 2; i <= settings.maxInstallments; i++) {
                const installmentPrice = productPrice / i;
                options.push({
                    value: `credit_${i}`,
                    text: `${i}x de R$ ${formatPrice(installmentPrice)} sem juros`,
                    type: 'credit',
                    installments: i,
                    finalPrice: productPrice
                });
            }
        }
    } else {
        // Fallback se não houver configurações específicas
        options = [
            {
                value: 'default_1',
                text: `À vista - R$ ${formatPrice(productPrice)}`,
                type: 'cash',
                finalPrice: productPrice
            },
            {
                value: 'default_2',
                text: `2x de R$ ${formatPrice(productPrice / 2)} sem juros`,
                type: 'credit',
                installments: 2,
                finalPrice: productPrice
            },
            {
                value: 'default_3',
                text: `3x de R$ ${formatPrice(productPrice / 3)} sem juros`,
                type: 'credit',
                installments: 3,
                finalPrice: productPrice
            },
            {
                value: 'default_4',
                text: `4x de R$ ${formatPrice(productPrice / 4)} sem juros`,
                type: 'credit',
                installments: 4,
                finalPrice: productPrice
            },
            {
                value: 'default_5',
                text: `5x de R$ ${formatPrice(productPrice / 5)} sem juros`,
                type: 'credit',
                installments: 5,
                finalPrice: productPrice
            },
            {
                value: 'default_6',
                text: `6x de R$ ${formatPrice(productPrice / 6)} sem juros`,
                type: 'credit',
                installments: 6,
                finalPrice: productPrice
            }
        ];
    }
    
    return options.map(option => 
        `<option value="${option.value}" data-type="${option.type}" data-final-price="${option.finalPrice}">${option.text}</option>`
    ).join('');
}

// Initialize the application
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM loaded, starting app...');
    
    try {
        // Splash screen logic - only on first visit
        const hasVisited = sessionStorage.getItem('hasVisited');
        const splashScreen = document.getElementById('splashScreen');
        
        if (!hasVisited && splashScreen) {
            // First visit - show splash screen
            setTimeout(() => {
                splashScreen.classList.add('fade-out');
                setTimeout(() => {
                    splashScreen.style.display = 'none';
                }, 500);
            }, 2000);
            sessionStorage.setItem('hasVisited', 'true');
        } else if (splashScreen) {
            // Already visited - hide immediately
            splashScreen.style.display = 'none';
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

// Enable add to cart button when size is selected
function enableAddToCart(productId) {
    const sizeSelect = document.getElementById(`size-${productId}`);
    const addButton = document.getElementById(`btn-${productId}`);
    
    if (sizeSelect.value) {
        addButton.disabled = false;
        addButton.textContent = 'Adicionar ao Carrinho';
        addButton.classList.remove('disabled');
    } else {
        addButton.disabled = true;
        addButton.textContent = 'Selecione um tamanho';
        addButton.classList.add('disabled');
    }
}

// Update installment display when option is selected
function updateInstallmentDisplay(productId) {
    const installmentSelect = document.getElementById(`installment-${productId}`);
    const selectedOption = installmentSelect.options[installmentSelect.selectedIndex];
    
    // You can add visual feedback here if needed
    console.log(`Parcelamento selecionado para produto ${productId}:`, selectedOption.text);
}

function addToCart(productId) {
    console.log('Adding to cart:', productId);
    
    const sizeSelect = document.getElementById(`size-${productId}`);
    const installmentSelect = document.getElementById(`installment-${productId}`);
    const selectedSize = sizeSelect.value;
    const selectedInstallment = installmentSelect.value;
    
    if (!selectedSize) {
        alert('Por favor, selecione um tamanho antes de adicionar ao carrinho.');
        return;
    }
    
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
        // Get payment info
        const selectedOption = installmentSelect.options[installmentSelect.selectedIndex];
        const installmentText = selectedOption.text;
        const paymentType = selectedOption.getAttribute('data-type') || 'default';
        const finalPrice = parseFloat(selectedOption.getAttribute('data-final-price')) || product.price;
        
        // Create cart item with all product information
        const cartItem = {
            id: product.id,
            name: product.name,
            description: product.description,
            price: finalPrice, // Use final price (with discount if applicable)
            originalPrice: product.price, // Keep original price for reference
            image: product.image,
            size: selectedSize,
            sizes: product.sizes,
            colors: product.colors,
            category: productCategory,
            quantity: 1,
            payment: {
                text: installmentText,
                type: paymentType,
                originalPrice: product.price,
                finalPrice: finalPrice
            }
        };
        
        // Check if item with same size already exists in cart
        const existingItemIndex = cart.findIndex(item => item.id === productId && item.size === selectedSize);
        
        if (existingItemIndex > -1) {
            // Increase quantity
            cart[existingItemIndex].quantity += 1;
        } else {
            // Add new item
            cart.push(cartItem);
        }
        
        saveCart(); // Save to localStorage
        updateCartDisplay();
        showAddToCartSuccess(product.name, selectedSize);
        console.log('Product added to cart:', product.name);
    }
}

// Show success message when item is added to cart
function showAddToCartSuccess(productName, size) {
    // Create success message element
    const successMsg = document.createElement('div');
    successMsg.className = 'add-to-cart-success';
    successMsg.innerHTML = `
        <div class="success-content">
            <i class="fas fa-check-circle"></i>
            <span>${productName} (Tamanho: ${size}) adicionado ao carrinho!</span>
        </div>
    `;
    
    // Add styles
    successMsg.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
        z-index: 1000;
        animation: slideInRight 0.3s ease-out;
        max-width: 300px;
    `;
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        .add-to-cart-success .success-content {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .add-to-cart-success .success-content i {
            font-size: 1.2rem;
        }
    `;
    document.head.appendChild(style);
    
    // Add to page
    document.body.appendChild(successMsg);
    
    // Remove after 3 seconds
    setTimeout(() => {
        successMsg.style.animation = 'slideInRight 0.3s ease-out reverse';
        setTimeout(() => {
            if (successMsg.parentNode) {
                successMsg.parentNode.removeChild(successMsg);
            }
        }, 300);
    }, 3000);
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
                            <strong>Tamanho selecionado:</strong> ${item.size}<br>
                            <strong>Cores:</strong> ${item.colors.join(', ')}<br>
                            <strong>Quantidade:</strong> ${item.quantity}<br>
                            <strong>Pagamento:</strong> ${item.payment ? item.payment.text : 'À vista'}
                        </p>
                        <p class="cart-item-price">R$ ${formatPrice(item.price)}</p>
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
        cartTotal.textContent = formatPrice(total);
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
        message += `📏 Tamanho selecionado: ${item.size}\n`;
        message += `🎨 Cores: ${item.colors.join(', ')}\n`;
        message += `🔢 Quantidade: ${item.quantity}\n`;
        message += `💳 Forma de pagamento: ${item.payment ? item.payment.text : 'À vista'}\n`;
        message += `💰 Preço: R$ ${formatPrice(item.price)}\n`;
        message += `💰 Subtotal: R$ ${formatPrice(item.price * item.quantity)}\n\n`;
        
        total += item.price * item.quantity;
    });
    
    message += `*TOTAL: R$ ${formatPrice(total)}*\n\n`;
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
        <img src="${imageSrc}" alt="" class="zoomed-image">
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
        transition: transform 0.3s ease;
        cursor: grab;
    `;
    
    // Variáveis para controle de zoom e pan
    let currentZoom = 1;
    const minZoom = 1;
    const maxZoom = 3;
    const zoomStep = 0.2;
    
    // Variáveis para controle de pan (arrastar)
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let translateX = 0;
    let translateY = 0;
    
    // Aplicar zoom inicial
    img.style.transform = `scale(${currentZoom}) translate(${translateX}px, ${translateY}px)`;
    img.style.cursor = 'grab';
    
    // Adicionar controles de zoom
    const zoomControls = document.createElement('div');
    zoomControls.style.cssText = `
        position: absolute;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 10px;
        z-index: 10003;
    `;
    
    const zoomOutBtn = document.createElement('button');
    zoomOutBtn.innerHTML = '<i class="fas fa-search-minus"></i>';
    zoomOutBtn.style.cssText = `
        background: rgba(0, 0, 0, 0.7);
        color: white;
        border: none;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1rem;
        transition: all 0.3s ease;
    `;
    
    const zoomInBtn = document.createElement('button');
    zoomInBtn.innerHTML = '<i class="fas fa-search-plus"></i>';
    zoomInBtn.style.cssText = `
        background: rgba(0, 0, 0, 0.7);
        color: white;
        border: none;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1rem;
        transition: all 0.3s ease;
    `;
    
    const resetBtn = document.createElement('button');
    resetBtn.innerHTML = '<i class="fas fa-expand-arrows-alt"></i>';
    resetBtn.style.cssText = `
        background: rgba(0, 0, 0, 0.7);
        color: white;
        border: none;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1rem;
        transition: all 0.3s ease;
    `;
    
    zoomControls.appendChild(zoomOutBtn);
    zoomControls.appendChild(resetBtn);
    zoomControls.appendChild(zoomInBtn);
    imageModal.appendChild(zoomControls);
    
    // Adicionar overlay para cobrir qualquer texto na imagem
    const textOverlay = document.createElement('div');
    textOverlay.style.cssText = `
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 150px;
        background: linear-gradient(transparent, rgba(0, 0, 0, 0.95));
        pointer-events: none;
        z-index: 10002;
    `;
    imageModal.appendChild(textOverlay);
    
    // Funções de zoom e pan
    function updateTransform() {
        img.style.transform = `scale(${currentZoom}) translate(${translateX}px, ${translateY}px)`;
    }
    
    function updateZoom() {
        updateTransform();
        
        // Atualizar estado dos botões
        zoomOutBtn.disabled = currentZoom <= minZoom;
        zoomInBtn.disabled = currentZoom >= maxZoom;
        
        // Aplicar estilo visual aos botões desabilitados
        zoomOutBtn.style.opacity = currentZoom <= minZoom ? '0.5' : '1';
        zoomInBtn.style.opacity = currentZoom >= maxZoom ? '0.5' : '1';
        
        // Resetar posição quando voltar ao zoom 1x
        if (currentZoom === 1) {
            translateX = 0;
            translateY = 0;
            updateTransform();
        }
    }
    
    function resetPan() {
        translateX = 0;
        translateY = 0;
        updateTransform();
    }
    
    function zoomIn() {
        if (currentZoom < maxZoom) {
            currentZoom = Math.min(currentZoom + zoomStep, maxZoom);
            updateZoom();
        }
    }
    
    function zoomOut() {
        if (currentZoom > minZoom) {
            currentZoom = Math.max(currentZoom - zoomStep, minZoom);
            updateZoom();
        }
    }
    
    function resetZoom() {
        currentZoom = 1;
        translateX = 0;
        translateY = 0;
        updateZoom();
    }
    
    // Event listeners para os botões
    zoomInBtn.addEventListener('click', zoomIn);
    zoomOutBtn.addEventListener('click', zoomOut);
    resetBtn.addEventListener('click', resetZoom);
    
    // Event listener para scroll do mouse
    imageModal.addEventListener('wheel', (e) => {
        e.preventDefault();
        if (e.deltaY < 0) {
            zoomIn();
        } else {
            zoomOut();
        }
    });
    
    // Event listeners para arrastar com mouse
    img.addEventListener('mousedown', (e) => {
        if (currentZoom > 1) {
            isDragging = true;
            startX = e.clientX - translateX;
            startY = e.clientY - translateY;
            img.style.cursor = 'grabbing';
            e.preventDefault();
        }
    });
    
    imageModal.addEventListener('mousemove', (e) => {
        if (isDragging && currentZoom > 1) {
            translateX = e.clientX - startX;
            translateY = e.clientY - startY;
            updateTransform();
            e.preventDefault();
        }
    });
    
    imageModal.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            img.style.cursor = currentZoom > 1 ? 'grab' : 'grab';
        }
    });
    
    imageModal.addEventListener('mouseleave', () => {
        if (isDragging) {
            isDragging = false;
            img.style.cursor = currentZoom > 1 ? 'grab' : 'grab';
        }
    });
    
    // Event listeners para touch (pinch zoom e pan)
    let initialDistance = 0;
    let initialZoom = 1;
    let touchStartX = 0;
    let touchStartY = 0;
    let isTouchDragging = false;
    
    imageModal.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1 && currentZoom > 1) {
            // Pan com um dedo
            isTouchDragging = true;
            touchStartX = e.touches[0].clientX - translateX;
            touchStartY = e.touches[0].clientY - translateY;
            e.preventDefault();
        } else if (e.touches.length === 2) {
            // Pinch zoom com dois dedos
            e.preventDefault();
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            initialDistance = Math.sqrt(
                Math.pow(touch2.clientX - touch1.clientX, 2) +
                Math.pow(touch2.clientY - touch1.clientY, 2)
            );
            initialZoom = currentZoom;
            isTouchDragging = false;
        }
    });
    
    imageModal.addEventListener('touchmove', (e) => {
        if (e.touches.length === 1 && isTouchDragging && currentZoom > 1) {
            // Pan com um dedo
            translateX = e.touches[0].clientX - touchStartX;
            translateY = e.touches[0].clientY - touchStartY;
            updateTransform();
            e.preventDefault();
        } else if (e.touches.length === 2) {
            // Pinch zoom com dois dedos
            e.preventDefault();
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const currentDistance = Math.sqrt(
                Math.pow(touch2.clientX - touch1.clientX, 2) +
                Math.pow(touch2.clientY - touch1.clientY, 2)
            );
            
            if (initialDistance > 0) {
                const scale = currentDistance / initialDistance;
                const newZoom = initialZoom * scale;
                currentZoom = Math.max(minZoom, Math.min(maxZoom, newZoom));
                updateZoom();
            }
        }
    });
    
    imageModal.addEventListener('touchend', () => {
        isTouchDragging = false;
    });
    
    // Hover effects para os botões
    [zoomInBtn, zoomOutBtn, resetBtn].forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            btn.style.background = 'rgba(0, 0, 0, 0.9)';
            btn.style.transform = 'scale(1.1)';
        });
        
        btn.addEventListener('mouseleave', () => {
            btn.style.background = 'rgba(0, 0, 0, 0.7)';
            btn.style.transform = 'scale(1)';
        });
    });
    
    // Inicializar estado dos botões
    updateZoom();
    
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
                        <p class="product-price">R$ ${formatPrice(product.price)}</p>
                        
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