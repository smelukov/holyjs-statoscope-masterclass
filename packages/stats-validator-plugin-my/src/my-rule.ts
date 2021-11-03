import { Rule } from '@statoscope/stats-validator/dist/rule';
import { Prepared } from '@statoscope/webpack-model';
import { NormalizedCompilation, NormalizedModule } from '@statoscope/webpack-model/types';

export type ResultItem = {
  compilation: NormalizedCompilation;
  modules: Array<{
    module: NormalizedModule;
    exports: Array<{
      name: string;
      imports: [];
    }>;
  }>;
};

export type Result = ResultItem[];

const myRule: Rule<any, Prepared> = (params, data, api) => {
  const result = data.query(`
$ext: "statoscope-stats-extension-modules-connections".resolveExtension(resolveInputFile().name);
$payload: $ext.data.payload;
$imports: $payload.imports.group(=> moduleTo);
$payload.exports.group(=> compilation).({
  $compilation: key.resolveCompilation();
  $compilation,
  modules: value.group(=> module).({
    $module: key.resolveModule($compilation.hash);
    $module,
    exports: value.({
      $name;
      $name,
      imports: $imports.[key = $module.identifier and value.name has $name]
    }).[not imports]
  }).[exports]
}).[modules]
  `) as Result;

  for (const item of result) {
    for (const moduleItem of item.modules) {
      for (const exportItem of moduleItem.exports) {
        api.message(`Export ${exportItem.name} in ${moduleItem.module.name} is not used.`, {
          related: [{ type: 'module', id: moduleItem.module.identifier }],
          details: [
            {
              type: 'discovery',
              view: ['h2:"Custom UI"', 'struct'],
              query: `
              {
                module: #.module.resolveModule(#.compilation),
                export: #.export
              }
              `,
              payload: {
                context: {
                  compilation: item.compilation.hash,
                  module: moduleItem.module.identifier,
                  export: exportItem.name,
                },
              },
            },
          ],
        });
      }
    }
  }
};

export default myRule;
