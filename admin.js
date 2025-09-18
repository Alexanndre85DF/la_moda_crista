// Painel Administrativo - La Moda Cristã
let products = {};
let editingProduct = null;
let paymentMethods = [];
let editingPayment = null;
let uploadedImageData = null; // Para armazenar dados da imagem uploadada

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    loadPaymentMethods();
    updateStats();
    setupEventListeners();
});

// Carregar produtos do localStorage
function loadProducts() {
    const savedProducts = localStorage.getItem('laModaCristaProducts');
    if (savedProducts) {
        products = JSON.parse(savedProducts);
        console.log('Produtos carregados:', products);
    } else {
        // Produtos padrão se não houver dados salvos
        products = {
            vestido: [
                {
                    id: 'VEST001',
                    name: 'Vestido Floral Elegante',
                    price: 89.90,
                    image: 'https://i.imgur.com/O7TC8aZ.png',
                    description: 'Vestido feminino com estampa floral delicada, perfeito para ocasiões especiais',
                    sizes: ['P', 'M', 'G', 'GG'],
                    colors: ['Rosa', 'Azul', 'Verde']
                }
            ]
        };
        saveProducts();
    }
    displayProducts();
}

// Salvar produtos no localStorage
function saveProducts() {
    localStorage.setItem('laModaCristaProducts', JSON.stringify(products));
    console.log('Produtos salvos:', products);
}

// Carregar formas de pagamento do localStorage
function loadPaymentMethods() {
    const savedMethods = localStorage.getItem('laModaCristaPaymentMethods');
    if (savedMethods) {
        paymentMethods = JSON.parse(savedMethods);
    } else {
        // Formas de pagamento padrão
        paymentMethods = [
            {
                id: 'pix_default',
                name: 'PIX',
                type: 'pix',
                discount: 10,
                description: 'PIX com 10% de desconto',
                active: true
            },
            {
                id: 'credit_default',
                name: 'Cartão de Crédito',
                type: 'credit',
                installments: 6,
                description: 'Cartão de Crédito',
                active: true
            },
            {
                id: 'debit_default',
                name: 'Cartão de Débito',
                type: 'debit',
                description: 'Cartão de Débito',
                active: true
            }
        ];
        savePaymentMethods();
    }
    displayPaymentMethods();
}

// Salvar formas de pagamento no localStorage
function savePaymentMethods() {
    localStorage.setItem('laModaCristaPaymentMethods', JSON.stringify(paymentMethods));
}

// Configurar event listeners
function setupEventListeners() {
    const form = document.getElementById('productForm');
    form.addEventListener('submit', handleFormSubmit);
    
    const paymentForm = document.getElementById('paymentForm');
    paymentForm.addEventListener('submit', handlePaymentFormSubmit);
}

// Mostrar aba
function showTab(tabName) {
    // Esconder todas as abas
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.add('hidden'));
    
    // Mostrar aba selecionada
    document.getElementById(tabName).classList.remove('hidden');
    
    // Atualizar botões
    const tabButtons = document.querySelectorAll('.admin-tab');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Atualizar conteúdo se necessário
    if (tabName === 'manage-products') {
        displayProducts();
    } else if (tabName === 'dashboard') {
        updateStats();
    } else if (tabName === 'payment-methods') {
        displayPaymentMethods();
    }
}

// Lidar com envio do formulário
function handleFormSubmit(e) {
    e.preventDefault();
    
    // Validar imagem primeiro
    if (!validateImage()) {
        return;
    }
    
    const formData = {
        id: document.getElementById('productId').value.trim(),
        name: document.getElementById('productName').value.trim(),
        price: parseFloat(document.getElementById('productPrice').value),
        image: getImageUrl(), // Usar nova função para obter URL da imagem
        description: document.getElementById('productDescription').value.trim(),
        sizes: document.getElementById('productSizes').value.split(',').map(s => s.trim()),
        colors: document.getElementById('productColors').value.split(',').map(c => c.trim()),
        category: document.getElementById('productCategory').value
    };
    
    // Validar dados
    if (!formData.id || !formData.name || !formData.price || !formData.image || !formData.description || !formData.category) {
        showMessage('Por favor, preencha todos os campos obrigatórios!', 'error');
        return;
    }
    
    // Verificar se ID já existe (exceto se estiver editando)
    if (!editingProduct && productExists(formData.id)) {
        showMessage('Este ID já existe! Escolha outro ID.', 'error');
        return;
    }
    
    // Adicionar ou editar produto
    if (editingProduct) {
        updateProduct(editingProduct.id, formData);
        showMessage('Produto atualizado com sucesso!', 'success');
    } else {
        addProduct(formData);
        showMessage('Produto adicionado com sucesso!', 'success');
    }
    
    // Limpar formulário
    clearForm();
    editingProduct = null;
    
    // Atualizar exibição
    displayProducts();
    updateStats();
}

// Verificar se produto existe
function productExists(id) {
    for (const category in products) {
        if (products[category].some(p => p.id === id)) {
            return true;
        }
    }
    return false;
}

// Adicionar produto
function addProduct(productData) {
    if (!products[productData.category]) {
        products[productData.category] = [];
    }
    
    products[productData.category].push(productData);
    saveProducts();
}

// Atualizar produto
function updateProduct(oldId, newData) {
    // Remover produto antigo
    removeProduct(oldId);
    
    // Adicionar produto atualizado
    addProduct(newData);
}

// Remover produto
function removeProduct(id) {
    for (const category in products) {
        const index = products[category].findIndex(p => p.id === id);
        if (index !== -1) {
            products[category].splice(index, 1);
            break;
        }
    }
    saveProducts();
}

// Exibir produtos
function displayProducts() {
    const container = document.getElementById('productsList');
    container.innerHTML = '';
    
    let totalProducts = 0;
    
    for (const category in products) {
        if (products[category].length > 0) {
            const categoryDiv = document.createElement('div');
            categoryDiv.innerHTML = `<h3 style="color: #e91e63; margin: 30px 0 15px 0; text-transform: capitalize;">${category.replace('-', ' ')} (${products[category].length} produtos)</h3>`;
            container.appendChild(categoryDiv);
            
            const grid = document.createElement('div');
            grid.className = 'products-grid';
            
            products[category].forEach(product => {
                const productCard = createProductCard(product);
                grid.appendChild(productCard);
                totalProducts++;
            });
            
            container.appendChild(grid);
        }
    }
    
    if (totalProducts === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; font-size: 1.2rem;">Nenhum produto cadastrado ainda.</p>';
    }
}

// Criar card do produto
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card-admin';
    
    card.innerHTML = `
        <div class="product-image-admin">
            <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/300x200?text=Imagem+Não+Encontrada'">
        </div>
        <div class="product-info-admin">
            <h3>${product.name}</h3>
            <p><strong>ID:</strong> ${product.id}</p>
            <p><strong>Categoria:</strong> ${product.category || 'N/A'}</p>
            <div class="product-price-admin">R$ ${product.price.toFixed(2)}</div>
            <p><strong>Descrição:</strong> ${product.description}</p>
            <p><strong>Tamanhos:</strong> ${product.sizes.join(', ')}</p>
            <p><strong>Cores:</strong> ${product.colors.join(', ')}</p>
        </div>
        <div class="product-actions">
            <button class="btn-edit" onclick="editProduct('${product.id}')">✏️ Editar</button>
            <button class="btn-delete" onclick="deleteProduct('${product.id}')">🗑️ Excluir</button>
        </div>
    `;
    
    return card;
}

// Editar produto
function editProduct(id) {
    // Encontrar produto
    let product = null;
    for (const category in products) {
        product = products[category].find(p => p.id === id);
        if (product) break;
    }
    
    if (product) {
        // Limpar campos de imagem primeiro
        removeImage();
        
        // Preencher formulário
        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productDescription').value = product.description;
        document.getElementById('productSizes').value = product.sizes.join(', ');
        document.getElementById('productColors').value = product.colors.join(', ');
        document.getElementById('productCategory').value = product.category || '';
        
        // Se a imagem for uma URL externa, mostrar no campo de URL
        if (product.image && !product.image.startsWith('data:')) {
            document.getElementById('productImageUrl').value = product.image;
        } else if (product.image && product.image.startsWith('data:')) {
            // Se for uma imagem base64, mostrar preview
            uploadedImageData = product.image;
            showImagePreview(product.image);
        }
        
        // Marcar como editando
        editingProduct = product;
        
        // Ir para aba de adicionar produto
        showTab('add-product');
        
        // Scroll para o topo
        window.scrollTo(0, 0);
    }
}

// Excluir produto
function deleteProduct(id) {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
        removeProduct(id);
        displayProducts();
        updateStats();
        showMessage('Produto excluído com sucesso!', 'success');
    }
}

// Limpar formulário
function clearForm() {
    document.getElementById('productForm').reset();
    removeImage(); // Limpar também os campos de imagem
}

// Mostrar mensagem
function showMessage(text, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.innerHTML = `<div class="${type}-message">${text}</div>`;
    
    // Remover mensagem após 3 segundos
    setTimeout(() => {
        messageDiv.innerHTML = '';
    }, 3000);
}

// Atualizar estatísticas
function updateStats() {
    let totalProducts = 0;
    let totalCategories = 0;
    let totalPrice = 0;
    
    for (const category in products) {
        if (products[category].length > 0) {
            totalCategories++;
            totalProducts += products[category].length;
            
            products[category].forEach(product => {
                totalPrice += product.price;
            });
        }
    }
    
    document.getElementById('total-products').textContent = totalProducts;
    document.getElementById('total-categories').textContent = totalCategories;
    document.getElementById('avg-price').textContent = totalProducts > 0 ? `R$ ${(totalPrice / totalProducts).toFixed(2)}` : 'R$ 0';
}

// Exportar produtos para o site principal
function exportProducts() {
    // Esta função será chamada pelo site principal para obter os produtos
    return products;
}

// Função para sincronizar com o site principal
function syncWithMainSite() {
    // Salvar produtos em um formato que o site principal possa acessar
    const exportData = {
        products: products,
        paymentMethods: paymentMethods,
        lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem('laModaCristaExport', JSON.stringify(exportData));
    showMessage('Produtos e formas de pagamento sincronizados com o site principal!', 'success');
}

// ========== SISTEMA DE FORMAS DE PAGAMENTO ==========

// Atualizar campos do formulário de pagamento baseado no tipo
function updatePaymentFields() {
    const type = document.getElementById('paymentType').value;
    const discountGroup = document.getElementById('discountGroup');
    const installmentsGroup = document.getElementById('installmentsGroup');
    
    // Esconder todos os grupos
    discountGroup.style.display = 'none';
    installmentsGroup.style.display = 'none';
    
    // Mostrar grupos baseado no tipo
    if (type === 'pix') {
        discountGroup.style.display = 'block';
        document.getElementById('paymentDiscount').required = true;
        document.getElementById('paymentInstallments').required = false;
    } else if (type === 'credit') {
        installmentsGroup.style.display = 'block';
        document.getElementById('paymentDiscount').required = false;
        document.getElementById('paymentInstallments').required = true;
    } else {
        document.getElementById('paymentDiscount').required = false;
        document.getElementById('paymentInstallments').required = false;
    }
}

// Lidar com envio do formulário de pagamento
function handlePaymentFormSubmit(e) {
    e.preventDefault();
    
    const formData = {
        id: 'payment_' + Date.now(),
        name: document.getElementById('paymentName').value.trim(),
        type: document.getElementById('paymentType').value,
        description: document.getElementById('paymentDescription').value.trim(),
        active: document.getElementById('paymentActive').checked
    };
    
    // Adicionar campos específicos baseado no tipo
    if (formData.type === 'pix') {
        formData.discount = parseFloat(document.getElementById('paymentDiscount').value);
        if (!formData.discount && formData.discount !== 0) {
            showPaymentMessage('Por favor, informe o desconto para PIX!', 'error');
            return;
        }
    } else if (formData.type === 'credit') {
        formData.installments = parseInt(document.getElementById('paymentInstallments').value);
        if (!formData.installments) {
            showPaymentMessage('Por favor, informe o número de parcelas!', 'error');
            return;
        }
    }
    
    // Validar dados obrigatórios
    if (!formData.name || !formData.type || !formData.description) {
        showPaymentMessage('Por favor, preencha todos os campos obrigatórios!', 'error');
        return;
    }
    
    // Adicionar ou editar forma de pagamento
    if (editingPayment) {
        updatePaymentMethod(editingPayment.id, formData);
        showPaymentMessage('Forma de pagamento atualizada com sucesso!', 'success');
    } else {
        addPaymentMethod(formData);
        showPaymentMessage('Forma de pagamento adicionada com sucesso!', 'success');
    }
    
    // Limpar formulário
    clearPaymentForm();
    editingPayment = null;
    
    // Atualizar exibição
    displayPaymentMethods();
}

// Adicionar forma de pagamento
function addPaymentMethod(paymentData) {
    paymentMethods.push(paymentData);
    savePaymentMethods();
}

// Atualizar forma de pagamento
function updatePaymentMethod(oldId, newData) {
    const index = paymentMethods.findIndex(p => p.id === oldId);
    if (index !== -1) {
        paymentMethods[index] = { ...newData, id: oldId };
        savePaymentMethods();
    }
}

// Remover forma de pagamento
function removePaymentMethod(id) {
    paymentMethods = paymentMethods.filter(p => p.id !== id);
    savePaymentMethods();
}

// Exibir formas de pagamento
function displayPaymentMethods() {
    const container = document.getElementById('paymentMethodsList');
    container.innerHTML = '';
    
    if (paymentMethods.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; font-size: 1.2rem;">Nenhuma forma de pagamento configurada ainda.</p>';
        return;
    }
    
    paymentMethods.forEach(payment => {
        const paymentCard = createPaymentCard(payment);
        container.appendChild(paymentCard);
    });
}

// Criar card da forma de pagamento
function createPaymentCard(payment) {
    const card = document.createElement('div');
    card.className = 'product-card-admin';
    
    let details = '';
    if (payment.type === 'pix') {
        details = `<strong>Desconto:</strong> ${payment.discount}%`;
    } else if (payment.type === 'credit') {
        details = `<strong>Parcelas:</strong> até ${payment.installments}x`;
    } else {
        details = '<strong>Tipo:</strong> À vista';
    }
    
    card.innerHTML = `
        <div class="product-info-admin">
            <h3>${payment.name}</h3>
            <p><strong>Tipo:</strong> ${payment.type.toUpperCase()}</p>
            <p>${details}</p>
            <p><strong>Descrição:</strong> ${payment.description}</p>
            <p><strong>Status:</strong> ${payment.active ? '✅ Ativo' : '❌ Inativo'}</p>
        </div>
        <div class="product-actions">
            <button class="btn-edit" onclick="editPaymentMethod('${payment.id}')">✏️ Editar</button>
            <button class="btn-delete" onclick="deletePaymentMethod('${payment.id}')">🗑️ Excluir</button>
        </div>
    `;
    
    return card;
}

// Editar forma de pagamento
function editPaymentMethod(id) {
    const payment = paymentMethods.find(p => p.id === id);
    if (payment) {
        // Preencher formulário
        document.getElementById('paymentName').value = payment.name;
        document.getElementById('paymentType').value = payment.type;
        document.getElementById('paymentDescription').value = payment.description;
        document.getElementById('paymentActive').checked = payment.active;
        
        // Atualizar campos específicos
        updatePaymentFields();
        
        if (payment.discount !== undefined) {
            document.getElementById('paymentDiscount').value = payment.discount;
        }
        if (payment.installments !== undefined) {
            document.getElementById('paymentInstallments').value = payment.installments;
        }
        
        // Marcar como editando
        editingPayment = payment;
        
        // Scroll para o topo
        window.scrollTo(0, 0);
    }
}

// Excluir forma de pagamento
function deletePaymentMethod(id) {
    if (confirm('Tem certeza que deseja excluir esta forma de pagamento?')) {
        removePaymentMethod(id);
        displayPaymentMethods();
        showPaymentMessage('Forma de pagamento excluída com sucesso!', 'success');
    }
}

// Limpar formulário de pagamento
function clearPaymentForm() {
    document.getElementById('paymentForm').reset();
    document.getElementById('discountGroup').style.display = 'none';
    document.getElementById('installmentsGroup').style.display = 'none';
}

// Mostrar mensagem de pagamento
function showPaymentMessage(text, type) {
    const messageDiv = document.getElementById('paymentMessage');
    messageDiv.innerHTML = `<div class="${type}-message">${text}</div>`;
    
    // Remover mensagem após 3 segundos
    setTimeout(() => {
        messageDiv.innerHTML = '';
    }, 3000);
}

// ========== SISTEMA DE UPLOAD DE IMAGENS ==========

// Lidar com upload de imagem
function handleImageUpload(event) {
    const file = event.target.files[0];
    
    if (!file) {
        return;
    }
    
    // Validar tamanho do arquivo (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showMessage('Arquivo muito grande! Máximo permitido: 5MB', 'error');
        return;
    }
    
    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
        showMessage('Por favor, selecione apenas arquivos de imagem!', 'error');
        return;
    }
    
    // Converter para base64
    const reader = new FileReader();
    reader.onload = function(e) {
        uploadedImageData = e.target.result;
        showImagePreview(e.target.result);
        showMessage('Imagem carregada com sucesso!', 'success');
    };
    reader.onerror = function() {
        showMessage('Erro ao carregar a imagem!', 'error');
    };
    reader.readAsDataURL(file);
}

// Mostrar preview da imagem
function showImagePreview(imageData) {
    const previewContainer = document.getElementById('imagePreviewContainer');
    const previewImage = document.getElementById('imagePreview');
    
    previewImage.src = imageData;
    previewContainer.style.display = 'block';
    
    // Limpar campo de URL se houver imagem uploadada
    document.getElementById('productImageUrl').value = '';
}

// Remover imagem selecionada
function removeImage() {
    uploadedImageData = null;
    document.getElementById('productImageFile').value = '';
    document.getElementById('imagePreviewContainer').style.display = 'none';
    document.getElementById('productImageUrl').value = '';
}

// Obter URL da imagem (uploadada ou URL externa)
function getImageUrl() {
    // Priorizar imagem uploadada
    if (uploadedImageData) {
        return uploadedImageData;
    }
    
    // Se não houver imagem uploadada, usar URL externa
    const urlInput = document.getElementById('productImageUrl');
    return urlInput.value.trim();
}

// Validar se há imagem selecionada
function validateImage() {
    const imageUrl = getImageUrl();
    if (!imageUrl) {
        showMessage('Por favor, selecione uma imagem ou informe uma URL!', 'error');
        return false;
    }
    return true;
}
