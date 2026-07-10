package br.com.outsera.api.teste.contrato;

import br.com.outsera.api.teste.TesteDeApi;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.nullValue;

@Tag("regressao")
@Tag("contrato")
@DisplayName("Headers de segurança")
class TesteDeHeadersDeSeguranca extends TesteDeApi {
    @Test
    @Tag("smoke")
    @DisplayName("Deve expor headers de segurança observados no ServeRest")
    void deveExporHeadersDeSegurancaObservadosNoServeRest() {
        usuarios.listar().then().statusCode(200)
                .header("Strict-Transport-Security", containsString("max-age="))
                .header("X-Content-Type-Options", equalTo("nosniff"))
                .header("X-DNS-Prefetch-Control", equalTo("off"))
                .header("X-Download-Options", equalTo("noopen"))
                .header("X-Frame-Options", equalTo("SAMEORIGIN"))
                .header("X-XSS-Protection", equalTo("1; mode=block"))
                .header("X-Powered-By", nullValue());
    }
}
