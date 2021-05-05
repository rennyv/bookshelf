import * as React from 'react'
import { buildBook, buildListItem} from 'test/generate'
import {App} from 'app'
import * as booksDB from 'test/data/books'
import * as listItemsDB from  'test/data/list-items'
import {formatDate} from 'utils/misc'
import {loginAsUser, render, screen, userEvent,  waitForLoadingToFinish} from 'test/app-test-utils'
import faker from 'faker'

jest.mock('components/profiler')

async function renderBookScreen({user, book, listItem} = {}){
    if (user === undefined){
        user = await loginAsUser()
    }
    if (book === undefined){
        book = await booksDB.create(buildBook())
    }
    if (listItem === undefined) {
        listItem = await listItemsDB.create(buildListItem({owner: user, book}))
    }
    const route = `/book/${book.id}`
    
  
    const utils = await render(<App />, {route, user})
    return {...utils, user, book, listItem}
}


test('renders all the book information', async () => {
    const {book} = await renderBookScreen({listItem: null})

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
    await renderBookScreen({listItem: null})

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

test('can remove a list item for the book', async () => {
    await renderBookScreen()

    const removeFromListButton = screen.getByRole('button', {name: /remove from list/i})
    userEvent.click(removeFromListButton)
    expect(removeFromListButton).toBeDisabled()

    await waitForLoadingToFinish()

    expect(screen.getByRole('button', {name: /add to list/i})).toBeInTheDocument()
    expect(screen.queryByRole('button', {name: /remove from list/i})).not.toBeInTheDocument()
})

test('can mark a list item as read', async () => {
    const {listItem} = await renderBookScreen()
    await listItemsDB.update(listItem.id, {finishDate: null})

    const markAsRead = screen.getByRole('button', {name: /mark as read/i})
    userEvent.click(markAsRead)
    expect(markAsRead).toBeDisabled()

    await waitForLoadingToFinish()

    expect(screen.getByRole('button', {name: /mark as unread/i})).toBeInTheDocument()
    const startAndFinishDateNode = screen.getByLabelText(/start and finish date/i)
    expect(startAndFinishDateNode).toHaveTextContent(
        `${formatDate(listItem.startDate)} — ${formatDate(Date.now())}`,
      )

    expect(screen.queryByRole('button', {name: /mark as read/i})).not.toBeInTheDocument()
})

test('can edit a note', async () => {
    jest.useFakeTimers()
    const {listItem} = await renderBookScreen()

    const newNotes = faker.lorem.words()
    const notesTestarea = screen.getByRole('textbox', {name: /notes/i})

    userEvent.clear(notesTestarea)
    userEvent.type(notesTestarea, newNotes)

    await screen.findByLabelText(/loading/i)
    await waitForLoadingToFinish()

    expect(notesTestarea).toHaveValue(newNotes)

    expect(await listItemsDB.read(listItem.id)).toMatchObject({
        notes: newNotes
    })
})