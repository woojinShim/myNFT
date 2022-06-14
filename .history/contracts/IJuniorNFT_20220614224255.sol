//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

interface IJuniorNFT {
    error BadRequest(string message);
    error NotOwnerNorAdmin(string message);
    error NoMatchingFee();
    error ExceedMaxQuantity();
    error AlreadyRevealed();
    error ImmutableState();
    error FailedToSendBalance();

    // struct Token {
    //     string tokenURIfix;
    // }

    event Received(address sender, uint256 amount);
    event MintingFeeUpdated(string fee);
    event BaseURIUpdated(string baseURI);
    event Revealed();
    event Withdraw(uint256 amount);
    event DefaultURIUpdated(string defaultURI);
}
