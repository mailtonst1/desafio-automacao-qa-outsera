package br.com.outsera.api.especificacao;

import br.com.outsera.api.configuracao.ConfiguracaoDoAmbiente;
import br.com.outsera.api.validacao.FiltroDeEvidenciasAllure;
import io.restassured.builder.RequestSpecBuilder;
import io.restassured.config.HttpClientConfig;
import io.restassured.config.RestAssuredConfig;
import io.restassured.http.ContentType;
import io.restassured.specification.RequestSpecification;

public class FabricaDeEspecificacaoDeRequisicao {
    public RequestSpecification criarPadrao() {
        return new RequestSpecBuilder()
                .setBaseUri(ConfiguracaoDoAmbiente.obterUrlBase())
                .setContentType(ContentType.JSON)
                .setAccept(ContentType.JSON)
                .setConfig(RestAssuredConfig.config().httpClient(HttpClientConfig.httpClientConfig()
                        .setParam("http.connection.timeout", 10_000)
                        .setParam("http.socket.timeout", 15_000)))
                .addFilter(new FiltroDeEvidenciasAllure())
                .build();
    }
}
