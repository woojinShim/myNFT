//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

interface IJuniorNFT {
    error BadRequest(string message)
    error NotOwnerNorAdmin(string reason);
    error NoMatchingFee();
    error AlreadyRevealed();
    error ImmutableState();
    error FailedToSendBalance();

    event Received(address sender, uint256 amount);
    event MintingFeeUpdated(uint256 fee);
    event BaseURIUpdated(string baseURI);
    event Revealed();
    event Withdraw(uint256 amount);
    event DefaultURIUpdated(string defaultURI)
}
