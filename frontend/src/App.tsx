import { ThemeProvider } from '@/contexts'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { GlobalNotification, PrivateElement } from '@/components'
import { Home, SignIn, SignUp } from '@/pages'
import { MainLayout } from '@/layouts'

function App(): JSX.Element {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<GlobalNotification />}>
            <Route element={<PrivateElement />}>
              <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
              </Route>
            </Route>
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
