import React, { useState } from "react";
import { useQuery } from "react-query";
import "./Drops.scss";
import { apiRequest } from "../util/util";
import { sign } from "util/mint";

async function mintItem({ provider, contentId, dropId, jwtAuthToken }) {
  const result = await apiRequest({
    path: `v1/mint?contentId=${contentId}&dropId=${dropId}`,
    method: "GET",
    accessToken: jwtAuthToken,
  });
  console.log({ result });

  const signer = provider.getSigner();
  const address = await signer.getAddress();
  console.log({ address });

  const signature = await sign(
    signer,
    result.tokenData.tokenId,
    result.tokenData.tokenUri,
    [{ account: address, value: 10000 }],
    [],
    result.tokenData.contractAddress,
  );
  console.log({ signature });
  const mintResult = await apiRequest({
    path: `v1/mint?contentId=${contentId}&dropId=${dropId}`,
    method: "POST",
    data: {
      contentId,
      dropId,
      signature,
    },
    accessToken: jwtAuthToken,
  });
  console.log({ mintResult });
}

export default function Drops({ jwtAuthToken, provider }) {
  console.log({ jwtAuthToken });
  const query = () => apiRequest({ path: "v1/getDrops", method: "GET", accessToken: jwtAuthToken });
  const { isLoading, error, data, isFetching } = useQuery(`userDrops`, query, { refetchInterval: 3000 });
  if (isLoading) return <span>Loading</span>;
  if (error) return <span>`An error has occurred: ${error}`</span>;
  console.log({ data });

  return (
    <div id="drops">
      {data &&
        data.drops.map(drop => (
          <div key={drop.dropId}>
            <span>test</span>
            <img alt="" src={drop.dropPreviewUrl} />
            {drop.content.map(content => (
              <div key={content.contentId}>
                <span>{content.contentTitle}</span>
                <button
                  onClick={() =>
                    mintItem({ provider, jwtAuthToken, contentId: content.contentId, dropId: drop.dropId })
                  }
                  className="button is-primary"
                >
                  Mint Item
                </button>
              </div>
            ))}
            <button onClick={() => console.log({ jwtAuthToken })} className="button is-primary">
              Mint Collection
            </button>
          </div>
        ))}
    </div>
  );
}

// {
//   "drops": [
//     {
//       "dropData": {
//         "dropPreviewUrl": "https://dev-mystery-drop-infra-s3-creatordropb67a9c21-tgoa0us55eug.s3.us-east-1.amazonaws.com/uploads/drop_c0f3080b-fe19-4664-b2cc-25497c847c14/5794f4b9-546a-41b7-a2c2-323879cbf48b.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIA2SDB75DXJZ4CPN5M%2F20210414%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20210414T184402Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEJv%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJGMEQCIHl%2BLfEHxLZdxNS5LmA%2BP72jO9HQ1MuL8Iocpr7UKMmiAiBLGU6Jd12Divt6%2BIIiuwQUAYZ5tYNvUWtnK3gs%2BXAM5CrlAQj0%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAAaDDcyNjA1NDk4ODAxNCIMUJftjAvopDZwwNxzKrkBs3SQoy1sZ7Bim%2BSnDqKlhZiMRZf3b9mRJRQaV7gDDZUDs8TdFAFOEMSEgHHkqN9zvs%2BJwbpPE97I37xDSde2ar1VYlewuAZpB0lrUA%2FEBkWNSXWAfgQU7njEsXijzzZjB7oQLH6WBeXdyfmHcbtHa7iH526CX6hHZInBS9rSEzfQtA1ftAxurtONoWfc9Vbv8WLvgsT8sHa5uU9ixb%2FR1eeDyhCT%2F9fgswpzrEayenMepKrny2PezIUwqu7cgwY64QEufEs62%2BbpsEVfZz8zwOHjJufOKUmEXBjm5VcAqx0WipOamyDYo3kcenJVZCDs9byeMAHUSymQbdE89SEQzUuxYYk5NGWpv%2BVO14nR5qy2wwBgrod%2Fr2VCOKzlq5g22oBtkVHVnqGxMcuBW%2BGgg94lh4isU7Zud1TTT4Fq0bi7OaPEEy3aA6LCyLsPP%2FWIczjuudOL8EKtSXpVCRaq43%2B98i%2BdSLDoup2EITF9u9vx3vpMIKvTswyngEUmeyqjwaOzH566I0sBea2rOlzwwVlNp7xod4S4Q8535OkklpueG%2F8%3D&X-Amz-Signature=5456f1dbfe7563bfe2b1a8f5dd562be28171c6ab134279ad3b7c29e22a363c3d&X-Amz-SignedHeaders=host&x-amz-user-agent=aws-sdk-js%2F3.11.0%20os%2Flinux%2F4.14.225-175.364.amzn2.x86_64%20lang%2Fjs%20md%2Fnodejs%2F14.16.1%20api%2Fs3%2F3.11.0%20exec-env%2FAWS_Lambda_nodejs14.x&x-id=GetObject",
//         "dropTitle": "ex",
//         "dropDescription": "red",
//         "numberOfItems": "1",
//         "contentType": "image/png",
//         "dropId": "c0f3080b-fe19-4664-b2cc-25497c847c14",
//         "content": [
//           {
//             "contentId": "6b4381e7-d5a0-4553-a06a-922a3b67b2b9",
//             "contentTitle": "check"
//           }
//         ],
//         "createdAt": "2021-04-14T18:43:27.784Z"
//       }
//     }
//   ]
// }
