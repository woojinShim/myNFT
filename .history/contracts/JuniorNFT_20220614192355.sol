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
    address private receiver;
    
    string public baseURI;
    string private defaultURI;

    mapping(address => uint256[]) public adminAddr; // admin -> adminAddr

    constructor(address _receiver, string memory _baseURI, string memory _defaultURI) ERC721A("Atomrigs Junior's NFT","JuniorNFT") Ownable() {
        receiver = _receiver;
        baseURI = _baseURI;
        defaultURI = _defaultURI;
    }

    modifier onlyOwnerOrAdmin() {
        if (address(0)) {
            revert BadRequest("Not allowed address");
        }
        if(_msgSender() != adminAddr[msg.sender] || _msgSender() != owner()) revert NotOwnerNorAdmin("caller is not the Admin");
        
        _;
    }

    function addAdmin(address newAdmin) external onlyOwner {
        bool isRegistered = adminAddr.push(newAdmin);
        return isRegistered;
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
