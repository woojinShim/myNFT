// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";


library Base64 {
    bytes internal constant TABLE =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

    /// @notice Encodes some bytes to the base64 representation
    function encode(bytes memory data) internal pure returns (string memory) {
        uint256 len = data.length;
        if (len == 0) return "";

        // multiply by 4/3 rounded up
        uint256 encodedLen = 4 * ((len + 2) / 3);

        // Add some extra buffer at the end
        bytes memory result = new bytes(encodedLen + 32);

        bytes memory table = TABLE;

        assembly {
            let tablePtr := add(table, 1)
            let resultPtr := add(result, 32)

            for {
                let i := 0
            } lt(i, len) {

            } {
                i := add(i, 3)
                let input := and(mload(add(data, i)), 0xffffff)

                let out := mload(add(tablePtr, and(shr(18, input), 0x3F)))
                out := shl(8, out)
                out := add(
                    out,
                    and(mload(add(tablePtr, and(shr(12, input), 0x3F))), 0xFF)
                )
                out := shl(8, out)
                out := add(
                    out,
                    and(mload(add(tablePtr, and(shr(6, input), 0x3F))), 0xFF)
                )
                out := shl(8, out)
                out := add(
                    out,
                    and(mload(add(tablePtr, and(input, 0x3F))), 0xFF)
                )
                out := shl(224, out)

                mstore(resultPtr, out)

                resultPtr := add(resultPtr, 4)
            }

            switch mod(len, 3)
            case 1 {
                mstore(sub(resultPtr, 2), shl(240, 0x3d3d))
            }
            case 2 {
                mstore(sub(resultPtr, 1), shl(248, 0x3d))
            }

            mstore(result, encodedLen)
        }

        return string(result);
    }
}

interface IGameGene {
    function getSeed(uint256 _tokenId) external view returns (uint256);

    function getBaseGenes(uint256 _tokenId)
        external
        view
        returns (uint256[] memory);

    function getBaseGeneNames(uint256 _tokenId)
        external
        view
        returns (string[] memory);

    function getImgIdx(uint256 _tokenId) external view returns (string memory);
}

contract GameNFT is ERC721Enumerable, ReentrancyGuard, Ownable {
    enum State {
        Setup,
        PreMint,
        PublicMint,
        Finished
    }

    State public state;
    address private _gameGene;
    address private _signer;
    address private _receiver;

    bool public isPermanent;
    uint8 public constant FOUNDER_COUNT = 120;
    uint8 public MAX_PRE_MULTI = 2; 
    uint8 public constant MAX_PUBLIC_MULTI = 20;
    uint16 public MAX_PRE_ID = FOUNDER_COUNT + 3200;
    uint16 public MAX_PUBLIC_ID = FOUNDER_COUNT + 3600;
    uint16 public constant MAX_COUNT = 5000;
    uint16 private _publicTokenId = FOUNDER_COUNT;
    uint256 public MINTING_FEE = 0.1 * 10**18; //in wei
    string private _baseImgUrl = "";

    mapping(address => uint8) public freeClaims; //address => count
    mapping(address => uint8) public preMints; //address => count

    event Received(address caller, uint256 amount, string message);
    event BalanceWithdraw(address recipient, uint256 amount);
    event StateChanged(State _state);
    event SignerChanged(address signer);

    constructor(
        address signer_,
        address receiver_,
        string memory baseImgUrl_
    ) ERC721("Gaming NFT", "GameEx") Ownable() {
        _signer = signer_;
        _receiver = receiver_;
        _baseImgUrl = baseImgUrl_;
        state = State.Setup;
    }

    fallback() external payable {
        emit Received(_msgSender(), msg.value, "Fallback was called");
    }

    receive() external payable {
        emit Received(_msgSender(), msg.value, "Fallback was called");
    }

    function updateMaxPreMulti(uint8 _newMax) external onlyOwner {
        //in wei unit
        MAX_PRE_MULTI = _newMax;
    }

    function updateMintingFee(uint256 _feeAmount) external onlyOwner {
        //in wei unit
        MINTING_FEE = _feeAmount;
    }

    function updateSigner(address signer_) external onlyOwner {
        require(!isPermanent, "GameNFT: contract is fixed");
        _signer = signer_;
    }

    function getSigner() external view returns (address) {
        return _signer;
    }

    function updateGene(address gameGene_) external onlyOwner {
        require(!isPermanent, "GameNFT: Gene contract is fixed");
        _gameGene = gameGene_;
    }

    function updateBaseImgUrl(string memory _url) external onlyOwner {
        require(!isPermanent, "GameNFT: All images are on ipfs");
        _baseImgUrl = _url;
    }

    function updateMaxPublicId(uint16 _newMax) external onlyOwner {
        require(
            _newMax >= _publicTokenId,
            "GameNFT: Can not set MAX_PUBLIC_ID lower than the current id"
        );
        require(
            _newMax <= MAX_COUNT,
            "GameNFT: Can not set more than MAX_COUNT"
        );
        MAX_PUBLIC_ID = _newMax;
    }

    function getNextPublicId() private returns (uint16) {
        uint16 newTokenId = _publicTokenId + 1;
        if (_exists(newTokenId)) {
            while (newTokenId <= MAX_PUBLIC_ID) {
                newTokenId += 1;
                if (!_exists(newTokenId)) {
                    break;
                }
            }
        }
        _publicTokenId = newTokenId;
        return newTokenId;
    }

    function safeMint(address _to, uint256 _tokenId) private returns (bool) {
        _safeMint(_to, _tokenId);
        return true;
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function withdraw() external onlyOwner {
        uint256 amount = address(this).balance;
        (bool success, ) = _receiver.call{value: amount}("");
        require(success, "Failed to send Ether");
        emit BalanceWithdraw(_receiver, amount);
    }

    function getHash(
        address this_,
        address sender_,
        string memory msg_
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(this_, sender_, msg_));
    }

    function publicMint(uint256 _count) external payable nonReentrant {
        require(
            state == State.PublicMint,
            "GameNFT: State is not in PublicMint"
        );
        require(
            _count <= MAX_PUBLIC_MULTI,
            "GameNFT: Minting count exceeds more than allowed"
        );
        require(
            _publicTokenId + _count <= MAX_PUBLIC_ID,
            "GameNFT: Can not mint more than MAX_PUBLIC_ID"
        );
        require(
            MINTING_FEE * _count == msg.value,
            "GameNFT: Minting fee amounts does not match."
        );

        for (uint256 i = 0; i < _count; i++) {
            require(
                safeMint(_msgSender(), getNextPublicId()),
                "GameNFT: minting failed"
            );
        }
    }

    function adminMint(uint256[] calldata _tokenIds)
        external
        onlyOwner
        nonReentrant
    {
        for (uint256 i = 0; i < _tokenIds.length; i++) {
            uint256 tokenId = _tokenIds[i];
            if (!_exists(tokenId)) {
                require(tokenId > 0);
                require(
                    tokenId <= FOUNDER_COUNT || tokenId > MAX_PUBLIC_ID,
                    "GameNFT: id is out of range"
                );
                require(tokenId <= MAX_COUNT);
                require(
                    safeMint(_msgSender(), tokenId),
                    "GameNFT: minting failed"
                );
            }
        }
    }

    function adminMintTo(uint256[] calldata _tokenIds, address[] calldata _tos)
        external
        onlyOwner
        nonReentrant
    {
        require(
            _tokenIds.length == _tos.length,
            "GameNFT: token count does not match recipient count"
        );
        for (uint256 i = 0; i < _tokenIds.length; i++) {
            uint256 tokenId = _tokenIds[i];
            if (!_exists(tokenId)) {
                require(tokenId > 0);
                require(
                    tokenId <= FOUNDER_COUNT || tokenId > MAX_PUBLIC_ID,
                    "GameNFT: id is out of range"
                );
                require(tokenId <= MAX_COUNT);
                require(safeMint(_tos[i], tokenId), "GameNFT: minting failed");
            }
        }
    }

    function transferBatch(uint256[] calldata _tokenIds, address _to)
        external
        nonReentrant
    {
        for (uint256 i = 0; i < _tokenIds.length; i++) {
            safeTransferFrom(_msgSender(), _to, _tokenIds[i]);
        }
    }

    function getSeed(uint256 _tokenId) public view onlyOwner returns (uint256) {
        require(_exists(_tokenId), "GameNFT: TokenId not minted yet");
        IGameGene gene = IGameGene(_gameGene);
        return gene.getSeed(_tokenId);
    }

    function getBaseGenes(uint256 _tokenId)
        public
        view
        returns (uint256[] memory)
    {
        require(_exists(_tokenId), "GameNFT: TokenId not minted yet");
        IGameGene gene = IGameGene(_gameGene);
        return gene.getBaseGenes(_tokenId);
    }

    function getImgUrl(uint256 _tokenId) public view returns (string memory) {
        require(_exists(_tokenId), "GameNFT: TokenId not minted yet");

        return
            string(abi.encodePacked(_baseImgUrl, toString(_tokenId), ".gif"));
    }

    function getImgIdx(uint256 _tokenId) public view returns (string memory) {
        require(_exists(_tokenId), "GameNFT: TokenId not minted yet");
        IGameGene gene = IGameGene(_gameGene);
        return gene.getImgIdx(_tokenId);
    }

    function tokensOf(address _account) public view returns (uint256[] memory) {
        uint256[] memory tokenIds = new uint256[](balanceOf(_account));
        for (uint256 i; i < balanceOf(_account); i++) {
            tokenIds[i] = tokenOfOwnerByIndex(_account, i);
        }
        return tokenIds;
    }

    function toString(uint256 value) internal pure returns (string memory) {
        // Inspired by OraclizeAPI's implementation - MIT license
        // https://github.com/oraclize/ethereum-api/blob/b42146b063c7d6ee1358846c198246239e9360e8/oraclizeAPI_0.4.25.sol

        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}
