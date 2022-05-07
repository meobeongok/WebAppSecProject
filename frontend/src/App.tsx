import { ThemeProvider } from '@/contexts'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { PrivateElement } from './components'
import { Home, SignIn } from '@/pages'

function App(): JSX.Element {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PrivateElement />}>
            <Route path="/" element={<Home />} />
          </Route>
          <Route path="/signin" element={<SignIn />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
