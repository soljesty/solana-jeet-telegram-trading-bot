// @ts-ignore
import { Metaplex } from "@metaplex-foundation/js";
import { Connection, PublicKey } from "@solana/web3.js";
import { solConnection } from "../config";
import { TokenMetadata } from "./types";
import { TOKEN_PROGRAM_ID } from "@raydium-io/raydium-sdk";
import { AccountLayout, getMint } from "@solana/spl-token";
import { getMetadataAccountDataSerializer } from "@metaplex-foundation/mpl-token-metadata";
import { fetchImage, getTokenPriceFromDexScreener } from ".";
import axios from "axios";

export async function getTokenData(mint: string): Promise<TokenMetadata> {
  try {
    const metaplex = Metaplex.make(solConnection);

    const mintAddress = new PublicKey(mint);

    let tokenName;
    let tokenSymbol;
    let tokenLogo;

    const metadataAccount = metaplex
      .nfts()
      .pdas()
      .metadata({ mint: mintAddress });

    const metadataAccountInfo = await solConnection.getAccountInfo(metadataAccount);

    if (metadataAccountInfo) {
      const token: any = await metaplex.nfts().findByMint({ mintAddress: mintAddress });
      tokenName = token.name;
      tokenSymbol = token.symbol;
      // tokenLogo = token.json.image? token.json.image: "";
    }
    return {
      name: tokenName,
      symbol: tokenSymbol,
      // uri: tokenLogo
    }
  } catch (e) {
    console.log(e)
    return {
      name: '',
      symbol: '',
      // uri: tokenLogo
    }
  }
}

export const getTokenInfo = async (connection: Connection, baseMint: PublicKey) => {
  console.log("calling getTokenInfo...", baseMint.toBase58());
  try {

    const metadataAccount = await connection.getAccountInfo(baseMint);

    const mintInfo = await getMint(connection, baseMint);


    // Check if the token is an NFT (supply of 1)
    console.log("mintInfo.supply)", mintInfo.supply.toString())
    // // @ts-ignore
    if (mintInfo.supply.toString() === "`") {
      console.log("Token is an NFT, excluding from results.");
      return {};
    }


    const serializer = getMetadataAccountDataSerializer();
    console.log("serializer", serializer)
    // @ts-ignore
    const deserialize = serializer.deserialize(metadataAccount.data);
    console.log("deserialize", deserialize)

    // // Image fetching is now in parallel with mint fetching
    // const imageFetch = fetchImage(deserialize[0].uri);

    // const _img = await imageFetch; // Await the image fetch here
    // console.log("_img", _img)



    return {

      name: deserialize[0].name,
      symbol: deserialize[0].symbol,
      // image: _img,
      supply: mintInfo.supply,
      decimals: mintInfo.decimals,

    };
  } catch (err) {
    console.log("Error getTokenInfo", err)
  }

}

export const getMyTokens = async (walletPubKey: PublicKey) => {
  console.log("calling getMyTokens...");

  try {
    const tokenAccounts = await solConnection.getTokenAccountsByOwner(walletPubKey, { programId: TOKEN_PROGRAM_ID });
    const tokensData = await Promise.all(tokenAccounts.value.map(async (account) => {
      const accountInfo = AccountLayout.decode(account.account.data);
      const mintAddress = new PublicKey(accountInfo.mint);
      let price: number;

      const mintInfo = await getMint(solConnection, mintAddress);
      // const tokenInfo = await getTokenInfo(solConnection, mintAddress)
      const tokenInfo = await getTokenData(accountInfo.mint.toBase58())

      // Exclude tokens with a supply of 1 (NFTs)
      if (mintInfo.supply.toString() === "1") {
        return null;
      }


      // const res = await axios.get(`https://price.jup.ag/v6/price?ids=${walletPubKey.toBase58()}&vsToken=So11111111111111111111111111111111111111112`)

      // console.log("res------------------------>", res.data.data)
      const response = await fetch(
        `https://price.jup.ag/v6/price?ids=${mintAddress.toBase58()}&vsToken=So11111111111111111111111111111111111111112`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data: any = await response.json();

      if (Object.keys(data.data).length === 0) {
        price = 0;
      } else {
        // console.log("haha", data.data[mintAddress.toBase58()].price)
        price = data.data[mintAddress.toBase58()].price;
      }


      // console.log({
      //   mintAddress: accountInfo.mint.toBase58(),
      //   decimals: mintInfo.decimals,
      //   supply: parseInt((BigInt(mintInfo.supply) / BigInt(10 ** mintInfo.decimals)).toString()), // Assuming supply is a BigInt, convert it to string for better handling in JS.
      //   balance: parseInt((BigInt(accountInfo.amount) / BigInt(10 ** mintInfo.decimals)).toString()), // Same as supply, handle big numbers as strings.
      //   // @ts-ignore
      //   name: tokenInfo.name,
      //   // @ts-ignore
      //   symbol: tokenInfo.symbol,
      //   // uri: tokenInfo.uri
      // })

      return {
        mintAddress: accountInfo.mint.toBase58(),
        decimals: mintInfo.decimals,
        supply: parseInt((BigInt(mintInfo.supply) / BigInt(10 ** mintInfo.decimals)).toString()), // Assuming supply is a BigInt, convert it to string for better handling in JS.
        balance: parseInt((BigInt(accountInfo.amount) / BigInt(10 ** mintInfo.decimals)).toString()), // Same as supply, handle big numbers as strings.
        // @ts-ignore
        name: tokenInfo.name,
        // @ts-ignore
        symbol: tokenInfo.symbol,
        price: price
        // uri: tokenInfo.uri

      };
    }));


    // Filter out null values (NFTs)
    const validTokensData = tokensData.filter(token => token !== null);
    // console.log("validTokensData", validTokensData)

    return validTokensData

    // const tokensObject = validTokensData.reduce((acc, token) => {
    //   // @ts-ignore
    //   acc[token.mintAddress] = token;
    //   return acc;
    // }, {});

  } catch (error) {
    console.error("Error fetching tokens:", error);
  }
};


export const getTokenPriceFromJupiterByTokenMint = async (baseMint: string) => {
  try{
    let price: number  = 0;
    const response = await fetch(
      `https://price.jup.ag/v6/price?ids=${baseMint}&vsToken=So11111111111111111111111111111111111111112`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    const data: any = await response.json();
  
    if (Object.keys(data.data).length === 0) {
      price = 0;
    } else {
      // console.log("haha", data.data[mintAddress.toBase58()].price)
      price = data.data[baseMint].price;
    }
    return price;
  }catch(err){
    return 0;
  }
}