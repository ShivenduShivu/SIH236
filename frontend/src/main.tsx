import React from 'react'
import ReactDOM from 'react-dom/client'
import '@fontsource/dm-sans/400.css'
import '@fontsource/dm-sans/500.css'
import '@fontsource/dm-sans/600.css'
import '@fontsource/dm-sans/700.css'
import '@fontsource/fraunces/400.css'
import '@fontsource/fraunces/500.css'
import App from './App'
import './styles.css'

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {failed: boolean}> {
  state = {failed: false}
  static getDerivedStateFromError() { return {failed: true} }
  render() { return this.state.failed ? <main className="fatal"><h1>Let's reopen your workspace.</h1><p>The page encountered an unexpected problem. Saved plans remain in this browser.</p><button onClick={() => location.reload()}>Reload Packora</button></main> : this.props.children }
}
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><ErrorBoundary><App /></ErrorBoundary></React.StrictMode>)
