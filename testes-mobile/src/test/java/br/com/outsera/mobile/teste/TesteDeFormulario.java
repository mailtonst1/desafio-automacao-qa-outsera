package br.com.outsera.mobile.teste;

import br.com.outsera.mobile.fabrica.FabricaDeDados;
import br.com.outsera.mobile.fluxo.FluxoDeLogin;
import br.com.outsera.mobile.tela.TelaDeCarrinho;
import br.com.outsera.mobile.tela.TelaDeCheckout;
import br.com.outsera.mobile.tela.TelaDeProduto;
import br.com.outsera.mobile.tela.TelaDeProdutos;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

final class TesteDeFormulario extends TesteMobile {
    private TelaDeCheckout abrirCheckout() {
        new FluxoDeLogin(driver).autenticar(FabricaDeDados.usuarioValido(), FabricaDeDados.senhaValida());
        TelaDeProdutos produtos = new TelaDeProdutos(driver);
        produtos.estaAberta();
        produtos.abrirPrimeiroProduto();
        new TelaDeProduto(driver).adicionarAoCarrinho();
        TelaDeCarrinho carrinho = new TelaDeCarrinho(driver);
        carrinho.acessar();
        carrinho.iniciarCheckout();
        return new TelaDeCheckout(driver);
    }
    @Test @DisplayName("Deve preencher formulario de checkout")
    void devePreencherFormularioDeCheckout() {
        TelaDeCheckout checkout = abrirCheckout();
        checkout.preencherEndereco(FabricaDeDados.nomeCompleto(), FabricaDeDados.endereco(), FabricaDeDados.cidade(), FabricaDeDados.cep(), FabricaDeDados.estado(), FabricaDeDados.pais());
        assertEquals(FabricaDeDados.nomeCompleto(), driver.findElement(org.openqa.selenium.By.id("com.saucelabs.mydemoapp.android:id/fullNameET")).getText());
    }
    @Test @DisplayName("Deve exigir nome no formulario de checkout")
    void deveExigirNomeNoFormularioDeCheckout() {
        TelaDeCheckout checkout = abrirCheckout();
        checkout.enviar();
        assertEquals("Please provide your full name.", checkout.erroDoNome());
    }
}
