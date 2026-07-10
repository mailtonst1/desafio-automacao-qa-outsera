package br.com.outsera.api.teste.autenticacao;

import br.com.outsera.api.modelo.requisicao.CredenciaisDeLogin;
import br.com.outsera.api.modelo.requisicao.UsuarioRequisicao;
import br.com.outsera.api.teste.TesteDeApi;
import java.util.stream.Stream;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import static io.restassured.module.jsv.JsonSchemaValidator.matchesJsonSchemaInClasspath;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.notNullValue;

@Tag("regressao")
@DisplayName("Autenticação")
class TesteDeAutenticacao extends TesteDeApi {
    @Test
    @Tag("smoke")
    @Tag("positivo")
    @DisplayName("Deve realizar login com credenciais válidas")
    void deveRealizarLoginComCredenciaisValidas() {
        UsuarioRequisicao usuario = criarUsuarioComum();

        autenticacao.autenticar(new CredenciaisDeLogin(usuario.email(), usuario.password()))
                .then()
                .statusCode(200)
                .header("Content-Type", containsString("application/json"))
                .body(matchesJsonSchemaInClasspath("esquemas/login-com-sucesso.json"))
                .body("message", equalTo("Login realizado com sucesso"))
                .body("authorization", containsString("Bearer "));
    }

    @Test
    @Tag("negativo")
    @DisplayName("Deve rejeitar login com senha inválida")
    void deveRejeitarLoginComSenhaInvalida() {
        UsuarioRequisicao usuario = criarUsuarioComum();

        autenticacao.autenticar(new CredenciaisDeLogin(usuario.email(), "senha-invalida"))
                .then().statusCode(401)
                .body("message", equalTo("Email e/ou senha inválidos"));
    }

    @Test
    @Tag("negativo")
    @DisplayName("Deve rejeitar login com usuário inexistente")
    void deveRejeitarLoginComUsuarioInexistente() {
        autenticacao.autenticar(new CredenciaisDeLogin("inexistente@qa.com", "teste"))
                .then().statusCode(401)
                .body("message", equalTo("Email e/ou senha inválidos"));
    }

    @ParameterizedTest(name = "Deve rejeitar login sem {0}")
    @MethodSource("credenciaisComCampoAusente")
    @Tag("negativo")
    @DisplayName("Deve rejeitar login sem campo obrigatório")
    void deveRejeitarLoginSemCampoObrigatorio(String campo, CredenciaisDeLogin credenciais) {
        autenticacao.autenticar(credenciais)
                .then().statusCode(400)
                .body(campo, notNullValue());
    }

    @Test
    @Tag("negativo")
    @DisplayName("Deve rejeitar payload de login malformado")
    void deveRejeitarPayloadDeLoginMalformado() {
        autenticacao.enviarCorpoBruto("nao-json")
                .then().statusCode(400)
                .body("message", containsString("Adicione aspas"));
    }

    private static Stream<Arguments> credenciaisComCampoAusente() {
        return Stream.of(
                Arguments.of("email", new CredenciaisDeLogin(null, "teste")),
                Arguments.of("password", new CredenciaisDeLogin("usuario@qa.com", null)));
    }
}
