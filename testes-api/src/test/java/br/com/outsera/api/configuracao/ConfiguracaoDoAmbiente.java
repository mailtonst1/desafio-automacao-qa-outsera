package br.com.outsera.api.configuracao;

public final class ConfiguracaoDoAmbiente {
    private static final String URL_PADRAO = "http://localhost:3000";

    private ConfiguracaoDoAmbiente() {
    }

    public static String obterUrlBase() {
        String url = System.getProperty("base.url");
        if (url == null || url.isBlank()) {
            url = System.getenv("BASE_URL");
        }
        if (url == null || url.isBlank()) {
            url = URL_PADRAO;
        }
        return url.replaceAll("/+$", "");
    }
}
