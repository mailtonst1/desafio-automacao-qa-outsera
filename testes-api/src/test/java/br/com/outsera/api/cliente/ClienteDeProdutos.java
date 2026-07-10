package br.com.outsera.api.cliente;

import br.com.outsera.api.especificacao.FabricaDeEspecificacaoDeRequisicao;
import br.com.outsera.api.modelo.requisicao.ProdutoRequisicao;
import io.restassured.response.Response;
import java.util.Map;
import static io.restassured.RestAssured.given;

public class ClienteDeProdutos {
    private final FabricaDeEspecificacaoDeRequisicao especificacoes;

    public ClienteDeProdutos(FabricaDeEspecificacaoDeRequisicao especificacoes) {
        this.especificacoes = especificacoes;
    }

    public Response listar() {
        return given().spec(especificacoes.criarPadrao()).get("/produtos");
    }

    public Response listarPor(Map<String, String> filtros) {
        return given().spec(especificacoes.criarPadrao()).queryParams(filtros).get("/produtos");
    }

    public Response criar(ProdutoRequisicao produto, String token) {
        return given().spec(especificacoes.criarPadrao()).header("Authorization", token).body(produto).post("/produtos");
    }

    public Response criarSemAutenticacao(ProdutoRequisicao produto) {
        return given().spec(especificacoes.criarPadrao()).body(produto).post("/produtos");
    }

    public Response criarComMapa(Map<String, Object> corpo, String token) {
        return given().spec(especificacoes.criarPadrao()).header("Authorization", token).body(corpo).post("/produtos");
    }

    public Response criarComCorpoBruto(String corpo, String token) {
        return given().spec(especificacoes.criarPadrao()).header("Authorization", token).body(corpo).post("/produtos");
    }

    public Response buscarPorId(String id) {
        return given().spec(especificacoes.criarPadrao()).get("/produtos/{id}", id);
    }

    public Response atualizar(String id, ProdutoRequisicao produto, String token) {
        return given().spec(especificacoes.criarPadrao()).header("Authorization", token).body(produto).put("/produtos/{id}", id);
    }

    public Response excluir(String id, String token) {
        return given().spec(especificacoes.criarPadrao()).header("Authorization", token).delete("/produtos/{id}", id);
    }
}
