import "@reach/dialog/styles.css"
import React from 'react'
import ReactDOM from 'react-dom'
import {Dialog} from '@reach/dialog'
import {Logo} from './components/logo'

function App() {
    const [openModel, setOpenModel] = React.useState('none')
    return <div>
        <Logo width="80" height="80"/>
        <h1>Bookshelf</h1>
        <div>
            <button onClick={() => setOpenModel('login')}>Login</button>
        </div>
        <div>
            <button onClick={() => setOpenModel('register')}>Register</button>
        </div>
        <Dialog aria-label="Login form" isOpen={openModel === 'login'}>
            <div>
                <button onClick={() => setOpenModel('none')}>Close</button>
            </div>
            <h3>Login</h3>
        </Dialog>
        <Dialog aria-label="Register form" isOpen={openModel === 'register'}>
            <div>
                <button onClick={() => setOpenModel('none')}>Close</button>
            </div>
            <h3>Register</h3>
        </Dialog>
    </div>
}

ReactDOM.render(<App/>, document.getElementById('root'))
