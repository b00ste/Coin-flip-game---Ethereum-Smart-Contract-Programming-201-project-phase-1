pragma solidity ^0.5.16;
import "./Ownable.sol";

contract Flip is Ownable
{
	uint public balance;

	event wol(uint n);
	

  	function randomFlip() public view returns(uint)
  	{
  		return now % 2;
  	}

  	function coinFLip(uint n) public payable
  	{
  		require(msg.value > 0);
  		
  		if(randomFlip() != n)
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