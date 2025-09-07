# La Moda Cristã - Loja Virtual

Uma loja virtual moderna e responsiva para venda de roupas femininas, desenvolvida em HTML, CSS e JavaScript puro.

## 🚀 Funcionalidades

- **Página Inicial**: Exibição de categorias de roupas com imagens atrativas
- **Categorias**: Vestido, Conjunto, Blusa, Saia, Calça, Macacão
- **Produtos**: Visualização detalhada com zoom, seleção de tamanho e cores
- **Carrinho**: Sistema de carrinho com envio direto para WhatsApp
- **Responsivo**: Design adaptável para mobile e desktop
- **Integração WhatsApp**: Finalização de compra via WhatsApp Business

## 📱 Links de Integração

- **Instagram**: [@lamodacrista_gpi](https://www.instagram.com/lamodacrista_gpi/reels)
- **WhatsApp**: +55 63 99227-1991

## 🛠️ Estrutura do Projeto

```
la_moda_crista/
├── index.html          # Página principal
├── styles.css          # Estilos CSS
├── script.js           # Funcionalidades JavaScript
├── spreadsheet-config.js # Configuração da planilha
├── README.md           # Este arquivo
└── moda.jpeg          # Logo da loja
```

## 📊 Gerenciamento de Produtos via Planilha

### Estrutura da Planilha Excel/Google Sheets

Para facilitar o gerenciamento de produtos, use uma planilha com as seguintes colunas:

| Coluna | Descrição | Exemplo |
|--------|-----------|---------|
| A - ID | Identificador único | v1, c1, b1 |
| B - Nome | Nome do produto | Vestido Floral Elegante |
| C - Preço | Preço em reais | 89.90 |
| D - Imagem | URL da imagem | https://exemplo.com/imagem.jpg |
| E - Descrição | Descrição do produto | Vestido feminino com estampa... |
| F - Tamanhos | Tamanhos disponíveis | P, M, G, GG |
| G - Cores | Cores disponíveis | Rosa, Azul, Verde |

### Organização por Abas

Crie uma aba para cada categoria:
- **Vestidos**: Produtos da categoria vestido
- **Conjuntos**: Produtos da categoria conjunto
- **Blusas**: Produtos da categoria blusa
- **Saias**: Produtos da categoria saia
- **Calças**: Produtos da categoria calça
- **Macacões**: Produtos da categoria macacão

### Exemplo de Dados na Planilha

```
ID    | Nome                    | Preço | Imagem                    | Descrição                    | Tamanhos | Cores
v1    | Vestido Floral Elegante | 89.90 | https://exemplo.com/v1.jpg | Vestido feminino elegante... | P,M,G,GG | Rosa,Azul
c1    | Conjunto Casual         | 149.90| https://exemplo.com/c1.jpg | Conjunto moderno...          | P,M,G    | Bege,Rosa
```

## 🔧 Como Usar

### 1. Hospedagem no Netlify

1. Faça upload dos arquivos para o Netlify
2. Configure o domínio personalizado (opcional)
3. A loja estará online e funcionando

### 2. Gerenciamento de Produtos

1. **Adicionar Produto**:
   - Abra a planilha Excel/Google Sheets
   - Vá para a aba da categoria desejada
   - Adicione uma nova linha com os dados do produto
   - Salve a planilha

2. **Atualizar Preços**:
   - Edite a coluna de preços na planilha
   - Os preços serão atualizados automaticamente no site

3. **Gerenciar Estoque**:
   - Use a coluna de tamanhos para indicar disponibilidade
   - Remova tamanhos indisponíveis da lista

### 3. Integração com WhatsApp

O sistema está configurado para enviar pedidos para o WhatsApp +55 63 99227-1991. A mensagem inclui:
- Lista de produtos
- Tamanhos selecionados
- Quantidades
- Valor total

## 🎨 Personalização

### Cores e Estilo
- Edite o arquivo `styles.css` para alterar cores, fontes e layout
- As cores principais estão definidas como variáveis CSS

### Logo e Imagens
- Substitua `moda.jpeg` pela logo da sua loja
- Use URLs de imagens de alta qualidade para os produtos

### Textos e Conteúdo
- Edite o arquivo `index.html` para alterar textos
- Personalize as mensagens do WhatsApp em `script.js`

## 📱 Funcionalidades Mobile

- Design totalmente responsivo
- Carrinho lateral otimizado para mobile
- Navegação touch-friendly
- Imagens otimizadas para diferentes tamanhos de tela

## 🔄 Atualizações Futuras

Para implementar carregamento automático da planilha:

1. Configure uma API do Google Sheets
2. Atualize o arquivo `spreadsheet-config.js`
3. Modifique a função `loadProducts()` em `script.js`

## 📞 Suporte

Para dúvidas ou suporte técnico, entre em contato via WhatsApp: +55 63 99227-1991

## 📄 Licença

Este projeto foi desenvolvido especificamente para La Moda Cristã. Todos os direitos reservados.
