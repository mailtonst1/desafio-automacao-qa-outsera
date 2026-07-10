package br.com.outsera.api.suporte;

import java.util.ArrayList;
import java.util.List;

public class RegistroDeRecursosCriados {
    private final List<String> usuarios = new ArrayList<>();
    private final List<ProdutoCriado> produtos = new ArrayList<>();
    private final List<String> tokensComCarrinho = new ArrayList<>();

    public void registrarUsuario(String id) {
        usuarios.add(id);
    }

    public void registrarProduto(String id, String tokenAdministrador) {
        produtos.add(new ProdutoCriado(id, tokenAdministrador));
    }

    public void registrarCarrinho(String tokenUsuario) {
        tokensComCarrinho.add(tokenUsuario);
    }

    public List<String> obterUsuarios() {
        return usuarios;
    }

    public List<ProdutoCriado> obterProdutos() {
        return produtos;
    }

    public List<String> obterTokensComCarrinho() {
        return tokensComCarrinho;
    }

    public record ProdutoCriado(String id, String tokenAdministrador) {
    }
}
