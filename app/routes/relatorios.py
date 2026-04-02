from flask import Blueprint, render_template, request
from app.models import Venda, Produto, ItemVenda
from app import db
from sqlalchemy import func
from datetime import date, timedelta

bp = Blueprint('relatorios', __name__, url_prefix='/relatorios')


@bp.route('/vendas')
def vendas():
    data_inicio = request.args.get('data_inicio', str(date.today() - timedelta(days=30)))
    data_fim = request.args.get('data_fim', str(date.today()))
    vendas = Venda.query.filter(
        func.date(Venda.criado_em) >= data_inicio,
        func.date(Venda.criado_em) <= data_fim,
        Venda.status == 'finalizada'
    ).order_by(Venda.criado_em.desc()).all()
    total_geral = sum(float(v.total) for v in vendas)
    return render_template('relatorios/vendas.html',
                           vendas=vendas,
                           total_geral=total_geral,
                           data_inicio=data_inicio,
                           data_fim=data_fim)


@bp.route('/estoque')
def estoque():
    q = request.args.get('q', '')
    somente_baixo = request.args.get('somente_baixo') == '1'
    query = Produto.query.filter_by(ativo=True)
    if q:
        query = query.filter(
            (Produto.nome.ilike(f'%{q}%')) | (Produto.codigo.ilike(f'%{q}%'))
        )
    if somente_baixo:
        query = query.filter(Produto.estoque <= Produto.estoque_minimo)
    produtos = query.order_by(Produto.nome).all()
    return render_template('relatorios/estoque.html',
                           produtos=produtos,
                           q=q,
                           somente_baixo=somente_baixo)


@bp.route('/produtos-mais-vendidos')
def produtos_mais_vendidos():
    data_inicio = request.args.get('data_inicio', str(date.today() - timedelta(days=30)))
    data_fim = request.args.get('data_fim', str(date.today()))
    resultados = db.session.query(
        Produto.codigo,
        Produto.nome,
        Produto.unidade,
        func.sum(ItemVenda.quantidade).label('qtd_total'),
        func.sum(ItemVenda.total).label('valor_total')
    ).join(ItemVenda, Produto.id == ItemVenda.produto_id
    ).join(Venda, ItemVenda.venda_id == Venda.id
    ).filter(
        func.date(Venda.criado_em) >= data_inicio,
        func.date(Venda.criado_em) <= data_fim,
        Venda.status == 'finalizada'
    ).group_by(Produto.id
    ).order_by(func.sum(ItemVenda.total).desc()
    ).limit(20).all()
    return render_template('relatorios/produtos_mais_vendidos.html',
                           resultados=resultados,
                           data_inicio=data_inicio,
                           data_fim=data_fim)
