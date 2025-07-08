def generate_hardhat_config():
    content = """
        require("@nomicfoundation/hardhat-toolbox");
        require("dotenv").config();

        module.exports = {
        solidity: "0.8.20",
        networks: {
            custom: {
            url: "http://35.95.15.31:8545/",
            accounts: [process.env.PRIVATE_KEY]
            }
        }
        };
        """
    with open("X:\DTCC_HACK\work\hard\hardhat.config.js", "w", encoding="utf-8") as f:
        f.write(content)
    print("✅ hardhat.config.js created")