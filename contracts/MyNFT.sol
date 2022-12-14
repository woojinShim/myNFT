//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./IMyNFT.sol";
import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract MyNFT is IMyNFT, ERC721A, Ownable, ReentrancyGuard {
    
    address public Admin;
    uint256 private mintingFee;
    uint256 public maxQuantity = 5;
    string public baseURI;
    string private defaultURI;
    bool public revealed = false;

    constructor(string memory _baseURI, string memory _defaultURI) ERC721A("MY NFT","MyNFT") Ownable() {
        baseURI = _baseURI;
        defaultURI = _defaultURI;
    }

    modifier onlyOwnerOrAdmin() {
        if (Admin == address(0)) revert BadRequest("Not allowed address");
        if(msg.sender != Admin && msg.sender != owner()) revert NotOwnerNorAdmin("caller is not the Admin");
        _;
    }

    function addAdmin(address newAdmin) public onlyOwner {
        Admin = newAdmin;
    }

    function mint(uint256 quantity) external payable nonReentrant {
        uint256 Fee = mintingFee * quantity;
        if(Fee != msg.value) revert NoMatchingFee();

        if(quantity > maxQuantity) revert ExceedMaxQuantity();
        safeMint(msg.sender, quantity);
    }

    function safeMint(address to, uint256 quantity) private returns(bool) {
        _safeMint(to, quantity);
        return true;
    }

    function adminMint(uint256 quantity) external onlyOwnerOrAdmin nonReentrant {
        if(quantity > maxQuantity) revert ExceedMaxQuantity();
        safeMint(msg.sender, quantity);
    }

    function transferBatch(uint256[] calldata tokenIds, address to) external nonReentrant {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            safeTransferFrom(_msgSender(), to, tokenIds[i]);
        }
    }

    function tokenURI(uint256 tokenId) public view override returns(string memory) {
        if (revealed == false) {
                return string(abi.encodePacked(defaultURI, "/", _toString(tokenId), ".json"));
            } else {
                return string(abi.encodePacked(baseURI, "/", _toString(tokenId), ".json"));
            }
    }

    function reveal() public onlyOwnerOrAdmin {
        revealed = true;
        emit Revealed();
    }

    function getBaseURI() external view returns (string memory) {
        return _baseURI();
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    function setBaseURI(string memory _newBaseURI) external onlyOwnerOrAdmin {
        baseURI = _newBaseURI;
        emit BaseURIUpdated(_newBaseURI);
    }

    function setDefaultURI(string memory _defaultURI)
        external
        onlyOwner
    {
        defaultURI = _defaultURI;
        emit DefaultURIUpdated(_defaultURI);
    }

    function setMintingFee(uint256 fee) external onlyOwnerOrAdmin {
        mintingFee = fee;
        emit MintingFeeUpdated();
    }

    function getMinintgFee() public view returns(uint256) {
        return mintingFee;
    }

    fallback() external payable {
        emit Received(_msgSender(), msg.value);
    }

    receive() external payable {
        emit Received(_msgSender(), msg.value);
    }

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }

    function withdraw() external payable onlyOwner nonReentrant {
        uint256 amount = address(this).balance;
        (bool success, ) = _msgSender().call{value: amount}("");
        if (!success) {
            revert FailedToSendBalance();
        }
        emit Withdraw(amount);
    }
}
