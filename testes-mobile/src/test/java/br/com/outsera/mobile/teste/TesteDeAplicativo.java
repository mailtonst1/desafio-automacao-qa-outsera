package br.com.outsera.mobile.teste;

import br.com.outsera.mobile.tela.TelaDeProdutos;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertTrue;

final class TesteDeAplicativo extends TesteMobile {
    @Test @DisplayName("Deve abrir o aplicativo na tela de produtos")
    void deveAbrirOAplicativoNaTelaDeProdutos() { assertTrue(new TelaDeProdutos(driver).estaAberta()); }
}
