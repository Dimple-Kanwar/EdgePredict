import "dotenv/config";

export const CONFIG = {
    CONTRACT_ADDRESS: process.env.ROOTSTOCK_CONTRACT_ADDRESS,
    RPC_URL: process.env.ROOTSTOCK_RPC_URL,
    PRIVATE_KEY: process.env.PRIVATE_KEY,
    PORT: process.env.PORT || 3000
};  