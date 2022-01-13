const ethers = require("ethers");


const privatekey = "";

const provider = new ethers.providers.JsonRpcProvider("https://eth-kovan.alchemyapi.io/v2/Nx0U6ioIDJoF9-Olbnaa-B1P90vGwm27");

// console.log(mnemonic);

const wallet = new ethers.Wallet(privatekey);
const signer = wallet.connect(provider);
console.log(signer.address);

const abi_erc20 = require("./abi/abi_erc20.json");
const abi_factory = require("./abi/abi_factory.json");
const abi_calculator = require("./abi/abi_calculator.json");
const abi_router = require("./abi/abi_router.json");
// const { resolveProperties } = require("ethers/lib/utils");

const tokenGold = "0xe156329C416733B85D1aE85FC16c1cF62f22C733";
const tokenFiat = "0x775Cd37d82F9b52FdcdfA65aed072878Ce2Fe00D";
const pairAddress = "0x953ae0baf76c263acb57582ce8b9c16df8262934";

const calculator = "0xDFA27fc7edCB9Ba6Aa1934faa1796a7417692479";
const Router = "0xc27755bbFf1Fef8152Dd3Bd462AEE31c81F267D8";
const factory = "0x7b0f3795a98CDCA280D3A3ecffd85C5594092eD5";
const contract_erc20_gold = new ethers.Contract(tokenGold, abi_erc20, signer);
const contract_erc20_fiat = new ethers.Contract(tokenFiat, abi_erc20, signer);
const contract_factory = new ethers.Contract(factory, abi_factory, signer);
const contract_calculator = new ethers.Contract(calculator, abi_calculator, signer);
const contract_router = new ethers.Contract(Router, abi_router, signer);
const contract_erc20_pair = new ethers.Contract(pairAddress, abi_erc20, signer);
// const accountAddress = wallet.address;

// contract_erc20_gold.decimals().then(decimal =>{
//     // console.log(`decimal is ${decimal}`);
// });
contract_erc20_gold.balanceOf(wallet.address).then(balance =>{
    console.log(`balance gold is ${balance/10e17}`);
});

contract_erc20_fiat.balanceOf(wallet.address).then(balance =>{
    console.log(`balance fiat is ${balance/10e17}`);
})
// console.log(contract_erc20_gold.balanceOf(wallet.address));

// console.log(`signer address is ${signer.address}`);


// createPair();
// computeLiquidityShareValue();
// approve_gold();
// approve_fiat();
// addLiquidity();
// swapExactTokensForTokens();
// approve_pair();
removeLiquidity();

// getAmountsOut();
// getPair().then(pairAddress=>{
//     getReserve(pairAddress).then(result=>{
//         console.log(result);
//     });
// });
async function createPair() {
    contract_factory.createPair(tokenGold, tokenFiat).then(tx=>{
        console.log(`create pair success ${tx.address}`);
    });
}


async function computeLiquidityShareValue() {
    contract_calculator.computeLiquidityShareValue(0, tokenGold, tokenFiat).then(result =>{
        console.log(result);
    });
}

async function approve_gold() {
    contract_erc20_gold.approve(Router, "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff").then(hash=>{
        console.log(hash);
    })
}


async function approve_fiat() {
    contract_erc20_fiat.approve(Router, "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff").then(hash=>{
        console.log(hash);
    })
}
async function approve_pair() {
  contract_erc20_pair.approve(Router, "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff").then(hash=>{
      console.log(hash);
  })
}

async function addLiquidity() {
    contract_router.addLiquidity(
        tokenGold,
        tokenFiat, 
        ethers.utils.parseEther("500"),
        ethers.utils.parseEther("50000"),
        ethers.utils.parseEther("500"),
        ethers.utils.parseEther("50000"),
        wallet.address,
        1642132596
        ).then(result=>{
        console.log(result);
    });
}

async function getPair() {
    return new Promise((resolve, reject)=>{
        contract_factory.getPair(tokenGold, tokenFiat).then(result=>{
            console.log(result);
            resolve(result);
        });
    })

}

async function getReserve(pairAddress) {
    const pair = new ethers.Contract(pairAddress, abi_calculator, signer);

    const reservesRaw = await fetchReserves(tokenFiat, tokenGold, pair);
    const liquidityTokens_BN = await pair.balanceOf(accountAddress);
    const liquidityTokens = Number(
      ethers.utils.formatEther(liquidityTokens_BN)
    ).toFixed(2);
  
    return [
      reservesRaw[0].toFixed(2),
      reservesRaw[1].toFixed(2),
      liquidityTokens,
    ];
}
async function getAmountsOut() {
    const amountIn = ethers.utils.parseEther("50000");
    const tokens = [tokenFiat, tokenGold];
    contract_router.getAmountsOut(
        amountIn,
        tokens
    ).then(result=>{
        console.log(result[0]/10e17);
        console.log(result[1]/10e17);
    });
}
async function swapExactTokensForTokens() {
    const amountIn = ethers.utils.parseEther("50000");
    let path = [];
    path[0] = tokenFiat;
    path[1] = tokenGold;

    contract_router.swapExactTokensForTokens(
        amountIn,
        ethers.utils.parseEther("78"),
        path,
        wallet.address,
        1642132596
    ).then(result=>{
        console.log(result);
    });
}


async function fetchReserves(address1, address2, pair) {
    try {
      const reservesRaw = await pair.getReserves();
      let results = [
        Number(ethers.utils.formatEther(reservesRaw[0])),
        Number(ethers.utils.formatEther(reservesRaw[1])),
      ];
  
      return [
        (await pair.token0()) === address1 ? results[0] : results[1],
        (await pair.token1()) === address2 ? results[1] : results[0],
      ];
    } catch (err) {
      console.log("no reserves yet");
      return [0, 0];
    }
  }



 async function swapTokens(
    address1,
    address2,
    amount,
    routerContract,
    accountAddress,
    signer
  ) {
    const tokens = [address1, address2];
    const time = Math.floor(Date.now() / 1000) + 200000;
    const deadline = ethers.BigNumber.from(time);
  const amountIn = ethers.utils.parseEther(amount.toString());
    const amountOut = await routerContract.callStatic.getAmountsOut(
      amountIn,
      tokens
    );
  const token1 = new Contract(address1, ERC20.abi, signer);
    await token1.approve(routerContract.address, amountIn);
  if (address1 === COINS.AUTONITY.address) {
      // Eth -> Token
      await routerContract.swapExactETHForTokens(
        amountOut[1],
        tokens,
        accountAddress,
        deadline,
        { value: amountIn }
      );
    } else if (address2 === COINS.AUTONITY.address) {
      // Token -> Eth
      await routerContract.swapExactTokensForETH(
        amountIn,
        amountOut[1],
        tokens,
        accountAddress,
        deadline
      );
    } else {
      await routerContract.swapExactTokensForTokens(
        amountIn,
        amountOut[1],
        tokens,
        accountAddress,
        deadline
      );
    }
  }

 async function getAmountOut(
    address1,
    address2,
    amountIn,
    routerContract
  ) {
    try {
      const values_out = await routerContract.getAmountsOut(
        ethers.utils.parseEther(amountIn),
        [address1, address2]
      );
      const amount_out = ethers.utils.formatEther(values_out[1]);
      return Number(amount_out);
    } catch {
      return false;
    }
  }


  async function removeLiquidity() {
    contract_erc20_pair.balanceOf(wallet.address).then(balance=>{
      console.log(balance);
      console.log(balance/10e17);
      contract_router.removeLiquidity(
        tokenFiat,
        tokenGold,
        balance,
        0,
        0,
        wallet.address,
        1642132596
      ).then(tx=>{
        console.log(tx.hash);
      });
    });

  }