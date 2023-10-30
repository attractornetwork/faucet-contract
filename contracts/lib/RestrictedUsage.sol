// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import {TimeContext} from "./TimeContext.sol";

/**
    @title RestrictedUsage
    @author iMe Lab
    @notice SC part implementing time-based usage restriction
 */
contract RestrictedUsage is TimeContext {
    error UsageIsRestricted();

    struct Actor {
        /**
            @notice Actor identity
            @dev it should be generated by trusted part, e.g. signer
         */
        bytes32 name;
        address addr;
    }

    uint32 private _usageInterval;
    mapping (bytes32 => uint64) private _namesUsage;
    mapping (address => uint64) private _addressUsage;

    constructor(uint32 usageInterval) {
        _usageInterval = usageInterval;
    }

    function _useFrom(Actor memory actor) internal {
        _assertCanUse(actor);
        _namesUsage[actor.name] = _now();
        _addressUsage[actor.addr] = _now();
    }

    function _assertCanUse(Actor memory actor) private view {
        if (!_canUse(actor)) revert UsageIsRestricted();
    }

    function _canUse(Actor memory actor) private view returns(bool) {
        uint64 usedAt = _usedAt(actor);
        uint64 allowedAt = usedAt + _usageInterval;
        return _now() >= allowedAt;
    }

    function _usedAt(Actor memory actor) private view returns(uint64) {
        uint64 nameUsedAt = _namesUsage[actor.name];
        uint64 addrUsedAt = _addressUsage[actor.addr];
        return nameUsedAt >= addrUsedAt ? nameUsedAt : addrUsedAt;
    }
}