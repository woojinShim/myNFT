
import { ethers } from 'hardhat';
import { Link } from 'react-router-dom';
import config from "../config";
import { useState } from 'react';

const nftConfig = config.testnet;
const nftAddress = nftConfig.JuniorNFT_Address;
const nftAbi = config.abi.JuniorNFT_ABI;

const Home = () => {
    const [minting, setMinting] = useState('')


    if(typeof window.etheruem !== "undefined") {
        try {
            await window.etheruem.request({method: "eth_requestAccounts"})
            const provider = new ethers.providers.Web3Provider(window.etheruem)
            const signer = provider.getSigner()
            const account = await signer.getAddress()

            const contract = new ethers.Contract(nftAddress, nftAbi, signer);


        } catch (e) {
            console.log(e)
        }
    }

    const mint = ()=> {

    }
    return (
        <div>
            <h1>홈</h1>
            <p>가장 먼저 보여지는 페이지입니다.</p>
            <button onClick={()=>mint()}></button>
            <Link to="/modal">모달</Link>
            <Link to="/tokenlist">리스트</Link>
        </div>
    );
};

export default Home;