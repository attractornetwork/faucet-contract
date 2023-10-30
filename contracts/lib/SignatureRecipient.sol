// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract SignatureRecipient {
    error SignerMismatch(address expected, address actual);

    struct Signature {
        uint8 v;
        bytes32 r;
        bytes32 s;
    }

    address private _signer;

    function signer() public view returns (address) {
        return _signer;
    }

    function _trustTo(address signer_) internal {
        require (_signer != signer_);
        _signer = signer_;
    }

    function _verify(bytes32 fingerprint, Signature memory sig) internal view {
        address signer_ = ecrecover(fingerprint, sig.v, sig.r, sig.s);
        if (signer_ != _signer) revert SignerMismatch(_signer, signer_);
    }
}
