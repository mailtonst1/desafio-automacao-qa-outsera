package br.com.outsera.api.teste.carrinhos;

import br.com.outsera.api.modelo.requisicao.CarrinhoRequisicao;
import br.com.outsera.api.modelo.requisicao.ItemDoCarrinho;
import br.com.outsera.api.modelo.requisicao.ProdutoRequisicao;
import br.com.outsera.api.teste.TesteDeApi;
import io.restassured.response.Response;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import static io.restassured.module.jsv.JsonSchemaValidator.matchesJsonSchemaInClasspath;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.equalTo;

@Tag("regressao")
@DisplayName("Carrinhos")
class TesteDeCarrinhos extends TesteDeApi {
    @Test
    @Tag("smoke")
    @Tag("positivo")
    @Tag("contrato")
    @DisplayName("Deve listar carrinhos")
    void deveListarCarrinhos() {
        carrinhos.listar().then().statusCode(200)
                .body(matchesJsonSchemaInClasspath("esquemas/lista-de-carrinhos.json"));
    }

    @Test
    @Tag("smoke")
    @Tag("positivo")
    @DisplayName("Deve criar carrinho válido")
    void deveCriarCarrinhoValido() {
        DadosDoCarrinho dados = prepararDadosDoCarrinho();
        Response resposta = carrinhos.criar(dados.carrinho(), dados.tokenUsuario());
        recursosCriados.registrarCarrinho(dados.tokenUsuario());

        resposta.then().statusCode(201)
                .body("message", equalTo("Cadastro realizado com sucesso"));
    }

    @Test
    @Tag("positivo")
    @Tag("contrato")
    @DisplayName("Deve consultar carrinho criado")
    void deveConsultarCarrinhoCriado() {
        DadosDoCarrinho dados = prepararDadosDoCarrinho();
        Response criado = carrinhos.criar(dados.carrinho(), dados.tokenUsuario());
        recursosCriados.registrarCarrinho(dados.tokenUsuario());
        String id = criado.path("_id");

        carrinhos.buscarPorId(id).then().statusCode(200)
                .body(matchesJsonSchemaInClasspath("esquemas/carrinho.json"));
    }

    @Test
    @Tag("positivo")
    @DisplayName("Deve cancelar compra e reabastecer estoque")
    void deveCancelarCompra() {
        DadosDoCarrinho dados = prepararDadosDoCarrinho();
        carrinhos.criar(dados.carrinho(), dados.tokenUsuario()).then().statusCode(201);

        carrinhos.cancelarCompra(dados.tokenUsuario()).then().statusCode(200)
                .body("message", containsString("Estoque dos produtos reabastecido"));

        produtos.buscarPorId(dados.idProduto()).then().statusCode(200)
                .body("quantidade", equalTo(10));
    }

    @Test
    @Tag("positivo")
    @DisplayName("Deve concluir compra e reduzir estoque")
    void deveConcluirCompra() {
        DadosDoCarrinho dados = prepararDadosDoCarrinho();
        carrinhos.criar(dados.carrinho(), dados.tokenUsuario()).then().statusCode(201);

        carrinhos.concluirCompra(dados.tokenUsuario()).then().statusCode(200)
                .body("message", equalTo("Registro excluído com sucesso"));

        produtos.buscarPorId(dados.idProduto()).then().statusCode(200)
                .body("quantidade", equalTo(9));
    }

    @Test
    @Tag("negativo")
    @DisplayName("Deve rejeitar carrinho sem autenticação")
    void deveRejeitarCarrinhoSemAutenticacao() {
        CarrinhoRequisicao carrinho = new CarrinhoRequisicao(List.of(new ItemDoCarrinho("aaaaaaaaaaaaaaaa", 1)));

        carrinhos.criarSemAutenticacao(carrinho).then().statusCode(401)
                .body("message", containsString("Token de acesso ausente"));
    }

    @Test
    @Tag("negativo")
    @DisplayName("Deve rejeitar carrinho com token inválido")
    void deveRejeitarCarrinhoComTokenInvalido() {
        CarrinhoRequisicao carrinho = new CarrinhoRequisicao(List.of(new ItemDoCarrinho("aaaaaaaaaaaaaaaa", 1)));

        carrinhos.criar(carrinho, "Bearer token-invalido").then().statusCode(401)
                .body("message", containsString("Token de acesso ausente"));
    }

    @Test
    @Tag("negativo")
    @DisplayName("Deve rejeitar carrinho com produto inexistente")
    void deveRejeitarCarrinhoComProdutoInexistente() {
        String tokenUsuario = autenticar(criarUsuarioComum());
        CarrinhoRequisicao carrinho = new CarrinhoRequisicao(List.of(new ItemDoCarrinho("aaaaaaaaaaaaaaaa", 1)));

        carrinhos.criar(carrinho, tokenUsuario).then().statusCode(400)
                .body("message", equalTo("Produto não encontrado"));
    }

    @Test
    @Tag("negativo")
    @DisplayName("Deve rejeitar carrinho com quantidade inválida")
    void deveRejeitarCarrinhoComQuantidadeInvalida() {
        DadosDoCarrinho dados = prepararDadosDoCarrinho();
        CarrinhoRequisicao carrinhoInvalido = new CarrinhoRequisicao(List.of(new ItemDoCarrinho(dados.idProduto(), 0)));

        carrinhos.criar(carrinhoInvalido, dados.tokenUsuario()).then().statusCode(400);
    }

    @Test
    @Tag("negativo")
    @DisplayName("Deve impedir mais de um carrinho por usuário")
    void deveImpedirMaisDeUmCarrinhoPorUsuario() {
        DadosDoCarrinho dados = prepararDadosDoCarrinho();
        carrinhos.criar(dados.carrinho(), dados.tokenUsuario()).then().statusCode(201);
        recursosCriados.registrarCarrinho(dados.tokenUsuario());

        carrinhos.criar(dados.carrinho(), dados.tokenUsuario()).then().statusCode(400)
                .body("message", equalTo("Não é permitido ter mais de 1 carrinho"));
    }

    private DadosDoCarrinho prepararDadosDoCarrinho() {
        String tokenAdministrador = autenticar(criarUsuarioAdministrador());
        ProdutoRequisicao produto = fabricaDeProdutos.criarValido();
        String idProduto = criarProduto(produto, tokenAdministrador);
        String tokenUsuario = autenticar(criarUsuarioComum());
        CarrinhoRequisicao carrinho = new CarrinhoRequisicao(List.of(new ItemDoCarrinho(idProduto, 1)));
        return new DadosDoCarrinho(tokenUsuario, idProduto, carrinho);
    }

    private record DadosDoCarrinho(String tokenUsuario, String idProduto, CarrinhoRequisicao carrinho) {
    }
}
