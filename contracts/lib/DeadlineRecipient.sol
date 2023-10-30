// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {TimeContext} from "./TimeContext.sol";

abstract contract DeadlineRecipient is TimeContext {
  error DeadlineIsTooFar();
  error DeadlineWasExceeded();

  uint32 private immutable _deadlineLimit;

  constructor(uint32 deadlineLimit) {
    _deadlineLimit = deadlineLimit;
  }

  function _accept(uint64 deadline) internal view {
    uint64 time = _now();
    if (time > deadline) revert DeadlineWasExceeded();
    uint64 extraTime = deadline - time;
    if (extraTime > _deadlineLimit) revert DeadlineIsTooFar();
  }
}
