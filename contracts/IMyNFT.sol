//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface IMyNFT {
    error BadRequest(string message);
    error NotOwnerNorAdmin(string message);
    error NoMatchingFee();
    error ExceedMaxQuantity();
    error AlreadyRevealed();
    error ImmutableState();
    error FailedToSendBalance();
    

    event Received(address sender, uint256 amount);
    event MintingFeeUpdated();
    event BaseURIUpdated(string baseURI);
    event Revealed();
    event Withdraw(uint256 amount);
    event DefaultURIUpdated(string defaultURI);
}
