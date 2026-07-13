package br.com.outsera.api.validacao;

import io.qameta.allure.Allure;
import io.restassured.filter.Filter;
import io.restassured.filter.FilterContext;
import io.restassured.response.Response;
import io.restassured.specification.FilterableRequestSpecification;
import io.restassured.specification.FilterableResponseSpecification;
import java.util.regex.Pattern;

public class FiltroDeEvidenciasAllure implements Filter {
    private static final Pattern TOKEN_NO_CORPO = Pattern.compile("(\\\"authorization\\\"\\s*:\\s*\\\")[^\\\"]+", Pattern.CASE_INSENSITIVE);
    private static final Pattern SENHA_NO_CORPO = Pattern.compile("(\\\"password\\\"\\s*:\\s*\\\")[^\\\"]+", Pattern.CASE_INSENSITIVE);

    @Override
    public Response filter(
            FilterableRequestSpecification requisicao,
            FilterableResponseSpecification resposta,
            FilterContext contexto) {
        long inicio = System.nanoTime();
        Response retorno = contexto.next(requisicao, resposta);
        long duracaoEmMilissegundos = (System.nanoTime() - inicio) / 1_000_000;

        Allure.addAttachment("Requisicao " + requisicao.getMethod() + " " + requisicao.getURI(), "text/plain", obterRequisicaoSanitizada(requisicao));
        Allure.addAttachment("Resposta HTTP " + retorno.statusCode(), "application/json", obterRespostaSanitizada(retorno));
        Allure.addAttachment("Metadados da chamada", "text/plain", "status=" + retorno.statusCode() + "\nduracaoMs=" + duracaoEmMilissegundos);
        return retorno;
    }

    private String obterRequisicaoSanitizada(FilterableRequestSpecification requisicao) {
        String cabecalhos = requisicao.getHeaders().asList().stream()
                .map(cabecalho -> cabecalho.getName().equalsIgnoreCase("Authorization")
                        ? "Authorization: Bearer ***"
                        : cabecalho.getName() + ": " + cabecalho.getValue())
                .reduce("", (atual, proximo) -> atual + proximo + "\n");
        return "metodo=" + requisicao.getMethod() + "\nurl=" + requisicao.getURI() + "\n" + cabecalhos
                + "corpo=\n" + sanitizar(requisicao.getBody() == null ? "" : requisicao.getBody().toString());
    }

    private String obterRespostaSanitizada(Response resposta) {
        return "cabecalhos=\n" + resposta.headers() + "\ncorpo=\n" + sanitizar(resposta.asString());
    }

    private String sanitizar(String conteudo) {
        String semToken = TOKEN_NO_CORPO.matcher(conteudo).replaceAll("$1***");
        return SENHA_NO_CORPO.matcher(semToken).replaceAll("$1***");
    }
}
