from flask import Blueprint, render_template
from app.models import Produto, Venda, Cliente
from app import db
from sqlalchemy import func
from datetime import date

bp = Blueprint('main', __name__)


@bp.route('/')
def index():
    hoje = date.today()
    vendas_hoje = Venda.query.filter(
        func.date(Venda.criado_em) == hoje,
        Venda.status == 'finalizada'
    ).all()
    total_hoje = sum(float(v.total) for v in vendas_hoje)
    qtd_vendas_hoje = len(vendas_hoje)
    total_produtos = Produto.query.filter_by(ativo=True).count()
    total_clientes = Cliente.query.filter_by(ativo=True).count()
    estoque_baixo = Produto.query.filter(
        Produto.ativo == True,
        Produto.estoque <= Produto.estoque_minimo
    ).count()
    ultimas_vendas = Venda.query.filter_by(status='finalizada').order_by(
        Venda.finalizado_em.desc()
    ).limit(5).all()
    return render_template('index.html',
                           total_hoje=total_hoje,
                           qtd_vendas_hoje=qtd_vendas_hoje,
                           total_produtos=total_produtos,
                           total_clientes=total_clientes,
                           estoque_baixo=estoque_baixo,
                           ultimas_vendas=ultimas_vendas)
