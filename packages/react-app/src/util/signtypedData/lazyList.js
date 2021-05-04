import {createTypeData, signTypedData} from './sign'
import { raribleApiRequest } from "../util";
import { orderTypes } from './domain';

export function createOrderForm(
  assetType,
  maker,
) {
  return {
    maker,
    make: {
      assetType,
      "value": "1"
    },
    take: {
      "type": {
        "@type": "ETH"
      },
      "value": "10000000000000000"
    },
    data:  {
      "@type": "V1",
      "beneficiary": "0x0000000000000000000000000000000000000000",
      "originFees": []
    },
    salt: "0x0000000000000000000000000000000000000000000000000000000000000001",
  }
}

// export async function getLazyMintedItem(id) {
//   const res = await raribleApiRequest({
//    path: `/protocol/v0.1/ethereum/nft/items/${id}/lazy`,
//    method: 'GET' ,
//    data: order
//   })
//   return res.data
// }


async function getEncodedAssetData(asset) {
  const res = await raribleApiRequest({
   path: 'protocol/v0.1/ethereum/order/encoder/assetType',
   method: 'POST' ,
   data: asset
  })
  return res.data
}

async function getEncoderData(data) {
  const res = await raribleApiRequest({
   path: 'protocol/v0.1/ethereum/order/encoder/data',
   method: 'POST' ,
   data
  })
  return res.data
}

export async function putOrder(order) {
  const res = await raribleApiRequest({
   path: '/protocol/ethereum/order/indexer/v0.1/orders',
   method: 'POST' ,
   data: order
  })
  return res.data
}

export async function prepareOrderMessage(form) {
  const encodedMakeType = await getEncodedAssetData(form.make.type)
  const encodedTakeType = await getEncodedAssetData(form.take.type)
  const encodedData = await getEncoderData(form.data)
  return {
    maker: form.maker,
    makeAsset: {
      assetType: {
        tp: encodedMakeType.type,
        data: encodedMakeType.data
      },
      amount: form.make.value
    },
    taker: form.taker || "0x0000000000000000000000000000000000000000",
    takeAsset: {
      assetType: {
        tp: encodedTakeType.type,
        data: encodedTakeType.data
      },
      amount: form.take.value
    },
    start: form.start || "0",
    end: form.end || "0",
    data: encodedData.data,
    dataType: encodedData.type,
    salt: form.salt,
  }
}

export async function signOrderMessage(
  provider,
  order,
  account,
  chainId,
  verifyingContract
) {
  const data = createTypeData(
    {
      name: "Exchange",
      version: "2",
      chainId,
      verifyingContract
    },
    "Order",
    order,
    orderTypes
  );
  return (await signTypedData(provider, account, data)).sig;
}