import json
from app.models import Produto, Cliente, Venda, ItemVenda, Categoria


# ─── Dashboard ────────────────────────────────────────────────────────────────

def test_dashboard(client):
    resp = client.get('/')
    assert resp.status_code == 200
    assert b'Dashboard' in resp.data


# ─── Produtos ─────────────────────────────────────────────────────────────────

def test_produtos_index(client):
    resp = client.get('/produtos/')
    assert resp.status_code == 200


def test_produto_create(client, db, app):
    with app.app_context():
        cat = Categoria.query.first()
        resp = client.post('/produtos/novo', data={
            'codigo': 'CIM001',
            'nome': 'Cimento CP-II 50kg',
            'unidade': 'SC',
            'preco_custo': '28.00',
            'preco_venda': '35.00',
            'estoque': '100',
            'estoque_minimo': '10',
            'categoria_id': cat.id,
        }, follow_redirects=True)
        assert resp.status_code == 200
        assert b'Cimento CP-II 50kg' in resp.data
        produto = Produto.query.filter_by(codigo='CIM001').first()
        assert produto is not None
        assert float(produto.preco_venda) == 35.00


def test_produto_create_duplicate_codigo(client, db, app):
    with app.app_context():
        cat = Categoria.query.first()
        client.post('/produtos/novo', data={
            'codigo': 'DUP001',
            'nome': 'Produto A',
            'unidade': 'UN',
            'preco_custo': '10',
            'preco_venda': '15',
            'estoque': '5',
            'estoque_minimo': '1',
            'categoria_id': cat.id,
        })
        resp = client.post('/produtos/novo', data={
            'codigo': 'DUP001',
            'nome': 'Produto B',
            'unidade': 'UN',
            'preco_custo': '10',
            'preco_venda': '15',
            'estoque': '5',
            'estoque_minimo': '1',
            'categoria_id': cat.id,
        })
        assert resp.status_code == 200
        assert b'j\xc3\xa1 existe' in resp.data.lower() or b'existe' in resp.data.lower()


def test_produto_buscar_api(client, db, app):
    with app.app_context():
        cat = Categoria.query.first()
        client.post('/produtos/novo', data={
            'codigo': 'TIJB001',
            'nome': 'Tijolo Baiano',
            'unidade': 'UN',
            'preco_custo': '0.50',
            'preco_venda': '0.80',
            'estoque': '500',
            'estoque_minimo': '50',
            'categoria_id': cat.id,
        })
        resp = client.get('/produtos/buscar?q=Tijolo')
        assert resp.status_code == 200
        data = json.loads(resp.data)
        assert any(p['codigo'] == 'TIJB001' for p in data)


def test_produto_edit(client, db, app):
    with app.app_context():
        cat = Categoria.query.first()
        client.post('/produtos/novo', data={
            'codigo': 'EDIT001',
            'nome': 'Produto Edit',
            'unidade': 'UN',
            'preco_custo': '5',
            'preco_venda': '8',
            'estoque': '10',
            'estoque_minimo': '2',
            'categoria_id': cat.id,
        })
        p = Produto.query.filter_by(codigo='EDIT001').first()
        resp = client.post(f'/produtos/{p.id}/editar', data={
            'codigo': 'EDIT001',
            'nome': 'Produto Edit Atualizado',
            'unidade': 'UN',
            'preco_custo': '5',
            'preco_venda': '9',
            'estoque': '10',
            'estoque_minimo': '2',
            'categoria_id': cat.id,
            'ativo': 'on',
        }, follow_redirects=True)
        assert resp.status_code == 200
        p2 = Produto.query.filter_by(codigo='EDIT001').first()
        assert float(p2.preco_venda) == 9.0


def test_produto_delete(client, db, app):
    with app.app_context():
        cat = Categoria.query.first()
        client.post('/produtos/novo', data={
            'codigo': 'DEL001',
            'nome': 'Para Excluir',
            'unidade': 'UN',
            'preco_custo': '5',
            'preco_venda': '8',
            'estoque': '10',
            'estoque_minimo': '1',
            'categoria_id': cat.id,
        })
        p = Produto.query.filter_by(codigo='DEL001').first()
        resp = client.post(f'/produtos/{p.id}/excluir', follow_redirects=True)
        assert resp.status_code == 200
        assert Produto.query.filter_by(codigo='DEL001').first() is None


# ─── Clientes ─────────────────────────────────────────────────────────────────

def test_clientes_index(client):
    resp = client.get('/clientes/')
    assert resp.status_code == 200


def test_cliente_create(client, db, app):
    with app.app_context():
        resp = client.post('/clientes/novo', data={
            'nome': 'José da Silva',
            'cpf_cnpj': '12345678901',
            'telefone': '11999999999',
            'cidade': 'São Paulo',
        }, follow_redirects=True)
        assert resp.status_code == 200
        assert b'Jos' in resp.data
        c = Cliente.query.filter_by(cpf_cnpj='12345678901').first()
        assert c is not None


def test_cliente_create_duplicate_cpf(client, db, app):
    with app.app_context():
        client.post('/clientes/novo', data={
            'nome': 'Cliente X',
            'cpf_cnpj': '99988877766',
        })
        resp = client.post('/clientes/novo', data={
            'nome': 'Cliente Y',
            'cpf_cnpj': '99988877766',
        })
        assert resp.status_code == 200
        assert b'existe' in resp.data.lower()


# ─── Vendas ───────────────────────────────────────────────────────────────────

def _criar_produto(client, app, codigo='PROD001', estoque=50):
    with app.app_context():
        cat = Categoria.query.first()
        client.post('/produtos/novo', data={
            'codigo': codigo,
            'nome': f'Produto {codigo}',
            'unidade': 'UN',
            'preco_custo': '10',
            'preco_venda': '15',
            'estoque': str(estoque),
            'estoque_minimo': '5',
            'categoria_id': cat.id,
        })


def test_nova_venda_redireciona(client, app):
    resp = client.get('/vendas/nova', follow_redirects=False)
    # deve criar e redirecionar para /vendas/<id>
    assert resp.status_code == 302
    assert '/vendas/' in resp.headers['Location']


def test_venda_adicionar_item(client, app):
    _criar_produto(client, app, 'ITEM001', 50)
    # cria a venda
    resp = client.get('/vendas/nova', follow_redirects=True)
    assert resp.status_code == 200
    with app.app_context():
        venda = Venda.query.first()
        produto = Produto.query.filter_by(codigo='ITEM001').first()
        resp = client.post(
            f'/vendas/{venda.id}/adicionar-item',
            data=json.dumps({'produto_id': produto.id, 'quantidade': 2, 'preco_unitario': 15.0, 'desconto': 0}),
            content_type='application/json',
        )
        assert resp.status_code == 200
        data = json.loads(resp.data)
        assert data['subtotal'] == 30.0
        assert len(data['itens']) == 1


def test_venda_sem_estoque(client, app):
    _criar_produto(client, app, 'SEMEST', 2)
    client.get('/vendas/nova', follow_redirects=True)
    with app.app_context():
        venda = Venda.query.order_by(Venda.id.desc()).first()
        produto = Produto.query.filter_by(codigo='SEMEST').first()
        resp = client.post(
            f'/vendas/{venda.id}/adicionar-item',
            data=json.dumps({'produto_id': produto.id, 'quantidade': 99, 'preco_unitario': 15.0, 'desconto': 0}),
            content_type='application/json',
        )
        assert resp.status_code == 400
        data = json.loads(resp.data)
        assert 'Estoque insuficiente' in data['erro']


def test_venda_finalizar(client, app):
    _criar_produto(client, app, 'FIN001', 50)
    client.get('/vendas/nova', follow_redirects=True)
    with app.app_context():
        venda = Venda.query.order_by(Venda.id.desc()).first()
        produto = Produto.query.filter_by(codigo='FIN001').first()
        estoque_antes = float(produto.estoque)
        client.post(
            f'/vendas/{venda.id}/adicionar-item',
            data=json.dumps({'produto_id': produto.id, 'quantidade': 3, 'preco_unitario': 15.0, 'desconto': 0}),
            content_type='application/json',
        )
        resp = client.post(f'/vendas/{venda.id}/finalizar', data={
            'forma_pagamento': 'Dinheiro',
            'desconto': '0',
        }, follow_redirects=True)
        assert resp.status_code == 200
        venda2 = Venda.query.get(venda.id)
        assert venda2.status == 'finalizada'
        produto2 = Produto.query.filter_by(codigo='FIN001').first()
        assert float(produto2.estoque) == estoque_antes - 3


def test_venda_finalizar_sem_itens(client, app):
    client.get('/vendas/nova', follow_redirects=True)
    with app.app_context():
        venda = Venda.query.order_by(Venda.id.desc()).first()
        resp = client.post(f'/vendas/{venda.id}/finalizar', data={
            'forma_pagamento': 'Dinheiro',
            'desconto': '0',
        }, follow_redirects=True)
        assert resp.status_code == 200
        assert b'item' in resp.data.lower()


def test_venda_cancelar_estorna_estoque(client, app):
    _criar_produto(client, app, 'CAN001', 20)
    client.get('/vendas/nova', follow_redirects=True)
    with app.app_context():
        venda = Venda.query.order_by(Venda.id.desc()).first()
        produto = Produto.query.filter_by(codigo='CAN001').first()
        client.post(
            f'/vendas/{venda.id}/adicionar-item',
            data=json.dumps({'produto_id': produto.id, 'quantidade': 5, 'preco_unitario': 15.0, 'desconto': 0}),
            content_type='application/json',
        )
        client.post(f'/vendas/{venda.id}/finalizar', data={
            'forma_pagamento': 'PIX',
            'desconto': '0',
        })
        estoque_pos_venda = float(Produto.query.filter_by(codigo='CAN001').first().estoque)
        client.post(f'/vendas/{venda.id}/cancelar', follow_redirects=True)
        estoque_pos_cancelamento = float(Produto.query.filter_by(codigo='CAN001').first().estoque)
        assert estoque_pos_cancelamento == estoque_pos_venda + 5


# ─── Relatórios ───────────────────────────────────────────────────────────────

def test_relatorio_vendas(client):
    resp = client.get('/relatorios/vendas')
    assert resp.status_code == 200


def test_relatorio_estoque(client):
    resp = client.get('/relatorios/estoque')
    assert resp.status_code == 200


def test_relatorio_mais_vendidos(client):
    resp = client.get('/relatorios/produtos-mais-vendidos')
    assert resp.status_code == 200
