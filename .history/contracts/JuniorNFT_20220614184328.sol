//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./IJuniorNFT.sol";
import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "hardhat/console.sol";

contract JuniorNFT is IJuniorNFT, ERC721A, Ownable, ReentrancyGuard {
    
    bool private isRevealed;
    bool public isPermanent;
    address private _receiver;
    address public admin;
    string public baseURI;
    string private defaultURI;

    mapping(address => uint256[]) public adminAddr; // admin -> adminAddr

    constructor(address receiver, string memory _baseURI, string memory _defaultURI) ERC721A("Atomrigs Junior's NFT","JuniorNFT") Ownable() {
        _receiver = receiver;
        
    }

    function addAdmin(address newAdmin) external {
        if(admin == _msgSender() || owner() == _msgSender()) revert OnlyOwnerOrAdmin();
        admin = newAdmin;
    }

    fallback() external payable {
        emit Received(address _msgSender(), msg.value)
    }

    receive() external payable {
        emit Received(address _msgSender(), msg.value)
    }

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }

    function withdraw() external payable onlyOwner {

    }
}
