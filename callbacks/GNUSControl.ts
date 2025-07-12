import { GeniusDiamond } from "../../../typechain-types";
import { debuglog, CallbackArgs } from "diamonds";
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
  
  // Try to get the diamond artifact - if it doesn't exist, use ethers.getContractAt
  let diamondContract: GeniusDiamond;
  try {
    const diamondArtifactName = `hardhat-diamond-abi/HardhatDiamondABI.sol:${diamondName}`;
    const diamondArtifact = hre.artifacts.readArtifactSync(diamondArtifactName);
    diamondContract = new hre.ethers.Contract(diamondAddress, diamondArtifact.abi, diamond.provider as any) as unknown as GeniusDiamond;
  } catch (error) {
    console.warn(`Warning: Could not find hardhat-diamond-abi artifact for ${diamondName}, using ethers.getContractAt`);
    // Fallback to using ethers.getContractAt with a known facet
    diamondContract = await hre.ethers.getContractAt('GNUSControl', diamondAddress) as unknown as GeniusDiamond;
  }
  
  const deployerDiamondContract = diamondContract.connect(deployer);

  try {
    await deployerDiamondContract.setChainID(chainID);
    const protocolVersion = deployInfo.protocolVersion || 0.0;
    await deployerDiamondContract.setProtocolVersion(Math.round(protocolVersion * 100));

    const info = await diamondContract.protocolInfo();
    debuglog(`protocol info: \n${util.inspect(info)}`);
  } catch (error) {
    console.warn(`Warning: Could not set protocol info for ${diamondName}:`, error);
  }
}
