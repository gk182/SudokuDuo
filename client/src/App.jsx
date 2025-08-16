import Room from './pages/Room'

export default function App(){
  return (
    <div className="app">
      <header className="header" style={{padding:16}}>
        <h1>Sudoku Duo</h1>
        <p className="sub">Realtime 2-player</p>
      </header>
      <main style={{padding:16}}><Room /></main>
    </div>
  )
}
