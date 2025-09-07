// Configuração para integração com planilha Excel/Google Sheets
// Este arquivo pode ser usado para carregar dados da planilha

const SPREADSHEET_CONFIG = {
    // URL da planilha Google Sheets (pública)
    // Substitua pelo link da sua planilha
    url: 'https://docs.google.com/spreadsheets/d/SEU_ID_DA_PLANILHA/edit#gid=0',
    
    // Configuração das abas da planilha
    sheets: {
        vestido: 'Vestidos',
        conjunto: 'Conjuntos', 
        blusa: 'Blusas',
        saia: 'Saias',
        calca: 'Calças',
        macacao: 'Macacões'
    },
    
    // Estrutura das colunas na planilha
    columns: {
        id: 'A',           // ID único do produto
        name: 'B',         // Nome do produto
        price: 'C',        // Preço
        image: 'D',        // URL da imagem
        description: 'E',  // Descrição
        sizes: 'F',        // Tamanhos disponíveis (separados por vírgula)
        colors: 'G'        // Cores disponíveis (separadas por vírgula)
    }
};

// Função para carregar dados da planilha
async function loadProductsFromSpreadsheet() {
    try {
        // Esta função seria implementada para carregar dados reais da planilha
        // Por enquanto, retorna os dados de exemplo
        console.log('Carregando produtos da planilha...');
        return products; // Retorna os dados de exemplo do script.js
    } catch (error) {
        console.error('Erro ao carregar produtos da planilha:', error);
        return {};
    }
}

// Função para converter dados da planilha para o formato do site
function convertSpreadsheetData(sheetData, category) {
    const products = [];
    
    sheetData.forEach(row => {
        if (row[SPREADSHEET_CONFIG.columns.name]) { // Se tem nome, é um produto válido
            const product = {
                id: row[SPREADSHEET_CONFIG.columns.id] || `${category}_${Date.now()}`,
                name: row[SPREADSHEET_CONFIG.columns.name],
                price: parseFloat(row[SPREADSHEET_CONFIG.columns.price]) || 0,
                image: row[SPREADSHEET_CONFIG.columns.image] || 'https://via.placeholder.com/300x400',
                description: row[SPREADSHEET_CONFIG.columns.description] || 'Produto sem descrição',
                sizes: row[SPREADSHEET_CONFIG.columns.sizes] ? 
                    row[SPREADSHEET_CONFIG.columns.sizes].split(',').map(s => s.trim()) : 
                    ['P', 'M', 'G'],
                colors: row[SPREADSHEET_CONFIG.columns.colors] ? 
                    row[SPREADSHEET_CONFIG.columns.colors].split(',').map(c => c.trim()) : 
                    ['Padrão']
            };
            products.push(product);
        }
    });
    
    return products;
}

// Exportar configurações
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SPREADSHEET_CONFIG, loadProductsFromSpreadsheet, convertSpreadsheetData };
}
