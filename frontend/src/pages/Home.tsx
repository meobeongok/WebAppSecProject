import { usePageTitle } from '@/hooks'

function Home(): JSX.Element {
  usePageTitle('Home')

  return <div>Hello</div>
}

export default Home
