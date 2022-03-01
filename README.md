# Sealed Bid Auction 

## Project Description and Walkthrough

This is a single page application built with vue.js and griptape.js. It interacts with a recent instantiation of the classic [Sealed Bid Auction contract](https://github.com/baedrik/SCRT-sealed-bid-auction) on the pulsar-2 testnet of Secret Network.

The entry point file is `main.ts`, which both mounts `App.vue` and connects the application to the griptape API, to allow queries to be made to Secret Network.

`App.vue` sets up the site's navigation bar and overall style. `vue-router` is being used to implement link routing to the pages defined in /views/. Most of the functionality of the application is contained within the /components/ and /contracts/.

<!-- The Home page doesn't really do anything at the moment, but could contain some basic information, tutorials, and statistics in the future. -->

---

To use the app, click on the Connect button near the top of the screen to connect to your active Keplr account. Then create a viewing key using the button below. This key is stored locally in the browser, not in Keplr, and is used by the application to link your wallet address to any auctions you create or interact with.

Next, head over to the Wallet page. Click on the buttons for each token you want to use within the application. If anything doesn't look right, press the 'Get Balances' button to refresh them.

Now click on the Auctions link to pull up a list of all the active auctions. Pressing 'View More' will load all of the auction info and interactive features further down on the page. Features like 'Check Bids' and 'Change Minimum Bid' only work if you are the one who created the auction. As well, only the auction creator can close an auction, unless the end date has already passed. In that case, anyone can close the auction.

When placing a bid, Keplr will pop up and will require you to sign 2 transactions. The first one increases the allowance on the bid token contract, and the second one places the actual bid on the auction contract.

You can create an auction using the 'Create' link in the navigation bar. Please enter information for every field, or the transaction may not execute properly. Once the create auction message has been signed and the transaction confirmed, you will be redirected automatically to the Home page. It may take a few minutes for your auction to show up on the list of active auctions, or you can try refreshing the application. 

---

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```