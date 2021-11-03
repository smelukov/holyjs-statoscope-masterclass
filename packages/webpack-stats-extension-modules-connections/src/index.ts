import ModulesConnectionsGenerator, {
  Format, Payload,
} from 'statoscope-stats-extension-modules-connections';
import {Compiler} from 'webpack';
import {StatsExtensionWebpackAdapter} from "@statoscope/webpack-model";
const {name, version} = require('../package.json')

export default class WebpackModulesConnectionsGenerator implements StatsExtensionWebpackAdapter<Payload> {
  generator = new ModulesConnectionsGenerator();

  handleCompiler(compiler: Compiler, context: string) {
    compiler.hooks.done.tap(`${name}@${version}`, (stats) => {
      const compilation = stats.compilation;

      for (const module of compilation.modules) {
        const connections = compilation.moduleGraph.getOutgoingConnections(module);
        const exportsInfo = compilation.moduleGraph.getExportsInfo(module);

        for (const connection of connections) {
          // @ts-ignore
          for (const id of connection.dependency.ids ?? []) {
            this.generator.handleImport(
              compilation.hash!,
              module.identifier(),
              connection.module.identifier(),
              id
            );
          }
        }

        for (const exportItem of exportsInfo.exports) {
          this.generator.handleExport(
            compilation.hash!,
            module.identifier(),
            exportItem.name
          );
        }
      }
    })
  }

  getExtension(): Format {
    return this.generator.get();
  }
}
