// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/access/Ownable.sol";


contract Proxy is Ownable {
    // Storage slot for the address of the implementation contract. This uses EIP-1967 standard
    bytes32 private constant implementationSlot = bytes32(uint256(keccak256('eip1967.proxy.implementation')) - 1);

    struct ownerSet {
        address owner;
    }

    // Constructor that sets the initial implementation contract address
    constructor(address _implementation) Ownable(msg.sender) {
        setImplementation(_implementation);
    }

    // Fallback function that delegates all calls to the implementation contract
    fallback() external payable {
        address impl = getImplementation(); 
        require(impl != address(0), "Implementation contract not set");
        assembly {
            let ptr := mload(0x40)  // Load free memory pointer
            calldatacopy(ptr, 0, calldatasize())  // Copy the calldata to memory
            let result := delegatecall(gas(), impl, ptr, calldatasize(), 0, 0)  // Delegate the call to the implementation
            let size := returndatasize()  // Get the size of the returned data
            returndatacopy(ptr, 0, size)  // Copy the returned data to memory
            switch result  // Check the result of the call
            case 0 { revert(ptr, size) }  // Revert if the call failed
            default { return(ptr, size) }  // Return the result if the call succeeded
        }
    }

    // Function to set the implementation address (for upgrading)
    function setImplementation(address _implementation) public onlyOwner{
        bytes32 slot = implementationSlot;
        assembly {
            sstore(slot, _implementation)
        }
    }

    // Function to get the current implementation address
    function getImplementation() public view returns (address impl) {
        bytes32 slot = implementationSlot;
        assembly {
            impl := sload(slot)
        }
    }

    function getOwner() public view returns (address) {
        return owner();
    }

    // Function to receive Ether
    receive() external payable {}
}
