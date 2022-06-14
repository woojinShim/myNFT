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

    string private mintingFee;
    string public baseURI;
    string private defaultURI;

    mapping(address => uint256[]) public adminAddr; // admin -> adminAddr

    constructor(string memory _baseURI, string memory _defaultURI) ERC721A("Atomrigs Junior's NFT","JuniorNFT") Ownable() {
        baseURI = _baseURI;
        defaultURI = _defaultURI;
    }

    modifier onlyOwnerOrAdmin() {
        if (address(0)) revert BadRequest("Not allowed address");
        if(_msgSender() != adminAddr[msg.sender] || _msgSender() != owner()) revert NotOwnerNorAdmin("caller is not the Admin");
        _;
    }

    function addAdmin(address newAdmin) public view returns (uint256[] memory) onlyOwner {
        return adminAddr.push(newAdmin);
    }

    function mint() public {

        uint256 Fee = mintingFee;
        if(Fee != msg.value) revert NoMatchingFee();
    }

    function tokenURI(uint256 tokenId) public view override returns(string memory) {}

    function setMintingFee(uint256 fee) public onlyOwnerOrAdmin {
        mintingFee = fee;
        emit MintingFeeUpdated(fee);
    }

    function setRevealed()
        public
        onlyOwnerOrAdmin
    {
        isRevealed = true;

        emit Revealed();
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
