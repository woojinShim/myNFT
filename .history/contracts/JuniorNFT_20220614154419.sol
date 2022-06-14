//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./IJuniorNFT.sol";
import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "hardhat/console.sol";

contract JuniorNFT is IJuniorNFT, ERC721A, Ownable, ReentrancyGuard {
    
    bool private revealed;

    fallback() external payable {
        emit Received(address _msgSender(), msg.value)
    }

    receive() external payable {
        emit Received(address _msgSender(), msg.value)
    }

    function withdraw() external payable nonReentrant onlyOwner {

    }
}
