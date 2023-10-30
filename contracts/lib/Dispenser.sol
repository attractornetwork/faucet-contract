// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {Currency} from "./Currency.sol";

/**
    @title Dispenser
    @author iMe Lab
 */
abstract contract Dispenser {
    using Currency for address;

    address private immutable _token;
    uint256 private immutable _portion;

    constructor(address token_, uint256 portion_) {
        _token = token_;
        _portion = portion_;
    }

    function portion() public view returns (uint256) {
        return _portion;
    }

    function token() public view returns(address) {
        return _token;
    }

    function _dispense(address recipient) internal {
        _token.transfer(recipient, _portion);
    }

    function _flush(address recipient) internal {
        uint256 balance = _token.balanceOf(address(this));
        _token.transfer(recipient, balance);
    }

    receive() external payable {
        require (_token == Currency.NATIVE);
    }
}
