import { getLinks } from "./api/wikipedia";

function App() {
  getLinks();
  return <div className="container">Hello</div>;
}

export default App;
