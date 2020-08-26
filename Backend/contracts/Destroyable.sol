import "./Ownable.sol";

pragma solidity ^0.5.16;

contract Destroyable is Ownable
{
    function selfDestruct() public onlyOwner
    {
        selfdestruct(msg.sender);
    }
}