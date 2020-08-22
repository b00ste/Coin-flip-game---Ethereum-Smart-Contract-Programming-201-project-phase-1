var web3 = new Web3(Web3.givenProvider);
var contractInstance;
var contractAddress = "0x895A5696C25952270ca6D88A48E272b4521883Ca";
web3.eth.defaultAccount = web3.eth.accounts[0];

$(document).ready(function() {
    window.ethereum.enable().then(function(accounts){
    	contractInstance = new web3.eth.Contract(abi, contractAddress, {from: accounts[0]});
    	//console.log(contractInstance);
    });

    $("#heads").click(function(){
    	$("#heads").addClass("active");
    	$("#tails").removeClass("active");
    });
    $("#tails").click(function(){
    	$("#tails").addClass("active");
    	$("#heads").removeClass("active");
    });

    $("#press_to_bet").click(bet);
    $("#press_to_donate").click(give);
    $("#press_to_withdraw").click(take);

	updateBalance();
});

function updateBalance()
{
	$("#balance").html("");
	web3.eth.getBalance(contractAddress).then(function(res){
    	$("#balance").append("<h4>" + "The balance of the game is: " + web3.utils.fromWei(res, "ether") + " ETH" + "</h4>");
    });
}

let bet = () => {	
	if($(".active").text() == "Heads")
	{
		var bettedOn = 1;
	}
	else if($(".active").text() == "Tails")
	{
		var bettedOn = 0;
	}
	var bet = $("#bet_value").val().toString();
	var config = {
		value: web3.utils.toWei(bet, "ether")
	};
	contractInstance.methods.coinFLip(bettedOn).send(config)
	.then((res) => {
		if(parseInt(res.events.wol.returnValues.n) == 1)
		{
			if(bettedOn == 1)
				$(".coin").addClass("win");
			else
				$(".coin").addClass("lose");
		}
		else
		{
			if(bettedOn == 1)
				$(".coin").addClass("lose");
			else
				$(".coin").addClass("win");
		}
	}).then(updateBalance);
	$(".coin").removeClass("win");
	$(".coin").removeClass("lose");
}

let give = () => {
	var donate = $("#donate_value").val().toString();
	var config = {
		value: web3.utils.toWei(donate, "ether")
	};
	contractInstance.methods.donate().send(config).then(updateBalance);
}

let take = () => {
	var withdraw = $("#withdraw_value").val().toString();
	var toWithdraw = web3.utils.toWei(withdraw, "ether");
	contractInstance.methods.takeMoney(toWithdraw).send().then(updateBalance);
}