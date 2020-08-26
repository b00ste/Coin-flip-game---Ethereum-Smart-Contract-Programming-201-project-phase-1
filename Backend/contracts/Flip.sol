import "./Ownable.sol";
import "./Destroyable.sol";
import "./provableAPI_0.5.sol";

pragma solidity ^0.5.16;

contract Flip is Ownable, Destroyable, usingProvable
{
    uint public balance;
    uint256 constant NUM_RANDOM_BYTES_REQUESTED = 1;
    
    struct Player
    {
        uint256 playerNum;
        bool waiting;
    }

    mapping (address => bytes32) public playerId;
    mapping (bytes32 => Player) public players;

    event wol(uint n);

    constructor() public
    {
        update();
    }

    function __callback(bytes32 _queryId, string memory _result, bytes memory _proof) public
    {
        require(msg.sender == provable_cbAddress());

        uint256 randomNumber = uint256(keccak256(abi.encodePacked(_result))) % 2;
        players[_queryId].playerNum = randomNumber;
        players[_queryId].waiting = false;
    }

    function update() public payable
    {        
        uint256 QUERY_EXECUTION_DELAY = 0;
        uint256 GAS_FOR_CALLBACK = 200000;

        bytes32 queryId = provable_newRandomDSQuery(
            QUERY_EXECUTION_DELAY,
            NUM_RANDOM_BYTES_REQUESTED,
            GAS_FOR_CALLBACK
        );
        playerId[msg.sender] = queryId; 
        players[queryId].waiting = true;
    }

    function coinFlip(uint256 n) public payable
    {
        require(msg.value >= 0.01 ether);

        uint256 m = players[playerId[msg.sender]].playerNum;

        if(m != n)
        {
    		    balance += msg.value;
    		    emit wol(0);
        }
        else
        {
            balance -= msg.value;
            msg.sender.transfer(2*(msg.value));
    		    emit wol(1);
        }
    }

    function donate() public payable 
    {
        require (msg.value > 0);
        balance += msg.value;
    }

    function takeMoney(uint toWithdraw) public onlyOwner returns(uint)
    {
        require(toWithdraw <= balance);
        balance -= toWithdraw;
        msg.sender.transfer(toWithdraw);
    }
}