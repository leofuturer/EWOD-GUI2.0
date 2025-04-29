/// <reference types="cypress" />
beforeEach(() => {
  cy.visit('localhost:3000');
  cy.get('[data-testid="act-seq-start"]').click();
});
describe('Actuation', () => {
  it('Add a sequence to the timeline', () => {
    cy.get('[data-testid="seq-button"]').should('have.length', 1);
    cy.get('[data-testid="add-button"]').click();
    cy.get('[data-testid="seq-button"]').should('have.length', 2);
    cy.get('[data-testid="seq-button"]').first().rightclick();
    cy.contains('Loop').click();
    cy.get('[data-testid="input-from"]').type('1');
    cy.get('[data-testid="input-to"]').type('2');
    cy.get('[data-testid="input-rept"]').type('2');
    cy.contains('Confirm').click();
    cy.get('[data-testid="loop-button"]').should('have.length', 1);
  });

  it('update loop', () => {
    cy.get('[data-testid="add-button"]').click();
    cy.get('[data-testid="add-button"]').click();
    cy.get('[data-testid="seq-button"]').first().rightclick();
    cy.contains('Loop').click();
    cy.get('[data-testid="input-from"]').type('1');
    cy.get('[data-testid="input-to"]').type('2');
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
    cy.get('[data-testid="input-from"]').type('1');
    cy.get('[data-testid="input-to"]').type('2');
    cy.get('[data-testid="input-rept"]').type('2');
    cy.contains('Confirm').click();
    cy.get('[data-testid="seq-button"]').first().rightclick();
    cy.contains('Loop').click();
    cy.get('[data-testid="input-from"]').type('2');
    cy.get('[data-testid="input-to"]').type('3');
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

  it('create multiple loop', () => {
    for (let i = 0; i < 4; i += 1) {
      cy.get('[data-testid="add-button"]').click();
    }
    cy.get('[data-testid="seq-button"]').first().rightclick();
    cy.contains('Loop').click();
    cy.get('[data-testid="input-from"]').type('1');
    cy.get('[data-testid="input-to"]').type('2');
    cy.get('[data-testid="input-rept"]').type('2');
    cy.contains('Confirm').click();
    cy.get('[data-testid="seq-button"]').first().rightclick();
    cy.contains('Loop').click();
    cy.get('[data-testid="input-from"]').type('4');
    cy.get('[data-testid="input-to"]').type('5');
    cy.get('[data-testid="input-rept"]').type('2');
    cy.contains('Confirm').click();
    cy.get('[data-testid="loop-button"]').should('have.length', 2);
    cy.get('[data-testid="loop-button"]').first().click();
    cy.get('[data-testid="input-to"]').type('{backspace}2');
    cy.contains('Confirm').click();
  });

  it('delete, copy, and paste block', () => {
    for (let i = 0; i < 2; i += 1) {
      cy.get('[data-testid="add-button"]').click();
    }
    cy.get('[data-testid="seq-button"]').eq(1).rightclick();
    cy.contains('Copy').click();
    cy.get('[data-testid="seq-button"]').eq(1).rightclick();
    cy.contains('Delete').click();
    cy.get('[data-testid="seq-button"]').should('have.length', 2);
    cy.get('[data-testid="seq-button"]').eq(0).rightclick();
    cy.contains('Paste').click();
    cy.get('[data-testid="seq-button"]').should('have.length', 3);
  });

  it('set duration at once', () => {
    for (let i = 0; i < 2; i += 1) {
      cy.get('[data-testid="add-button"]').click();
    }
    cy.get('[data-testid="set-all-duration"]').click();
    cy.get('[data-testid="duration-all"]').type('{backspace}{backspace}{backspace}500');
    cy.contains('Confirm').click();
    cy.get('[data-testid="seq-button"]').first().find('input').should('have.value', '500');
  });

  it('play the sequence', () => {
    for (let i = 0; i < 4; i += 1) {
      cy.get('[data-testid="add-button"]').click();
    }
    cy.get('[data-testid="seq-button"]').first().rightclick();
    cy.contains('Loop').click();
    cy.get('[data-testid="input-from"]').type('1');
    cy.get('[data-testid="input-to"]').type('2');
    cy.get('[data-testid="input-rept"]').type('2');
    cy.contains('Confirm').click();
    cy.get('[data-testid="seq-button"]').first().rightclick();
    cy.contains('Loop').click();
    cy.get('[data-testid="input-from"]').type('4');
    cy.get('[data-testid="input-to"]').type('5');
    cy.get('[data-testid="input-rept"]').type('2');
    cy.contains('Confirm').click();
    cy.get('[data-testid="set-all-duration"]').click();
    cy.get('[data-testid="duration-all"]').type('{backspace}{backspace}{backspace}500');
    cy.contains('Confirm').click();
    cy.get('[data-testid="play-button"]').click();
  });

  it('remove cached info of loop', () => {
    for (let i = 0; i < 4; i += 1) {
      cy.get('[data-testid="add-button"]').click();
    }
    cy.get('[data-testid="seq-button"]').first().rightclick();
    cy.contains('Loop').click();
    cy.get('[data-testid="input-from"]').type('1');
    cy.get('[data-testid="input-to"]').type('2');
    cy.get('[data-testid="input-rept"]').type('2');
    cy.contains('Confirm').click();
    cy.get('[data-testid="loop-button"]').first().click();
    cy.contains('Cancel').click();
    cy.get('[data-testid="seq-button"]').eq(3).rightclick();
    cy.contains('Loop').click();
    cy.get('[data-testid="input-from"]').should('have.value', '');
    cy.get('[data-testid="input-to"]').should('have.value', '');
    cy.get('[data-testid="input-rept"]').should('have.value', '');
  });

  it('hide context menu while playing', () => {
    for (let i = 0; i < 4; i += 1) {
      cy.get('[data-testid="add-button"]').click();
    }
    cy.get('[data-testid="set-all-duration"]').click();
    cy.get('[data-testid="duration-all"]').type('{backspace}{backspace}{backspace}500');
    cy.contains('Confirm').click();
    cy.get('[data-testid="play-forever"]').click();
    cy.get('[data-testid="play-button"]').click();
    cy.get('[data-testid="seq-button"]').first().rightclick();
    cy.get('[data-testid="act-context-menu"]').should('not.be.visible');
  });

  it('toggle scroll bar', () => {
    cy.get('[data-testid="act-close"]').click();
    cy.get('[data-testid="act-contents"]').should('not.be.visible');
    cy.get('[data-testid="act-open"]').click();
    cy.get('[data-testid="act-contents"]').should('be.visible');
  });
});
