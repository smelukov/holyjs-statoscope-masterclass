import { StatsExtensionWebpackAdapter } from '@statoscope/webpack-model';
import ModulesConnectionsGenerator, {
  Payload,
} from 'statoscope-stats-extension-modules-connections';
import { Compiler } from 'webpack';

export default class WebpackModulesConnections implements StatsExtensionWebpackAdapter<Payload> {
  generator = new ModulesConnectionsGenerator();

  handleCompiler(compiler: Compiler, context: string): void {
    compiler.hooks.done.tap('webpack-stats-extension-modules-connections', ({ compilation }) => {
      for (const module of compilation.modules) {
        const connections = compilation.moduleGraph.getOutgoingConnections(module);

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

        const exportsInfo = compilation.moduleGraph.getExportsInfo(module);

        for (const exportInfo of exportsInfo.exports) {
          this.generator.handleExport(compilation.hash!, module.identifier(), exportInfo.name);
        }
      }
    });
  }

  getExtension() {
    return this.generator.get();
  }
}
