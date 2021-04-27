import {useQuery, useMutation, queryCache} from 'react-query'
import {client} from './api-client'
import {setQueryDataForBook} from './books'
 
function useListItems(user){
    const {data: listItems} = useQuery({
        queryKey: 'list-items',
        queryFn: () => client('list-items', {token: user.token}).then(data => data.listItems),
        config: {
            onSuccess(listItems) {
                for (const listItem of listItems) {
                    setQueryDataForBook(listItem.book)
                }
            }
        }
    })

    return listItems ?? []
}

const defaultMutationOptions = {
    onSettled: () => queryCache.invalidateQueries('list-items'),

}

function useListItem(user, bookId) {
    const listItems = useListItems(user)
    const listItem = listItems.find(li => li.bookId === bookId) ?? null

    return listItem
}

function useUpdateListItem(user, options) {
    return useMutation(
        (updates) => client(`list-items/${updates.id}`, {method: 'PUT', data: updates, token: user.token }),
        {...defaultMutationOptions, ...options}
      )
}

function useRemoveListItem(user, options){
    return useMutation(
        ({id}) => client(`list-items/${id}`, {method: 'DELETE', token: user.token }),
        {...defaultMutationOptions, ...options}
    )
}

function useCreateListItem(user, options) {
    return useMutation(
        ({bookId}) => client('list-items', {data: {bookId}, token: user.token }),
        {...defaultMutationOptions, ...options}
    )
}

export {useListItem, useListItems, useUpdateListItem, useRemoveListItem, useCreateListItem}