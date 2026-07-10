package br.com.outsera.api.teste.usuarios;

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
@DisplayName("Usuários")
class TesteDeUsuarios extends TesteDeApi {
    @Test
    @Tag("smoke")
    @Tag("positivo")
    @Tag("contrato")
    @DisplayName("Deve listar usuários")
    void deveListarUsuarios() {
        usuarios.listar().then().statusCode(200)
                .header("Content-Type", containsString("application/json"))
                .body(matchesJsonSchemaInClasspath("esquemas/lista-de-usuarios.json"));
    }

    @Test
    @Tag("positivo")
    @DisplayName("Deve criar usuário comum com dados válidos")
    void deveCriarUsuarioComDadosValidos() {
        UsuarioRequisicao usuario = fabricaDeUsuarios.criarComum();
        Response resposta = usuarios.criar(usuario);
        String id = resposta.path("_id");
        recursosCriados.registrarUsuario(id);

        resposta.then().statusCode(201)
                .body("message", equalTo("Cadastro realizado com sucesso"))
                .body("_id", notNullValue());
    }

    @Test
    @Tag("positivo")
    @DisplayName("Deve criar usuário administrador")
    void deveCriarUsuarioAdministrador() {
        UsuarioRequisicao usuario = fabricaDeUsuarios.criarAdministrador();
        Response resposta = usuarios.criar(usuario);
        recursosCriados.registrarUsuario(resposta.path("_id"));

        resposta.then().statusCode(201).body("message", equalTo("Cadastro realizado com sucesso"));
    }

    @Test
    @Tag("negativo")
    @DisplayName("Deve impedir e-mail duplicado")
    void deveImpedirEmailDuplicado() {
        UsuarioRequisicao usuario = criarUsuarioComum();

        usuarios.criar(usuario).then().statusCode(400)
                .body("message", equalTo("Este email já está sendo usado"));
    }

    @Test
    @Tag("positivo")
    @Tag("contrato")
    @DisplayName("Deve consultar usuário existente por identificador")
    void deveConsultarUsuarioExistentePorId() {
        UsuarioRequisicao usuario = criarUsuarioComum();
        String id = usuarios.listarPor(Map.of("email", usuario.email())).path("usuarios[0]._id");

        usuarios.buscarPorId(id).then().statusCode(200)
                .body(matchesJsonSchemaInClasspath("esquemas/usuario.json"))
                .body("email", equalTo(usuario.email()));
    }

    @Test
    @Tag("negativo")
    @DisplayName("Deve informar usuário inexistente")
    void deveInformarUsuarioInexistente() {
        usuarios.buscarPorId("aaaaaaaaaaaaaaaa").then().statusCode(400)
                .body("message", equalTo("Usuário não encontrado"));
    }

    @Test
    @Tag("positivo")
    @DisplayName("Deve atualizar usuário existente")
    void deveAtualizarUsuarioExistente() {
        UsuarioRequisicao usuario = criarUsuarioComum();
        String id = usuarios.listarPor(Map.of("email", usuario.email())).path("usuarios[0]._id");
        UsuarioRequisicao atualizado = new UsuarioRequisicao("Nome atualizado", usuario.email(), usuario.password(), "false");

        usuarios.atualizar(id, atualizado).then().statusCode(200)
                .body("message", equalTo("Registro alterado com sucesso"));
    }

    @Test
    @Tag("positivo")
    @DisplayName("Deve excluir usuário existente")
    void deveExcluirUsuarioExistente() {
        UsuarioRequisicao usuario = fabricaDeUsuarios.criarComum();
        Response criado = usuarios.criar(usuario);
        String id = criado.path("_id");

        usuarios.excluir(id).then().statusCode(200)
                .body("message", equalTo("Registro excluído com sucesso"));
    }

    @Test
    @Tag("negativo")
    @DisplayName("Deve rejeitar usuário sem e-mail")
    void deveRejeitarUsuarioSemEmail() {
        usuarios.criarComMapa(Map.of("nome", "Sem email", "password", "teste", "administrador", "false"))
                .then().statusCode(400).body("email", equalTo("email é obrigatório"));
    }

    @Test
    @Tag("negativo")
    @DisplayName("Deve rejeitar payload de usuário malformado")
    void deveRejeitarPayloadDeUsuarioMalformado() {
        usuarios.criarComCorpoBruto("nao-json").then().statusCode(400)
                .body("message", containsString("Adicione aspas"));
    }

    @Test
    @Tag("positivo")
    @DisplayName("Deve filtrar usuário por e-mail")
    void deveFiltrarUsuarioPorEmail() {
        UsuarioRequisicao usuario = criarUsuarioComum();

        usuarios.listarPor(Map.of("email", usuario.email())).then().statusCode(200)
                .body("quantidade", equalTo(1))
                .body("usuarios", hasSize(1))
                .body("usuarios[0].email", equalTo(usuario.email()));
    }

    @Test
    @Tag("positivo")
    @DisplayName("Deve criar usuário no PUT com identificador inexistente")
    void deveCriarUsuarioNoPutComIdInexistente() {
        UsuarioRequisicao usuario = fabricaDeUsuarios.criarComum();
        Response resposta = usuarios.atualizar("id-inexistente", usuario);
        recursosCriados.registrarUsuario(resposta.path("_id"));

        resposta.then().statusCode(201)
                .body("message", equalTo("Cadastro realizado com sucesso"));
    }
}
