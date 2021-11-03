import { Rule } from '@statoscope/stats-validator/dist/rule';
import { Prepared } from '@statoscope/webpack-model';
import {NormalizedCompilation, NormalizedModule} from "@statoscope/webpack-model/types";

export type ResultItem = {
  compilation: NormalizedCompilation;
  modules: Array<{
    module: NormalizedModule;
    exports: Array<{
      name: string;
      imports: NormalizedModule[];
    }>;
  }>;
};

export type Result = ResultItem[];

const rule: Rule<any, Prepared> = (params, data, api) => {
  const result = data.query(`
$ext: "statoscope-stats-extension-modules-connections".resolveExtension(resolveInputFile().name);
$payload: $ext.data.payload;
$imports: $payload.imports.group(=> destModule);
$payload.exports.group(=> compilation).({
  $compilation: key.resolveCompilation();
  $compilation,
  modules: value.group(=> module).({
    $module: key.resolveModule($compilation.hash);
    $module,
    exports: value.({
      $name;
      $name,
      imports: $imports.[key = $module.identifier and value.name has $name].value.sourceModule.(resolveModule($compilation.hash))
    }).[not imports]
  }).[exports]
}).[modules]
    `) as Result;

  for (const compilationItem of result) {
    for (const moduleItem of compilationItem.modules) {
      for (const exportItem of moduleItem.exports) {
        api.message(
          `Export [${exportItem.name}] in module [${moduleItem.module.name}] does not have imports`,
          {
            related: [
              {
                type: 'module',
                id: moduleItem.module.identifier,
              },
            ],
          }
        );
      }
    }
  }
};

export default rule;
