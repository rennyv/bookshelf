import {useQuery, useMutation, queryCache} from 'react-query'
import {client} from './api-client'
 
function useListItems(user){
    const {data: listItems} = useQuery({
        queryKey: 'list-items',
        queryFn: () => client('list-items', {token: user.token}).then(data => data.listItems)
      })

    return listItems ?? []
}

function useListItem(user, bookId) {
    const listItems = useListItems(user)
    const listItem = listItems.find(li => li.bookId === bookId) ?? null

    return listItem
}

function useUpdateListItem(user) {
    return useMutation(
        (updates) => client(`list-items/${updates.id}`, {method: 'PUT', data: updates, token: user.token }),
        {onSettled: () => queryCache.invalidateQueries('list-items')}
      )
}

export {useListItem, useListItems, useUpdateListItem}