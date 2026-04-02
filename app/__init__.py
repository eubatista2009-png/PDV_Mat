from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import os

db = SQLAlchemy()


def create_app(config=None):
    app = Flask(__name__)

    basedir = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
    app.config.setdefault('SECRET_KEY', 'pdv-mat-secret-key')
    app.config.setdefault('SQLALCHEMY_DATABASE_URI',
                          'sqlite:///' + os.path.join(basedir, 'pdv_mat.db'))
    app.config.setdefault('SQLALCHEMY_TRACK_MODIFICATIONS', False)

    if config:
        app.config.update(config)

    db.init_app(app)

    from app.routes import main, produtos, clientes, vendas, relatorios
    app.register_blueprint(main.bp)
    app.register_blueprint(produtos.bp)
    app.register_blueprint(clientes.bp)
    app.register_blueprint(vendas.bp)
    app.register_blueprint(relatorios.bp)

    with app.app_context():
        db.create_all()
        _seed_categorias()

    return app


def _seed_categorias():
    from app.models import Categoria
    if Categoria.query.count() == 0:
        categorias = [
            Categoria(nome='Cimento e Argamassa'),
            Categoria(nome='Tijolos e Blocos'),
            Categoria(nome='Telhas e Coberturas'),
            Categoria(nome='Pisos e Revestimentos'),
            Categoria(nome='Tintas e Vernizes'),
            Categoria(nome='Hidráulica'),
            Categoria(nome='Elétrica'),
            Categoria(nome='Ferragens e Fixação'),
            Categoria(nome='Madeiras e Compensados'),
            Categoria(nome='Ferramentas'),
        ]
        db.session.add_all(categorias)
        db.session.commit()
