/// <reference types="cypress" />
import { ELEC_SIZE } from '../../src/constants';

beforeEach(() => { cy.visit('localhost:3000'); });

describe('Canvas', () => {
  const CELL1 = { x: 5 * ELEC_SIZE + 10, y: 3 * ELEC_SIZE + 10 };
  const CELL2 = { x: 5 * ELEC_SIZE + 10, y: 4 * ELEC_SIZE + 10 };
  const CELL3 = { x: 4 * ELEC_SIZE + 10, y: 4 * ELEC_SIZE + 10 };
  const CELL4 = { x: 6 * ELEC_SIZE + 10, y: 6 * ELEC_SIZE + 10 };
  const POSITION = { x: 6 * ELEC_SIZE + 10, y: 4 * ELEC_SIZE + 10 };

  it('Add and select square electrode', () => {
    cy.createSquare(CELL1);

    cy.get('[data-testid="square"]').should('have.length', 1);

    cy.get('[data-testid="square"]')
      .should('have.attr', 'x', Math.floor(CELL1.x / ELEC_SIZE) * ELEC_SIZE)
      .should('have.attr', 'y', Math.floor(CELL1.y / ELEC_SIZE) * ELEC_SIZE);

    cy.get('[data-testid="CAN"]').click();
    cy.get('[data-testid="square"]').click();
    cy.get('[data-testid="square"]').should('have.class', 'selected');
  });

  // credit to https://github.com/cypress-io/cypress/issues/3942 for this one
  it('Move square', () => {
    cy.createSquare(CELL1);

    cy.get('[data-testid="CAN"]').click();
    cy.get('[data-testid="square"]').click();

    cy.get('[data-testid="square"]')
      .then(($square) => cy.moveElec($square, CELL1, POSITION));

    cy.get('[data-testid="square"]').parent()
      .should('have.attr', 'style')
      .should('contain', `translate(${ELEC_SIZE}px, ${ELEC_SIZE}px)`);
  });

  it('Delete square', () => {
    cy.createSquare(CELL1);
    cy.get('[data-testid="CAN"]').click();
    cy.get('[data-testid="square"]').click();

    cy.get('.greenArea').rightclick();
    cy.get('ul.menu > li:nth-child(4)').click({ force: true });
    cy.get('[data-testid="square"]').should('have.length', 0);
  });

  it('Combine', () => {
    cy.createSquare(CELL2);
    cy.createSquare(CELL3);

    cy.get('[data-testid="CAN"]').click();
    cy.get('[data-testid="square"]').click({ multiple: true });
    cy.get('.greenArea').rightclick();
    cy.get('ul.menu > li:nth-child(5)').click({ force: true });
    cy.get('[data-testid="square"]').should('have.length', 0);
    cy.get('[data-testid="combined"]').should('have.length', 1);
  });

  it('Overlap', () => {
    cy.createSquare(CELL2);
    cy.createSquare(CELL3);
    cy.createSquare(CELL4);
    cy.get('[data-testid="CAN"]').click();

    cy.get('[data-testid="square"]').eq(0).click();
    cy.get('[data-testid="square"]').eq(1).click();
    cy.get('.greenArea').rightclick();
    cy.get('ul.menu > li:nth-child(5)').click({ force: true });

    cy.get('[data-testid="square"]')
      .then(($square) => cy.moveElec($square, CELL4, CELL2));

    cy.get('[data-testid="alert-box-error"]').should('be.visible');
    cy.get('[data-testid="square"]').parent()
      .should('have.attr', 'style')
      .should('contain', 'translate(0px, 0px)');
  });

  it('Move off canvas', () => {
    cy.createSquare(CELL2);
    cy.createSquare(CELL3);

    cy.get('[data-testid="CAN"]').click();

    cy.get('[data-testid="square"]').click({ multiple: true });
    cy.get('.greenArea').rightclick();
    cy.get('ul.menu > li:nth-child(5)').click({ force: true });

    cy.get('[data-testid="combined"]')
      .then(($comb) => cy.moveElec($comb, CELL2, { x: -10, y: 10 }));
    cy.get('[data-testid="alert-box-error"]').should('be.visible');
  });

  it('Clear canvas', () => {
    cy.createSquare(CELL1);
    cy.createSquare(CELL2);
    cy.createSquare(CELL3);
    cy.createSquare(CELL4);

    cy.get('[data-testid="CAN"]').click();
    cy.get('[data-testid="square"]').eq(2).click();
    cy.get('[data-testid="square"]').eq(3).click();
    cy.get('.greenArea').rightclick();
    cy.get('ul.menu > li:nth-child(5)').click({ force: true });

    cy.get('[data-testid="clear"]').click();
    cy.contains('Confirm').click();
    cy.get('[data-testid="square"]').should('have.length', 0);
    cy.get('[data-testid="combined"]').should('have.length', 0);
  });
});
