# NeuroFocus - Pacote Completo (Quiz TDAH + QI com Paywall PIX)

Estrutura de diretórios:
- `/database/01_init_database.sql`: Script PostgreSQL com tabelas, 20 perguntas e laudos.
- `/frontend/index.html` e `app.js`: Aplicação web responsiva com efeito blur e polling automático.
- `/backend/`: Web API em .NET 8 (C#) integrada ao SDK oficial do Mercado Pago e Dapper.

## Configuração do backend

Copie `backend/appsettings.example.json` para `backend/appsettings.json` e preencha
a conexão PostgreSQL, o token do Mercado Pago e a URL pública do webhook.
O arquivo `appsettings.json` e as pastas de build ficam fora do Git.

Também é possível configurar os valores por variáveis de ambiente:
`ConnectionStrings__Postgres`, `MercadoPago__AccessToken` e
`MercadoPago__WebhookUrl`.
