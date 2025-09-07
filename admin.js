// Painel Administrativo - La Moda Cristã
let products = {};
let editingProduct = null;

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
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

// Configurar event listeners
function setupEventListeners() {
    const form = document.getElementById('productForm');
    form.addEventListener('submit', handleFormSubmit);
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
    }
}

// Lidar com envio do formulário
function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = {
        id: document.getElementById('productId').value.trim(),
        name: document.getElementById('productName').value.trim(),
        price: parseFloat(document.getElementById('productPrice').value),
        image: document.getElementById('productImage').value.trim(),
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
        // Preencher formulário
        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productImage').value = product.image;
        document.getElementById('productDescription').value = product.description;
        document.getElementById('productSizes').value = product.sizes.join(', ');
        document.getElementById('productColors').value = product.colors.join(', ');
        document.getElementById('productCategory').value = product.category || '';
        
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
        lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem('laModaCristaExport', JSON.stringify(exportData));
    showMessage('Produtos sincronizados com o site principal!', 'success');
}
