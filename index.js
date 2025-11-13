// index.js
import express from "express";
const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));

// armazenamento em memória
const empresas = []; // { cnpj, razao, fantasia, endereco, cidade, uf, cep, email, telefone, cadastradoEm }

// autenticação simples (flag)
let isLogged = false;
const USER = { username: "admin", password: "1234" };

// utilitário para escapar valores exibidos no HTML
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ROTAS
app.get("/", function (req, res) {
  res.send(`<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Home</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</head>
<body>
  <div class="container my-4">
    <nav class="navbar navbar-expand-lg navbar-light bg-light mb-4">
      <div class="container-fluid">
        <a class="navbar-brand" href="/">MeuSistema</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navMenu">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item"><a class="nav-link" href="/">Home</a></li>
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">Cadastros</a>
              <ul class="dropdown-menu">
                <li><a class="dropdown-item" href="/cadastros/fornecedor">Fornecedor</a></li>
                <li><a class="dropdown-item" href="/cadastros/cliente">Cliente</a></li>
              </ul>
            </li>
          </ul>
          <div class="d-flex">
            ${
              isLogged
                ? '<a class="btn btn-outline-danger" href="/logout">Logout</a>'
                : '<a class="btn btn-outline-primary" href="/login">Login</a>'
            }
          </div>
        </div>
      </div>
    </nav>

    <div class="card p-3">
      <h2>Home</h2>
      <p>Exemplo simples de sistema com cadastro de fornecedores. Use o menu para navegar.</p>
      <ul>
        <li>Cadastros → Fornecedor: formulário de cadastro (validação no servidor).</li>
        <li>Login / Logout: autenticação simples.</li>
      </ul>
    </div>
  </div>
</body>
</html>`);
});

app.get("/cadastros", function (req, res) {
  res.send(`<!doctype html>
<html><head>
  <meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Cadastros</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</head><body>
  <div class="container my-4">
    <nav class="navbar navbar-expand-lg navbar-light bg-light mb-4">
      <div class="container-fluid">
        <a class="navbar-brand" href="/">MeuSistema</a>
        <div class="d-flex">${
          isLogged
            ? '<a class="btn btn-outline-danger" href="/logout">Logout</a>'
            : '<a class="btn btn-outline-primary" href="/login">Login</a>'
        }</div>
      </div>
    </nav>
    <h2>Cadastros</h2>
    <p>Escolha um cadastro no menu.</p>
  </div>
</body></html>`);
});

app.get("/cadastros/cliente", function (req, res) {
  res.send(`<!doctype html>
<html><head>
  <meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Cliente</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</head><body>
  <div class="container my-4">
    <nav class="navbar navbar-expand-lg navbar-light bg-light mb-4">
      <div class="container-fluid">
        <a class="navbar-brand" href="/">MeuSistema</a>
        <div class="d-flex">${
          isLogged
            ? '<a class="btn btn-outline-danger" href="/logout">Logout</a>'
            : '<a class="btn btn-outline-primary" href="/login">Login</a>'
        }</div>
      </div>
    </nav>
    <h2>Cadastro - Cliente</h2>
    <p>Placeholder para cadastro de cliente.</p>
  </div>
</body></html>`);
});

// PÁGINA DE CADASTRO
app.get("/cadastros/fornecedor", function (req, res) {
  // valores vazios ao abrir
  var values = {
    cnpj: "",
    razao: "",
    fantasia: "",
    endereco: "",
    cidade: "",
    uf: "",
    cep: "",
    email: "",
    telefone: "",
  };
  var errors = {};
  // montar HTML direto
  var html =
    `<!doctype html>
<html><head>
  <meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Cadastro de Fornecedor</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</head><body>
  <div class="container my-4">
    <nav class="navbar navbar-expand-lg navbar-light bg-light mb-4"><div class="container-fluid">
      <a class="navbar-brand" href="/">MeuSistema</a>
      <div class="d-flex">` +
    (isLogged
      ? '<a class="btn btn-outline-danger" href="/logout">Logout</a>'
      : '<a class="btn btn-outline-primary" href="/login">Login</a>') +
    `</div></div></nav>

    <h2>Cadastro de Fornecedor</h2>

    <form method="POST" action="/cadastros/fornecedor" class="card p-3 mb-3">
      <div class="mb-3"><label class="form-label">CNPJ</label><input name="cnpj" class="form-control" value="` +
    escapeHtml(values["cnpj"]) +
    `" /></div>
      <div class="mb-3"><label class="form-label">Razão Social / Nome do Fornecedor</label><input name="razao" class="form-control" value="` +
    escapeHtml(values["razao"]) +
    `" /></div>
      <div class="mb-3"><label class="form-label">Nome Fantasia</label><input name="fantasia" class="form-control" value="` +
    escapeHtml(values["fantasia"]) +
    `" /></div>
      <div class="mb-3"><label class="form-label">Endereço</label><input name="endereco" class="form-control" value="` +
    escapeHtml(values["endereco"]) +
    `" /></div>

      <div class="row">
        <div class="col-md-6 mb-3"><label class="form-label">Cidade</label><input name="cidade" class="form-control" value="` +
    escapeHtml(values["cidade"]) +
    `" /></div>
        <div class="col-md-3 mb-3"><label class="form-label">UF</label><input name="uf" class="form-control" value="` +
    escapeHtml(values["uf"]) +
    `" /></div>
        <div class="col-md-3 mb-3"><label class="form-label">CEP</label><input name="cep" class="form-control" value="` +
    escapeHtml(values["cep"]) +
    `" /></div>
      </div>

      <div class="mb-3"><label class="form-label">Email</label><input name="email" class="form-control" value="` +
    escapeHtml(values["email"]) +
    `" /></div>
      <div class="mb-3"><label class="form-label">Telefone</label><input name="telefone" class="form-control" value="` +
    escapeHtml(values["telefone"]) +
    `" /></div>

      <button class="btn btn-primary" type="submit">Cadastrar</button>
      <a class="btn btn-secondary ms-2" href="/cadastros/fornecedor/lista">Ver cadastrados</a>
    </form>

    <div class="card p-3"><small class="text-muted">Clique em "Ver cadastrados" para abrir a lista completa em outra página.</small></div>
  </div>
</body></html>`;

  res.send(html);
});

// POST do formulário
app.post("/cadastros/fornecedor", function (req, res) {
  var body = req.body || {};
  var fields = [
    "cnpj",
    "razao",
    "fantasia",
    "endereco",
    "cidade",
    "uf",
    "cep",
    "email",
    "telefone",
  ];
  var values = {};
  var errors = {};
  var temErros = false; // marca direto durante a validação

  // preencher values e validar vazio
  for (var i = 0; i < fields.length; i++) {
    var f = fields[i];
    var val = (body[f] || "").trim();
    values[f] = val;
    if (!val) {
      errors[f] = "Campo obrigatório";
      temErros = true; // já marca aqui, sem necessidade de loop extra
    }
  }

  if (temErros) {
    function mostrarErro(nomeCampo) {
      if (errors[nomeCampo]) {
        return (
          '<div class="text-danger small mt-1">' + escapeHtml(errors[nomeCampo]) + "</div>"
        );
      }
      return "";
    }

    var html = `
  <!doctype html>
  <html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Cadastro de Fornecedor - Erros</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
  </head>
  <body>
    <div class="container my-4">
      <h2>Cadastro de Fornecedor</h2>
      <div class="alert alert-warning">Por favor, corrija os campos obrigatórios.</div>

      <form method="POST" action="/cadastros/fornecedor" class="card p-3 mb-3">

        <div class="mb-3">
          <label class="form-label">CNPJ</label>
          <input name="cnpj" class="form-control" value="${escapeHtml(values.cnpj || "")}">
          ${mostrarErro("cnpj")}
        </div>

        <div class="mb-3">
          <label class="form-label">Razão Social / Nome do Fornecedor</label>
          <input name="razao" class="form-control" value="${escapeHtml(values.razao || "")}">
          ${mostrarErro("razao")}
        </div>

        <div class="mb-3">
          <label class="form-label">Nome Fantasia</label>
          <input name="fantasia" class="form-control" value="${escapeHtml(values.fantasia || "")}">
          ${mostrarErro("fantasia")}
        </div>

        <div class="mb-3">
          <label class="form-label">Endereço</label>
          <input name="endereco" class="form-control" value="${escapeHtml(values.endereco || "")}">
          ${mostrarErro("endereco")}
        </div>

        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Cidade</label>
            <input name="cidade" class="form-control" value="${escapeHtml(values.cidade || "")}">
            ${mostrarErro("cidade")}
          </div>
          <div class="col-md-3 mb-3">
            <label class="form-label">UF</label>
            <input name="uf" class="form-control" value="${escapeHtml(values.uf || "")}">
            ${mostrarErro("uf")}
          </div>
          <div class="col-md-3 mb-3">
            <label class="form-label">CEP</label>
            <input name="cep" class="form-control" value="${escapeHtml(values.cep || "")}">
            ${mostrarErro("cep")}
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Email</label>
          <input name="email" class="form-control" value="${escapeHtml(values.email || "")}">
          ${mostrarErro("email")}
        </div>

        <div class="mb-3">
          <label class="form-label">Telefone</label>
          <input name="telefone" class="form-control" value="${escapeHtml(values.telefone || "")}">
          ${mostrarErro("telefone")}
        </div>

        <button class="btn btn-primary" type="submit">Cadastrar</button>
        <a class="btn btn-secondary ms-2" href="/cadastros/fornecedor/lista">Ver cadastrados</a>
      </form>
    </div>
  </body>
  </html>
  `;

    res.send(html);
    return;
  }

  // sem erros: salvar
  empresas.push({
    cnpj: values["cnpj"],
    razao: values["razao"],
    fantasia: values["fantasia"],
    endereco: values["endereco"],
    cidade: values["cidade"],
    uf: values["uf"],
    cep: values["cep"],
    email: values["email"],
    telefone: values["telefone"],
    cadastradoEm: new Date().toISOString(),
  });

  // após salvar, mostrar formulário limpo + mensagem de sucesso
  var htmlSuccess =
    `<!doctype html>
<html><head>
  <meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Cadastro de Fornecedor - Sucesso</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</head><body>
  <div class="container my-4">
    <nav class="navbar navbar-expand-lg navbar-light bg-light mb-4"><div class="container-fluid">
      <a class="navbar-brand" href="/">MeuSistema</a>
      <div class="d-flex">` +
    (isLogged
      ? '<a class="btn btn-outline-danger" href="/logout">Logout</a>'
      : '<a class="btn btn-outline-primary" href="/login">Login</a>') +
    `</div></div></nav>

    <h2>Cadastro de Fornecedor</h2>

    <div class="alert alert-success">Fornecedor cadastrado com sucesso!</div>

    <form method="POST" action="/cadastros/fornecedor" class="card p-3 mb-3">
      <div class="mb-3"><label class="form-label">CNPJ</label><input name="cnpj" class="form-control" value="" /></div>
      <div class="mb-3"><label class="form-label">Razão Social / Nome do Fornecedor</label><input name="razao" class="form-control" value="" /></div>
      <div class="mb-3"><label class="form-label">Nome Fantasia</label><input name="fantasia" class="form-control" value="" /></div>
      <div class="mb-3"><label class="form-label">Endereço</label><input name="endereco" class="form-control" value="" /></div>

      <div class="row">
        <div class="col-md-6 mb-3"><label class="form-label">Cidade</label><input name="cidade" class="form-control" value="" /></div>
        <div class="col-md-3 mb-3"><label class="form-label">UF</label><input name="uf" class="form-control" value="" /></div>
        <div class="col-md-3 mb-3"><label class="form-label">CEP</label><input name="cep" class="form-control" value="" /></div>
      </div>

      <div class="mb-3"><label class="form-label">Email</label><input name="email" class="form-control" value="" /></div>
      <div class="mb-3"><label class="form-label">Telefone</label><input name="telefone" class="form-control" value="" /></div>

      <button class="btn btn-primary" type="submit">Cadastrar</button>
      <a class="btn btn-secondary ms-2" href="/cadastros/fornecedor/lista">Ver cadastrados</a>
    </form>
  </div>
</body></html>`;

  res.send(htmlSuccess);
});

// Págima de cadastrados
app.get("/cadastros/fornecedor/lista", function (req, res) {
  // montar linhas da tabela
  var linhas = "";
  if (empresas.length === 0) {
    linhas =
      '<tr><td colspan="6" class="text-center">Nenhuma empresa cadastrada ainda.</td></tr>';
  } else {
    for (var i = empresas.length - 1; i >= 0; i--) {
      var it = empresas[i];
      linhas +=
        "<tr>" +
        "<td>" +
        escapeHtml(it.cnpj) +
        "</td>" +
        "<td>" +
        escapeHtml(it.razao) +
        "</td>" +
        "<td>" +
        escapeHtml(it.fantasia) +
        "</td>" +
        "<td>" +
        escapeHtml(it.cidade) +
        " / " +
        escapeHtml(it.uf) +
        "</td>" +
        "<td>" +
        escapeHtml(it.email) +
        "<br>" +
        escapeHtml(it.telefone) +
        "</td>" +
        "<td>" +
        escapeHtml(it.cep) +
        "</td>" +
        "</tr>";
    }
  }

  var html =
    `<!doctype html>
<html><head>
  <meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Lista de Fornecedores</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</head><body>
  <div class="container my-4">
    <nav class="navbar navbar-expand-lg navbar-light bg-light mb-4"><div class="container-fluid">
      <a class="navbar-brand" href="/">MeuSistema</a>
      <div class="d-flex">` +
    (isLogged
      ? '<a class="btn btn-outline-danger" href="/logout">Logout</a>'
      : '<a class="btn btn-outline-primary" href="/login">Login</a>') +
    `</div></div></nav>

    <h2>Fornecedores Cadastrados</h2>

    <div class="card p-3 mb-3">
      <div class="table-responsive">
        <table class="table table-sm table-bordered">
          <thead class="table-light"><tr><th>CNPJ</th><th>Razão</th><th>Fantasia</th><th>Cidade/UF</th><th>Contato</th><th>CEP</th></tr></thead>
          <tbody>` +
    linhas +
    `</tbody>
        </table>
      </div>

      <a class="btn btn-secondary" href="/cadastros/fornecedor">Voltar para cadastro</a>
    </div>
  </div>
</body></html>`;

  res.send(html);
});

// login/logout
app.get("/login", function (req, res) {
  if (isLogged) {
    res.send(`<!doctype html><html><head>
      <meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" />
      <title>Login</title>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    </head><body>
      <div class="container my-4">
        <nav class="navbar navbar-light bg-light mb-4"><div class="container-fluid"><a class="navbar-brand" href="/">MeuSistema</a></div></nav>
        <div class="alert alert-info">Você já está logado. Use <a href="/logout">Logout</a> para sair.</div>
      </div>
    </body></html>`);
    return;
  }

  res.send(`<!doctype html>
<html><head>
  <meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Login</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</head><body>
  <div class="container my-4">
    <nav class="navbar navbar-light bg-light mb-4"><div class="container-fluid"><a class="navbar-brand" href="/">MeuSistema</a></div></nav>
    <h2>Login</h2>
    <form method="POST" action="/login" class="card p-3" style="max-width:480px">
      <div class="mb-3"><label class="form-label">Usuário</label><input name="username" class="form-control" /></div>
      <div class="mb-3"><label class="form-label">Senha</label><input name="password" type="password" class="form-control" /></div>
      <button class="btn btn-primary" type="submit">Entrar</button>
    </form>
  </div>
</body></html>`);
});

app.post("/login", function (req, res) {
  var username = req.body && req.body.username ? req.body.username : "";
  var password = req.body && req.body.password ? req.body.password : "";

  if (username === USER.username && password === USER.password) {
    isLogged = true;
    res.send(`<!doctype html><html><head>
      <meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" />
      <title>Login</title>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    </head><body>
      <div class="container my-4">
        <nav class="navbar navbar-light bg-light mb-4"><div class="container-fluid"><a class="navbar-brand" href="/">MeuSistema</a></div></nav>
        <div class="alert alert-success">Login efetuado com sucesso! <a href="/">Ir para Home</a></div>
      </div>
    </body></html>`);
  } else {
    res.send(
      `<!doctype html><html><head>
      <meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" />
      <title>Login - Falha</title>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    </head><body>
      <div class="container my-4">
        <nav class="navbar navbar-light bg-light mb-4"><div class="container-fluid"><a class="navbar-brand" href="/">MeuSistema</a></div></nav>
        <div class="alert alert-danger">Usuário ou senha inválidos.</div>
        <form method="POST" action="/login" class="card p-3" style="max-width:480px">
          <div class="mb-3"><label class="form-label">Usuário</label><input name="username" class="form-control" value="` +
        escapeHtml(username) +
        `" /></div>
          <div class="mb-3"><label class="form-label">Senha</label><input name="password" type="password" class="form-control" /></div>
          <button class="btn btn-primary" type="submit">Entrar</button>
        </form>
      </div>
    </body></html>`
    );
  }
});

app.get("/logout", function (req, res) {
  isLogged = false;
  res.send(`<!doctype html><html><head>
    <meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Logout</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
  </head><body>
    <div class="container my-4">
      <nav class="navbar navbar-light bg-light mb-4"><div class="container-fluid"><a class="navbar-brand" href="/">MeuSistema</a></div></nav>
      <div class="alert alert-success">Logout efetuado com sucesso! <a href="/">Voltar</a></div>
    </div>
  </body></html>`);
});

app.listen(port, function () {
  console.log("Servidor rodando em http://localhost:" + port);
});
