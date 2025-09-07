# 🔧 Como Atualizar o Código com Dados da Planilha

## 📋 Passo a Passo

### 1. Abrir o Arquivo script.js
Localize o arquivo `script.js` no seu projeto e abra-o em um editor de texto.

### 2. Encontrar a Função loadProducts()
Procure pela função `loadProducts()` no arquivo. Ela deve estar assim:

```javascript
function loadProducts() {
    // This would normally load from your Excel/Google Sheets
    // For now, using sample data
    products = {
        vestido: [
            {
                id: 'v1',
                name: 'Vestido Floral Elegante',
                price: 89.90,
                image: 'https://via.placeholder.com/300x400/FF6B6B/FFFFFF?text=Vestido+Floral',
                description: 'Vestido feminino com estampa floral delicada, ideal para ocasiões especiais.',
                sizes: ['P', 'M', 'G', 'GG'],
                colors: ['Rosa', 'Azul', 'Verde']
            },
            // ... mais produtos
        ],
        // ... outras categorias
    };
}
```

### 3. Substituir os Dados
Substitua os dados de exemplo pelos dados reais da sua planilha.

## 📝 Exemplo Prático

### Antes (Dados de Exemplo):
```javascript
vestido: [
    {
        id: 'v1',
        name: 'Vestido Floral Elegante',
        price: 89.90,
        image: 'https://via.placeholder.com/300x400/FF6B6B/FFFFFF?text=Vestido+Floral',
        description: 'Vestido feminino com estampa floral delicada, ideal para ocasiões especiais.',
        sizes: ['P', 'M', 'G', 'GG'],
        colors: ['Rosa', 'Azul', 'Verde']
    }
]
```

### Depois (Dados Reais da Planilha):
```javascript
vestido: [
    {
        id: 'v1',
        name: 'Vestido Floral Elegante',
        price: 89.90,
        image: 'https://drive.google.com/file/d/1ABC123/view',
        description: 'Vestido feminino com estampa floral delicada, ideal para ocasiões especiais.',
        sizes: ['P', 'M', 'G', 'GG'],
        colors: ['Rosa', 'Azul', 'Verde']
    },
    {
        id: 'v2',
        name: 'Vestido Social Clássico',
        price: 129.90,
        image: 'https://drive.google.com/file/d/1DEF456/view',
        description: 'Vestido social elegante, perfeito para o trabalho e eventos formais.',
        sizes: ['P', 'M', 'G'],
        colors: ['Preto', 'Azul Marinho', 'Cinza']
    },
    {
        id: 'v3',
        name: 'Vestido Casual Moderno',
        price: 79.90,
        image: 'https://drive.google.com/file/d/1GHI789/view',
        description: 'Vestido casual com modelagem confortável, ideal para o dia a dia.',
        sizes: ['P', 'M', 'G', 'GG'],
        colors: ['Branco', 'Bege', 'Rosa']
    }
]
```

## 🔄 Processo Completo

### 1. Para Cada Categoria:
1. **Abra a aba** da categoria na planilha
2. **Copie os dados** de cada produto
3. **Cole no código** seguindo o formato

### 2. Formato do Código:
```javascript
categoria: [
    {
        id: 'ID_DA_PLANILHA',
        name: 'NOME_DA_PLANILHA',
        price: PRECO_DA_PLANILHA,
        image: 'URL_DA_IMAGEM_DA_PLANILHA',
        description: 'DESCRICAO_DA_PLANILHA',
        sizes: ['TAMANHOS', 'SEPARADOS', 'POR', 'VIRGULA'],
        colors: ['CORES', 'SEPARADAS', 'POR', 'VIRGULA']
    },
    // Repita para cada produto
]
```

### 3. Exemplo Completo - Categoria Vestidos:
```javascript
vestido: [
    {
        id: 'v1',
        name: 'Vestido Floral Elegante',
        price: 89.90,
        image: 'https://drive.google.com/file/d/1ABC123/view',
        description: 'Vestido feminino com estampa floral delicada, ideal para ocasiões especiais.',
        sizes: ['P', 'M', 'G', 'GG'],
        colors: ['Rosa', 'Azul', 'Verde']
    },
    {
        id: 'v2',
        name: 'Vestido Social Clássico',
        price: 129.90,
        image: 'https://drive.google.com/file/d/1DEF456/view',
        description: 'Vestido social elegante, perfeito para o trabalho e eventos formais.',
        sizes: ['P', 'M', 'G'],
        colors: ['Preto', 'Azul Marinho', 'Cinza']
    }
]
```

## ⚠️ Pontos Importantes

### 1. Aspas e Vírgulas:
- **Use aspas duplas** para textos
- **Use vírgulas** para separar itens
- **Feche com vírgula** cada produto (exceto o último)

### 2. Arrays (Tamanhos e Cores):
- **Use colchetes** []
- **Separe por vírgula** cada item
- **Use aspas** para cada item

### 3. Números (Preços):
- **Não use aspas** para números
- **Use ponto** para decimais
- **Exemplo**: 89.90 (não "89.90")

## 🧪 Testando as Alterações

### 1. Salvar o Arquivo:
- Salve o arquivo `script.js`
- Verifique se não há erros de sintaxe

### 2. Testar no Navegador:
- Abra o `index.html`
- Navegue pelas categorias
- Verifique se as imagens carregam
- Teste o carrinho

### 3. Verificar Erros:
- Abra o **Console do Navegador** (F12)
- Procure por erros em vermelho
- Corrija se necessário

## 🔧 Solução de Problemas

### Erro: "Cannot read property of undefined"
- **Causa**: Erro de sintaxe no código
- **Solução**: Verifique vírgulas e aspas

### Imagens não carregam:
- **Causa**: URL incorreta ou imagem privada
- **Solução**: Teste o link e torne a imagem pública

### Produtos não aparecem:
- **Causa**: Erro na estrutura do código
- **Solução**: Verifique se seguiu o formato correto

## 📞 Suporte

Se tiver dificuldades:
1. **Verifique** se seguiu o formato exato
2. **Teste** os links das imagens
3. **Use** o console do navegador para ver erros
4. **Entre em contato** via WhatsApp: +55 63 99227-1991

---

**Lembre-se**: O formato deve ser exatamente como mostrado nos exemplos. Qualquer erro de sintaxe pode quebrar o site! 🌸
