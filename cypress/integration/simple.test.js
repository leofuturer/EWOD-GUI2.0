/// <reference types="cypress" />
beforeEach(() => { cy.visit('localhost:3000'); });
describe('Actuation', () => {
  it('Add a sequence to the timeline', () => {
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

  it('update loop', () => {
    cy.get('[data-testid="add-button"]').click();
    cy.get('[data-testid="add-button"]').click();
    cy.get('[data-testid="seq-button"]').first().rightclick();
    cy.contains('Loop').click();
    cy.get('[data-testid="input-from"]').type('0');
    cy.get('[data-testid="input-to"]').type('1');
    cy.get('[data-testid="input-rept"]').type('2');
    cy.contains('Confirm').click();
    cy.get('[data-testid="loop-button"]').click();
    cy.get('[data-testid="input-to"]').type('{backspace}2');
    cy.contains('Confirm').click();
    cy.get('[data-testid="alert-box-success"]').should('be.visible');
  });

  it('raise error when overlap', () => {
    cy.get('[data-testid="add-button"]').click();
    cy.get('[data-testid="add-button"]').click();
    cy.get('[data-testid="seq-button"]').first().rightclick();
    cy.contains('Loop').click();
    cy.get('[data-testid="input-from"]').type('0');
    cy.get('[data-testid="input-to"]').type('1');
    cy.get('[data-testid="input-rept"]').type('2');
    cy.contains('Confirm').click();
    cy.get('[data-testid="seq-button"]').first().rightclick();
    cy.contains('Loop').click();
    cy.get('[data-testid="input-from"]').type('1');
    cy.get('[data-testid="input-to"]').type('2');
    cy.get('[data-testid="input-rept"]').type('3');
    cy.contains('Confirm').click();
    cy.get('[data-testid="alert-box-error"]').should('be.visible');
  });

  it('delete all', () => {
    for (let i = 0; i < 3; i += 1) {
      cy.get('[data-testid="add-button"]').click();
    }
    cy.get('[data-testid="seq-button"]').should('have.length', 4);
    cy.get('[data-testid="delete-start"]').click();
    cy.contains('Confirm').click();
    cy.get('[data-testid="seq-button"]').should('have.length', 1);
  });
});
