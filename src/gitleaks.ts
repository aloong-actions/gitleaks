import * as tc from "@actions/tool-cache";
import * as core from "@actions/core";
import * as exec from "@actions/exec";

export async function setup(toolUrl: string): Promise<void> {
  const downloadPath = await tc.downloadTool(toolUrl);
  const extractPath = await tc.extractTar(downloadPath);
  core.addPath(extractPath);
  await exec.exec("gitleaks version");
}

export async function scan(customizedArgs: Array<string>): Promise<boolean> {
  return await exec
    .getExecOutput(
      "gitleaks detect -c .gitleaks.toml --redact",
      customizedArgs,
      {
        ignoreReturnCode: true,
      }
    )
    .then((res) => {
      if (res.stderr.length > 0 && res.exitCode != 0) {
        // core.error(`secrets detected.`);
        return true;
      }
      return false;
    });
}

// export async function clean():Promise<void> {
// pass
// }
