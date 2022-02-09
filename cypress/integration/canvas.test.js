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

  it('Copy paste multiple combined', () => {
    // combine 2 electrodes
    cy.createSquare(CELL2);
    cy.createSquare(CELL3);
    cy.get('[data-testid="CAN"]').click();
    cy.drag(CELL3, CELL2);
    cy.get('.greenArea').rightclick({ force: true });
    cy.get('ul.menu > li:nth-child(6)').click({ force: true });

    // copy
    cy.drag(CELL2, CELL3);
    cy.get('.greenArea').rightclick({ force: true });
    cy.get('ul.menu > li:nth-child(3)').click({ force: true });

    // paste
    const pos1 = 7 * ELEC_SIZE + 10;
    cy.get('.greenArea').rightclick(pos1, pos1, { force: true });
    cy.get('ul.menu > li:nth-child(4)').click({ force: true });

    // paste again
    const pos2 = 9 * ELEC_SIZE + 10;
    cy.get('.greenArea').rightclick(pos2, pos2, { force: true });
    cy.get('ul.menu > li:nth-child(4)').click({ force: true });

    // assert they all have diff ids
    cy.get('[data-testid="combined"]')
      .should(($el) => {
        expect($el).to.have.lengthOf(3);
        expect($el[0].getAttribute('id')).not.to.equal($el[1].getAttribute('id'));
        expect($el[1].getAttribute('id')).not.to.equal($el[2].getAttribute('id'));
        expect($el[2].getAttribute('id')).not.to.equal($el[0].getAttribute('id'));
      });

    // hard to assert positions since they're path objs with no clear singular coordinates
    // but try to drag select 3rd combined electrode and see if it turns blue
    cy.drag({ x: pos2, y: pos2 }, { x: pos2, y: pos2 });
    cy.get('path.selected').should(($el) => {
      expect($el).to.have.lengthOf(1);
      expect($el[0].getAttribute('id')).to.equal('C2');
    });
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
    cy.drag(CELL2, CELL4, '.greenArea', 2);

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

  it('Select box gone after context menu op (combine)', () => {
    cy.createSquare(CELL1);
    cy.createSquare(CELL2);

    // combine
    cy.get('[data-testid="CAN"]').click();
    cy.drag(CELL1, CELL2);
    cy.get('.greenArea').rightclick({ force: true });
    cy.get('ul.menu > li:nth-child(6)').click({ force: true });

    // select box shouldn't be visible
    cy.get('rect[style="fill: rgba(0, 162, 255, 0.2);"]')
      .should('not.be.visible');
  });

  it('No transient select color', () => {
    cy.createSquare(CELL2);

    cy.get('[data-testid="CAN"]').click();
    cy.get('.greenArea')
      .trigger('mousedown', CELL3.x, CELL3.y, {
        which: 1,
        force: true,
      })
      .trigger('mousemove', CELL3.x, CELL3.y, {
        which: 1,
        force: true,
      })
      .trigger('mousemove', CELL4.x, CELL4.y, {
        which: 1,
        force: true,
      });

    cy.get('[data-testid="square"]')
      .should(($el) => {
        expect($el[0]).not.to.have.property('fill');
        expect($el[0].getAttribute('style')).not.to.contain('fillOpacity');
      });
  });

  it('No shift click-select squares', () => {
    // without holding down the shift keep,
    // clicking on multiple squares will only select the latest clicked
    cy.createSquare(CELL3);
    cy.createSquare(CELL4);

    cy.get('[data-testid="CAN"]').click();
    cy.get('[data-testid="square"]').eq(0).click();
    cy.get('[data-testid="square"]')
      .eq(0)
      .should('have.class', 'selected');

    cy.get('[data-testid="square"]').eq(1).click();
    cy.get('[data-testid="square"]')
      .eq(0)
      .should('not.have.class', 'selected');
    cy.get('[data-testid="square"]')
      .eq(1)
      .should('have.class', 'selected');
  });

  it('Shift drag-select squares', () => {
    cy.createSquare(CELL3);
    cy.createSquare(CELL4);

    cy.get('[data-testid="CAN"]').click();
    cy.get('body').trigger('keydown', { keyCode: 16 }); // shift key

    cy.drag(CELL3, { x: CELL3.x + 10, y: CELL3.y + 10 });
    cy.drag(CELL4, { x: CELL4.x + 10, y: CELL4.y + 10 });

    cy.get('[data-testid="square"]')
      .should((sub) => {
        expect(sub[0]).to.have.class('selected');
        expect(sub[1]).to.have.class('selected');
      });
  });

  it('Shift deselect squares', () => {
    cy.createSquare(CELL3);
    cy.createSquare(CELL4);

    cy.get('[data-testid="CAN"]').click();
    cy.get('body').trigger('keydown', { keyCode: 16 }); // shift key
    cy.drag(CELL3, CELL4);

    cy.get('[data-testid="square"]').eq(1).click();
    cy.get('[data-testid="square"]')
      .should((sub) => {
        expect(sub[0]).to.have.class('selected');
        expect(sub[1]).not.to.have.class('selected');
      });
  });

  it('Select in unfilled part of combined elec', () => {
    // create a donut electrode then try to select a square in its center
    const min = ELEC_SIZE + 10;
    const mid = 2 * ELEC_SIZE + 10;
    const max = 3 * ELEC_SIZE + 10;

    cy.createSquare({ x: min, y: min });
    cy.createSquare({ x: mid, y: min });
    cy.createSquare({ x: max, y: min });
    cy.createSquare({ x: min, y: mid });
    cy.createSquare({ x: max, y: mid });
    cy.createSquare({ x: min, y: max });
    cy.createSquare({ x: mid, y: max });
    cy.createSquare({ x: max, y: max });

    cy.get('[data-testid="CAN"]').click();
    cy.drag({ x: min, y: min }, { x: max, y: max });
    cy.get('.greenArea').rightclick({ force: true });
    cy.get('ul.menu > li:nth-child(6)').click({ force: true }); // combine

    cy.get('[data-testid="draw-button"]').click();
    cy.createSquare({ x: mid, y: mid });

    cy.get('[data-testid="CAN"]').click();
    cy.get('[data-testid="square"]').click({ force: true });
    cy.get('[data-testid="square"]').should('have.class', 'selected');
    cy.get('[data-testid="combined"]').should('not.have.class', 'selected');
  });

  // keyboard shortcut tests
  it('Shortcut Move Square', () => {
    cy.createSquare(CELL1);

    cy.get('[data-testid="CAN"]').click();
    cy.get('[data-testid="square"]').click({ force: true });

    cy.get('.greenArea').type('{m}');
    cy.get('[data-testid="square"]')
      .then(($square) => cy.moveElec($square, CELL1, POSITION));

    cy.get('[data-testid="square"]')
      .should('have.attr', 'x', POSITION.x - 10)
      .should('have.attr', 'y', POSITION.y - 10);
  });

  it('Shortcut Delete Square', () => {
    cy.createSquare(CELL1);
    cy.get('[data-testid="CAN"]').click();
    cy.get('[data-testid="square"]').click({ force: true });

    cy.get('.greenArea').type('{delete}');
    cy.get('[data-testid="square"]').should('have.length', 0);
  });

  it('Combine', () => {
    cy.createSquare(CELL2);
    cy.createSquare(CELL3);

    cy.get('[data-testid="CAN"]').click();
    cy.drag(CELL3, CELL2);
    cy.get('.greenArea').type('{c}');
    cy.get('[data-testid="square"]').should('have.length', 0);
    cy.get('[data-testid="combined"]').should('have.length', 1);
  });

  it('Separate', () => {
    cy.createSquare(CELL2);
    cy.createSquare(CELL3);

    // combine
    cy.get('[data-testid="CAN"]').click();
    cy.drag(CELL3, CELL2);
    cy.get('.greenArea').type('{c}');

    // now separate
    cy.get('[data-testid="combined"]').click({ force: true });
    cy.get('.greenArea').type('{s}');
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

    cy.get('.greenArea').type('{ctrl+c}');

    cy.get('.greenArea').click(CELL4.x, CELL4.y);
    cy.get('.greenArea').type('{ctrl+v}');

    cy.get('[data-testid="square"]')
      .eq(1)
      .should('have.attr', 'x', CELL4.x - 10, CELL4.y - 10);
  });

  it('Copy paste multiple combined', () => {
    // combine 2 electrodes
    cy.createSquare(CELL2);
    cy.createSquare(CELL3);
    cy.get('[data-testid="CAN"]').click();
    cy.drag(CELL3, CELL2);
    cy.get('.greenArea').type('{c}');

    // copy
    cy.drag(CELL2, CELL3);
    cy.get('.greenArea').type('{ctrl+c}');

    // paste
    const pos1 = 7 * ELEC_SIZE + 10;
    cy.get('.greenArea').click(pos1, pos1);
    cy.get('.greenArea').type('{ctrl+v}');

    // paste again
    const pos2 = 9 * ELEC_SIZE + 10;
    cy.get('.greenArea').click(pos2, pos2);
    cy.get('.greenArea').type('{ctrl+v}');

    // assert they all have diff ids
    cy.get('[data-testid="combined"]')
      .should(($el) => {
        expect($el).to.have.lengthOf(3);
        expect($el[0].getAttribute('id')).not.to.equal($el[1].getAttribute('id'));
        expect($el[1].getAttribute('id')).not.to.equal($el[2].getAttribute('id'));
        expect($el[2].getAttribute('id')).not.to.equal($el[0].getAttribute('id'));
      });

    // hard to assert positions since they're path objs with no clear singular coordinates
    // but try to drag select 3rd combined electrode and see if it turns blue
    cy.drag({ x: pos2, y: pos2 }, { x: pos2, y: pos2 });
    cy.get('path.selected').should(($el) => {
      expect($el).to.have.lengthOf(1);
      expect($el[0].getAttribute('id')).to.equal('C2');
    });
  });
});
