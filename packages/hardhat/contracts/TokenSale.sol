pragma solidity >=0.6.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/access/Ownable.sol"; //https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

contract TokenSale is Ownable {

  using SafeMath for uint256;

  mapping (address => uint256) public drops;

  constructor() public {
  }

  function setDrop(address tokenContract, uint256 salePrice) public onlyOwner {
    drops[tokenContract] = salePrice;
  }

  function buyToken(address tokenContract, uint256 quantity) payable public {
    ERC20 token = ERC20(tokenContract);
    require(msg.value == drops[tokenContract].mul(quantity), "Must send specified amount of ETH");
    require(token.balanceOf(address(this)) >= quantity, "Attempted to purchase too many tokens");
    token.transfer(msg.sender, quantity);
  }

}