# Configuração Firebase - La Moda Cristã

## ✅ O que já está pronto:

1. **Firebase configurado** com suas chaves
2. **Página de admin** criada (`admin-firebase.html`)
3. **Sistema integrado** - produtos do Firebase aparecem no site

## 🔧 O que você precisa fazer agora:

### 1. Configurar o Firestore Database

1. No Firebase Console, vá em **"Firestore Database"**
2. Clique em **"Criar banco de dados"**
3. Escolha **"Começar no modo de teste"** (para desenvolvimento)
4. Escolha uma localização: **us-central1** (recomendado)
5. Clique em **"Concluído"**

### 2. Configurar as Regras do Firestore

1. No Firestore Database, vá na aba **"Regras"**
2. Substitua as regras por:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Produtos são públicos para leitura, qualquer um pode escrever
    match /products/{productId} {
      allow read, write: if true;
    }
  }
}
```

3. Clique em **"Publicar"**

### 3. Testar o Sistema

1. **Abra o site principal**: `index.html`
2. **Abra o admin**: `admin-firebase.html`
3. **No admin, clique em "Adicionar Produto"**
4. **Preencha um produto de teste**
5. **Salve e veja se aparece no site principal**

## 📁 Estrutura dos Arquivos:

```
la_moda_crista/
├── index.html              ← Site principal
├── admin-firebase.html     ← Painel administrativo
├── firebase-config.js      ← Configuração do Firebase
├── script.js               ← JavaScript principal
└── styles.css              ← Estilos
```

## 🎯 Como usar:

### No Admin (`admin-firebase.html`):
- **Adicionar Produto**: Preencha todos os campos
- **Editar Produto**: Clique em "Editar" no produto
- **Excluir Produto**: Clique em "Excluir" no produto
- **Atualizar Lista**: Clique em "Atualizar Lista"

### No Site Principal (`index.html`):
- Os produtos aparecem automaticamente
- Carrinho funciona normalmente
- Sistema híbrido: Firebase → Admin → Google Sheets → Fallback

## 🔄 Ordem de Carregamento:

1. **Firebase** (se configurado)
2. **Admin localStorage** (se existir)
3. **Google Sheets** (se disponível)
4. **Produtos básicos** (fallback)

## 🚨 Troubleshooting:

### "Firebase not initialized"
- Verifique se o `firebase-config.js` está carregando
- Abra o console (F12) e veja se há erros

### "Permission denied"
- Verifique as regras do Firestore
- Certifique-se de que as regras estão publicadas

### Produtos não aparecem
- Verifique se o Firestore está criado
- Verifique se as regras estão corretas
- Teste adicionando um produto no admin

## 📱 Próximos Passos (Opcionais):

1. **Autenticação** (se quiser proteger o admin)
2. **Upload de imagens** (Firebase Storage)
3. **Sistema de pedidos** (Firestore)
4. **Notificações** (Firebase Messaging)

## 🎉 Pronto!

Agora você tem:
- ✅ Site funcionando
- ✅ Admin sem senha
- ✅ Produtos salvos no Firebase
- ✅ Sistema híbrido de fallback

**Teste adicionando um produto no admin e veja se aparece no site!**
