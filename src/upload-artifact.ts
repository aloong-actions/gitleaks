import * as artifact from "@actions/artifact";
import * as core from "@actions/core";

export async function uploadArtifact(
  artifactName: string,
  filename: string
): Promise<void> {
  const artifactClient = artifact.create();
  const files = [filename];
  const rootDirectory = ".";
  const options = {
    continueOnError: true,
  };

  const uploadResponse = await artifactClient.uploadArtifact(
    artifactName,
    files,
    rootDirectory,
    options
  );

  if (uploadResponse.failedItems.length != 0) {
    core.error(`Upload artifacts failed: ${uploadResponse.failedItems}`);
  }
}
