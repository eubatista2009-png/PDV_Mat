from datetime import datetime
from app import db


class Categoria(db.Model):
    __tablename__ = 'categorias'
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False, unique=True)
    produtos = db.relationship('Produto', backref='categoria', lazy=True)

    def __repr__(self):
        return f'<Categoria {self.nome}>'


class Produto(db.Model):
    __tablename__ = 'produtos'
    id = db.Column(db.Integer, primary_key=True)
    codigo = db.Column(db.String(50), unique=True, nullable=False)
    nome = db.Column(db.String(200), nullable=False)
    descricao = db.Column(db.Text)
    unidade = db.Column(db.String(20), nullable=False, default='UN')
    preco_custo = db.Column(db.Numeric(10, 2), nullable=False, default=0)
    preco_venda = db.Column(db.Numeric(10, 2), nullable=False, default=0)
    estoque = db.Column(db.Numeric(10, 3), nullable=False, default=0)
    estoque_minimo = db.Column(db.Numeric(10, 3), nullable=False, default=0)
    ativo = db.Column(db.Boolean, nullable=False, default=True)
    categoria_id = db.Column(db.Integer, db.ForeignKey('categorias.id'), nullable=False)
    criado_em = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    itens_venda = db.relationship('ItemVenda', backref='produto', lazy=True)

    def __repr__(self):
        return f'<Produto {self.codigo} - {self.nome}>'


class Cliente(db.Model):
    __tablename__ = 'clientes'
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(200), nullable=False)
    cpf_cnpj = db.Column(db.String(20), unique=True)
    telefone = db.Column(db.String(20))
    email = db.Column(db.String(150))
    endereco = db.Column(db.String(300))
    cidade = db.Column(db.String(100))
    ativo = db.Column(db.Boolean, nullable=False, default=True)
    criado_em = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    vendas = db.relationship('Venda', backref='cliente', lazy=True)

    def __repr__(self):
        return f'<Cliente {self.nome}>'


class Venda(db.Model):
    __tablename__ = 'vendas'
    id = db.Column(db.Integer, primary_key=True)
    numero = db.Column(db.String(20), unique=True, nullable=False)
    cliente_id = db.Column(db.Integer, db.ForeignKey('clientes.id'))
    status = db.Column(db.String(20), nullable=False, default='aberta')
    forma_pagamento = db.Column(db.String(30))
    subtotal = db.Column(db.Numeric(10, 2), nullable=False, default=0)
    desconto = db.Column(db.Numeric(10, 2), nullable=False, default=0)
    total = db.Column(db.Numeric(10, 2), nullable=False, default=0)
    observacao = db.Column(db.Text)
    criado_em = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    finalizado_em = db.Column(db.DateTime)
    itens = db.relationship('ItemVenda', backref='venda', lazy=True,
                            cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Venda {self.numero}>'

    def calcular_totais(self):
        self.subtotal = sum(item.total for item in self.itens)
        self.total = self.subtotal - (self.desconto or 0)


class ItemVenda(db.Model):
    __tablename__ = 'itens_venda'
    id = db.Column(db.Integer, primary_key=True)
    venda_id = db.Column(db.Integer, db.ForeignKey('vendas.id'), nullable=False)
    produto_id = db.Column(db.Integer, db.ForeignKey('produtos.id'), nullable=False)
    quantidade = db.Column(db.Numeric(10, 3), nullable=False)
    preco_unitario = db.Column(db.Numeric(10, 2), nullable=False)
    desconto = db.Column(db.Numeric(10, 2), nullable=False, default=0)
    total = db.Column(db.Numeric(10, 2), nullable=False)

    def __repr__(self):
        return f'<ItemVenda venda={self.venda_id} produto={self.produto_id}>'
