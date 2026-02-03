const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying Game2048Fee contract...");

  // Fee recipient wallet - your address
  const FEE_RECIPIENT = "0xB4BD7D410543cB27f42c562ab3fF5DC12fBDd42F";
  
  // Get deployer
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying contract with account:", deployer.address);
  console.log("💰 Account balance:", (await deployer.getBalance()).toString());

  // Deploy contract
  const Game2048Fee = await hre.ethers.getContractFactory("Game2048Fee");
  const contract = await Game2048Fee.deploy(FEE_RECIPIENT);
  await contract.deployed();

  console.log("✅ Contract deployed to:", contract.address);
  console.log("📊 Fee Recipient:", FEE_RECIPIENT);
  console.log("💵 Game Fee Amount: 0.001 USDC (1000 wei)");

  // Verify on Block Explorer
  console.log("\n📋 Next steps:");
  console.log("1. Verify contract on BaseScan:");
  console.log(`   npx hardhat verify --network base ${contract.address} "${FEE_RECIPIENT}"`);
  console.log("\n2. Update your app's contract address in lib/constants.ts");
  console.log(`3. Update PaymentModal to use the contract's payGameFee function`);

  // Save deployment info
  const fs = require("fs");
  const deploymentInfo = {
    contractAddress: contract.address,
    feeRecipient: FEE_RECIPIENT,
    network: "base",
    deploymentTime: new Date().toISOString(),
    gameFeeAmount: "1000", // 0.001 USDC
  };

  fs.writeFileSync(
    "deployments/game2048Fee.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("\n💾 Deployment info saved to deployments/game2048Fee.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
