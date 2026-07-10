package br.com.outsera.api.teste;

import br.com.outsera.api.cliente.ClienteDeAutenticacao;
import br.com.outsera.api.cliente.ClienteDeCarrinhos;
import br.com.outsera.api.cliente.ClienteDeProdutos;
import br.com.outsera.api.cliente.ClienteDeUsuarios;
import br.com.outsera.api.especificacao.FabricaDeEspecificacaoDeRequisicao;
import br.com.outsera.api.fabrica.FabricaDeProdutos;
import br.com.outsera.api.fabrica.FabricaDeUsuarios;
import br.com.outsera.api.modelo.requisicao.CredenciaisDeLogin;
import br.com.outsera.api.modelo.requisicao.ProdutoRequisicao;
import br.com.outsera.api.modelo.requisicao.UsuarioRequisicao;
import br.com.outsera.api.suporte.GerenciadorDeLimpeza;
import br.com.outsera.api.suporte.RegistroDeRecursosCriados;
import io.restassured.response.Response;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;

public abstract class TesteDeApi {
    protected ClienteDeAutenticacao autenticacao;
    protected ClienteDeUsuarios usuarios;
    protected ClienteDeProdutos produtos;
    protected ClienteDeCarrinhos carrinhos;
    protected FabricaDeUsuarios fabricaDeUsuarios;
    protected FabricaDeProdutos fabricaDeProdutos;
    protected RegistroDeRecursosCriados recursosCriados;
    private GerenciadorDeLimpeza gerenciadorDeLimpeza;

    @BeforeEach
    void prepararCenario() {
        FabricaDeEspecificacaoDeRequisicao especificacoes = new FabricaDeEspecificacaoDeRequisicao();
        autenticacao = new ClienteDeAutenticacao(especificacoes);
        usuarios = new ClienteDeUsuarios(especificacoes);
        produtos = new ClienteDeProdutos(especificacoes);
        carrinhos = new ClienteDeCarrinhos(especificacoes);
        fabricaDeUsuarios = new FabricaDeUsuarios();
        fabricaDeProdutos = new FabricaDeProdutos();
        recursosCriados = new RegistroDeRecursosCriados();
        gerenciadorDeLimpeza = new GerenciadorDeLimpeza(carrinhos, produtos, usuarios);
    }

    @AfterEach
    void limparCenario() {
        gerenciadorDeLimpeza.limparDadosCriados(recursosCriados);
    }

    protected UsuarioRequisicao criarUsuarioComum() {
        UsuarioRequisicao usuario = fabricaDeUsuarios.criarComum();
        String id = usuarios.criar(usuario).then().statusCode(201).extract().path("_id");
        recursosCriados.registrarUsuario(id);
        return usuario;
    }

    protected UsuarioRequisicao criarUsuarioAdministrador() {
        UsuarioRequisicao usuario = fabricaDeUsuarios.criarAdministrador();
        String id = usuarios.criar(usuario).then().statusCode(201).extract().path("_id");
        recursosCriados.registrarUsuario(id);
        return usuario;
    }

    protected String autenticar(UsuarioRequisicao usuario) {
        return autenticacao.autenticar(new CredenciaisDeLogin(usuario.email(), usuario.password()))
                .then().statusCode(200).extract().path("authorization");
    }

    protected String criarProduto(ProdutoRequisicao produto, String tokenAdministrador) {
        Response resposta = produtos.criar(produto, tokenAdministrador);
        resposta.then().statusCode(201);
        String id = resposta.path("_id");
        recursosCriados.registrarProduto(id, tokenAdministrador);
        return id;
    }
}
