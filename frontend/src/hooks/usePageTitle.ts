import * as React from 'react'

function usePageTitle(title?: string) {
  React.useEffect(() => {
    window.document.title = [title, 'Alunno'].filter(Boolean).join(' - ')
  }, [title])
}

export { usePageTitle }
