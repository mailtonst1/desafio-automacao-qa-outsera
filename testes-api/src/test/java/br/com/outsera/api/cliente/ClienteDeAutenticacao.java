package br.com.outsera.api.cliente;

import br.com.outsera.api.especificacao.FabricaDeEspecificacaoDeRequisicao;
import br.com.outsera.api.modelo.requisicao.CredenciaisDeLogin;
import io.restassured.response.Response;
import static io.restassured.RestAssured.given;

public class ClienteDeAutenticacao {
    private final FabricaDeEspecificacaoDeRequisicao especificacoes;

    public ClienteDeAutenticacao(FabricaDeEspecificacaoDeRequisicao especificacoes) {
        this.especificacoes = especificacoes;
    }

    public Response autenticar(CredenciaisDeLogin credenciais) {
        return given().spec(especificacoes.criarPadrao()).body(credenciais).post("/login");
    }

    public Response enviarCorpoBruto(String corpo) {
        return given().spec(especificacoes.criarPadrao()).body(corpo).post("/login");
    }
}
