from datetime import datetime, timezone
from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from app.models import Venda, ItemVenda, Produto, Cliente
from app import db

bp = Blueprint('vendas', __name__, url_prefix='/vendas')


def _gerar_numero():
    ultimo = Venda.query.order_by(Venda.id.desc()).first()
    n = (ultimo.id + 1) if ultimo else 1
    return f'V{n:06d}'


@bp.route('/')
def index():
    status = request.args.get('status', '')
    query = Venda.query
    if status:
        query = query.filter_by(status=status)
    vendas = query.order_by(Venda.criado_em.desc()).limit(100).all()
    return render_template('vendas/index.html', vendas=vendas, status=status)


@bp.route('/nova', methods=['GET', 'POST'])
def nova():
    clientes = Cliente.query.filter_by(ativo=True).order_by(Cliente.nome).all()
    venda = Venda(numero=_gerar_numero(), status='aberta')
    db.session.add(venda)
    db.session.commit()
    return redirect(url_for('vendas.editar', id=venda.id))


@bp.route('/<int:id>', methods=['GET'])
def editar(id):
    venda = Venda.query.get_or_404(id)
    clientes = Cliente.query.filter_by(ativo=True).order_by(Cliente.nome).all()
    return render_template('vendas/form.html', venda=venda, clientes=clientes)


@bp.route('/<int:id>/adicionar-item', methods=['POST'])
def adicionar_item(id):
    venda = Venda.query.get_or_404(id)
    if venda.status != 'aberta':
        return jsonify({'erro': 'Venda não está aberta'}), 400
    data = request.get_json()
    produto_id = data.get('produto_id')
    quantidade = float(data.get('quantidade', 1))
    preco_unitario = float(data.get('preco_unitario', 0))
    desconto_item = float(data.get('desconto', 0))

    produto = Produto.query.get_or_404(produto_id)
    if float(produto.estoque) < quantidade:
        return jsonify({'erro': f'Estoque insuficiente. Disponível: {float(produto.estoque)} {produto.unidade}'}), 400

    total_item = round(quantidade * preco_unitario - desconto_item, 2)
    item = ItemVenda(
        venda_id=venda.id,
        produto_id=produto.id,
        quantidade=quantidade,
        preco_unitario=preco_unitario,
        desconto=desconto_item,
        total=total_item,
    )
    db.session.add(item)
    venda.calcular_totais()
    db.session.commit()
    return jsonify(_venda_json(venda))


@bp.route('/<int:id>/remover-item/<int:item_id>', methods=['DELETE'])
def remover_item(id, item_id):
    venda = Venda.query.get_or_404(id)
    if venda.status != 'aberta':
        return jsonify({'erro': 'Venda não está aberta'}), 400
    item = ItemVenda.query.get_or_404(item_id)
    db.session.delete(item)
    db.session.flush()
    venda.calcular_totais()
    db.session.commit()
    return jsonify(_venda_json(venda))


@bp.route('/<int:id>/atualizar', methods=['POST'])
def atualizar(id):
    venda = Venda.query.get_or_404(id)
    if venda.status != 'aberta':
        flash('Esta venda não pode ser editada.', 'danger')
        return redirect(url_for('vendas.index'))
    cliente_id = request.form.get('cliente_id') or None
    venda.cliente_id = int(cliente_id) if cliente_id else None
    venda.desconto = float(request.form.get('desconto', 0) or 0)
    venda.observacao = request.form.get('observacao', '')
    venda.calcular_totais()
    db.session.commit()
    flash('Venda atualizada.', 'success')
    return redirect(url_for('vendas.editar', id=id))


@bp.route('/<int:id>/finalizar', methods=['POST'])
def finalizar(id):
    venda = Venda.query.get_or_404(id)
    if venda.status != 'aberta':
        flash('Esta venda já foi finalizada ou cancelada.', 'danger')
        return redirect(url_for('vendas.index'))
    if not venda.itens:
        flash('Adicione pelo menos um item à venda antes de finalizar.', 'danger')
        return redirect(url_for('vendas.editar', id=id))
    forma = request.form.get('forma_pagamento', '').strip()
    if not forma:
        flash('Selecione a forma de pagamento.', 'danger')
        return redirect(url_for('vendas.editar', id=id))
    venda.forma_pagamento = forma
    venda.desconto = float(request.form.get('desconto', 0) or 0)
    venda.calcular_totais()
    venda.status = 'finalizada'
    venda.finalizado_em = datetime.now(timezone.utc).replace(tzinfo=None)
    for item in venda.itens:
        item.produto.estoque = float(item.produto.estoque) - float(item.quantidade)
    db.session.commit()
    flash(f'Venda {venda.numero} finalizada com sucesso!', 'success')
    return redirect(url_for('vendas.detalhe', id=id))


@bp.route('/<int:id>/cancelar', methods=['POST'])
def cancelar(id):
    venda = Venda.query.get_or_404(id)
    if venda.status == 'finalizada':
        for item in venda.itens:
            item.produto.estoque = float(item.produto.estoque) + float(item.quantidade)
    venda.status = 'cancelada'
    db.session.commit()
    flash(f'Venda {venda.numero} cancelada.', 'warning')
    return redirect(url_for('vendas.index'))


@bp.route('/<int:id>/detalhe')
def detalhe(id):
    venda = Venda.query.get_or_404(id)
    return render_template('vendas/detalhe.html', venda=venda)


def _venda_json(venda):
    return {
        'id': venda.id,
        'numero': venda.numero,
        'subtotal': float(venda.subtotal),
        'desconto': float(venda.desconto),
        'total': float(venda.total),
        'itens': [{
            'id': i.id,
            'produto_id': i.produto_id,
            'produto_nome': i.produto.nome,
            'produto_codigo': i.produto.codigo,
            'unidade': i.produto.unidade,
            'quantidade': float(i.quantidade),
            'preco_unitario': float(i.preco_unitario),
            'desconto': float(i.desconto),
            'total': float(i.total),
        } for i in venda.itens]
    }
