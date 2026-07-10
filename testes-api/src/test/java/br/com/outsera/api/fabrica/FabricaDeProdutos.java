package br.com.outsera.api.fabrica;

import br.com.outsera.api.modelo.requisicao.ProdutoRequisicao;
import java.util.UUID;

public class FabricaDeProdutos {
    public ProdutoRequisicao criarValido() {
        String identificador = UUID.randomUUID().toString().substring(0, 12);
        return new ProdutoRequisicao("Produto de teste " + identificador, 149, "Produto criado pela automacao", 10);
    }
}
