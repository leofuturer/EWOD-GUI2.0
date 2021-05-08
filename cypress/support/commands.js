// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add('createSquare', (CELL) => {
  cy.get('.greenArea')
    .trigger('mousedown', { which: 1, offsetX: CELL.x, offsetY: CELL.y })
    .trigger('mousemove', { offsetX: CELL.x, offsetY: CELL.y })
    .trigger('mouseup', { force: true });
});

Cypress.Commands.add('moveElec', (subject, from, to) => {
  cy.get('[data-testid="CAN"]').click();

  cy.wrap(subject).first().click()
    .trigger('mousedown', {
      button: 0,
      clientX: from.x,
      clientY: from.y,
      force: true,
    })
    .trigger('mousemove', {
      button: 0,
      clientX: from.x,
      clientY: from.y,
      force: true,
    });
  cy.get('body')
    .trigger('mousemove', {
      button: 0,
      clientX: to.x,
      clientY: to.y,
      force: true,
    })
    .trigger('mouseup');
});
