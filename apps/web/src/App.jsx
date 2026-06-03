import "./styles.css";

export default function App() {
  return (
    <main className="app-shell">
      <section className="intro" aria-labelledby="page-title">
        <p className="eyebrow">Task list</p>
        <h1 id="page-title">Todos</h1>
        <p>Keep track of the work that needs attention.</p>
      </section>
    </main>
  );
}
