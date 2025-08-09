import vm from "vm";
import path from "path";
import ts from "typescript";
import { printHelp } from "./help";
import { existsSync, readFileSync } from "fs";
import type { MaythraConfiguration } from "./../maythracfg";

export function parseArgs(args: string[]) {
  if (args.length == 0) {
    printHelp();
    process.exit(0);
  }

  let configFile = "./maythra.config.ts";

  for (let i = 0; i < args.length; i++) {
    if (!args[i].startsWith("--")) continue;

    const argname = args[i].substring(2);

    if (argname == "schema") {
      configFile = args[i + 1] ?? configFile;
      args.splice(i + 1, 1);
    }

    args.splice(i, 1);
    i--;
  }

  configFile = path.join(process.cwd(), configFile);

  return {
    configFile,
    action: args[0] ?? "<unspecified action>",
  };
}

export function loadConfig(configFile: string) {
  if (!existsSync(configFile)) {
    console.error("Configuration file does not exist: ", configFile);
    return process.exit(-1);
  }
  console.log("Loading " + configFile + "...");

  // loading the configuration file.
  const configFileModule = ts.transpileModule(
    readFileSync(configFile).toString(),
    {
      compilerOptions: {
        strict: true,
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ESNext,
        esModuleInterop: true,
        rewriteRelativeImportExtensions: true,
        rootDir: process.cwd(),
      },
      fileName: configFile,
    }
  );

  if (
    configFileModule.diagnostics &&
    configFileModule.diagnostics.find(
      (v) => v.category == ts.DiagnosticCategory.Error
    )
  ) {
    console.error("Failed to load config file: ", configFile, " (invalid)");
    console.error(
      configFileModule.diagnostics
        .map((v) => `${v.file}:${v.start} error ${v.code}: ${v.messageText}`)
        .join("\n")
    );
    return process.exit(-1);
  }

  let exports = {};

  const context = vm.createContext({
    require: (mp: string) => {
      return require("./../maythracfg");
    },
    exports,
  });

  const script = new vm.Script(configFileModule.outputText, {
    filename: configFile,
  });
  script.runInContext(context);

  const cfg = "default" in exports ? exports["default"] : undefined;

  if (!cfg) {
    console.error("Bad configuration file at " + configFile + ".");
    console.error("Could not read default export.");
    process.exit(-1);
  }
  return cfg as MaythraConfiguration;
}
