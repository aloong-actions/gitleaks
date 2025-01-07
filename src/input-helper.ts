import * as core from "@actions/core";
import * as github from "@actions/github";
export interface Inputs {
  token: string;
  version: string;
  mergeMode: string;
  format: string;
  rptPrefix: string;
}

export async function getInputs(): Promise<Inputs> {
  return {
    token: core.getInput("core"),
    version: core.getInput("version"),
    mergeMode: core.getInput("rule-merge-mode"),
    format: core.getInput("format"),
    rptPrefix: core.getInput("report-file-prefix"),
  };
}

export async function generateArgs(inputs: Inputs): Promise<Array<string>> {
  const args: Array<string> = [];
  if (inputs.format) {
    args.push("-f", inputs.format);
  }
  if (inputs.rptPrefix) {
    args.push("-r", getRptFileName(inputs));
  }
  return args;
}

export function getRptFileName(inputs: Inputs): string {
  return `${inputs.rptPrefix}-${github.context.repo.repo}-${github.context.runNumber}.${inputs.format}`;
}

export function getDownloadUrl(inputs: Inputs): string {
  return `https://github.com/zricethezav/gitleaks/releases/download/v${inputs.version}/gitleaks_${inputs.version}_linux_x64.tar.gz`;
}
