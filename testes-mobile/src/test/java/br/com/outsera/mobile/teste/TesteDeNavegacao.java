package br.com.outsera.mobile.teste;

import br.com.outsera.mobile.tela.TelaDeProdutos;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

final class TesteDeNavegacao extends TesteMobile {
    @Test @DisplayName("Deve exibir o primeiro produto do catalogo")
    void deveExibirOPrimeiroProdutoDoCatalogo() { assertEquals("Sauce Labs Backpack", new TelaDeProdutos(driver).primeiroProduto()); }
}
