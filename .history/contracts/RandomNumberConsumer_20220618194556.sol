pramgma solidity 0.6.6;

contract RandomNumberConsumer is VRFConsumerBase {

    bytes32 public keyHash;
    uint256 public fee;
    uint256 public randomResult;
}