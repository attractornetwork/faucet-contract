# Attractor faucet

This project contains smart contracts and scripts, related to
Attractor faucet.

## Getting started

```shell
npm install;
cp .env.example .env;

# Edit environment with your favourite editor
edit .env
```

## Deployment

```shell
# Run deployment script
npx hardhat run --network attratest scripts/deploy.ts

# Your deployment info stored in ./deployment/faucet-<timestamp>.json
```

Deployed faucets:
- [ATTRA](https://explorer.dev.attra.me/address/0x3f73E601c0569F91751FBDFc2b6DCc91595108E1)
- BUSD (soon)
- USDT (soon)

## Verification

TODO :)

## Funding

```shell
# Run funding task
# Note that the script will transfer your funds to faucet SC!
npx hardhat fund <address> <amount>
```
