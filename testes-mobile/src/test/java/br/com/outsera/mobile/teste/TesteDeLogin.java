package br.com.outsera.mobile.teste;

import br.com.outsera.mobile.fabrica.FabricaDeDados;
import br.com.outsera.mobile.fluxo.FluxoDeLogin;
import br.com.outsera.mobile.tela.TelaDeLogin;
import br.com.outsera.mobile.tela.TelaDeProdutos;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

final class TesteDeLogin extends TesteMobile {
    @Test @DisplayName("Deve realizar login valido")
    void deveRealizarLoginValido() {
        new FluxoDeLogin(driver).autenticar(FabricaDeDados.usuarioValido(), FabricaDeDados.senhaValida());
        assertTrue(new TelaDeProdutos(driver).estaAberta());
    }
    @Test @DisplayName("Deve bloquear usuario invalido")
    void deveBloquearUsuarioInvalido() {
        TelaDeProdutos produtos = new TelaDeProdutos(driver); produtos.abrirMenu();
        TelaDeLogin login = new TelaDeLogin(driver); login.acessar(); login.preencherUsuario(FabricaDeDados.usuarioBloqueado()); login.preencherSenha(FabricaDeDados.senhaValida()); login.enviar();
        assertEquals("Sorry this user has been locked out.", login.mensagemDeSenha());
    }
}
