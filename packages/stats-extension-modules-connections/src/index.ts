import { Extension } from '@statoscope/stats/spec/extension';

const { name, version, description, author, homepage } = require('../package.json');

export type ImportItem = {
  compilation: string;
  moduleFrom: string;
  moduleTo: string;
  name: string;
};

export type ExportItem = {
  compilation: string;
  module: string;
  name: string;
};

export type Payload = {
  imports: ImportItem[];
  exports: ExportItem[];
};

export type Format = Extension<Payload>;

export default class ModulesConnectionsGenerator {
  imports: ImportItem[] = [];
  exports: ExportItem[] = [];

  handleImport(compilation: string, moduleFrom: string, moduleTo: string, name: string) {
    this.imports.push({ compilation, moduleFrom, moduleTo, name });
  }

  handleExport(compilation: string, module: string, name: string) {
    this.exports.push({ compilation, module, name });
  }

  get(): Format {
    return {
      descriptor: { name, version, description, author, homepage },
      payload: { imports: this.imports, exports: this.exports },
    };
  }
}
