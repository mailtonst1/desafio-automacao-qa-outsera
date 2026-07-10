package br.com.outsera.api.suporte;

import br.com.outsera.api.cliente.ClienteDeCarrinhos;
import br.com.outsera.api.cliente.ClienteDeProdutos;
import br.com.outsera.api.cliente.ClienteDeUsuarios;
import io.qameta.allure.Allure;

public class GerenciadorDeLimpeza {
    private final ClienteDeCarrinhos carrinhos;
    private final ClienteDeProdutos produtos;
    private final ClienteDeUsuarios usuarios;

    public GerenciadorDeLimpeza(ClienteDeCarrinhos carrinhos, ClienteDeProdutos produtos, ClienteDeUsuarios usuarios) {
        this.carrinhos = carrinhos;
        this.produtos = produtos;
        this.usuarios = usuarios;
    }

    public void limparDadosCriados(RegistroDeRecursosCriados registro) {
        registro.obterTokensComCarrinho().forEach(this::cancelarCarrinhoSemMascararFalha);
        registro.obterProdutos().forEach(produto -> executarComRegistro("produto " + produto.id(), () -> produtos.excluir(produto.id(), produto.tokenAdministrador())));
        registro.obterUsuarios().forEach(id -> executarComRegistro("usuario " + id, () -> usuarios.excluir(id)));
    }

    private void cancelarCarrinhoSemMascararFalha(String token) {
        executarComRegistro("carrinho do usuario", () -> carrinhos.cancelarCompra(token));
    }

    private void executarComRegistro(String recurso, Runnable operacao) {
        try {
            operacao.run();
        } catch (Exception erro) {
            Allure.addAttachment("Falha na limpeza de " + recurso, "text/plain", erro.getMessage() == null ? erro.toString() : erro.getMessage());
        }
    }
}
