/// <reference types="cypress" />
describe('Actuation', () => {
  it('Add a sequence to the timeline', () => {
    cy.visit('localhost:3000');
    cy.get('[data-testid="seq-button"]').should('have.length', 1);
    cy.get('[data-testid="add-button"]').click();
    cy.get('[data-testid="seq-button"]').should('have.length', 2);
    cy.get('[data-testid="seq-button"]').first().rightclick();
    cy.contains('Loop').click();
    cy.get('[data-testid="input-from"]').type('0');
    cy.get('[data-testid="input-to"]').type('1');
    cy.get('[data-testid="input-rept"]').type('2');
    cy.contains('Confirm').click();
    cy.get('[data-testid="loop-button"]').should('have.length', 1);
  });
});
