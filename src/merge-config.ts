// import * as toml from "toml"
import * as toml from "@iarna/toml";
import * as fs from "fs";
import * as path from "path";
import * as core from "@actions/core";

interface allowlist {
  description: string;
  regexes: Array<string>;
  paths: Array<string>;
}

interface rule {
  id: string;
  [key: string]: any;
}

interface config {
  title: string;
  allowlist: allowlist;
  rules: Array<rule>;
}

export async function mergeConfig(mode: string): Promise<void> {
  // __dirname is repo/dist/
  const baseRuleFile = path.resolve(__dirname, "..", "gitleaks-rules.toml");
  const baseRuleConfig: config = toml.parse(fs.readFileSync(baseRuleFile, "utf8")) as any;
  let customizedConfig: config = toml.parse(
    fs.readFileSync(".gitleaks.toml", "utf8")
  ) as any;

  switch (mode) {
    case "replace":
      customizedConfig = await mergeAndReplaceConfig(baseRuleConfig, customizedConfig);
      break;
    case "retain":
      customizedConfig = await mergeAndRetainConfig(baseRuleConfig, customizedConfig);
      break;
    default:
      core.error(`Unknown mode ${mode}.`);
  }

  fs.writeFileSync(".gitleaks.toml", toml.stringify(customizedConfig as any));
}

async function mergeAndReplaceConfig(
  baseConfig: config,
  myConfig: config
): Promise<config> {
  // Get the ids in the base rule file. If any rule in the customized file, remove all of them.
  // then merge the base rules into the config file.
  core.info(
    "Merge base rules and replace customized rules with the same id into gitleaks.toml"
  );
  const baseRules: rule[] = baseConfig.rules;

  const ids: Array<string> = [];
  for (let v of baseRules) {
    ids.push(v.id);
  }
  myConfig.rules = myConfig.rules.filter((r) => {
    return !ids.includes(r.id);
  });
  for (let br of baseRules) {
    myConfig.rules.push(br);
  }

  return myConfig;
}

async function mergeAndRetainConfig(
  baseConfig: config,
  myConfig: config
): Promise<config> {
  // Merge the base rules into the config file. If the base rule file and customized config file
  // have rules with the same id, retain the rule of customized file.
  core.info(
    "Merge base rules and retain customized rules with the same id into .gitleaks.toml"
  );

  const ids: Array<string> = [];
  for (let v of myConfig.rules) {
    ids.push(v.id);
  }
  for (let br of baseConfig.rules) {
    if (ids.includes(br.id)) {
      continue;
    }
    myConfig.rules.push(br);
  }

  return myConfig;
}
