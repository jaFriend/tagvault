import { BlobClient, BlobServiceClient, generateBlobSASQueryParameters, BlobSASPermissions } from "@azure/storage-blob";
import { DefaultAzureCredential } from "@azure/identity";

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;
const credential = new DefaultAzureCredential();
const blobService = new BlobServiceClient(`https://${accountName}.blob.core.windows.net`, credential);
const containerClient = blobService.getContainerClient(containerName);

async function getSasUrl(userId, filename, perms) {
  const blobClient = containerClient.getBlockBlobClient(`${userId}/${filename}`);
  const now = new Date();
  const startsOn = new Date(now.getTime() - 2 * 60 * 1000);
  const expiresOn = new Date(now.getTime() + 2 * 60 * 1000);
  const userDelegationKey = await blobService.getUserDelegationKey(startsOn, expiresOn);
  const sas = generateBlobSASQueryParameters(
    {
      containerName,
      blobName: `${userId}/${filename}`,
      permissions: BlobSASPermissions.parse(perms),
      startsOn,
      expiresOn,

    },
    userDelegationKey,
    process.env.AZURE_STORAGE_ACCOUNT_NAME
  );
  const blobClientWithSAS = new BlobClient(`${blobClient.url}?${sas.toString()}`);

  return { url_sas: blobClientWithSAS.url, url: blobClient.url, sas: sas.toString() };
}

async function deleteFile(userId, filename) {
  const blobPath = `${userId}/${filename}`;
  const blobClient = containerClient.getBlockBlobClient(blobPath);

  try {
    const result = await blobClient.deleteIfExists();
    return {
      success: result.succeeded,
      deleted: result.succeeded,
      blobPath
    };
  } catch (error) {
    console.error('Error deleting blob:', error.message);
    return {
      success: false,
      deleted: false,
      error: error.message,
      blobPath
    };
  }
}


export {
  getSasUrl,
  deleteFile
}
