import {buildUser} from '../support/generate'

describe('smoke', () => {
  it('should allow a typical user flow', () => {
    const user = buildUser()  
    cy.visit('/')

    cy.findByRole('button', {name: /register/i}).click()

    cy.findByRole('dialog').within(() => {
      cy.findByRole('textbox', {name: /username/i}).type(user.username)
      cy.findByLabelText(/password/i).type(user.password)
      cy.findByRole('button', {name: /register/i}).click()
    })

    cy.findByRole('navigation').within(() => {
      cy.findByRole('link', {name: /discover/i}).click()
    }) 

    cy.findByRole('main').within(() => {
      cy.findByRole('searchbox', {name: /search/i}).type('Voice of War{enter}')
      cy.findByRole('listitem', {name: /voice of war/i}).within(() => {
        cy.findByRole('button', {name: /add to list/i}).click()
      })
    })

    cy.findByRole('navigation').within(() => {
      cy.findByRole('link', {name: /reading list/i}).click()
    }) 

    cy.findByRole('main').within(() => {
      cy.findAllByRole('listitem').should('have.length', 1)
      cy.findByRole('link', {name: /voice of war/i}).click()
    })

  })
})
