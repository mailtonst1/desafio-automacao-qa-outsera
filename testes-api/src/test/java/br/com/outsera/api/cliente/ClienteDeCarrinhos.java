package br.com.outsera.api.cliente;

import br.com.outsera.api.especificacao.FabricaDeEspecificacaoDeRequisicao;
import br.com.outsera.api.modelo.requisicao.CarrinhoRequisicao;
import io.restassured.response.Response;
import static io.restassured.RestAssured.given;

public class ClienteDeCarrinhos {
    private final FabricaDeEspecificacaoDeRequisicao especificacoes;

    public ClienteDeCarrinhos(FabricaDeEspecificacaoDeRequisicao especificacoes) {
        this.especificacoes = especificacoes;
    }

    public Response listar() {
        return given().spec(especificacoes.criarPadrao()).get("/carrinhos");
    }

    public Response criar(CarrinhoRequisicao carrinho, String token) {
        return given().spec(especificacoes.criarPadrao()).header("Authorization", token).body(carrinho).post("/carrinhos");
    }

    public Response criarSemAutenticacao(CarrinhoRequisicao carrinho) {
        return given().spec(especificacoes.criarPadrao()).body(carrinho).post("/carrinhos");
    }

    public Response buscarPorId(String id) {
        return given().spec(especificacoes.criarPadrao()).get("/carrinhos/{id}", id);
    }

    public Response concluirCompra(String token) {
        return given().spec(especificacoes.criarPadrao()).header("Authorization", token).delete("/carrinhos/concluir-compra");
    }

    public Response cancelarCompra(String token) {
        return given().spec(especificacoes.criarPadrao()).header("Authorization", token).delete("/carrinhos/cancelar-compra");
    }
}
