package br.com.outsera.mobile.tela;

import io.appium.java_client.android.AndroidDriver;
import org.openqa.selenium.By;

public final class TelaDeCheckout extends TelaBase {
    private static final String ID = "com.saucelabs.mydemoapp.android:id/";
    public TelaDeCheckout(AndroidDriver driver) { super(driver); }
    public void preencherEndereco(String nome, String endereco, String cidade, String cep, String estado, String pais) {
        preencher(By.id(ID + "fullNameET"), nome);
        preencher(By.id(ID + "address1ET"), endereco);
        preencher(By.id(ID + "cityET"), cidade);
        preencher(By.id(ID + "zipET"), cep);
        preencher(By.id(ID + "stateET"), estado);
        preencher(By.id(ID + "countryET"), pais);
    }
    public void enviar() { tocar(By.id(ID + "paymentBtn")); }
    public String erroDoNome() { return visivel(By.id(ID + "fullNameErrorTV")).getText(); }
}
