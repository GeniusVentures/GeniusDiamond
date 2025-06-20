import { GeniusDiamond } from "../../../typechain-types";
import { debuglog, CallbackArgs } from "@gnus.ai/diamonds";
import hre from "hardhat";
import util from "util";

/**
 * 
 * @param CallbackArgs 
 */
export async function registerProtocolVersionChainId(callbackArgs: CallbackArgs) {
  console.log("Starting ERC1155ProxyOperator callback registerProtocolVersionChainId");

  const { diamond } = callbackArgs;

  const chainID = diamond.chainId;
  const diamondName = diamond.diamondName;
  const networkName = diamond.networkName;
  const deployInfo = diamond.getDeployedDiamondData();
  const deployer = diamond.signer!;

  debuglog('UnitTest:log', `In GNUSControl callback function for networkName: ${networkName}  chainID: ${chainID}`);

  const diamondAddress = diamond.getDeployedDiamondData().DiamondAddress!;
  const diamondArtifactName = `hardhat-diamond-abi/HardhatDiamondABI.sol:${diamondName}`;
  const diamondArtifact = hre.artifacts.readArtifactSync(diamondArtifactName);
  const diamondContract = new hre.ethers.Contract(diamondAddress, diamondArtifact.abi, diamond.provider) as GeniusDiamond;
  const deployerDiamondContract = diamondContract.connect(deployer);

  deployerDiamondContract.setChainID(chainID);
  const protocolVersion = deployInfo.protocolVersion || 0.0;
  deployerDiamondContract.setProtocolVersion(Math.round(protocolVersion * 100));

  const info = diamondContract.protocolInfo();
  debuglog(`protocol info: \n${util.inspect(info)}`)
}
