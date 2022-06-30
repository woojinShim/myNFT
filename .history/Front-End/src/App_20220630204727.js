import { Route, Routes } from "react-router-dom";
import About from "./pages/About";
import Home from "./pages/Home";
import config from "./config";
import { ethers } from "ethers";

const nftConfig = config.testnet;
const nftAddress = nftConfig.JuniorNFT_Address;
const nftAbi = config.abi.JuniorNFT_ABI;

const App = () => {

  if (typeof window.etheruem !== "undefined") {
    try {
      await window.etheruem.request({ method: "eth_requestAccounts" });
      const provider = new ethers.providers.Web3Provider(window.etheruem);
      const signer = provider.getSigner();
      const account = await signer.getAddress();

      const contract = new ethers.Contract(nftAddress, nftAbi, signer);
      console.log(contract);
    } catch (e) {
      console.log(e);
    }
  }
  
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
    </Routes>
  );
};

export default App;
