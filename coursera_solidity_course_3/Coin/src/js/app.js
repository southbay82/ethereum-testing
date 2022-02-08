App = {
  web3Provider: null,
  contracts: {},
  names: new Array(),
  minter:null,
  currentAccount:null,
  transaction:0,
  flag:false,
  local_ethereum_node_url:'http://127.0.0.1:7545',

  init: async function() {
    return await App.initWeb3();
  }


  ,initWeb3: async function() {
    // Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.request({ method: "eth_requestAccounts" });;
      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider(App.local_ethereum_node_url);
    }
    web3 = new Web3(App.web3Provider);

    //custom for app - currently triggering the metamask warning
    App.populateAddress();

    return App.initContract();
  }
  
  ,initContract: function() {
      $.getJSON('Coin.json', function(message) {
    // Get the necessary contract artifact file and instantiate it with truffle-contract
        var coinArtifact = message;
        App.contracts.Coin = TruffleContract(coinArtifact);

    // Set the provider for our contract
        App.contracts.Coin.setProvider(App.web3Provider);
        App.getMinter();

        // this code triggers the metamask warning.
        //App.currentAccount = web3.eth.coinbase;

        currentAccount=null;

        // web3.eth.getAccounts((error, accounts) => {
        //   console.log(accounts);
        // }).then(
        //   function(value){
        //   currentAccount = value;
        //   },
        //   function(error){
        //     console.log('error getting accounts of wallet..: \n' + error);
        //   }
        // );

        getAccountsPromise = web3.eth.getAccounts((error, accounts) => {
          console.log('[debug] after promise...'
          + '\naccounts array from wallet: '+accounts
          +'\narray length: ' + accounts.length);
        }).then(
          function(value){
            currentAccount = value[0];
            App.currentAccount = currentAccount;
            console.log('[debug] first wallet address == '+currentAccount)

            jQuery('#current_account').text("Current account : "+ App.currentAccount);
            jQuery('#curr_account').text(App.currentAccount);
          },function(error){
            currentAccount = value;
            console.log('[debug] error == '+error)
          }
        
        );

        return App.bindEvents();
      });
  },
  setWalletAccounts: function(){


  }
   

  ,bindEvents: function() {
    
    $(document).on('click', '#create_money', function(){ App.handleMint(jQuery('#enter_create_address').val(),jQuery('#create_amount').val()); });
    $(document).on('click', '#send_money', function(){ App.handleTransfer(jQuery('#enter_send_address').val(),jQuery('#send_amount').val()); });
    $(document).on('click', '#balance', function(){ App.handleBalance(); });
  }



  ,populateAddress : function(){ 
    console.log('[debug] populateAddress():  eth node url = '+App.local_ethereum_node_url);

    new Web3(new Web3.providers.HttpProvider(App.local_ethereum_node_url)).eth.getAccounts((err, accounts) => {
      jQuery.each(accounts,function(i){
        console.log('[debug] Found Account in Blockchain: '+accounts[i]);
        var optionElement = '<option value="'+accounts[i]+'">'+accounts[i]+'</option';
          jQuery('#enter_create_address').append(optionElement);
          if(web3.eth.coinbase != accounts[i]){
            jQuery('#enter_send_address').append(optionElement);  
          }
      });
    });
  }


  ,getMinter : function(){
    App.contracts.Coin.deployed().then(function(instance) {
      return instance.minter();
    }).then(function(result) {
      App.minter = result;
      jQuery('#minter').text("Minter : "+result);
      if(App.minter != App.currentAccount){
        jQuery('#create_coin').css('display','none');
        jQuery('#send_coin').css('width','50%');
        jQuery('#balance_coin').css('width','50%');
      }else{
        jQuery('#create_coin').css('display','block');
        jQuery('#send_coin').css('width','30%');
        jQuery('#balance_coin').css('width','30%');
      }
    })
  }
 

  ,handleMint: function(addr,value){
      if(App.currentAccount != App.minter){
        alert("Not Authorised to create coin");
        return false;
      }
      var coinInstance;
      App.contracts.Coin.deployed().then(function(instance) {
        coinInstance = instance;

        return coinInstance.mint(addr,value,{from: addr});
      }).then( function(result){
        if(result.receipt.status == '0x01')
          alert(value +" coins created successfully to "+addr);
        else
          alert("Creation failed")
      }).catch( function(err){
        alert('Exception Thrown in handleMint():'+err.message);
        console.log(err.message);
      })
  }
 

  
  ,handleTransfer: function(addr,value) {

    if(addr == ""){
      alert("Please select an address");
      return false;
    }
    if(value == ""){
      alert("Please enter valid amount");
      return false;
    }

    var coinInstance;
    App.contracts.Coin.deployed().then(function(instance) {
      coinInstance = instance;
      return coinInstance.transfer(addr,value, {from: App.currentAccount});
    }).then( function(result){

      // Watching Events 
      
      if(result.receipt.status != '0x01')
          alert("Transfer failed");
      for (var i = 0; i < result.logs.length; i++) {
        var log = result.logs[i];
        var singularText = "coins were";
        if(log.args.amount == 1){
          singularText = "coin was";
        }
        
        // Look for the event Sent
        // Notification 
        if (log.event == "Sent") {
          var text = 'Coin transfer: ' + log.args.amount + " " +singularText + 
              ' sent from ' + log.args.from +
              ' to ' + log.args.to + '.';
          jQuery('#showmessage_text').html(text);
          jQuery('#show_event').animate({'right':'10px'});
          setTimeout(function(){jQuery('#show_event').animate({'right':'-410px'},500)}, 15000);
          break;
        }
      }
      return coinInstance.balances(App.currentAccount);
    }).catch( function(err){
      console.log(err.message);
    })
  }
 

  
  ,handleBalance : function(){
    
    
    App.contracts.Coin.deployed().then(function(instance) {
      coinInstance = instance;
      return coinInstance.balances(App.currentAccount);
    }).then(function(result) {
      jQuery('#display_balance').val(result.toNumber());
    })
  }

};

$(function() {
  $(window).load(function() {
    App.init();
    console.log('starting app.js');
  });
});
