package br.com.outsera.api.cliente;

import br.com.outsera.api.especificacao.FabricaDeEspecificacaoDeRequisicao;
import br.com.outsera.api.modelo.requisicao.UsuarioRequisicao;
import io.restassured.response.Response;
import java.util.Map;
import static io.restassured.RestAssured.given;

public class ClienteDeUsuarios {
    private final FabricaDeEspecificacaoDeRequisicao especificacoes;

    public ClienteDeUsuarios(FabricaDeEspecificacaoDeRequisicao especificacoes) {
        this.especificacoes = especificacoes;
    }

    public Response listar() {
        return given().spec(especificacoes.criarPadrao()).get("/usuarios");
    }

    public Response listarPor(Map<String, String> filtros) {
        return given().spec(especificacoes.criarPadrao()).queryParams(filtros).get("/usuarios");
    }

    public Response criar(UsuarioRequisicao usuario) {
        return given().spec(especificacoes.criarPadrao()).body(usuario).post("/usuarios");
    }

    public Response criarComMapa(Map<String, Object> corpo) {
        return given().spec(especificacoes.criarPadrao()).body(corpo).post("/usuarios");
    }

    public Response criarComCorpoBruto(String corpo) {
        return given().spec(especificacoes.criarPadrao()).body(corpo).post("/usuarios");
    }

    public Response buscarPorId(String id) {
        return given().spec(especificacoes.criarPadrao()).get("/usuarios/{id}", id);
    }

    public Response atualizar(String id, UsuarioRequisicao usuario) {
        return given().spec(especificacoes.criarPadrao()).body(usuario).put("/usuarios/{id}", id);
    }

    public Response excluir(String id) {
        return given().spec(especificacoes.criarPadrao()).delete("/usuarios/{id}", id);
    }

    public Response enviarMetodoNaoPermitido() {
        return given().spec(especificacoes.criarPadrao()).patch("/usuarios");
    }
}
