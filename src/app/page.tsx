"use client";
import Image from 'next/image'
import styles from './page.module.css'
import { Center, Spinner, Text, Button, Divider, Box, Tabs, TabList, Tab, TabPanels, TabPanel } from '@chakra-ui/react';
import InteractContract from './components/client/Contract/InteractContract';
import { useState } from "react";
import { ChakraProvider } from '@chakra-ui/react'
import { useStoreWallet } from './components/Wallet/walletContext';

import { encode, Provider } from "starknet";
import { StarknetWindowObject,  } from "./core/StarknetWindowObject";
//import { connect } from "get-starknet";

import starknetjsImg from '../../public/Images/StarkNet-JS_logo.png';
import WalletHandle from './components/client/WalletHandle/WalletHandle';
import { scanObjectForWallets } from './core/wallet/scan';
import { isWalletObj } from './core/wallet/isWalletObject';
import { callRequest } from './components/client/WalletHandle/callRequest';
import { isBooleanObject } from 'util/types';
import { formatAddress } from '@/utils/format';

export default function Page() {

    // Connect Argent-X or Braavos wallet
    const [isConnected, setConnected] = useState(false);
    // const [wallet, setWallet] = useState<StarknetWindowObject | null>(null);
    const addressAccountFromContext = useStoreWallet(state => state.address);
    const setAddressAccount = useStoreWallet(state => state.setAddressAccount);

    const myWallet = useStoreWallet(state => state.wallet);
    const setMyWallet = useStoreWallet(state => state.setMyWallet);

    const chainFromContext = useStoreWallet(state => state.chain);
    const setChain = useStoreWallet(state => state.setChain);

    const accountFromContext = useStoreWallet(state => state.account);
    const setAccount = useStoreWallet(state => state.setAccount);

    const providerFromContext = useStoreWallet(state => state.provider);
    const setProvider = useStoreWallet(state => state.setProvider);

    // Component context

    const handleConnectClick = async () => {
        // const wallet = await connect({ modalMode: "alwaysAsk", modalTheme: "light" });
        const wallets:StarknetWindowObject[]=scanObjectForWallets(window,isWalletObj);
        // console.log("wallets=", wallets);
        const wallet=wallets.find((wallet)=>wallet.id=="braavos");
        console.log("wallet=", wallet);

        if (!!wallet) {
            setMyWallet(wallet); // zustand
            // await wallet?.enable({ starknetVersion: "v5" } as any); //not allowed by new Braavos
            //setWallet(wallet); // local state
            const result=await callRequest({type:"wallet_requestAccounts"});
            console.log("result=",result);
            if (Array.isArray(result)) {
            const addr = formatAddress( result[0]);
            setAddressAccount(addr);
            }
            setConnected(wallet?.isConnected);
            if (wallet?.isConnected) {
                setChain(wallet.chainId); // not provided by Braavos
            }
        }
    }

    return (
        <ChakraProvider>
            <div>
                <p className={styles.bgText}>
                    Test experimental Braavos wallet with starknet.js v5.21.0
                </p>
                <Center>
                    <Image src={starknetjsImg} alt='starknet.js' width={150} height={150} />
                </Center>
                <p className={styles.bgText}>
                    Please connect to testnet network
                </p>
                <div>
                    {!isConnected ? (
                        <Center>
                            <Button
                                ml="4"
                                textDecoration="none !important"
                                outline="none !important"
                                boxShadow="none !important"
                                onClick={() => {
                                    handleConnectClick();
                                }}
                            >
                                Connect Braavos Wallet
                            </Button>
                        </Center>
                    ) : (
                        <>
                            <Center>
                                <Button
                                    ml="4"
                                    textDecoration="none !important"
                                    outline="none !important"
                                    boxShadow="none !important"
                                    onClick={() => {
                                        setConnected(false);
                                    }}
                                >
                                    {addressAccountFromContext
                                        ? `Your wallet : ${addressAccountFromContext?.slice(0, 7)}...${addressAccountFromContext?.slice(-4)} is connected`
                                        : "No Account"}
                                </Button>
                            </Center>
                            <br />
                            <Tabs variant="enclosed" colorScheme='facebook' size="lg" isFitted >
                                <TabList >
                                    <Tab> BlockChain</Tab>
                                    <Tab>Wallet</Tab>
                                </TabList>
                                <TabPanels>
                                    <TabPanel>
                                        <Box bg='pink.200' color='black' borderWidth='1px' borderRadius='md'>
                                            <p className={styles.text1}>
                                                address = {addressAccountFromContext}<br />
                                                chain = {chainFromContext}<br />
                                                isConnected={isConnected ? "Yes" : "No"}
                                                
                                            </p>
                                        </Box>
                                        {!!providerFromContext &&
                                            <InteractContract ></InteractContract>}
                                    </TabPanel>
                                    <TabPanel>
                                        <p></p>
                                        <WalletHandle></WalletHandle>
                                    </TabPanel>
                                </TabPanels>
                            </Tabs>

                        </>
                    )
                    }
                </div>
            </div >
        </ChakraProvider>
    )
}


