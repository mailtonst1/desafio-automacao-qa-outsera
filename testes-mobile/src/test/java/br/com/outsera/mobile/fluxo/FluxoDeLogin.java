package br.com.outsera.mobile.fluxo;

import br.com.outsera.mobile.tela.TelaDeLogin;
import br.com.outsera.mobile.tela.TelaDeProdutos;
import io.appium.java_client.android.AndroidDriver;

public final class FluxoDeLogin {
    private final TelaDeProdutos produtos;
    private final TelaDeLogin login;

    public FluxoDeLogin(AndroidDriver driver) {
        produtos = new TelaDeProdutos(driver);
        login = new TelaDeLogin(driver);
    }

    public void autenticar(String usuario, String senha) {
        produtos.abrirMenu();
        login.acessar();
        login.preencherUsuario(usuario);
        login.preencherSenha(senha);
        login.enviar();
    }
}
