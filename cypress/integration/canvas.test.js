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
      .should('have.attr', 'x', POSITION.x - 10)
      .should('have.attr', 'y', POSITION.y - 10);
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

  it('Separate', () => {
    cy.createSquare(CELL2);
    cy.createSquare(CELL3);

    // combine
    cy.get('[data-testid="CAN"]').click();
    cy.drag(CELL3, CELL2);
    cy.get('.greenArea').rightclick({ force: true });
    cy.get('ul.menu > li:nth-child(6)').click({ force: true });

    // now separate
    cy.get('[data-testid="combined"]').click({ force: true });
    cy.get('.greenArea').rightclick({ force: true });
    cy.get('ul.menu > li:nth-child(7)').click({ force: true });
    cy.get('[data-testid="square"]')
      .should((sub) => {
        expect(sub[0].id).to.match(/S[01]/);
        expect(sub[1].id).to.match(/S[01]/);
      });
  });

  it('Copy paste square', () => {
    cy.createSquare(CELL2);
    cy.get('[data-testid="CAN"]').click();
    cy.get('[data-testid="square"]').click({ force: true });

    cy.get('.greenArea').rightclick({ force: true });
    cy.get('ul.menu > li:nth-child(3)').click({ force: true });

    cy.get('.greenArea').rightclick(CELL4.x, CELL4.y, { force: true });
    cy.get('ul.menu > li:nth-child(4)').click({ force: true });

    cy.get('[data-testid="square"]')
      .eq(1)
      .should('have.attr', 'x', CELL4.x - 10, CELL4.y - 10);
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
      .should('have.attr', 'x', CELL4.x - 10)
      .should('have.attr', 'y', CELL4.y - 10);
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

    // do a major state change to ensure combined electrode
    // doesn't suddenly get chopped at canvas edge
    cy.get('[data-testid="PIN"]').click();
    cy.get('[data-testid="combined"]')
      .should('have.attr', 'd', 'M140 140 L140 170 L175 170 L175 140 Z M175 140 L175 170 L205 170 L205 140 Z ');
    // the path for combined rects at CELL2 and CELL3
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

  it('panning button changes color', () => {
    cy.get('[data-testid="PAN"] > svg')
      .should(($el) => {
        const styleSplit = $el[0].getAttribute('style').split(/; ?/);
        expect(styleSplit[0]).to.equal('color: rgb(160, 105, 51)');
      });
    cy.get('[data-testid="PAN"] > svg').click();
    cy.get('[data-testid="PAN"] > svg')
      .should(($el) => {
        const styleSplit = $el[0].getAttribute('style').split(/; ?/);
        expect(styleSplit[0]).to.equal('color: rgb(35, 168, 41)');
      });
  });

  it('Not drawing while panning', () => {
    cy.get('[data-testid="PAN"]').click();
    cy.createSquare(CELL4);
    cy.get('[data-testid="square"]').should('have.length', 0);
  });

  it('Drag with middle mouse button to pan', () => {
    cy.get('.greenArea')
      .trigger('mousedown', CELL2.x, CELL2.y, {
        which: 2,
        force: true,
      })
      .trigger('mousemove', CELL2.x, CELL2.y, {
        which: 2,
        force: true,
      })
      .trigger('mousemove', CELL4.x, CELL4.y, {
        which: 2,
        force: true,
      })
      .trigger('mouseup', CELL4.x, CELL4.y, {
        force: true,
      });

    cy.get('.greenArea').parent()
      .should(
        'have.attr',
        'style',
        `transform: translate3d(${CELL4.x - CELL2.x}px, ${CELL4.y - CELL2.y}px, 0px) scale(1);`,
      );
  });

  it('Canvas does not zoom outside svg in non-PIN mode', () => {
    // move canvas out of the way to get at outer regions
    cy.drag(CELL3, CELL4, '.greenArea', 2);

    // try to zoom outside svg but within canvas region/wrapper
    cy.get('.wrapper')
      .trigger('wheel', 100, 50, { deltaY: 10 });

    cy.get('.greenArea').parent() // should be unchanged
      .should(
        'have.attr',
        'style',
        `transform: translate3d(${CELL4.x - CELL3.x}px, ${CELL4.y - CELL3.y}px, 0px) scale(1);`,
      );
  });

  it('Canvas does not pan outside svg in non-PIN mode', () => {
    // move canvas out of the way to get at outer regions
    cy.drag(CELL3, CELL4, '.greenArea', 2);

    // try to pan outside svg but within canvas region/wrapper
    cy.get("[data-testid='PAN']").click();
    const from = { x: 100, y: 50 };
    const to = { x: 100, y: 100 };
    cy.drag(from, to, '.wrapper');

    cy.get('.greenArea').parent() // should be unchanged
      .should(
        'have.attr',
        'style',
        `transform: translate3d(${CELL4.x - CELL3.x}px, ${CELL4.y - CELL3.y}px, 0px) scale(1);`,
      );
  });

  it('Undo create square', () => {
    cy.createSquare(CELL1);

    cy.get('[data-testid="undo"]').click();
    cy.get('[data-testid="square"]').should('not.exist');
  });

  it('Undo delete squares', () => {
    cy.createSquare(CELL3);
    cy.createSquare(CELL4);

    cy.get('[data-testid="CAN"]').click();

    cy.drag(CELL3, CELL4, '.greenArea');
    cy.get('.greenArea').rightclick({ force: true });
    cy.get('ul.menu > li:nth-child(5)').click({ force: true }); // delete elecs

    cy.get('[data-testid="undo"]').click();
    cy.get('[data-testid="square"]').should('have.length', 2);
  });

  it('Redo create square', () => {
    cy.createSquare(CELL1);

    cy.get('[data-testid="undo"]').click();
    cy.get('[data-testid="redo"]').click();
    cy.get('[data-testid="square"]').should('have.length', 1);
  });

  it('Redo delete squares', () => {
    cy.createSquare(CELL3);
    cy.createSquare(CELL4);

    cy.get('[data-testid="CAN"]').click();

    cy.drag(CELL3, CELL4, '.greenArea');
    cy.get('.greenArea').rightclick({ force: true });
    cy.get('ul.menu > li:nth-child(5)').click({ force: true }); // delete elecs

    cy.get('[data-testid="undo"]').click();
    cy.get('[data-testid="redo"]').click();
    cy.get('[data-testid="square"]').should('not.exist');
  });

  // pins tests
  it('Assign pin to square electrode', () => {
    cy.createSquare(CELL1);

    cy.get('[data-testid="PIN"]').click();
    cy.get('[data-testid="square"]').click({ force: true });
    cy.get('[data-testid="square"]').should('have.class', 'toPin');

    cy.get('.pin').contains('97').click({ force: true });

    cy.get('text')
      .should('have.attr', 'x', Math.floor(CELL1.x / ELEC_SIZE) * ELEC_SIZE + 2)
      .should('have.attr', 'y', Math.floor(CELL1.y / ELEC_SIZE) * ELEC_SIZE + ELEC_SIZE / 2)
      .should('contain', '97');
  });

  it('Select pin before electrode', () => {
    // doing the pin mapping out of order shouldn't crash or break anything
    // the mapping just shouldn't work
    // a proper mapping consists of clicking electrode and then clicking its corresponding pin
    cy.createSquare(CELL1);

    cy.get('[data-testid="PIN"]').click();
    cy.get('.pin').contains('97').click({ force: true });

    cy.get('[data-testid="square"]').click({ force: true });
    cy.get('text').should('not.exist');

    cy.get('.pin').contains('97').click({ force: true });

    cy.get('text')
      .should('have.attr', 'x', Math.floor(CELL1.x / ELEC_SIZE) * ELEC_SIZE + 2)
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
      .should('have.attr', 'x', Math.floor(CELL4.x / ELEC_SIZE) * ELEC_SIZE + 2)
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
      .should('have.attr', 'x', Math.floor(CELL2.x / ELEC_SIZE) * ELEC_SIZE + 2)
      .should('have.attr', 'y', Math.floor(CELL2.y / ELEC_SIZE) * ELEC_SIZE + ELEC_SIZE / 2)
      .should('contain', '130');
  });

  it('Assign pin to combined electrode', () => {
    cy.createSquare(CELL2);
    cy.createSquare(CELL3);

    cy.get('[data-testid="CAN"]').click();
    cy.drag(CELL3, CELL2);
    cy.get('.greenArea').rightclick({ force: true });
    cy.get('ul.menu > li:nth-child(6)').click({ force: true });
    cy.get('[data-testid="square"]').should('have.length', 0);
    cy.get('[data-testid="combined"]').should('have.length', 1);

    cy.get('[data-testid="PIN"]').click();
    cy.get('[data-testid="combined"]').click({ force: true });
    cy.get('[data-testid="combined"]').should('have.class', 'toPin');

    cy.get('.pin').contains('97').click({ force: true });

    cy.get('text')
      .should('have.attr', 'x', Math.floor(CELL2.x / ELEC_SIZE) * ELEC_SIZE + 2)
      .should('have.attr', 'y', Math.floor(CELL2.y / ELEC_SIZE) * ELEC_SIZE + ELEC_SIZE / 2)
      .should('contain', '97');
  });

  it('Bottom row should be visible', () => {
    cy.get('[data-testid="PIN"]').click();
    cy.get('.pin').contains('174').should('be.visible');
  });

  it('Delete One Mapping', () => {
    cy.createSquare(CELL2);
    cy.get('[data-testid="square"]').click({ force: true });
    cy.get('[data-testid="PIN"]').click();
    cy.get('.pin').contains('97').click({ force: true });

    cy.get('[data-testid="PIN"]').click();
    cy.get('.greenArea').rightclick({ force: true });
    cy.get('ul.menu > li:nth-child(1)').click({ force: true });
    cy.get('text').should('not.exist');
  });

  it('Delete Multiple Mappings', () => {
    cy.createSquare(CELL1); // to be combined with CELL2 and assigned pin #
    cy.createSquare(CELL2);
    cy.createSquare(CELL3); // to be assigned pin #
    cy.createSquare(CELL4); // will not get pin #

    // combine CELL1 and CELL2
    cy.get('[data-testid="CAN"]').click();
    cy.drag(CELL1, CELL2);
    cy.get('.greenArea').rightclick({ force: true });
    cy.get('ul.menu > li:nth-child(6)').click({ force: true });

    // assign pins
    cy.get('[data-testid="PIN"]').click();
    cy.get('[data-testid="combined"]').click({ force: true });
    cy.get('.pin').contains('97').click({ force: true });

    cy.get('[data-testid="square"]').eq(0).click({ force: true });
    cy.get('.pin').contains('47').click({ force: true });

    // delete every electrode's pin #
    cy.drag(CELL3, CELL4);
    cy.get('.greenArea').rightclick({ force: true });
    cy.get('ul.menu > li:nth-child(1)').click({ force: true });
    cy.get('text').should('not.exist');
  });

  it('REF maps to 1 electrode at a time', () => {
    cy.createSquare(CELL1);
    cy.createSquare(CELL2);
    cy.createSquare(CELL3);

    // combine CELL2 and CELL3
    cy.get('[data-testid="CAN"]').click();
    cy.drag(CELL3, CELL2);
    cy.get('.greenArea').rightclick({ force: true });
    cy.get('ul.menu > li:nth-child(6)').click({ force: true });

    // assign REF to combined then assign to CELL1
    cy.get('[data-testid="PIN"]').click();
    cy.get('[data-testid="combined"]').click({ force: true });
    cy.get('.ref').eq(2).click({ force: true });

    // verify that combined has been assigned REF
    cy.get('text')
      .should('have.attr', 'x', Math.floor(CELL2.x / ELEC_SIZE) * ELEC_SIZE + 2)
      .should('have.attr', 'y', Math.floor(CELL2.y / ELEC_SIZE) * ELEC_SIZE + ELEC_SIZE / 2)
      .should('contain', 'REF');

    // assign to CELL1
    cy.get('[data-testid="square"]').click({ force: true });
    cy.get('.ref').eq(6).click({ force: true });

    // verify that CELL1 has been assigned REF
    cy.get('text')
      .should('have.attr', 'x', Math.floor(CELL1.x / ELEC_SIZE) * ELEC_SIZE + 2)
      .should('have.attr', 'y', Math.floor(CELL1.y / ELEC_SIZE) * ELEC_SIZE + ELEC_SIZE / 2)
      .should('contain', 'REF');
  });

  it('Pan chassis and canvas together', () => {
    cy.get('[data-testid="PIN"]').click();

    const from = { x: 150, y: 150 };
    const to = { x: 200, y: 200 };
    cy.get('#chassis')
      .trigger('mousedown', from.x, from.y, {
        which: 2,
        force: true,
      })
      .trigger('mousemove', from.x, from.y, {
        which: 2,
        force: true,
      })
      .trigger('mousemove', to.x, to.y, {
        which: 2,
        force: true,
      })
      .trigger('mouseup', to.x, to.y, {
        force: true,
      });

    cy.get('#chassis').parent()
      .should(
        'have.attr',
        'style',
        `transform: translate3d(${to.x - from.x}px, ${to.y - from.y}px, 0px) scale(1);`,
      );
  });

  it('Panning on green without panning mode', () => {
    cy.get('[data-testid="PIN"]').click();

    cy.get('.greenArea')
      .trigger('mousedown', CELL1.x, CELL1.y, {
        which: 2,
        force: true,
      })
      .trigger('mousemove', CELL1.x, CELL1.y, {
        which: 2,
        force: true,
      })
      .trigger('mousemove', CELL2.x, CELL2.y, {
        which: 2,
        force: true,
      })
      .trigger('mouseup', CELL2.x, CELL2.y, {
        force: true,
      });

    cy.get('.greenArea').parent()
      .should(
        'have.attr',
        'style',
        'transform: translate3d(0px, 0px, 0px) scale(0.51);',
      );
  });

  it('Zoom chassis and canvas together', () => {
    cy.get('[data-testid="PIN"]').click();

    cy.get('#chassis')
      .trigger('wheel', 150, 150, { deltaY: 10 });

    cy.get('#chassis').parent()
      .should(($el) => {
        const styleSplit = $el[0].getAttribute('style').split(/[(,)]/);
        expect(styleSplit[styleSplit.indexOf(' scale') + 1]).to.not.equal('1');
      });
    // if #chassis doesn't have scale=1, means everything in it,
    // including the canvas, was also scaled
  });

  it('Pan chassis and canvas together', () => {
    cy.get('[data-testid="PIN"]').click();

    // drag outside canvas wrapper
    cy.get('[data-testid="PAN"]').click();
    const to = { x: 200, y: 200 };
    const from = { x: 150, y: 150 };

    cy.drag(from, to, '#chassis');

    cy.get('#chassis').parent()
      .should(($el) => {
        const styleSplit = $el[0].getAttribute('style').split(/ scale/);
        expect(styleSplit[0]).to.not.equal('transform: translate3d(0px, 0px, 0px)');
      });
    // if #chassis doesn't have 0 translation, means everything in it,
    // including the canvas, was translated
  });

  it('Canvas does not zoom outside svg in PIN mode', () => {
    cy.get('[data-testid="PIN"]').click();

    // zoom within canvas wrapper but outside the svg
    cy.get('#chassis')
      .trigger('wheel', 1300, 450, { deltaY: 10, force: true });

    // zoom outside svg but within canvas wrapper should be
    // perceived as zoom on chassis region
    cy.get('.greenArea').parent()
      .should(($el) => {
        const styleSplit = $el[0].getAttribute('style').split(/[(,)]/);
        expect(styleSplit[styleSplit.indexOf(' scale') + 1]).to.equal('0.51');
      });

    cy.get('#chassis').parent()
      .should(($el) => {
        const styleSplit = $el[0].getAttribute('style').split(/[(, )]/);
        expect(styleSplit[styleSplit.indexOf(' scale') + 1]).to.not.equal('1');
      });
  });
});
