from flask import Blueprint, render_template, request, redirect, url_for, flash
from app.models import Cliente
from app import db

bp = Blueprint('clientes', __name__, url_prefix='/clientes')


@bp.route('/')
def index():
    q = request.args.get('q', '')
    query = Cliente.query
    if q:
        query = query.filter(
            (Cliente.nome.ilike(f'%{q}%')) |
            (Cliente.cpf_cnpj.ilike(f'%{q}%')) |
            (Cliente.telefone.ilike(f'%{q}%'))
        )
    clientes = query.order_by(Cliente.nome).all()
    return render_template('clientes/index.html', clientes=clientes, q=q)


@bp.route('/novo', methods=['GET', 'POST'])
def novo():
    if request.method == 'POST':
        nome = request.form['nome'].strip()
        if not nome:
            flash('Nome é obrigatório.', 'danger')
            return render_template('clientes/form.html', cliente=None)
        cpf_cnpj = request.form.get('cpf_cnpj', '').strip() or None
        if cpf_cnpj and Cliente.query.filter_by(cpf_cnpj=cpf_cnpj).first():
            flash('Já existe um cliente com este CPF/CNPJ.', 'danger')
            return render_template('clientes/form.html', cliente=None)
        cliente = Cliente(
            nome=nome,
            cpf_cnpj=cpf_cnpj,
            telefone=request.form.get('telefone', '').strip() or None,
            email=request.form.get('email', '').strip() or None,
            endereco=request.form.get('endereco', '').strip() or None,
            cidade=request.form.get('cidade', '').strip() or None,
        )
        db.session.add(cliente)
        db.session.commit()
        flash('Cliente cadastrado com sucesso!', 'success')
        return redirect(url_for('clientes.index'))
    return render_template('clientes/form.html', cliente=None)


@bp.route('/<int:id>/editar', methods=['GET', 'POST'])
def editar(id):
    cliente = Cliente.query.get_or_404(id)
    if request.method == 'POST':
        nome = request.form['nome'].strip()
        if not nome:
            flash('Nome é obrigatório.', 'danger')
            return render_template('clientes/form.html', cliente=cliente)
        cpf_cnpj = request.form.get('cpf_cnpj', '').strip() or None
        if cpf_cnpj:
            existing = Cliente.query.filter_by(cpf_cnpj=cpf_cnpj).first()
            if existing and existing.id != cliente.id:
                flash('Já existe um cliente com este CPF/CNPJ.', 'danger')
                return render_template('clientes/form.html', cliente=cliente)
        cliente.nome = nome
        cliente.cpf_cnpj = cpf_cnpj
        cliente.telefone = request.form.get('telefone', '').strip() or None
        cliente.email = request.form.get('email', '').strip() or None
        cliente.endereco = request.form.get('endereco', '').strip() or None
        cliente.cidade = request.form.get('cidade', '').strip() or None
        cliente.ativo = 'ativo' in request.form
        db.session.commit()
        flash('Cliente atualizado com sucesso!', 'success')
        return redirect(url_for('clientes.index'))
    return render_template('clientes/form.html', cliente=cliente)


@bp.route('/<int:id>/excluir', methods=['POST'])
def excluir(id):
    cliente = Cliente.query.get_or_404(id)
    if cliente.vendas:
        cliente.ativo = False
        db.session.commit()
        flash('Cliente desativado (possui vendas associadas).', 'warning')
    else:
        db.session.delete(cliente)
        db.session.commit()
        flash('Cliente excluído com sucesso!', 'success')
    return redirect(url_for('clientes.index'))
