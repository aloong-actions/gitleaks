import * as core from "@actions/core";
import * as github from "@actions/github";
import * as exec from "@actions/exec";
import * as gl from "./gitleaks";
import { uploadArtifact } from "./upload-artifact";
import { mergeConfig } from "./merge-config";
import * as state from "./state-helper";
import * as ih from "./input-helper";

async function run(): Promise<void> {
  try {
    const inputs: ih.Inputs = await ih.getInputs();
    core.debug(`github.context: ${github.context}`);
    core.debug(`env: ${process.env}`);

    core.startGroup("Installing Gitleaks");
    const url = ih.getDownloadUrl(inputs);
    await gl.setup(url);
    core.endGroup();

    core.startGroup("Gitleaks Detecting Secrets");
    if (inputs.mergeMode != "ignore") {
      await mergeConfig(inputs.mergeMode);
    }
    const args = await ih.generateArgs(inputs);
    const isSecretsFound = await gl.scan(args);
    await exec.exec("ls -lrt .gitleaks.toml");
    await exec.exec("cat .gitleaks.toml");
    core.endGroup();

    if (isSecretsFound) {
      const filename = ih.getRptFileName(inputs);
      core.startGroup(`Uploading report file ${filename}`);
      await uploadArtifact("gitleaks-report", filename);
      core.endGroup();
      core.setFailed(`secrets detected.`);
    } else {
      core.info(`No secrets detected.`);
    }
  } catch (error) {
    core.setFailed(`${(error as any)?.message ?? error}`);
  }
}

async function cleanup(): Promise<void> {
  try {
    // await gl.clean();
  } catch (error) {
    core.warning(`${(error as any)?.message ?? error}`);
  }
}

if (!state.IsPost) {
  run();
} else {
  // post
  cleanup();
}
