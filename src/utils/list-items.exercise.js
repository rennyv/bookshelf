/*
import {useQuery} from 'react-query'
import {client} from 'api-client'
 
function useList(user){
    const [data: result] = useQuery({
        queryKey: 'list-items',
        queryFn: () => client('list-items', {token: user.token}).then(data => data.listItems)
      })
    
    return result : null
}*/