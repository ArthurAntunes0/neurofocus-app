using Dapper;
using MercadoPago.Client.Payment;
using MercadoPago.Config;
using MercadoPago.Resource.Payment;
using Npgsql;

var builder = WebApplication.CreateBuilder(args);

// Libera CORS para o seu Front-end na Vercel conseguir chamar a API
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

var app = builder.Build();
app.UseCors("AllowAll");

string connString = builder.Configuration.GetConnectionString("Postgres")!;
MercadoPagoConfig.AccessToken = builder.Configuration["MercadoPago:AccessToken"];
string webhookUrl = builder.Configuration["MercadoPago:WebhookUrl"]!;

// ==========================================================
// ROTA 1: GERAR PIX E SALVAR SESSÃO (POST /api/quiz/gerar-pix)
// ==========================================================
app.MapPost("/api/quiz/gerar-pix", async (QuizSubmitDto dto) =>
{
    using var conn = new NpgsqlConnection(connString);
    
    // 1. Busca o gabarito correspondente à nota de TDAH
    var gabarito = await conn.QueryFirstOrDefaultAsync<dynamic>(
        @"SELECT TituloPerfil, ResumoCurto 
          FROM GabaritoResultados 
          WHERE @Score >= PontuacaoMinTDAH AND @Score <= PontuacaoMaxTDAH",
        new { Score = dto.ScoreTdah });

    if (gabarito == null) return Results.BadRequest("Faixa de pontuação inválida.");

    // 2. Cria a cobrança PIX de R$ 6,99 no Mercado Pago
    var paymentRequest = new PaymentCreateRequest
    {
        TransactionAmount = 6.99m,
        Description = "Relatorio Mapeamento Cognitivo NeuroFocus",
        PaymentMethodId = "pix",
        NotificationUrl = webhookUrl,
        Payer = new PaymentPayerRequest
        {
            Email = "cliente@neurofocus.com.br" // O Mercado Pago exige um e-mail padrão para gerar PIX
        }
    };

    var client = new PaymentClient();
    Payment payment = await client.CreateAsync(paymentRequest);

    string qrCodeBase64 = payment.PointOfInteraction?.TransactionData?.QrCodeBase64 ?? "";
    string pixCopiaCola = payment.PointOfInteraction?.TransactionData?.QrCode ?? "";

    // 3. Salva a sessão no banco como PENDENTE
    var tokenSessao = await conn.ExecuteScalarAsync<Guid>(
        @"INSERT INTO SessoesTeste (ScoreTDAH, ScoreQI, MercadoPagoPaymentId, StatusPagamento, QrCodeBase64, PixCopiaCola)
          VALUES (@ScoreTDAH, @ScoreQI, @MpId, 'PENDENTE', @QrBase64, @CopiaCola)
          RETURNING TokenSessao;",
        new
        {
            ScoreTDAH = dto.ScoreTdah,
            ScoreQI = dto.ScoreQi,
            MpId = payment.Id,
            QrBase64 = qrCodeBase64,
            CopiaCola = pixCopiaCola
        });

    return Results.Ok(new
    {
        tokenSessao,
        tituloPerfil = (string)gabarito.tituloperfil,
        resumoCurto = (string)gabarito.resumocurto,
        qrCodeBase64,
        pixCopiaCola
    });
});

// ==========================================================
// ROTA 2: CONSULTAR STATUS (GET /api/quiz/status/{token})
// ==========================================================
app.MapGet("/api/quiz/status/{token:guid}", async (Guid token) =>
{
    using var conn = new NpgsqlConnection(connString);

    var sessao = await conn.QueryFirstOrDefaultAsync<dynamic>(
        @"SELECT s.StatusPagamento, s.ScoreTDAH, s.ScoreQI, g.LaudoCompleto
          FROM SessoesTeste s
          JOIN GabaritoResultados g ON s.ScoreTDAH BETWEEN g.PontuacaoMinTDAH AND g.PontuacaoMaxTDAH
          WHERE s.TokenSessao = @Token",
        new { Token = token });

    if (sessao == null) return Results.NotFound();

    // Só devolve o LaudoCompleto e as notas se o PIX tiver sido APROVADO
    if ((string)sessao.statuspagamento == "APROVADO")
    {
        return Results.Ok(new
        {
            statusPagamento = "APROVADO",
            scoreTdah = (int)sessao.scoretdah,
            scoreQi = (int)sessao.scoreqi,
            laudoCompleto = (string)sessao.laudocompleto
        });
    }

    return Results.Ok(new { statusPagamento = "PENDENTE" });
});

// ==========================================================
// ROTA 3: WEBHOOK DO MERCADO PAGO (POST /api/quiz/webhook)
// ==========================================================
app.MapPost("/api/quiz/webhook", async (HttpRequest request) =>
{
    // O Mercado Pago envia o ID do pagamento via QueryString (data.id) ou no Body
    string? paymentIdStr = request.Query["data.id"].FirstOrDefault() ?? request.Query["id"].FirstOrDefault();

    if (long.TryParse(paymentIdStr, out long paymentId))
    {
        var client = new PaymentClient();
        Payment payment = await client.GetAsync(paymentId);

        if (payment.Status == "approved")
        {
            using var conn = new NpgsqlConnection(connString);
            await conn.ExecuteAsync(
                @"UPDATE SessoesTeste 
                  SET StatusPagamento = 'APROVADO', DataPagamento = CURRENT_TIMESTAMP 
                  WHERE MercadoPagoPaymentId = @MpId",
                new { MpId = paymentId });
        }
    }

    return Results.Ok();
});

app.Run();

public record QuizSubmitDto(int ScoreTdah, int ScoreQi);
