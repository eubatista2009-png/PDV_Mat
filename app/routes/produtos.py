from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from app.models import Produto, Categoria
from app import db

bp = Blueprint('produtos', __name__, url_prefix='/produtos')


@bp.route('/')
def index():
    q = request.args.get('q', '')
    categoria_id = request.args.get('categoria_id', type=int)
    query = Produto.query
    if q:
        query = query.filter(
            (Produto.nome.ilike(f'%{q}%')) | (Produto.codigo.ilike(f'%{q}%'))
        )
    if categoria_id:
        query = query.filter_by(categoria_id=categoria_id)
    produtos = query.order_by(Produto.nome).all()
    categorias = Categoria.query.order_by(Categoria.nome).all()
    return render_template('produtos/index.html', produtos=produtos,
                           categorias=categorias, q=q,
                           categoria_id=categoria_id)


@bp.route('/novo', methods=['GET', 'POST'])
def novo():
    categorias = Categoria.query.order_by(Categoria.nome).all()
    if request.method == 'POST':
        codigo = request.form['codigo'].strip()
        nome = request.form['nome'].strip()
        if not codigo or not nome:
            flash('Código e nome são obrigatórios.', 'danger')
            return render_template('produtos/form.html', categorias=categorias, produto=None)
        if Produto.query.filter_by(codigo=codigo).first():
            flash('Já existe um produto com este código.', 'danger')
            return render_template('produtos/form.html', categorias=categorias, produto=None)
        produto = Produto(
            codigo=codigo,
            nome=nome,
            descricao=request.form.get('descricao', ''),
            unidade=request.form.get('unidade', 'UN'),
            preco_custo=float(request.form.get('preco_custo', 0) or 0),
            preco_venda=float(request.form.get('preco_venda', 0) or 0),
            estoque=float(request.form.get('estoque', 0) or 0),
            estoque_minimo=float(request.form.get('estoque_minimo', 0) or 0),
            categoria_id=int(request.form['categoria_id']),
        )
        db.session.add(produto)
        db.session.commit()
        flash('Produto cadastrado com sucesso!', 'success')
        return redirect(url_for('produtos.index'))
    return render_template('produtos/form.html', categorias=categorias, produto=None)


@bp.route('/<int:id>/editar', methods=['GET', 'POST'])
def editar(id):
    produto = Produto.query.get_or_404(id)
    categorias = Categoria.query.order_by(Categoria.nome).all()
    if request.method == 'POST':
        codigo = request.form['codigo'].strip()
        nome = request.form['nome'].strip()
        if not codigo or not nome:
            flash('Código e nome são obrigatórios.', 'danger')
            return render_template('produtos/form.html', categorias=categorias, produto=produto)
        existing = Produto.query.filter_by(codigo=codigo).first()
        if existing and existing.id != produto.id:
            flash('Já existe um produto com este código.', 'danger')
            return render_template('produtos/form.html', categorias=categorias, produto=produto)
        produto.codigo = codigo
        produto.nome = nome
        produto.descricao = request.form.get('descricao', '')
        produto.unidade = request.form.get('unidade', 'UN')
        produto.preco_custo = float(request.form.get('preco_custo', 0) or 0)
        produto.preco_venda = float(request.form.get('preco_venda', 0) or 0)
        produto.estoque = float(request.form.get('estoque', 0) or 0)
        produto.estoque_minimo = float(request.form.get('estoque_minimo', 0) or 0)
        produto.categoria_id = int(request.form['categoria_id'])
        produto.ativo = 'ativo' in request.form
        db.session.commit()
        flash('Produto atualizado com sucesso!', 'success')
        return redirect(url_for('produtos.index'))
    return render_template('produtos/form.html', categorias=categorias, produto=produto)


@bp.route('/<int:id>/excluir', methods=['POST'])
def excluir(id):
    produto = Produto.query.get_or_404(id)
    if produto.itens_venda:
        produto.ativo = False
        db.session.commit()
        flash('Produto desativado (possui vendas associadas).', 'warning')
    else:
        db.session.delete(produto)
        db.session.commit()
        flash('Produto excluído com sucesso!', 'success')
    return redirect(url_for('produtos.index'))


@bp.route('/buscar')
def buscar():
    q = request.args.get('q', '')
    produtos = Produto.query.filter(
        Produto.ativo == True,
        (Produto.nome.ilike(f'%{q}%')) | (Produto.codigo.ilike(f'%{q}%'))
    ).order_by(Produto.nome).limit(20).all()
    return jsonify([{
        'id': p.id,
        'codigo': p.codigo,
        'nome': p.nome,
        'unidade': p.unidade,
        'preco_venda': float(p.preco_venda),
        'estoque': float(p.estoque),
    } for p in produtos])
