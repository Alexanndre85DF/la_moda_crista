# 📊 Guia Completo - Como Inserir Produtos na Planilha

## 🎯 Visão Geral

O sistema está configurado para carregar produtos de uma planilha Excel/Google Sheets. Atualmente, os dados estão no arquivo `script.js`, mas você pode facilmente migrar para uma planilha real.

## 📋 Estrutura da Planilha

### Organização por Abas
Crie uma aba para cada categoria na sua planilha:

| Aba | Categoria | Arquivo HTML |
|-----|-----------|--------------|
| Vestidos | vestido | vestido.html |
| Conjuntos | conjunto | conjunto.html |
| T-shirts | tshirt | tshirt.html |
| Macacões | macacao | macacao.html |
| Blusas | blusa | blusa.html |
| Camisas | camisa | camisa.html |
| Saias Jeans | saia-jeans | saia-jeans.html |
| Saias Sociais | saia-social | saia-social.html |
| Calças | calca | calca.html |
| Pijamas | pijama | pijama.html |

### Estrutura das Colunas

Cada aba deve ter as seguintes colunas:

| Coluna | Descrição | Exemplo | Obrigatório |
|--------|-----------|---------|-------------|
| **A - ID** | Identificador único | v1, c1, t1 | ✅ Sim |
| **B - Nome** | Nome do produto | Vestido Floral Elegante | ✅ Sim |
| **C - Preço** | Preço em reais | 89.90 | ✅ Sim |
| **D - Imagem** | URL da imagem | https://exemplo.com/vestido1.jpg | ✅ Sim |
| **E - Descrição** | Descrição detalhada | Vestido feminino com estampa... | ✅ Sim |
| **F - Tamanhos** | Tamanhos disponíveis | P,M,G,GG | ✅ Sim |
| **G - Cores** | Cores disponíveis | Rosa,Azul,Verde | ✅ Sim |

## 📝 Exemplo Prático - Aba "Vestidos"

```
| A (ID) | B (Nome) | C (Preço) | D (Imagem) | E (Descrição) | F (Tamanhos) | G (Cores) |
|--------|----------|-----------|------------|---------------|--------------|-----------|
| v1 | Vestido Floral Elegante | 89.90 | https://drive.google.com/file/d/1ABC123/view | Vestido feminino com estampa floral delicada, ideal para ocasiões especiais. | P,M,G,GG | Rosa,Azul,Verde |
| v2 | Vestido Social Clássico | 129.90 | https://drive.google.com/file/d/1DEF456/view | Vestido social elegante, perfeito para o trabalho e eventos formais. | P,M,G | Preto,Azul Marinho,Cinza |
| v3 | Vestido Casual Moderno | 79.90 | https://drive.google.com/file/d/1GHI789/view | Vestido casual com modelagem confortável, ideal para o dia a dia. | P,M,G,GG | Branco,Bege,Rosa |
```

## 🖼️ Como Inserir Imagens

### Opção 1: Google Drive (Recomendado)
1. **Faça upload** da imagem no Google Drive
2. **Clique com botão direito** na imagem
3. **Selecione "Obter link"**
4. **Altere para "Qualquer pessoa com o link"**
5. **Copie o link** e cole na coluna D

### Opção 2: Outros Serviços
- **Dropbox**: Use links públicos
- **Imgur**: Upload gratuito
- **Servidor próprio**: Se tiver hospedagem

### ⚠️ Importante sobre Imagens
- **Formato**: JPG, PNG, WebP
- **Tamanho**: Mínimo 300x400px
- **Qualidade**: Alta resolução
- **Acesso**: Link público (qualquer pessoa pode ver)

## 📋 Instruções Passo a Passo

### 1. Criar a Planilha
1. Abra **Google Sheets** ou **Excel**
2. Crie **10 abas** (uma para cada categoria)
3. Nomeie as abas conforme a tabela acima

### 2. Configurar as Colunas
1. Na **linha 1** de cada aba, adicione os cabeçalhos:
   - A1: ID
   - B1: Nome
   - C1: Preço
   - D1: Imagem
   - E1: Descrição
   - F1: Tamanhos
   - G1: Cores

### 3. Inserir Produtos
1. **Comece pela linha 2**
2. **Preencha todas as colunas** para cada produto
3. **Use IDs únicos** (v1, v2, v3... para vestidos)
4. **Separe tamanhos e cores por vírgula**

### 4. Exemplo de Preenchimento

**Produto 1:**
- ID: `v1`
- Nome: `Vestido Floral Elegante`
- Preço: `89.90`
- Imagem: `https://drive.google.com/file/d/1ABC123/view`
- Descrição: `Vestido feminino com estampa floral delicada, ideal para ocasiões especiais.`
- Tamanhos: `P,M,G,GG`
- Cores: `Rosa,Azul,Verde`

## 🔄 Como Atualizar o Site

### Método Atual (Manual)
1. **Abra o arquivo** `script.js`
2. **Localize a função** `loadProducts()`
3. **Atualize os dados** conforme sua planilha
4. **Salve o arquivo**

### Método Futuro (Automático)
1. **Configure uma API** do Google Sheets
2. **Atualize o arquivo** `spreadsheet-config.js`
3. **O site carregará automaticamente** os dados

## 💡 Dicas Importantes

### Para Imagens:
- **Teste os links** antes de inserir
- **Use imagens de alta qualidade**
- **Mantenha proporção** similar (vertical)
- **Evite imagens muito pesadas**

### Para Descrições:
- **Seja específico** sobre o produto
- **Mencione ocasiões** de uso
- **Inclua características** especiais
- **Máximo 200 caracteres** recomendado

### Para Preços:
- **Use apenas números** (ex: 89.90)
- **Não use símbolos** (R$, vírgulas)
- **Mantenha atualizado**

### Para Tamanhos e Cores:
- **Separe por vírgula** (P,M,G,GG)
- **Use nomes claros** (Rosa, Azul, Verde)
- **Remova tamanhos indisponíveis**

## 🚀 Próximos Passos

1. **Crie sua planilha** seguindo este guia
2. **Adicione seus produtos** com fotos reais
3. **Teste os links** das imagens
4. **Atualize o script.js** com seus dados
5. **Faça upload** para o Netlify

## 📞 Suporte

Se tiver dúvidas sobre:
- **Configuração da planilha**
- **Upload de imagens**
- **Atualização do site**

Entre em contato via WhatsApp: +55 63 99227-1991

---

**Lembre-se**: O sistema está pronto para receber seus produtos. Basta seguir este guia e você terá sua loja funcionando perfeitamente! 🌸
