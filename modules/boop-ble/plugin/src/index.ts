import { ConfigPlugin, createRunOncePlugin } from "@expo/config-plugins";

const pkg = require("../../package.json");

const withBoopBle: ConfigPlugin = (config) => {
  return config;
};

export default createRunOncePlugin(withBoopBle, pkg.name, pkg.version);
