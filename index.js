import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";

const port = Number(process.env.PORT) || 3000;
const isProd =
  process.env.VERCEL === "1" || process.env.NODE_ENV === "production";

const app = express();
app.set("trust proxy", 1);

const listaProdutos = [];

app.use(
  session({
    secret: process.env.SESSION_SECRET || "M1nh4Ch4v3S3cr3t4",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProd,
      httpOnly: true,
      maxAge: 1000 * 60 * 15,
      sameSite: "lax",
    },
  }),
);

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

function escapeHtml(value) {
  if (value == null) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;");
}

function respostaPrecisaLogin(resposta) {
  resposta.setHeader("Content-Type", "text/html; charset=utf-8");
  resposta.end(`<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Login necessário</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-sRIl4kxILFvY47J16cr9ZwB07vP4J8+LH7qKQnuqkuIAvNWLzeN8tE5YBujZqJLB" crossorigin="anonymous">
</head>
<body class="bg-body-tertiary">
  <div class="container mt-5 col-lg-6">
    <div class="alert alert-warning shadow-sm">
      <h4 class="alert-heading">Acesso ao cadastro de produtos</h4>
      <p class="mb-0">Você precisa realizar o login no sistema para acessar o formulário de cadastro de produtos.</p>
    </div>
    <a class="btn btn-primary" href="/login">Ir para o login</a>
  </div>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js" integrity="sha384-FKyoEForCGlyvwx9Hj09JcYn3nv7wiPVlz7YYwJrWVcXK/BmnVDxM+D2scQbITxI" crossorigin="anonymous"></script>
</body>
</html>`);
}

const bootstrapCssLink = `<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-sRIl4kxILFvY47J16cr9ZwB07vP4J8+LH7qKQnuqkuIAvNWLzeN8tE5YBujZqJLB" crossorigin="anonymous">`;
const bootstrapJsBundle = `<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js" integrity="sha384-FKyoEForCGlyvwx9Hj09JcYn3nv7wiPVlz7YYwJrWVcXK/BmnVDxM+D2scQbITxI" crossorigin="anonymous"></script>`;

function cssNavbarApp() {
  return `<style>
                  .navbar-app { background-color: #1a5c38 !important; min-height: 3.5rem; }
                  .navbar-app .navbar-collapse { align-items: center !important; }
                  .navbar-app .navbar-nav { align-items: center; }
                  .navbar-app .nav-link { padding-top: 0.5rem; padding-bottom: 0.5rem; }
                </style>`;
}

function cssBtnAppVerde() {
  return `<style>
    .btn-app-verde {
      --bs-btn-bg: #1a5c38;
      --bs-btn-border-color: #1a5c38;
      --bs-btn-hover-bg: #154a2e;
      --bs-btn-hover-border-color: #123d28;
      --bs-btn-active-bg: #123d28;
      --bs-btn-active-border-color: #0f3522;
      --bs-btn-color: #fff;
      --bs-btn-hover-color: #fff;
      --bs-btn-active-color: #fff;
      --bs-btn-focus-shadow-rgb: 26, 92, 56;
    }
    a.btn-app-verde {
      text-decoration: none;
      background-color: #1a5c38 !important;
      border: 1px solid #1a5c38 !important;
      color: #fff !important;
    }
    a.btn-app-verde:hover {
      background-color: #154a2e !important;
      border-color: #123d28 !important;
      color: #fff !important;
    }
  </style>`;
}

function htmlNavbarApp(requisicao) {
  const nomeExibir = escapeHtml(
    requisicao.session?.nomeUsuario || "Usuário",
  );
  return `
            <nav class="navbar navbar-expand-lg navbar-dark navbar-app py-2">
                <div class="container-fluid d-flex flex-wrap align-items-center">
                    <a class="navbar-brand mb-0 align-middle" href="/" title="Início">${nomeExibir}</a>
                    <button class="navbar-toggler align-self-center" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Alternar menu">
                      <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse d-lg-flex flex-lg-grow-1 align-items-lg-center" id="navbarSupportedContent">
                    <div class="d-flex flex-column flex-lg-row align-items-center justify-content-lg-between w-100 flex-lg-grow-1 gap-2 py-lg-1">
                    <ul class="navbar-nav mb-2 mb-lg-0 align-items-center">
                        <li class="nav-item">
                            <a class="nav-link text-nowrap" href="/produto">Cadastrar produto</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link text-nowrap" href="/listaProdutos">Listar produtos</a>
                        </li>
                    </ul>
                    <ul class="navbar-nav mb-2 mb-lg-0 align-items-center ms-lg-auto">
                        <li class="nav-item">
                            <a class="nav-link text-nowrap" href="/logout">Sair</a>
                        </li>
                    </ul>
                    </div>
                    </div>
                </div>
                </nav>`;
}

app.get("/", estaAutenticado, (req, res) => {
  res.write(`
        <html lang="pt-br">
            <head>
                <meta charset="UTF-8">
                <title>Menu do sistema</title>
                ${bootstrapCssLink}
                ${cssNavbarApp()}
            </head>
            <body>`);
  res.write(htmlNavbarApp(req));

  res.write(`
            ${bootstrapJsBundle}
        </body>
        </html>`);

  res.end();
});

app.get("/produto", (requisicao, resposta) => {
  if (!requisicao.session?.logado) {
    return respostaPrecisaLogin(resposta);
  }

  resposta.write(`
      <html lang="pt-br">
        <head>
          <meta charset="UTF-8">
            <title>Cadastro de produtos</title>
              ${bootstrapCssLink}
              ${cssNavbarApp()}
              ${cssBtnAppVerde()}
              <style>.form-cadastro-produto .alert.alert-danger{margin-top:12px}</style>
        </head>
        <body>
          ${htmlNavbarApp(requisicao)}
          <div class="container mt-4">
            <form method="POST" action="/produto" class="form-cadastro-produto row gy-2 gx-3 align-items-center border p-3">
              <legend>
                <h3>Cadastro de produtos</h3>
              </legend>

                <div class="row mb-2">
                  <label class="form-label" for="codigoBarras">Código de barras</label>
                  <input class="form-control" type="text" id="codigoBarras" name="codigoBarras" placeholder="7891234567890">
                </div>
                <div class="row mb-2">
                  <label class="form-label" for="descricao">Descrição do produto</label>
                  <input class="form-control" type="text" id="descricao" name="descricao" placeholder="Descrição">
                </div>
                <div class="row mb-2">
                  <label class="form-label" for="precoCusto">Preço de custo</label>
                  <input class="form-control" type="text" id="precoCusto" name="precoCusto" placeholder="0,00">
                </div>
                <div class="row mb-2">
                  <label class="form-label" for="precoVenda">Preço de venda</label>
                  <input class="form-control" type="text" id="precoVenda" name="precoVenda" placeholder="0,00">
                </div>
                <div class="row mb-2">
                  <label class="form-label" for="dataValidade">Data de validade</label>
                  <input class="form-control" type="date" id="dataValidade" name="dataValidade">
                </div>
                <div class="row mb-2">
                  <label class="form-label" for="qtdEstoque">Qtd em estoque</label>
                  <input class="form-control" type="text" id="qtdEstoque" name="qtdEstoque" placeholder="0">
                </div>
                <div class="row mb-2">
                  <label class="form-label" for="nomeFabricante">Nome do fabricante</label>
                  <input class="form-control" type="text" id="nomeFabricante" name="nomeFabricante" placeholder="Fabricante">
                </div>

      <div class="row">
          <button type="submit" class="btn btn-app-verde">Cadastrar produto</button>
      </div>
      </form>
      </div>
          ${bootstrapJsBundle}
        </body>
       </html>
    `);
  resposta.end();
});

app.post("/produto", (requisicao, resposta) => {
  if (!requisicao.session?.logado) {
    return respostaPrecisaLogin(resposta);
  }

  const codigoBarras = requisicao.body.codigoBarras;
  const descricao = requisicao.body.descricao;
  const precoCusto = requisicao.body.precoCusto;
  const precoVenda = requisicao.body.precoVenda;
  const dataValidade = requisicao.body.dataValidade;
  const qtdEstoque = requisicao.body.qtdEstoque;
  const nomeFabricante = requisicao.body.nomeFabricante;

  if (
    !codigoBarras ||
    !descricao ||
    !precoCusto ||
    !precoVenda ||
    !dataValidade ||
    !qtdEstoque ||
    !nomeFabricante
  ) {
    const v = {
      codigoBarras: escapeHtml(codigoBarras),
      descricao: escapeHtml(descricao),
      precoCusto: escapeHtml(precoCusto),
      precoVenda: escapeHtml(precoVenda),
      dataValidade: escapeHtml(dataValidade),
      qtdEstoque: escapeHtml(qtdEstoque),
      nomeFabricante: escapeHtml(nomeFabricante),
    };

    let html = `
        <html lang="pt-br">
            <head>
                <meta charset="UTF-8">
                <title>Cadastro de produtos</title>
                ${bootstrapCssLink}
                ${cssNavbarApp()}
                ${cssBtnAppVerde()}
                <style>.form-cadastro-produto .alert.alert-danger{margin-top:12px}</style>
            </head>
            <body>
                ${htmlNavbarApp(requisicao)}
                <div class="container mt-4">
                    <form method="POST" action="/produto" class="form-cadastro-produto row gy-2 gx-3 align-items-center border p-3">
                        <legend>
                            <h3>Cadastro de produtos</h3>
                        </legend>

                        <div class="row mb-2">
                            <label class="form-label" for="codigoBarras">Código de barras</label>
                            <input type="text" class="form-control" id="codigoBarras" name="codigoBarras" value="${v.codigoBarras}"> `;
    if (!codigoBarras) {
      html += `
                              <div class="alert alert-danger" role="alert">
                                Informe o código de barras.
                              </div>
                            `;
    }
    html += `
                        </div>
                        <div class="row mb-2">
                            <label class="form-label" for="descricao">Descrição do produto</label>
                            <input type="text" class="form-control" id="descricao" name="descricao" value="${v.descricao}">`;
    if (!descricao) {
      html += `
                            <div class="alert alert-danger" role="alert">
                                Informe a descrição do produto.
                            </div>
                            `;
    }
    html += `
                        </div>
                        <div class="row mb-2">
                            <label class="form-label" for="precoCusto">Preço de custo</label>
                            <input type="text" class="form-control" id="precoCusto" name="precoCusto" value="${v.precoCusto}">`;
    if (!precoCusto) {
      html += `
                                <div class="alert alert-danger" role="alert">
                                Informe o preço de custo.
                            </div>
                            `;
    }
    html += `
                        </div>
                        <div class="row mb-2">
                            <label class="form-label" for="precoVenda">Preço de venda</label>
                            <input type="text" class="form-control" id="precoVenda" name="precoVenda" value="${v.precoVenda}">`;
    if (!precoVenda) {
      html += `
                                <div class="alert alert-danger" role="alert">
                                Informe o preço de venda.
                            </div>
                            `;
    }
    html += `
                        </div>
                        <div class="row mb-2">
                            <label class="form-label" for="dataValidade">Data de validade</label>
                            <input type="date" class="form-control" id="dataValidade" name="dataValidade" value="${v.dataValidade}">`;
    if (!dataValidade) {
      html += `
                                <div class="alert alert-danger" role="alert">
                                Informe a data de validade.
                            </div>
                            `;
    }
    html += `
                        </div>
                        <div class="row mb-2">
                            <label class="form-label" for="qtdEstoque">Qtd em estoque</label>
                            <input type="text" class="form-control" id="qtdEstoque" name="qtdEstoque" value="${v.qtdEstoque}">`;
    if (!qtdEstoque) {
      html += `
                                <div class="alert alert-danger" role="alert">
                                Informe a quantidade em estoque.
                            </div>
                            `;
    }
    html += `
                        </div>
                        <div class="row mb-2">
                            <label class="form-label" for="nomeFabricante">Nome do fabricante</label>
                            <input type="text" class="form-control" id="nomeFabricante" name="nomeFabricante" value="${v.nomeFabricante}">`;
    if (!nomeFabricante) {
      html += `
                                <div class="alert alert-danger" role="alert">
                                Informe o nome do fabricante.
                            </div>
                            `;
    }
    html += `

                        </div>

                        <div class="row">
                            <button type="submit" class="btn btn-app-verde">Cadastrar produto</button>
                        </div>
                    </form>
                </div>
                ${bootstrapJsBundle}
            </body>
        </html>`;

    resposta.write(html);
    resposta.end();
  } else {
    listaProdutos.push({
      codigoBarras,
      descricao,
      precoCusto,
      precoVenda,
      dataValidade,
      qtdEstoque,
      nomeFabricante,
    });

    resposta.redirect("/listaProdutos");
  }
});

app.get("/listaProdutos", estaAutenticado, (requisicao, resposta) => {
  const ultimoAcesso =
    requisicao.cookies?.ultimoAcesso || "Nunca acessou (cookie)";

  resposta.write(`
        <html lang="pt-br">
            <head>
                <meta charset="UTF-8">
                <title>Produtos cadastrados</title>
                ${bootstrapCssLink}
                ${cssNavbarApp()}
                ${cssBtnAppVerde()}
            </head>
            <body>
                ${htmlNavbarApp(requisicao)}
                <div class="container mt-4">
                    <p class="text-body-secondary mb-3"><strong>Último acesso ao sistema (cookie):</strong> ${escapeHtml(ultimoAcesso)}</p>
                    <table class="table table-striped table-hover">
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Código de barras</th>
                                <th scope="col">Descrição</th>
                                <th scope="col">Preço custo</th>
                                <th scope="col">Preço venda</th>
                                <th scope="col">Validade</th>
                                <th scope="col">Estoque</th>
                                <th scope="col">Fabricante</th>
                            </tr>
                        </thead>
                        <tbody>
    `);
  for (let i = 0; i < listaProdutos.length; i++) {
    const p = listaProdutos[i];
    resposta.write(`
            <tr>
                <td>${i + 1}</td>
                <td>${escapeHtml(p.codigoBarras)}</td>
                <td>${escapeHtml(p.descricao)}</td>
                <td>${escapeHtml(p.precoCusto)}</td>
                <td>${escapeHtml(p.precoVenda)}</td>
                <td>${escapeHtml(p.dataValidade)}</td>
                <td>${escapeHtml(p.qtdEstoque)}</td>
                <td>${escapeHtml(p.nomeFabricante)}</td>
            </tr>
        `);
  }
  resposta.write(`    </tbody>
                    </table>
                    <a href="/produto" class="btn btn-app-verde">Continuar cadastrando...</a>
                </div>
                ${bootstrapJsBundle}
            </body>
        </html>`);

  resposta.end();
});

app.get("/login", (requisicao, resposta) => {
  const ultimoAcesso = requisicao.cookies?.ultimoAcesso || "Nunca acessou";

  resposta.write(`
        <!DOCTYPE html>
        <html lang="pt-br" data-bs-theme="auto">
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <meta name="description" content="">
                <meta name="author" content="Mark Otto, Jacob Thornton, and Bootstrap contributors">
                <meta name="generator" content="Astro v5.13.2">
                <title>
                    Página de Login
                </title>
                <link rel="canonical" href="https://getbootstrap.com/docs/5.3/examples/sign-in/">
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-sRIl4kxILFvY47J16cr9ZwB07vP4J8+LH7qKQnuqkuIAvNWLzeN8tE5YBujZqJLB" crossorigin="anonymous">
                <style>
                    .bd-placeholder-img{font-size:1.125rem;text-anchor:middle;-webkit-user-select:none;-moz-user-select:none;user-select:none}@media (min-width: 768px){.bd-placeholder-img-lg{font-size:3.5rem}}.b-example-divider{width:100%;height:3rem;background-color:#0000001a;border:solid rgba(0,0,0,.15);border-width:1px 0;box-shadow:inset 0 .5em 1.5em #0000001a,inset 0 .125em .5em #00000026}.b-example-vr{flex-shrink:0;width:1.5rem;height:100vh}.bi{vertical-align:-.125em;fill:currentColor}.nav-scroller{position:relative;z-index:2;height:2.75rem;overflow-y:hidden}.nav-scroller .nav{display:flex;flex-wrap:nowrap;padding-bottom:1rem;margin-top:-1px;overflow-x:auto;text-align:center;white-space:nowrap;-webkit-overflow-scrolling:touch}.btn-bd-primary{--bd-violet-bg: #712cf9;--bd-violet-rgb: 112.520718, 44.062154, 249.437846;--bs-btn-font-weight: 600;--bs-btn-color: var(--bs-white);--bs-btn-bg: var(--bd-violet-bg);--bs-btn-border-color: var(--bd-violet-bg);--bs-btn-hover-color: var(--bs-white);--bs-btn-hover-bg: #6528e0;--bs-btn-hover-border-color: #6528e0;--bs-btn-focus-shadow-rgb: var(--bd-violet-rgb);--bs-btn-active-color: var(--bs-btn-hover-color);--bs-btn-active-bg: #5a23c8;--bs-btn-active-border-color: #5a23c8}.bd-mode-toggle{z-index:1500}.bd-mode-toggle .bi{width:1em;height:1em}.bd-mode-toggle .dropdown-menu .active .bi{display:block!important}.btn-login-app{--bs-btn-bg:#1a5c38;--bs-btn-border-color:#1a5c38;--bs-btn-hover-bg:#154a2e;--bs-btn-hover-border-color:#123d28;--bs-btn-active-bg:#123d28;--bs-btn-active-border-color:#0f3522;--bs-btn-color:#fff;--bs-btn-hover-color:#fff;--bs-btn-active-color:#fff;--bs-btn-focus-shadow-rgb:26,92,56}
                </style>
            </head>
            <body class="d-flex align-items-center py-4 bg-body-tertiary">
                <div class="container w-50">
                    <svg xmlns="http://www.w3.org/2000/svg" class="d-none"> <symbol id="check2" viewBox="0 0 16 16"> <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"></path> </symbol> <symbol id="circle-half" viewBox="0 0 16 16"> <path d="M8 15A7 7 0 1 0 8 1v14zm0 1A8 8 0 1 1 8 0a8 8 0 0 1 0 16z"></path> </symbol> <symbol id="moon-stars-fill" viewBox="0 0 16 16"> <path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278z"></path> <path d="M10.794 3.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387a1.734 1.734 0 0 0-1.097 1.097l-.387 1.162a.217.217 0 0 1-.412 0l-.387-1.162A1.734 1.734 0 0 0 9.31 6.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387a1.734 1.734 0 0 0 1.097-1.097l.387-1.162zM13.863.099a.145.145 0 0 1 .274 0l.258.774c.115.346.386.617.732.732l.774.258a.145.145 0 0 1 0 .274l-.774.258a1.156 1.156 0 0 0-.732.732l-.258.774a.145.145 0 0 1-.274 0l-.258-.774a1.156 1.156 0 0 0-.732-.732l-.774-.258a.145.145 0 0 1 0-.274l.774-.258c.346-.115.617-.386.732-.732L13.863.1z"></path> </symbol> <symbol id="sun-fill" viewBox="0 0 16 16"> <path d="M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"></path> </symbol> </svg> <div class="dropdown position-fixed bottom-0 end-0 mb-3 me-3 bd-mode-toggle"> <button class="btn btn-bd-primary py-2 dropdown-toggle d-flex align-items-center" id="bd-theme" type="button" aria-expanded="false" data-bs-toggle="dropdown" aria-label="Toggle theme (auto)"> <svg class="bi my-1 theme-icon-active" aria-hidden="true"><use href="#circle-half"></use></svg> <span class="visually-hidden" id="bd-theme-text">Toggle theme</span> </button> <ul class="dropdown-menu dropdown-menu-end shadow" aria-labelledby="bd-theme-text"> <li> <button type="button" class="dropdown-item d-flex align-items-center" data-bs-theme-value="light" aria-pressed="false"> <svg class="bi me-2 opacity-50" aria-hidden="true"><use href="#sun-fill"></use></svg>
                        Light
                    <svg class="bi ms-auto d-none" aria-hidden="true"><use href="#check2"></use></svg> </button> </li> <li> <button type="button" class="dropdown-item d-flex align-items-center" data-bs-theme-value="dark" aria-pressed="false"> <svg class="bi me-2 opacity-50" aria-hidden="true"><use href="#moon-stars-fill"></use></svg>
                        Dark
                    <svg class="bi ms-auto d-none" aria-hidden="true"><use href="#check2"></use></svg> </button> </li> <li> <button type="button" class="dropdown-item d-flex align-items-center active" data-bs-theme-value="auto" aria-pressed="true"> <svg class="bi me-2 opacity-50" aria-hidden="true"><use href="#circle-half"></use></svg>
                        Auto
                    <svg class="bi ms-auto d-none" aria-hidden="true"><use href="#check2"></use></svg> </button> </li> </ul> </div>  <main class="form-signin w-100 m-auto">
                    <form action="/login" method="POST">
                        <h1 class="h3 mb-3 fw-normal">Por favor, faça o login</h1>
                        <div class="form-floating mb-2">
                            <input type="text" class="form-control" id="nomeUsuario" name="nomeUsuario" placeholder="Seu nome">
                            <label for="nomeUsuario">Nome do usuário</label>
                        </div>
                        <div class="form-floating mb-2">
                            <input type="email" class="form-control" id="email" name="email" placeholder="nome@example.com">
                            <label for="email">
                                Email
                            </label>
                        </div>
                        <div class="form-floating mb-2">
                            <input type="password" class="form-control" id="senha" name="senha" placeholder="Password">
                            <label for="senha">
                                Senha
                            </label>
                        </div>

                        <button class="btn btn-login-app w-100 py-2" type="submit">
                            Login
                        </button> `);
  resposta.write(`
                        <p class="mt-5 mb-3 text-body-secondary">Último acesso: ${escapeHtml(ultimoAcesso)}</p>
    `);
  resposta.write(`
                    </form>
                </main>
            </div>
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js" integrity="sha384-FKyoEForCGlyvwx9Hj09JcYn3nv7wiPVlz7YYwJrWVcXK/BmnVDxM+D2scQbITxI" crossorigin="anonymous"></script>
        </body>
    </html>
    `);
  resposta.end();
});

app.post("/login", (requisicao, resposta) => {
  const email = requisicao.body.email;
  const senha = requisicao.body.senha;
  const nomeUsuario = (requisicao.body.nomeUsuario || "").trim();

  if (email == "admin@teste.com.br" && senha == "admin") {
    requisicao.session.logado = true;
    requisicao.session.nomeUsuario =
      nomeUsuario || (email && email.split("@")[0]) || "Usuário";
    const dataUltimoAcesso = new Date();
    resposta.cookie("ultimoAcesso", dataUltimoAcesso.toLocaleString("pt-BR"), {
      maxAge: 1000 * 60 * 60 * 24 * 30,
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
    });
    resposta.redirect("/");
  } else {
    resposta.write(`
        <!DOCTYPE html>
        <html lang="pt-br" data-bs-theme="auto">
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <meta name="description" content="">
                <meta name="author" content="Mark Otto, Jacob Thornton, and Bootstrap contributors">
                <meta name="generator" content="Astro v5.13.2">
                <title>
                    Página de Login
                </title>
                <link rel="canonical" href="https://getbootstrap.com/docs/5.3/examples/sign-in/">
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-sRIl4kxILFvY47J16cr9ZwB07vP4J8+LH7qKQnuqkuIAvNWLzeN8tE5YBujZqJLB" crossorigin="anonymous">
                <style>
                    .bd-placeholder-img{font-size:1.125rem;text-anchor:middle;-webkit-user-select:none;-moz-user-select:none;user-select:none}@media (min-width: 768px){.bd-placeholder-img-lg{font-size:3.5rem}}.b-example-divider{width:100%;height:3rem;background-color:#0000001a;border:solid rgba(0,0,0,.15);border-width:1px 0;box-shadow:inset 0 .5em 1.5em #0000001a,inset 0 .125em .5em #00000026}.b-example-vr{flex-shrink:0;width:1.5rem;height:100vh}.bi{vertical-align:-.125em;fill:currentColor}.nav-scroller{position:relative;z-index:2;height:2.75rem;overflow-y:hidden}.nav-scroller .nav{display:flex;flex-wrap:nowrap;padding-bottom:1rem;margin-top:-1px;overflow-x:auto;text-align:center;white-space:nowrap;-webkit-overflow-scrolling:touch}.btn-bd-primary{--bd-violet-bg: #712cf9;--bd-violet-rgb: 112.520718, 44.062154, 249.437846;--bs-btn-font-weight: 600;--bs-btn-color: var(--bs-white);--bs-btn-bg: var(--bd-violet-bg);--bs-btn-border-color: var(--bd-violet-bg);--bs-btn-hover-color: var(--bs-white);--bs-btn-hover-bg: #6528e0;--bs-btn-hover-border-color: #6528e0;--bs-btn-focus-shadow-rgb: var(--bd-violet-rgb);--bs-btn-active-color: var(--bs-btn-hover-color);--bs-btn-active-bg: #5a23c8;--bs-btn-active-border-color: #5a23c8}.bd-mode-toggle{z-index:1500}.bd-mode-toggle .bi{width:1em;height:1em}.bd-mode-toggle .dropdown-menu .active .bi{display:block!important}.btn-login-app{--bs-btn-bg:#1a5c38;--bs-btn-border-color:#1a5c38;--bs-btn-hover-bg:#154a2e;--bs-btn-hover-border-color:#123d28;--bs-btn-active-bg:#123d28;--bs-btn-active-border-color:#0f3522;--bs-btn-color:#fff;--bs-btn-hover-color:#fff;--bs-btn-active-color:#fff;--bs-btn-focus-shadow-rgb:26,92,56}
                </style>
            </head>
            <body class="d-flex align-items-center py-4 bg-body-tertiary">
                <div class="container w-50">
                    <svg xmlns="http://www.w3.org/2000/svg" class="d-none"> <symbol id="check2" viewBox="0 0 16 16"> <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"></path> </symbol> <symbol id="circle-half" viewBox="0 0 16 16"> <path d="M8 15A7 7 0 1 0 8 1v14zm0 1A8 8 0 1 1 8 0a8 8 0 0 1 0 16z"></path> </symbol> <symbol id="moon-stars-fill" viewBox="0 0 16 16"> <path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278z"></path> <path d="M10.794 3.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387a1.734 1.734 0 0 0-1.097 1.097l-.387 1.162a.217.217 0 0 1-.412 0l-.387-1.162A1.734 1.734 0 0 0 9.31 6.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387a1.734 1.734 0 0 0 1.097-1.097l.387-1.162zM13.863.099a.145.145 0 0 1 .274 0l.258.774c.115.346.386.617.732.732l.774.258a.145.145 0 0 1 0 .274l-.774.258a1.156 1.156 0 0 0-.732.732l-.258.774a.145.145 0 0 1-.274 0l-.258-.774a1.156 1.156 0 0 0-.732-.732l-.774-.258a.145.145 0 0 1 0-.274l.774-.258c.346-.115.617-.386.732-.732L13.863.1z"></path> </symbol> <symbol id="sun-fill" viewBox="0 0 16 16"> <path d="M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"></path> </symbol> </svg> <div class="dropdown position-fixed bottom-0 end-0 mb-3 me-3 bd-mode-toggle"> <button class="btn btn-bd-primary py-2 dropdown-toggle d-flex align-items-center" id="bd-theme" type="button" aria-expanded="false" data-bs-toggle="dropdown" aria-label="Toggle theme (auto)"> <svg class="bi my-1 theme-icon-active" aria-hidden="true"><use href="#circle-half"></use></svg> <span class="visually-hidden" id="bd-theme-text">Toggle theme</span> </button> <ul class="dropdown-menu dropdown-menu-end shadow" aria-labelledby="bd-theme-text"> <li> <button type="button" class="dropdown-item d-flex align-items-center" data-bs-theme-value="light" aria-pressed="false"> <svg class="bi me-2 opacity-50" aria-hidden="true"><use href="#sun-fill"></use></svg>
                        Light
                    <svg class="bi ms-auto d-none" aria-hidden="true"><use href="#check2"></use></svg> </button> </li> <li> <button type="button" class="dropdown-item d-flex align-items-center" data-bs-theme-value="dark" aria-pressed="false"> <svg class="bi me-2 opacity-50" aria-hidden="true"><use href="#moon-stars-fill"></use></svg>
                        Dark
                    <svg class="bi ms-auto d-none" aria-hidden="true"><use href="#check2"></use></svg> </button> </li> <li> <button type="button" class="dropdown-item d-flex align-items-center active" data-bs-theme-value="auto" aria-pressed="true"> <svg class="bi me-2 opacity-50" aria-hidden="true"><use href="#circle-half"></use></svg>
                        Auto
                    <svg class="bi ms-auto d-none" aria-hidden="true"><use href="#check2"></use></svg> </button> </li> </ul> </div>  <main class="form-signin w-100 m-auto">
                    <form action="/login" method="POST">
                        <h1 class="h3 mb-3 fw-normal">Por favor, faça o login</h1>
                        <div class="form-floating mb-2">
                            <input type="text" class="form-control" id="nomeUsuario" name="nomeUsuario" placeholder="Seu nome" value="${escapeHtml(requisicao.body.nomeUsuario)}">
                            <label for="nomeUsuario">Nome do usuário</label>
                        </div>
                        <div class="form-floating mb-2">
                            <input type="email" class="form-control" id="email" name="email" placeholder="nome@example.com">
                            <label for="email">
                                Email
                            </label>
                        </div>
                        <div class="form-floating mb-2">
                            <input type="password" class="form-control" id="senha" name="senha" placeholder="Password">
                            <label for="senha">
                                Senha
                            </label>
                        </div>
                        <span>
                            <p class="text-danger">Email ou senha inválidos!</p>
                        </span>
                        <button class="btn btn-login-app w-100 py-2" type="submit">
                            Login
                        </button>
                    </form>
                </main>
            </div>
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js" integrity="sha384-FKyoEForCGlyvwx9Hj09JcYn3nv7wiPVlz7YYwJrWVcXK/BmnVDxM+D2scQbITxI" crossorigin="anonymous"></script>
        </body>
    </html>
    `);
    resposta.end();
  }
});

app.get("/logout", (requisicao, resposta) => {
  requisicao.session.destroy();
  resposta.redirect("/login");
});

function estaAutenticado(requisicao, resposta, proximo) {
  if (requisicao.session?.logado) {
    proximo();
  } else {
    resposta.redirect("/login");
  }
}

if (!process.env.VERCEL) {
  app.listen(port, "0.0.0.0", () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
  });
}

export default app;
