package br.com.outsera.api.fabrica;

import br.com.outsera.api.modelo.requisicao.CredenciaisDeLogin;
import br.com.outsera.api.modelo.requisicao.UsuarioRequisicao;
import java.util.UUID;

public class FabricaDeUsuarios {
    public UsuarioRequisicao criarComum() {
        return criar("false");
    }

    public UsuarioRequisicao criarAdministrador() {
        return criar("true");
    }

    public CredenciaisDeLogin criarCredenciais(UsuarioRequisicao usuario) {
        return new CredenciaisDeLogin(usuario.email(), usuario.password());
    }

    private UsuarioRequisicao criar(String administrador) {
        String identificador = UUID.randomUUID().toString().substring(0, 12);
        return new UsuarioRequisicao(
                "Usuario de teste " + identificador,
                "usuario." + identificador + "@qa.com",
                "teste",
                administrador);
    }
}
