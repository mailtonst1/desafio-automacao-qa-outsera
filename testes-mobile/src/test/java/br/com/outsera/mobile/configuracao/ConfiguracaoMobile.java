package br.com.outsera.mobile.configuracao;

import java.net.MalformedURLException;
import java.net.URL;
import java.nio.file.Path;

public final class ConfiguracaoMobile {
    public static final String PACKAGE = "com.saucelabs.mydemoapp.android";
    public static final String ACTIVITY = "com.saucelabs.mydemoapp.android.view.activities.SplashActivity";

    private ConfiguracaoMobile() {}

    public static URL urlDoAppium() {
        try {
            return new URL("http://" + valor("APPIUM_HOST", "127.0.0.1") + ":" + valor("APPIUM_PORT", "4723"));
        } catch (MalformedURLException excecao) {
            throw new IllegalStateException("URL do Appium invalida.", excecao);
        }
    }

    public static String app() { return Path.of(valor("APP_PATH", "apps/mda-2.2.0-25.apk")).toAbsolutePath().toString(); }
    public static String dispositivo() { return valor("DEVICE_NAME", "Android Emulator"); }
    public static String versaoDaPlataforma() { return valor("PLATFORM_VERSION", ""); }
    public static String udid() { return valor("UDID", ""); }
    public static boolean semReset() { return Boolean.parseBoolean(valor("NO_RESET", "false")); }
    public static boolean resetCompleto() { return Boolean.parseBoolean(valor("FULL_RESET", "false")); }

    private static String valor(String nome, String padrao) {
        String valor = System.getProperty(nome.toLowerCase().replace('_', '.'), System.getenv(nome));
        return valor == null || valor.isBlank() ? padrao : valor;
    }
}
