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

## Verification

TODO :)

## Funding

```shell
# Run funding task
# Note that the script will transfer your funds to faucet SC!
npx hardhat fund <address> <amount>
```
