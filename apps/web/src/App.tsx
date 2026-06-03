import type { JSX } from "react";
import { TodoList } from "./components/TodoList";
import "./styles.css";

export default function App(): JSX.Element {
  return (
    <main className="app-shell">
      <TodoList />
    </main>
  );
}
