# PDV_Mat – PDV para Gestão de Materiais de Construção

Sistema de Ponto de Venda (PDV) desenvolvido em Python/Flask para gestão de lojas de materiais de construção.

## Funcionalidades

- **Dashboard** com resumo do dia (vendas, total faturado, alertas de estoque)
- **Cadastro de Produtos** com categorias, unidades de medida, preço de custo/venda e controle de estoque
- **Cadastro de Clientes** com CPF/CNPJ, telefone, e-mail e endereço
- **PDV / Frente de Caixa** – interface interativa para lançamento de itens, descontos e finalização de vendas
- **Controle de Estoque** – débito automático ao finalizar e estorno ao cancelar
- **Relatórios**: Vendas por período, Posição de Estoque, Produtos Mais Vendidos

## Tecnologias

- Python 3.12 + Flask 3
- Flask-SQLAlchemy + SQLite
- Bootstrap 5 + Bootstrap Icons

## Como executar

```bash
# 1. Instale as dependências
pip install -r requirements.txt

# 2. Inicie o servidor
python run.py

# 3. Acesse no navegador
# http://localhost:5000
```

## Estrutura do Projeto

```
PDV_Mat/
├── run.py               # Ponto de entrada
├── requirements.txt
├── app/
│   ├── __init__.py      # create_app() + seed de categorias
│   ├── models.py        # Categoria, Produto, Cliente, Venda, ItemVenda
│   ├── routes/
│   │   ├── main.py      # Dashboard
│   │   ├── produtos.py  # CRUD de produtos + API de busca
│   │   ├── clientes.py  # CRUD de clientes
│   │   ├── vendas.py    # PDV: nova venda, itens, finalizar, cancelar
│   │   └── relatorios.py
│   └── templates/
│       ├── base.html
│       ├── index.html   # Dashboard
│       ├── produtos/
│       ├── clientes/
│       ├── vendas/
│       └── relatorios/
└── tests/
    └── test_pdv.py      # 19 testes unitários/integração
```

## Testes

```bash
python -m pytest tests/ -v
```
