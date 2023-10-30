// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {TimeContext} from "./TimeContext.sol";

contract RestrictedUsage is TimeContext {
    error UsageIsRestricted();

    struct Actor {
        bytes32 name;
        address addr;
    }

    uint32 private _usageInterval;
    mapping (bytes32 => uint64) private _namesUsage;
    mapping (address => uint64) private _addressUsage;

    constructor(uint32 usageInterval) {
        _usageInterval = usageInterval;
    }

    function _useFrom(Actor memory identity) internal {
        _assertCanUse(identity);
        _namesUsage[identity.name] = _now();
        _addressUsage[identity.addr] = _now();
    }

    function _assertCanUse(Actor memory identity) private view {
        if (!_canUse(identity)) revert UsageIsRestricted();
    }

    function _canUse(Actor memory identity) private view returns(bool) {
        uint64 usedAt = _usedAt(identity);
        uint64 allowedAt = usedAt + _usageInterval;
        return _now() > allowedAt;
    }

    function _usedAt(Actor memory identity) private view returns(uint64) {
        uint64 nameUsedAt = _namesUsage[identity.name];
        uint64 addrUsedAt = _addressUsage[identity.addr];
        return nameUsedAt > addrUsedAt ? nameUsedAt : addrUsedAt;
    }
}
