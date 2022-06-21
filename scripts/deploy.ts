import { ethers, run, network } from "hardhat"
import { TaskArguments } from "hardhat/types"

async function main() {
  const simpleStorageFactory = await ethers.getContractFactory("SimpleStorage")
  console.log("Deploying contract...")
  const simpleStorage = await simpleStorageFactory.deploy()
  await simpleStorage.deployed()
  console.log(`Deployed contract to: ${simpleStorage.address}`)

  // verify the contract if on non-local/hardhat network
  if (
    network.name !== "hardhat" &&
    network.name !== "localhost" &&
    process.env.ETHERSCAN_API_KEY
  ) {
    console.log("Waiting for 6 block confirmations...")
    await simpleStorage.deployTransaction.wait(6) // wait 6 blocks before verifying
    await verify(simpleStorage.address)
  }

  const currentValue = await simpleStorage.retrieve()
  console.log(`Current Value is: ${currentValue}`)

  // update the current value
  const transactionResponse = await simpleStorage.store(7)
  await transactionResponse.wait(1) // wait 1 block
  const updatedValue = await simpleStorage.retrieve()
  console.log(`Updated Value is: ${updatedValue}`)
}

async function verify(contractAddress: string, args: TaskArguments = []) {
  console.log("Verifying contract...")
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    })
  } catch (error) {
    if ((error as Error).message.toLowerCase().includes("already verified")) {
      console.log("Already verified!")
    } else {
      console.error(error)
    }
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
