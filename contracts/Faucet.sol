// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Dispenser} from "./lib/Dispenser.sol";
import {SignatureRecipient} from "./lib/SignatureRecipient.sol";
import {RestrictedUsage} from "./lib/RestrictedUsage.sol";
import {DeadlineRecipient} from "./lib/DeadlineRecipient.sol";

contract Faucet is
    Ownable,
    Dispenser,
    RestrictedUsage,
    SignatureRecipient,
    DeadlineRecipient
{
    constructor(
        address dispenseToken,
        uint256 dispensePortion,
        address trustedSigner
    )
        Ownable(_msgSender())
        DeadlineRecipient(3600)
        RestrictedUsage(86400)
        Dispenser(dispenseToken, dispensePortion)
    {
        _trustTo(trustedSigner);
    }

    function dispense(
        RestrictedUsage.Actor calldata actor,
        SignatureRecipient.Signature calldata sig,
        uint64 deadline
    ) public {
        _accept(deadline);
        _verify(_fingerprint(actor, deadline), sig);
        _useFrom(actor);
        _dispense(actor.addr);
    }

    function flush() public onlyOwner {
        _flush(_msgSender());
    }

    function trust(address signer_) public onlyOwner {
        _trustTo(signer_);
    }

    receive() external payable override {
        // accept any currency
    }

    function _fingerprint(
        RestrictedUsage.Actor calldata actor,
        uint64 deadline
    ) private view returns (bytes32) {
        bytes32 message = keccak256(
            abi.encodePacked(
                "Attractor faucet dispension! Our lucky guy is",
                actor.addr,
                actor.name,
                address(this),
                deadline
            )
        );

        return keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", message)
        );
    }
}
