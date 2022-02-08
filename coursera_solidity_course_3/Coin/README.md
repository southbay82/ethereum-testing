# Coin DApp

Built a money transaction application with a minter who can create money to other accounts, and which they can transfer money to other accounts in the network.

Compiles with the following environment.

Truffle v5.4.3 (core: 5.4.3)
Solidity v0.5.16 (solc-js)
Node v16.6.1
Web3.js v1.5.0

<small> The smart contract used is based on the example in solidity docs </small>


## Prerequisite
1. NodeJs
2. Metamask (10.8.1)
3. Truffle (v5.4.3)


## Instruction for truffle testing
1. Clone the repository to a local folder
2. Go to the cloned folder using command line
3. Execute truffle compile
4. Open a new command line and execute truffle develop to start the blockchain network
5. In the old terminal execute truffle migrate --reset
6. Execute truffle test

This should print the following in the console

  Contract: CoinContract
    ✓ contract deployment
    ✓ should create money 
    ✓ should transfer money 
    ✓ should NOT create money 
    ✓ should NOT transfer money 


## Instruction for DApp

1. Now to start the nodeJs server execute npm run dev
2. This should start the front end of the application at localhost:3000
3. Open Metamask in your chrome browser and enter the key phrase you got after executing truffle develop
4. Now connect to private network using http://127.0.0.1:7545 and create as many accounts as you want
5. Now you should be in the first account in the metamask and can mint new coins.  Check balance, it's set to give owner 10 coins on contract instantiation.  Click the 'check balance' button to confirm coins.
6. Now send coins to another account, and then change to that account in Metamask from account 1 to account 2 and then click 'check balance' to see the sent coins.

Note:
1. To deploy a new instance of the contract exit the npm server and then execute truffle migrate --reset and then start the server again.
2. The contract is deployed from account[0] i.e the first account in the metamask.


