import * as React from 'react'
import {render, screen, waitForElementToBeRemoved} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {queryCache} from 'react-query'
import {buildUser, buildBook} from 'test/generate'
import * as auth from 'auth-provider'
import {AppProviders} from 'context'
import {App} from 'app'
import * as usersDB from 'test/data/users'
import * as booksDB from 'test/data/books'
import * as listItemsDB from 'test/data/list-items'
import {formatDate} from 'utils/misc'

afterEach(async () => {
    queryCache.clear()
    await Promise.all([
        auth.logout(),
        usersDB.reset(),
        booksDB.reset(),
        listItemsDB.reset()
    ])
})

async function loginAsUser(userProperties) {
    const user = buildUser(userProperties)
    await usersDB.create(user)
    const authUser = await usersDB.authenticate(user)
    window.localStorage.setItem(auth.localStorageKey, authUser.token)

    return authUser
}

const waitForLoadingToFinish = async () => await waitForElementToBeRemoved(() => [
        ...screen.queryAllByLabelText(/loading/i),
        ...screen.queryAllByText(/loading/i)
    ])

test('renders all the book information', async () => {
    await loginAsUser()

    const book = await booksDB.create(buildBook())
    window.history.pushState({}, 'Test page', `/book/${book.id}`)

    render(<App />, {wrapper: AppProviders})

    await waitForLoadingToFinish()

    expect(screen.getByRole('heading', {name: book.title})).toBeInTheDocument()
    expect(screen.getByText(book.author)).toBeInTheDocument()
    expect(screen.getByText(book.publisher)).toBeInTheDocument()
    expect(screen.getByText(book.synopsis)).toBeInTheDocument()
    expect(screen.getByRole('img', {name: /book cover/i})).toHaveAttribute('src', book.coverImageUrl)

    expect(screen.getByRole('button', {name: /add to list/i})).toBeInTheDocument()
    expect(screen.queryByRole('button', {name: /remove from list/i})).not.toBeInTheDocument()
    expect(screen.queryByRole('button', {name: /mark as read/i})).not.toBeInTheDocument()
    expect(screen.queryByRole('button', {name: /mark as unread/i})).not.toBeInTheDocument()
    expect(screen.queryByRole('textarea', {name: /notes/i})).not.toBeInTheDocument()
    expect(screen.queryByRole('radio', {name: /star/i})).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/start date/i)).not.toBeInTheDocument()
})

test('can create a list item for the book', async () => {
    await loginAsUser()

    const book = await booksDB.create(buildBook())
    window.history.pushState({}, 'Test page', `/book/${book.id}`)

    render(<App />, {wrapper: AppProviders})

    await waitForLoadingToFinish()

    const addToListButton = screen.getByRole('button', {name: /add to list/i})
    userEvent.click(addToListButton)
    expect(addToListButton).toBeDisabled()

    await waitForLoadingToFinish()

    expect(screen.getByRole('button', {name: /mark as read/i})).toBeInTheDocument()
    expect(screen.getByRole('button', {name: /remove from list/i})).toBeInTheDocument()
    expect(screen.getByRole('textbox', {name: /notes/i})).toBeInTheDocument()

    const startDateNode = screen.getByLabelText(/start date/i)
    expect(startDateNode).toHaveTextContent(formatDate(new Date()))

    expect(screen.queryByRole('button', {name: /add to list/i})).not.toBeInTheDocument()
    expect(screen.queryByRole('button', {name: /mark as unread/i})).not.toBeInTheDocument()
    expect(screen.queryByRole('radio', {name: /star/i})).not.toBeInTheDocument()
})
