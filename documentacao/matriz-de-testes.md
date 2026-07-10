# Matriz de testes

| Modulo | Alvo | Ferramentas | Status |
| --- | --- | --- | --- |
| API | ServeRest local | Java, Maven, REST Assured, JUnit 5, Allure | Somente fundacao |
| Web E2E | Automation Exercise | Cypress, TypeScript, Cucumber, Allure | Somente fundacao |
| Mobile | Sauce Labs My Demo App Android | Java, Maven, Appium, UiAutomator2, JUnit 5, Allure | Somente fundacao |
| Performance | ServeRest local | k6 | Somente fundacao |

## Cobertura planejada

- API: fluxos de autenticacao, usuario, produto e carrinho.
- Web: cadastro de usuario, login, busca de produtos, carrinho e fluxos proximos ao checkout.
- Mobile: catalogo, carrinho, navegacao e fluxos proximos ao checkout.
- Performance: smoke de health check e cenario de carga com 500 VUs.
