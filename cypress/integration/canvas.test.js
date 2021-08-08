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
    cy.get('[data-testid="square"]').click({ force: true });
    cy.get('[data-testid="square"]').should('have.class', 'selected');
  });

  // credit to https://github.com/cypress-io/cypress/issues/3942 for this one
  it('Move square', () => {
    cy.createSquare(CELL1);

    cy.get('[data-testid="CAN"]').click();
    cy.get('[data-testid="square"]').click({ force: true });

    cy.get('[data-testid="square"]')
      .then(($square) => cy.moveElec($square, CELL1, POSITION));

    cy.get('[data-testid="square"]')
      .should('have.attr', 'style')
      .should('contain', `translate(${ELEC_SIZE}px, ${ELEC_SIZE}px)`);
  });

  it('Delete square', () => {
    cy.createSquare(CELL1);
    cy.get('[data-testid="CAN"]').click();
    cy.get('[data-testid="square"]').click({ force: true });

    cy.get('.greenArea').rightclick({ force: true });
    cy.get('ul.menu > li:nth-child(5)').click({ force: true });
    cy.get('[data-testid="square"]').should('have.length', 0);
  });

  it('Combine', () => {
    cy.createSquare(CELL2);
    cy.createSquare(CELL3);

    cy.get('[data-testid="CAN"]').click();
    cy.drag(CELL3, CELL2);
    cy.get('.greenArea').rightclick({ force: true });
    cy.get('ul.menu > li:nth-child(6)').click({ force: true });
    cy.get('[data-testid="square"]').should('have.length', 0);
    cy.get('[data-testid="combined"]').should('have.length', 1);
  });

  it('Overlap', () => {
    cy.createSquare(CELL2);
    cy.createSquare(CELL3);
    cy.createSquare(CELL4);
    cy.get('[data-testid="CAN"]').click();

    cy.drag(CELL3, CELL2);
    cy.get('.greenArea').rightclick({ force: true });
    cy.get('ul.menu > li:nth-child(6)').click({ force: true });

    cy.get('[data-testid="square"]')
      .click({ force: true })
      .then(($square) => cy.moveElec($square, CELL4, CELL2));

    cy.get('[data-testid="alert-box-error"]').should('be.visible');
    cy.get('[data-testid="square"]')
      .should('have.attr', 'style')
      .should('contain', 'translate(0px, 0px)');
  });

  it('Move off canvas', () => {
    cy.createSquare(CELL2);
    cy.createSquare(CELL3);

    cy.get('[data-testid="CAN"]').click();

    cy.drag(CELL2, CELL3);
    cy.get('.greenArea').rightclick({ force: true });
    cy.get('ul.menu > li:nth-child(6)').click({ force: true });

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000); // wait 1s for all the electrodes to be deleted
    // and for the combined electrode to appear
    cy.get('[data-testid="combined"]')
      .click({ force: true })
      .then(($comb) => cy.moveElec($comb, CELL2, { x: -10, y: 10 }));
    cy.get('[data-testid="alert-box-error"]').should('be.visible');
  });

  it('Clear canvas', () => {
    cy.createSquare(CELL1);
    cy.createSquare(CELL2);
    cy.createSquare(CELL3);
    cy.createSquare(CELL4);

    cy.get('[data-testid="CAN"]').click();
    cy.drag(CELL1, CELL2);
    cy.get('.greenArea').rightclick({ force: true });
    cy.get('ul.menu > li:nth-child(6)').click({ force: true });

    cy.get('[data-testid="clear"]').click();
    cy.contains('Confirm').click();
    cy.get('[data-testid="square"]').should('have.length', 0);
    cy.get('[data-testid="combined"]').should('have.length', 0);
  });

  // pins tests
  it('Assign pin to square electrode', () => {
    cy.createSquare(CELL1);

    cy.get('[data-testid="PIN"]').click();
    cy.get('[data-testid="square"]').click({ force: true });
    cy.get('[data-testid="square"]').should('have.class', 'toPin');

    cy.get('.pin').contains('97').click({ force: true });

    cy.get('text')
      .should('have.attr', 'x', Math.floor(CELL1.x / ELEC_SIZE) * ELEC_SIZE + 5)
      .should('have.attr', 'y', Math.floor(CELL1.y / ELEC_SIZE) * ELEC_SIZE + ELEC_SIZE / 2)
      .should('contain', '97');
  });

  it('Assign two pins to square', () => {
    cy.createSquare(CELL4);

    cy.get('[data-testid="PIN"]').click();
    cy.get('[data-testid="square"]').click({ force: true });
    cy.get('[data-testid="square"]').should('have.class', 'toPin');

    cy.get('.pin').contains('97').click({ force: true });
    cy.get('.pin').contains('130').click({ force: true });

    cy.get('text')
      .should('have.attr', 'x', Math.floor(CELL4.x / ELEC_SIZE) * ELEC_SIZE + 5)
      .should('have.attr', 'y', Math.floor(CELL4.y / ELEC_SIZE) * ELEC_SIZE + ELEC_SIZE / 2)
      .should('contain', '130');
  });

  it('Snatch pin number from another square', () => {
    cy.createSquare(CELL2);
    cy.createSquare(CELL4);

    cy.get('[data-testid="PIN"]').click();
    cy.get('[data-testid="square"]')
      .eq(0)
      .click({ force: true })
      .should('have.class', 'toPin');
    cy.get('.pin').contains('97').click({ force: true });

    cy.get('[data-testid="square"]')
      .eq(1)
      .click({ force: true })
      .should('have.class', 'toPin');
    cy.get('.pin').contains('130').click({ force: true });

    cy.get('[data-testid="square"]')
      .eq(0)
      .click({ force: true });
    cy.get('.pin').contains('130').click({ force: true });
    cy.get('text')
      .should('have.length', 1)
      .should('have.attr', 'x', Math.floor(CELL2.x / ELEC_SIZE) * ELEC_SIZE + 5)
      .should('have.attr', 'y', Math.floor(CELL2.y / ELEC_SIZE) * ELEC_SIZE + ELEC_SIZE / 2)
      .should('contain', '130');
  });

  it('Assign pin to combined electrode', () => {
    cy.createSquare(CELL2);
    cy.createSquare(CELL3);

    cy.get('[data-testid="CAN"]').click();
    cy.get('[data-testid="square"]').click({ multiple: true, force: true });
    cy.get('.greenArea').rightclick({ force: true });
    cy.get('ul.menu > li:nth-child(5)').click({ force: true });
    cy.get('[data-testid="square"]').should('have.length', 0);
    cy.get('[data-testid="combined"]').should('have.length', 1);

    cy.get('[data-testid="PIN"]').click();
    cy.get('[data-testid="combined"]').click({ force: true });
    cy.get('[data-testid="combined"]').should('have.class', 'toPin');

    cy.get('.pin').contains('97').click({ force: true });

    cy.get('text')
      .should('have.attr', 'x', Math.floor(CELL2.x / ELEC_SIZE) * ELEC_SIZE + 5)
      .should('have.attr', 'y', Math.floor(CELL2.y / ELEC_SIZE) * ELEC_SIZE + ELEC_SIZE / 2)
      .should('contain', '97');
  });

  it('Bottom row should be visible', () => {
    cy.get('[data-testid="PIN"]').click();
    cy.get('.pin').contains('174').should('be.visible');
  });
});
