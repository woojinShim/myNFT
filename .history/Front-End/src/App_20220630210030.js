import { Route, Routes } from "react-router-dom";
import About from "./pages/About";
import Home from "./pages/Home";
import Modal from "./pages/copmpoent/modal";
import TokenList from "./pages/copmpoent/tokenList";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/modal" element={<Modal />} />
      <Route path="/tokenlist" element={<TokenList />} />
    </Routes>
  );
};

export default App;
