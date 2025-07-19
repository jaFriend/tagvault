import { BlobClient, BlobServiceClient, generateBlobSASQueryParameters, BlobSASPermissions } from "@azure/storage-blob";
import { DefaultAzureCredential } from "@azure/identity";


async function getUploadUrl(userId, filename) {
  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
  const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;

  const credential = new DefaultAzureCredential();
  const blobService = new BlobServiceClient(`https://${accountName}.blob.core.windows.net`, credential);
  const containerClient = blobService.getContainerClient(containerName);
  const blobClient = containerClient.getBlockBlobClient(`${userId}/${filename}`);
  const now = new Date();
  const startsOn = new Date(now.getTime() - 5 * 60 * 1000);
  const expiresOn = new Date(now.getTime() + 5 * 60 * 1000);
  const userDelegationKey = await blobService.getUserDelegationKey(startsOn, expiresOn);
  const sas = generateBlobSASQueryParameters(
    {
      containerName,
      blobName: `${userId}/${filename}`,
      permissions: BlobSASPermissions.parse("acw"),
      startsOn,
      expiresOn,

    },
    userDelegationKey,
    process.env.AZURE_STORAGE_ACCOUNT_NAME
  );
  const blobClientWithSAS = new BlobClient(`${blobClient.url}?${sas.toString()}`);

  return { url_sas: blobClientWithSAS.url, url: blobClient.url, sas: sas.toString() };
}

export {
  getUploadUrl
}
