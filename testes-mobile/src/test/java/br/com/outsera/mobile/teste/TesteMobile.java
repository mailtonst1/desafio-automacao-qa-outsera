package br.com.outsera.mobile.teste;

import br.com.outsera.mobile.driver.GerenciadorDeDriver;
import br.com.outsera.mobile.evidencia.EvidenciaEmFalha;
import io.appium.java_client.android.AndroidDriver;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.TestInfo;
import org.junit.jupiter.api.extension.RegisterExtension;

abstract class TesteMobile {
    protected AndroidDriver driver;
    private final GerenciadorDeDriver gerenciador = new GerenciadorDeDriver();
    @RegisterExtension final EvidenciaEmFalha evidencia = new EvidenciaEmFalha(() -> driver);
    @BeforeEach void iniciarSessao() { driver = gerenciador.criar(); }
    @AfterEach void encerrarSessao(TestInfo teste) {
        evidencia.anexarEstadoFinal(teste.getDisplayName());
        gerenciador.finalizar(driver);
    }
}
