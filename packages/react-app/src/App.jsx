import React, { useCallback, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { BrowserRouter, Switch, Route, Link } from "react-router-dom";
import "antd/dist/antd.css";
import { InfuraProvider, JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import "./App.css";
import { Alert, List } from "antd";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { useUserAddress } from "eth-hooks";
import {
  useGasPrice,
  useContractLoader,
  useContractReader,
  useEventListener,
  useBalance,
  useExternalContractLoader,
} from "./hooks";
import { Header, Contract, About, Gallery, Purchase } from "components";
import { Mint } from "./pages";
import { Transactor } from "./helpers";
import { formatEther } from "@ethersproject/units";
//import Hints from "./Hints";
import {
  INFURA_ID,
  NETWORK,
  NETWORKS,
  VAULT_ABI,
  VAULT_ADDRESS,
  RARI_ABI,
  RARI_ADDRESS,
  getPlaceholderJSONManifest,
} from "./constants";
const axios = require("axios");

/*
    Welcome to 🏗 scaffold-eth !

    Code:
    https://github.com/austintgriffith/scaffold-eth

    Support:
    https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA
    or DM @austingriffith on twitter or telegram

    You should get your own Infura.io ID and put it in `constants.js`
    (this is your connection to the main Ethereum network for ENS etc.)


    🌏 EXTERNAL CONTRACTS:
    You can also bring in contract artifacts in `constants.js`
    (and then use the `useExternalContractLoader()` hook!)
*/

/// 📡 What chain are your contracts deployed to?
const targetNetwork = NETWORKS["rinkeby"]; // <------- select your target frontend network (localhost, rinkeby, xdai, mainnet)

// 😬 Sorry for all the console logging
const DEBUG = false;

// 🛰 providers
if (DEBUG) console.log("📡 Connecting to Mainnet Ethereum");
// const mainnetProvider = getDefaultProvider("mainnet", { infura: INFURA_ID, etherscan: ETHERSCAN_KEY, quorum: 1 });
const mainnetProvider = new InfuraProvider("mainnet", INFURA_ID);
//
// attempt to connect to our own scaffold eth rpc and if that fails fall back to infura...
// const scaffoldEthProvider = new JsonRpcProvider("https://rpc.scaffoldeth.io:48544");
// const mainnetInfura = new JsonRpcProvider("https://mainnet.infura.io/v3/" + INFURA_ID);
// const rinkebyInfura = new JsonRpcProvider("https://mainnet.infura.io/v3/" + INFURA_ID);
// ( ⚠️ Getting "failed to meet quorum" errors? Check your INFURA_I

// 🏠 Your local provider is usually pointed at your local blockchain
const localProviderUrl = targetNetwork.rpcUrl;
// as you deploy to other networks you can set REACT_APP_PROVIDER=https://dai.poa.network in packages/react-app/.env
const localProviderUrlFromEnv = process.env.REACT_APP_PROVIDER ? process.env.REACT_APP_PROVIDER : localProviderUrl;
if (DEBUG) console.log("🏠 Connecting to provider:", localProviderUrlFromEnv);
const localProvider = new JsonRpcProvider(localProviderUrlFromEnv);

// 🔭 block explorer URL
const blockExplorer = targetNetwork.blockExplorer;

const queryClient = new QueryClient();
function App(props) {
  // const mainnetProvider = scaffoldEthProvider && scaffoldEthProvider._network ? scaffoldEthProvider : mainnetInfura;
  // if (DEBUG) console.log("🌎 mainnetProvider", mainnetProvider);

  const [injectedProvider, setInjectedProvider] = useState();

  /* Server JWT Auth */
  const [jwtAuthToken, setJwtAuthToken] = useState(null);

  /* 💵 This hook will get the price of ETH from 🦄 Uniswap: */
  // const price = useExchangePrice(targetNetwork, mainnetProvider);

  /* 🔥 This hook will get the price of Gas from ⛽️ EtherGasStation */
  const gasPrice = useGasPrice(targetNetwork, "fast");
  // Use your injected provider from 🦊 Metamask or if you don't have it then instantly generate a 🔥 burner wallet.
  // const userProvider = useUserProvider(injectedProvider, localProvider);
  const userProvider = injectedProvider;
  const address = useUserAddress(userProvider);
  if (DEBUG) console.log("👩‍💼 selected address:", address);

  // You can warn the user if you would like them to be on a specific network
  let localChainId = localProvider && localProvider._network && localProvider._network.chainId;
  if (DEBUG) console.log("🏠 localChainId", localChainId);

  let selectedChainId = userProvider && userProvider._network && userProvider._network.chainId;
  if (DEBUG) console.log("🕵🏻‍♂️ selectedChainId:", selectedChainId);

  // For more hooks, check out 🔗eth-hooks at: https://www.npmjs.com/package/eth-hooks

  // The transactor wraps transactions and provides notificiations
  const tx = Transactor(userProvider, gasPrice);

  // Faucet Tx can be used to send funds from the faucet
  // const faucetTx = Transactor(localProvider, gasPrice);

  // 🏗 scaffold-eth is full of handy hooks like this one to get your balance:
  const yourLocalBalance = useBalance(localProvider, address);
  if (DEBUG) console.log("💵 yourLocalBalance", yourLocalBalance ? formatEther(yourLocalBalance) : "...");

  // Just plug in different 🛰 providers to get your balance on different chains:
  // const yourMainnetBalance = useBalance(mainnetProvider, address);
  // if (DEBUG) console.log("💵 yourMainnetBalance", yourMainnetBalance ? formatEther(yourMainnetBalance) : "...");

  // Load in your local 📝 contract and read a value from it:
  const readContracts = useContractLoader(localProvider);
  if (DEBUG) console.log("📝 readContracts", readContracts);

  // If you want to make 🔐 write transactions to your contracts, use the userProvider:
  const writeContracts = useContractLoader(userProvider);
  if (DEBUG) console.log("🔐 writeContracts", writeContracts);

  // EXTERNAL CONTRACT EXAMPLE:
  //
  const rinkebyRariContract = useExternalContractLoader(localProvider, RARI_ADDRESS, RARI_ABI);
  console.log("🌍 RARI contract on rinkeby:", rinkebyRariContract);

  const vaultId = 34;
  const rinkebyVaultContract = useExternalContractLoader(localProvider, VAULT_ADDRESS, VAULT_ABI);
  console.log("🌍 Vault contract on rinkeby:", rinkebyVaultContract);

  const myRinkebyVaultHoldings = useContractReader({ XSTORE: rinkebyVaultContract }, "XSTORE", "holdingsLength", [
    vaultId,
  ]);
  console.log("🥇 myRinkebyVaultHoldings:", myRinkebyVaultHoldings);

  // keep track of a variable from the contract in the local React state:
  const numberOfDrops = useContractReader(readContracts, "TokenSale", "numberOfDrops");
  console.log("🤗 number of drops:", numberOfDrops);

  //📟 Listen for broadcast events
  const transferEvents = useEventListener(readContracts, "TokenSale", "Transfer", localProvider, 1);
  console.log("📟 Transfer events:", transferEvents);

  //
  // 🧠 This effect will update token sale by polling when number of drops changes
  //
  const yourNumberOfDrops = numberOfDrops && numberOfDrops.toNumber && numberOfDrops.toNumber();
  const [yourDrops, setYourDrops] = useState();

  useEffect(() => {
    const updateTokenSaleBalance = async () => {
      console.log("Updating drops");
      let tokenSaleUpdate = [];
      if (numberOfDrops) {
        for (let tokenIndex = 0; tokenIndex < numberOfDrops.toNumber(); tokenIndex++) {
          try {
            console.log("Getting token index", tokenIndex);
            const tokenAddress = await readContracts.TokenSale.dropAddress(tokenIndex);
            console.log("tokenId", tokenAddress);

            const yourBalance = await readContracts.TokenSale.balanceOf(tokenAddress, address);
            const tokensAvailable = await readContracts.TokenSale.tokensAvailable(tokenAddress);
            const currentPrice = await readContracts.TokenSale.dropPrice(tokenAddress);

            tokenSaleUpdate.push({ tokenAddress, currentPrice, tokensAvailable, yourBalance });
          } catch (e) {
            console.log(e);
          }
        }
      }
      setYourDrops(tokenSaleUpdate);
    };
    updateTokenSaleBalance();
  }, [address, yourNumberOfDrops, transferEvents]);

  //
  // 🧠 This effect will update token sale by polling when number of drops changes
  //
  const vaultHoldingsLength =
    myRinkebyVaultHoldings && myRinkebyVaultHoldings.toNumber && myRinkebyVaultHoldings.toNumber();
  const [yourVaultHoldings, setYourVaultHoldings] = useState([]);

  useEffect(() => {
    const updateVaultHoldings = async () => {
      console.log(`Updating holdings`);
      let vaultHoldingsUpdate = [];
      if (vaultHoldingsLength) {
        console.log(`Updating holdings: ${myRinkebyVaultHoldings.toNumber()}`);

        for (let holdingsIndex = 0; holdingsIndex < myRinkebyVaultHoldings.toNumber(); holdingsIndex++) {
          try {
            console.log("Getting holding index", holdingsIndex);
            const tokenId = await rinkebyVaultContract.holdingsAt(vaultId, holdingsIndex);
            const tokenURI = await rinkebyRariContract.tokenURI(tokenId.toString());
            const ipfsHash = tokenURI.replace("ipfs:/ipfs/", "");
            console.log("NFT tokenId", tokenId.toString());
            console.log("NFT tokenURI", tokenURI.toString());
            console.log("ipfsHash", ipfsHash);
            const metadataUri = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
            // const metadataUri = `https://gateway.pinata.cloud/ipfs/QmRxyfRwonZo9oXtBGaz2PDbJB7snm6R645irzGqrqKgJh`

            try {
              const jsonManifest = await axios.get(metadataUri, { timeout: 100 }).then(function (response) {
                console.log(response.data);
                return response.data;
              });
              const imageURI = jsonManifest.image;
              const imageIpfsHash = imageURI.replace("ipfs://ipfs/", "");
              const renderUri = `https://gateway.pinata.cloud/ipfs/${imageIpfsHash}`;
              console.log("jsonManifest", jsonManifest);
              vaultHoldingsUpdate.push({ id: tokenId, uri: tokenURI, renderUri, ...jsonManifest });
            } catch (e) {
              console.log("🧙 This NFT is still hidden");
              const placeholderManifest = getPlaceholderJSONManifest(ipfsHash, tokenId);
              vaultHoldingsUpdate.push({ id: tokenId, uri: tokenURI, ...placeholderManifest });
            }
          } catch (e) {
            alert("failed");
            console.log(e);
          }
        }
      }
      setYourVaultHoldings(vaultHoldingsUpdate);
    };
    updateVaultHoldings();
  }, [vaultHoldingsLength]);

  /*
  const addressFromENS = useResolveName(mainnetProvider, "austingriffith.eth");
  console.log("🏷 Resolved austingriffith.eth as:",addressFromENS)
  */

  let networkDisplay = "";
  if (localChainId && selectedChainId && localChainId != selectedChainId) {
    networkDisplay = (
      <div style={{ zIndex: 2, position: "absolute", right: 0, top: 60, padding: 16 }}>
        <Alert
          message={"⚠️ Wrong Network"}
          description={
            <div>
              You have <b>{NETWORK(selectedChainId)}</b> selected and you need to be on{" "}
              <b>{NETWORK(localChainId).name}</b>.
            </div>
          }
          type="error"
          closable={false}
        />
      </div>
    );
  } else {
    networkDisplay = (
      <div style={{ zIndex: -1, position: "absolute", right: 154, top: 28, padding: 16, color: targetNetwork.color }}>
        {targetNetwork.name}
      </div>
    );
  }

  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect();
    setInjectedProvider(new Web3Provider(provider));
  }, [setInjectedProvider]);

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      loadWeb3Modal();
    }
  }, [loadWeb3Modal]);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        {/* ✏️ Edit the header and change the title to your project name */}
        {DEBUG ? networkDisplay : null}
        <BrowserRouter>
          <Header
            loadWeb3Modal={loadWeb3Modal}
            setProvider={setInjectedProvider}
            web3Modal={web3Modal}
            logoutOfWeb3Modal={web3Modal}
            jwtAuthToken={jwtAuthToken}
            setJwtAuthToken={setJwtAuthToken}
          />

          <div className="main-content-container">
            {injectedProvider ? (
              <Switch>
                <Route exact path="/">
                  <div style={{ width: 640, margin: "auto", marginTop: 32, paddingBottom: 32 }}>
                    <List
                      dataSource={yourDrops}
                      renderItem={item => {
                        const id = item.tokenAddress;
                        console.log({ id });
                        return (
                          <List.Item key={id}>
                            <Purchase
                              availTokens={item.tokensAvailable}
                              yourBalance={item.yourBalance}
                              tokenAddress={item.tokenAddress}
                              currPrice={item.currentPrice}
                              tx={tx}
                              writeContracts={writeContracts}
                              /* name="YourContract" */
                              /* signer={userProvider.getSigner()} */
                              /* provider={localProvider} */
                              /* address={address} */
                              /* blockExplorer={blockExplorer} */
                            />
                          </List.Item>
                        );
                      }}
                    ></List>
                  </div>
                </Route>
                <Route path="/gallery">
                  <Gallery
                    tokens={yourVaultHoldings}
                    /* address={address} */
                    /* yourLocalBalance={yourLocalBalance} */
                    /* mainnetProvider={mainnetProvider} */
                    /* price={price} */
                  />
                </Route>
                <Route path="/debugcontracts">
                  <Contract
                    name="TokenSale"
                    signer={userProvider.getSigner()}
                    provider={localProvider}
                    address={address}
                    blockExplorer={blockExplorer}
                  />
                  <Contract
                    name="AnyERC20"
                    signer={userProvider.getSigner()}
                    provider={localProvider}
                    address={address}
                    blockExplorer={blockExplorer}
                  />
                </Route>
                <Route path="/about">
                  <About />
                </Route>
                <Route path="/mint">
                  <Mint
                    provider={userProvider}
                    mainnetProvider={mainnetProvider}
                    jwtAuthToken={jwtAuthToken}
                    setJwtAuthToken={setJwtAuthToken}
                  />
                </Route>
              </Switch>
            ) : (
              <span>Please connect your wallet</span>
            )}{" "}
          </div>
        </BrowserRouter>

        {/* <ThemeSwitch /> */}
      </div>
    </QueryClientProvider>
  );
}

/*
  Web3 modal helps us "connect" external wallets:
*/
const web3Modal = new Web3Modal({
  // network: "mainnet", // optional
  cacheProvider: true, // optional
  providerOptions: {
    walletconnect: {
      package: WalletConnectProvider, // required
      options: {
        infuraId: INFURA_ID,
      },
    },
  },
});

window.ethereum &&
  window.ethereum.on("chainChanged", chainId => {
    setTimeout(() => {
      window.location.reload();
    }, 1);
  });

export default App;
