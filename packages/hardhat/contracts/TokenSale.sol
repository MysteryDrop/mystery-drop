pragma solidity >=0.6.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/access/Ownable.sol"; //https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

contract TokenSale is Ownable {

  event Transfer(
    address indexed _dropAddress,
    address indexed _to,
    uint256 _value
  );

  using SafeMath for uint256;

  mapping (address => uint256) public dropPrice;
  mapping (uint256 => address) public dropAddress;

  uint256 public numberOfDrops;

  constructor() public {
  }

  function setDrop(address tokenContract, uint256 salePrice) public onlyOwner {
    if (dropPrice[tokenContract] == 0) {
      numberOfDrops++;
      dropAddress[numberOfDrops-1] = tokenContract;
    }
    dropPrice[tokenContract] = salePrice;
  }

  function buyToken(address tokenContract, uint256 quantity) payable public {
    ERC20 token = ERC20(tokenContract);
    require(msg.value == dropPrice[tokenContract].mul(quantity.div(1 ether)), "Must send specified amount of ETH");
    require(token.balanceOf(address(this)) >= quantity, "Attempted to purchase too many tokens");
    Transfer(tokenContract, msg.sender, quantity);
    token.transfer(msg.sender, quantity);
  }

  function tokensAvailable(address tokenContract) external view returns (uint256) {
    ERC20 token = ERC20(tokenContract);
    return token.balanceOf(address(this));
  }

  function balanceOf(address tokenContract, address userAddress) external view returns (uint256) {
    ERC20 token = ERC20(tokenContract);
    return token.balanceOf(userAddress);
  }

}