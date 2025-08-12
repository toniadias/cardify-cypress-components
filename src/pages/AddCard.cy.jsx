import React from 'react';
import AddCard from './AddCard';

Cypress.Commands.add('alertErrorHaveText', (expectedText) => {
  cy.contains('.alert-error', expectedText).should('be.visible');
});

Cypress.Commands.add('fillCardForm', (card) => {
  cy.contains('label', 'Número do Cartão')
    .parent()
    .find('input')
    .type(card.number);

  cy.get('[data-cy="holderName"]').type(card.holderName);
  cy.get('[data-cy="expirationDate"]').type(card.expirationDate);
  cy.get('[data-cy="cvv"]').type(card.cvv);

  cy.get(`[data-cy="bank-${card.bank}"]`).click({ multiple: true });
});

Cypress.Commands.add('submitCardForm', () => {
  cy.get('[data-cy="saveMyCard"]').click();
});

describe('<AddCard />', () => {
  const myCard = {
    number: '4242424242424242',
    holderName: 'TONIA DIAS',
    expirationDate: '01/35',
    cvv: '123',
    bank: 'neon',
  };

  beforeEach(() => {
    cy.viewport(1440, 900);
    cy.mount(<AddCard />);
  });

  it('exibe erros quando os campos não são informados', () => {
    cy.contains('button', 'Adicionar Cartão').click();

    const alerts = [
      'Número do cartão é obrigatório',
      'Nome do titular é obrigatório',
      'Data de expiração é obrigatória',
      'CVV é obrigatório',
      'Selecione um banco',
    ];

    alerts.forEach((alert) => {
      cy.alertErrorHaveText(alert);
    });
  });

  it('deve cadastrar um novo cartão de crédito', () => {
    cy.fillCardForm(myCard);

    cy.intercept('POST', 'http://wallet.cardfify.dev/api/cards', (req) => {
      req.reply({
        statusCode: 201,
        body: myCard,
      });
    }).as('addCard');

    cy.submitCardForm();

    cy.wait('@addCard');

    cy.get('.notice-success')
      .should('be.visible')
      .and('have.text', 'Cartão cadastrado com sucesso!');
  });

  it('valida nome do titular com menos de 2 caracteres', () => {
    cy.fillCardForm({ ...myCard, holderName: 'T' });
    cy.submitCardForm();

    cy.alertErrorHaveText('Nome deve ter pelo menos 2 caracteres');
  });

  it('valida data de expiração inválida', () => {
    cy.fillCardForm({ ...myCard, expirationDate: '13/35' });
    cy.submitCardForm();

    cy.alertErrorHaveText('Data de expiração inválida ou vencida');
  });

  it('valida cvv com menos de 3 dígitos', () => {
    cy.fillCardForm({ ...myCard, cvv: '17' });
    cy.submitCardForm();

    cy.alertErrorHaveText('CVV deve ter 3 ou 4 dígitos');
  });
});
