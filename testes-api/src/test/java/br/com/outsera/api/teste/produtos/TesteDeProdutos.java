package br.com.outsera.api.teste.produtos;

import br.com.outsera.api.modelo.requisicao.ProdutoRequisicao;
import br.com.outsera.api.modelo.requisicao.UsuarioRequisicao;
import br.com.outsera.api.teste.TesteDeApi;
import io.restassured.response.Response;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import static io.restassured.module.jsv.JsonSchemaValidator.matchesJsonSchemaInClasspath;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.notNullValue;

@Tag("regressao")
@DisplayName("Produtos")
class TesteDeProdutos extends TesteDeApi {
    @Test
    @Tag("smoke")
    @Tag("positivo")
    @Tag("contrato")
    @DisplayName("Deve listar produtos")
    void deveListarProdutos() {
        produtos.listar().then().statusCode(200)
                .header("Content-Type", containsString("application/json"))
                .body(matchesJsonSchemaInClasspath("esquemas/lista-de-produtos.json"));
    }

    @Test
    @Tag("smoke")
    @Tag("positivo")
    @DisplayName("Deve criar produto autenticado como administrador")
    void deveCriarProdutoAutenticadoComoAdministrador() {
        String tokenAdministrador = autenticar(criarUsuarioAdministrador());
        ProdutoRequisicao produto = fabricaDeProdutos.criarValido();
        Response resposta = produtos.criar(produto, tokenAdministrador);
        recursosCriados.registrarProduto(resposta.path("_id"), tokenAdministrador);

        resposta.then().statusCode(201)
                .body("message", equalTo("Cadastro realizado com sucesso"))
                .body("_id", notNullValue());
    }

    @Test
    @Tag("negativo")
    @DisplayName("Deve rejeitar produto sem autenticação")
    void deveRejeitarProdutoSemAutenticacao() {
        produtos.criarSemAutenticacao(fabricaDeProdutos.criarValido()).then().statusCode(401)
                .body("message", containsString("Token de acesso ausente"));
    }

    @Test
    @Tag("negativo")
    @DisplayName("Deve rejeitar produto com token inválido")
    void deveRejeitarProdutoComTokenInvalido() {
        produtos.criar(fabricaDeProdutos.criarValido(), "Bearer token-invalido").then().statusCode(401)
                .body("message", containsString("Token de acesso ausente"));
    }

    @Test
    @Tag("negativo")
    @DisplayName("Deve rejeitar produto criado por usuário sem permissão")
    void deveRejeitarProdutoComUsuarioSemPermissao() {
        String tokenComum = autenticar(criarUsuarioComum());

        produtos.criar(fabricaDeProdutos.criarValido(), tokenComum).then().statusCode(403)
                .body("message", equalTo("Rota exclusiva para administradores"));
    }

    @Test
    @Tag("positivo")
    @Tag("contrato")
    @DisplayName("Deve consultar produto existente")
    void deveConsultarProdutoExistente() {
        String tokenAdministrador = autenticar(criarUsuarioAdministrador());
        ProdutoRequisicao produto = fabricaDeProdutos.criarValido();
        String id = criarProduto(produto, tokenAdministrador);

        produtos.buscarPorId(id).then().statusCode(200)
                .body(matchesJsonSchemaInClasspath("esquemas/produto.json"))
                .body("nome", equalTo(produto.nome()));
    }

    @Test
    @Tag("negativo")
    @DisplayName("Deve informar produto inexistente")
    void deveInformarProdutoInexistente() {
        produtos.buscarPorId("bbbbbbbbbbbbbbbb").then().statusCode(400)
                .body("message", equalTo("Produto não encontrado"));
    }

    @Test
    @Tag("positivo")
    @DisplayName("Deve atualizar produto existente")
    void deveAtualizarProdutoExistente() {
        String tokenAdministrador = autenticar(criarUsuarioAdministrador());
        String id = criarProduto(fabricaDeProdutos.criarValido(), tokenAdministrador);
        ProdutoRequisicao atualizado = fabricaDeProdutos.criarValido();

        produtos.atualizar(id, atualizado, tokenAdministrador).then().statusCode(200)
                .body("message", equalTo("Registro alterado com sucesso"));
    }

    @Test
    @Tag("positivo")
    @DisplayName("Deve excluir produto existente")
    void deveExcluirProdutoExistente() {
        String tokenAdministrador = autenticar(criarUsuarioAdministrador());
        ProdutoRequisicao produto = fabricaDeProdutos.criarValido();
        Response criado = produtos.criar(produto, tokenAdministrador);
        String id = criado.path("_id");

        produtos.excluir(id, tokenAdministrador).then().statusCode(200)
                .body("message", equalTo("Registro excluído com sucesso"));
    }

    @Test
    @Tag("negativo")
    @DisplayName("Deve impedir produto com nome duplicado")
    void deveImpedirProdutoDuplicado() {
        String tokenAdministrador = autenticar(criarUsuarioAdministrador());
        ProdutoRequisicao produto = fabricaDeProdutos.criarValido();
        criarProduto(produto, tokenAdministrador);

        produtos.criar(produto, tokenAdministrador).then().statusCode(400)
                .body("message", equalTo("Já existe produto com esse nome"));
    }

    @Test
    @Tag("negativo")
    @DisplayName("Deve rejeitar produto sem nome")
    void deveRejeitarProdutoSemNome() {
        String tokenAdministrador = autenticar(criarUsuarioAdministrador());

        produtos.criarComMapa(Map.of("preco", 10, "descricao", "Sem nome", "quantidade", 1), tokenAdministrador)
                .then().statusCode(400).body("nome", equalTo("nome é obrigatório"));
    }

    @Test
    @Tag("negativo")
    @DisplayName("Deve rejeitar payload de produto malformado")
    void deveRejeitarPayloadDeProdutoMalformado() {
        String tokenAdministrador = autenticar(criarUsuarioAdministrador());

        produtos.criarComCorpoBruto("nao-json", tokenAdministrador).then().statusCode(400)
                .body("message", containsString("Adicione aspas"));
    }

    @Test
    @Tag("positivo")
    @DisplayName("Deve filtrar produto por nome")
    void deveFiltrarProdutoPorNome() {
        String tokenAdministrador = autenticar(criarUsuarioAdministrador());
        ProdutoRequisicao produto = fabricaDeProdutos.criarValido();
        criarProduto(produto, tokenAdministrador);

        produtos.listarPor(Map.of("nome", produto.nome())).then().statusCode(200)
                .body("quantidade", equalTo(1))
                .body("produtos", hasSize(1))
                .body("produtos[0].nome", equalTo(produto.nome()));
    }

    @Test
    @Tag("positivo")
    @DisplayName("Deve criar produto no PUT com identificador inexistente")
    void deveCriarProdutoNoPutComIdInexistente() {
        String tokenAdministrador = autenticar(criarUsuarioAdministrador());
        ProdutoRequisicao produto = fabricaDeProdutos.criarValido();
        Response resposta = produtos.atualizar("cccccccccccccccc", produto, tokenAdministrador);
        recursosCriados.registrarProduto(resposta.path("_id"), tokenAdministrador);

        resposta.then().statusCode(201)
                .body("message", equalTo("Cadastro realizado com sucesso"));
    }
}
