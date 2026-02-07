describe('Login Page', () => {
  it('loads and shows login form', () => {
    cy.visit('/login');

    cy.contains('Project Manager');
    cy.contains('Login');

    cy.get('input[type="email"]').should('exist').and('be.visible');
    cy.get('input[type="password"]').should('exist').and('be.visible');
    cy.get('button[type="submit"]').should('contain', 'Login');
  });
});
