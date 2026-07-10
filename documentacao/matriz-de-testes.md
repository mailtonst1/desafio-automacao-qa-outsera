# Matriz de testes

| Modulo | Alvo | Ferramentas | Status |
| --- | --- | --- | --- |
| API | ServeRest local | Java, Maven Wrapper, REST Assured, JUnit 5, Jackson, JSON Schema Validator, Allure | Implementado: autenticação, usuários, produtos, carrinhos e contrato |
| Web E2E | Automation Exercise | Cypress, TypeScript, Cucumber, Allure | Somente fundacao |
| Mobile | Sauce Labs My Demo App Android | Java, Maven, Appium, UiAutomator2, JUnit 5, Allure | Somente fundacao |
| Performance | ServeRest local | k6 | Somente fundacao |

## Cobertura planejada

- API: fluxos de autenticacao, usuario, produto e carrinho.
- Web: cadastro de usuario, login, busca de produtos, carrinho e fluxos proximos ao checkout.
- Mobile: catalogo, carrinho, navegacao e fluxos proximos ao checkout.
- Performance: smoke de health check e cenario de carga com 500 VUs.
