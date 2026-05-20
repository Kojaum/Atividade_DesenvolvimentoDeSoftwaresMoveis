const initialProducts = [
    { id: 1, nome: "Tela Frontal Completa iPhone 11", modelo: "Apple", categoria: "Peça", qtd: 6, custo: 150.00, venda: 380.00 },
    { id: 2, nome: "Bateria Homologada Galaxy S20", modelo: "Samsung", categoria: "Peça", qtd: 2, custo: 65.00, venda: 140.00 },
    { id: 3, nome: "iPhone 12 128GB - Vitrine", modelo: "Apple", categoria: "Aparelho", qtd: 1, custo: 2100.00, venda: 2950.00 },
    { id: 4, nome: "Carregador Turbo 20W Tipo-C", modelo: "Universal", categoria: "Acessório", qtd: 15, custo: 22.00, venda: 60.00 }
];

let products = [];

window.addEventListener('DOMContentLoaded', () => {
    const savedData = localStorage.getItem('tech_stock_items');
    if (savedData) {
        products = JSON.parse(savedData);
    } else {
        products = initialProducts;
        saveToLocalStorage();
    }
    
    document.getElementById('search-input').addEventListener('input', (e) => {
        renderStockList(e.target.value);
    });

    renderStockList();
});

function saveToLocalStorage() {
    localStorage.setItem('tech_stock_items', JSON.stringify(products));
}

function updateDashboard() {
    let totalItens = 0, valorEstoque = 0, alertaCritico = 0;
    products.forEach(p => {
        const qtd = parseInt(p.qtd) || 0;
        const custo = parseFloat(p.custo) || 0;
        totalItens += qtd;
        valorEstoque += (qtd * custo);
        if (qtd <= 2) alertaCritico++;
    });
    document.getElementById('dash-total-itens').innerText = totalItens;
    document.getElementById('dash-valor-estoque').innerText = 'R$ ' + valorEstoque.toFixed(2);
    document.getElementById('dash-alerta-critico').innerText = alertaCritico;
}

function renderStockList(searchTerm = '') {
    const container = document.getElementById('stock-list-container');
    container.innerHTML = '';

    const filtered = products.filter(p => {
        const term = searchTerm.toLowerCase();
        return p.nome.toLowerCase().includes(term) || p.modelo.toLowerCase().includes(term);
    });

    if (filtered.length === 0) {
        container.innerHTML = '<div class="empty-state">Nenhum produto localizado no estoque.</div>';
        updateDashboard();
        return;
    }

    filtered.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card';
        let badgeClass = p.categoria === 'Aparelho' ? 'badge-device' : p.categoria === 'Acessório' ? 'badge-acc' : 'badge-piece';
        const isLow = p.qtd <= 2;

        card.innerHTML = `
            <div class="product-info-row">
                <div class="product-main-details">
                    <div class="product-title">${p.nome}</div>
                    <div class="product-subtitle">Modelo/Marca: ${p.modelo}</div>
                </div>
                <div class="badge-container"><span class="badge ${badgeClass}">${p.categoria}</span></div>
            </div>
            <div class="product-meta-row">
                <div class="meta-item">Qtd: <span>${p.qtd}</span> u</div>
                <div class="meta-item">Venda: <span>R$ ${parseFloat(p.venda).toFixed(2)}</span></div>
                <div class="meta-item ${isLow ? 'status-low' : 'status-ok'} stock-status">${isLow ? 'Baixo' : 'Ok'}</div>
                <div class="actions-cell">
                    <button class="btn-action btn-edit" onclick="editProduct(${p.id})" aria-label="Editar">✏️</button>
                    <button class="btn-action btn-delete" onclick="deleteProduct(${p.id})" aria-label="Excluir">❌</button>
                </div>
            </div>`;
        container.appendChild(card);
    });
    updateDashboard();
}

function hideError() {
    const errorBox = document.getElementById('form-error');
    errorBox.style.display = 'none';
    errorBox.innerText = '';
}

function showError(message) {
    const errorBox = document.getElementById('form-error');
    errorBox.innerText = message;
    errorBox.style.display = 'block';
}

function navigateToList() {
    document.getElementById('screen-form').classList.remove('active');
    document.getElementById('screen-list').classList.add('active');
    document.getElementById('product-form').reset();
    document.getElementById('form-id').value = '';
    hideError();
    renderStockList();
}

function navigateToForm() {
    document.getElementById('form-screen-title').innerText = 'Novo Item';
    document.getElementById('screen-list').classList.remove('active');
    document.getElementById('screen-form').classList.add('active');
    hideError();
}

function handleFormSubmit(event) {
    event.preventDefault();
    hideError();

    const idVal = document.getElementById('form-id').value;
    const nome = document.getElementById('form-nome').value;
    const modelo = document.getElementById('form-modelo').value;
    const categoria = document.getElementById('form-categoria').value;
    const qtd = parseInt(document.getElementById('form-qtd').value);
    const custo = parseFloat(document.getElementById('form-custo').value);
    const venda = parseFloat(document.getElementById('form-venda').value);

    if (venda < custo) {
        showError("Atenção: O preço de venda não pode ser menor que o preço de custo. Ajuste os valores.");
        return; 
    }

    if (idVal) {
        const index = products.findIndex(p => p.id == idVal);
        if (index !== -1) products[index] = { id: parseInt(idVal), nome, modelo, categoria, qtd, custo, venda };
    } else {
        const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
        products.push({ id: newId, nome, modelo, categoria, qtd, custo, venda });
    }
    saveToLocalStorage();
    navigateToList();
}

function editProduct(id) {
    const prod = products.find(p => p.id === id);
    if (!prod) return;
    document.getElementById('form-id').value = prod.id;
    document.getElementById('form-nome').value = prod.nome;
    document.getElementById('form-modelo').value = prod.modelo;
    document.getElementById('form-categoria').value = prod.categoria;
    document.getElementById('form-qtd').value = prod.qtd;
    document.getElementById('form-custo').value = prod.custo;
    document.getElementById('form-venda').value = prod.venda;
    
    document.getElementById('form-screen-title').innerText = 'Editar Item';
    document.getElementById('screen-list').classList.remove('active');
    document.getElementById('screen-form').classList.add('active');
    hideError();
}

function deleteProduct(id) {
    if (confirm("Deseja remover este item do estoque?")) {
        products = products.filter(p => p.id !== id);
        saveToLocalStorage();
        renderStockList(document.getElementById('search-input').value);
    }
}

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('SW Registrado'))
            .catch(err => console.log('Falha no SW:', err));
    });
}