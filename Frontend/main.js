var web3 = new Web3(Web3.givenProvider);
var contractInstance;
var contractAddress = "0x4C4ee6918836A36849802E896205e345D0584c30";
var senderAddress;

$(document).ready(function() {

	window.ethereum.enable().then(function(accounts){
		contractInstance = new web3.eth.Contract(abi, contractAddress, {from: accounts[0]});
		senderAddress = contractInstance.options.from;
		//console.log(contractInstance);
	});

	$("#eth_face").click(function(){
		$("#btc_face").removeClass("active");
		$("#eth_face").addClass("active");
	});
	$("#btc_face").click(function(){
		$("#eth_face").removeClass("active");
		$("#btc_face").addClass("active");
	});

	closeAlert("#1tx_alert_btn", "#1tx_alert");
	closeAlert("#donate_alert_btn", "#donate_alert");
	closeAlert("#withdraw_alert_btn", "#withdraw_alert");
	closeAlert("#destroy_alert_btn", "#destroy_alert");
	closeAlert("#luck_alert_btn", "#luck_alert");

	$("#press_to_bet").click(bet);
	$("#press_to_donate").click(give);
	$("#press_to_withdraw").click(take);
	$("#press_to_destroy").click(destroy);

	updateBalance();
});
function updateBalance()
{
	web3.eth.getBalance(contractAddress).then(function(res){
		$("#balance").html("<h4>" + "The balance of the game is" + "<br>" + web3.utils.fromWei(res, "ether") + " ETH" + "</h4>");
	});
}

let showAlert = (point) => {
	$(point).removeClass("hide");
	$(point).addClass("show");
	$(point).addClass("showAlert");
	setTimeout(() => {
		$(point).removeClass("show");
		$(point).addClass("hide");
	}, 6000);
}
let closeAlert = (buttonName, alertName) => {
	$(buttonName).click(() => {
		$(alertName).removeClass("showAlert");
		$(alertName).addClass("hide");
	});
}

let bet = () => {		
	var updateConfig = {
		value: 4000000000000000
	};
	contractInstance.methods.update().send(updateConfig)
	.then(() => requestWaitingStatus(25, callback));
}

let requestWaitingStatus = (retries, callback) => {
	setTimeout(() => {
		showAlert("#1tx_alert")
		contractInstance.methods.playerId(senderAddress).call()
		.then((res) => {
			contractInstance.methods.players(res).call()
			.then((res) => res[1])
			.then((res) => {
				if(!res)
					callback();
				else
				{
					if(retries > 0)
						requestWaitingStatus(--retries, callback);
					else
					{
						console.log("the sever is congested");
						return 0;
					}
				}
			});
		});
	}, 10000);
}

let callback = () => {
	if($(".active").text() == "ETH")
	{
		var bettedOn = 1;
	}
	else if($(".active").text() == "BTC")
	{
		var bettedOn = 0;
	}
	var bet = $("#bet_value").val().toString();
	var betConfig = {
		value: web3.utils.toWei(bet, "ether")
	};
	contractInstance.methods.coinFlip(bettedOn).send(betConfig)
	.then((res) => {
		showAlert("#luck_alert");
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
	contractInstance.methods.donate().send(config)
	.then(updateBalance)
	.then(() => showAlert("#donate_alert"));
}

let take = () => {
	var withdraw = $("#withdraw_value").val().toString();
	var toWithdraw = web3.utils.toWei(withdraw, "ether");
	contractInstance.methods.takeMoney(toWithdraw).send()
	.then(updateBalance)
	.then(() => showAlert("#withdraw_alert"));
}

let destroy = () => {
	contractInstance.methods.selfDestruct().send()
	.then(() => showAlert("#destroy_alert"));
}