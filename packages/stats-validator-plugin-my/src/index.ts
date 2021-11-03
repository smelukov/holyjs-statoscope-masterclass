import { PluginFn } from '@statoscope/stats-validator/dist/plugin';
import { Prepared } from '@statoscope/webpack-model';
import myRule from './my-rule';

const plugin: PluginFn<Prepared> = () => {
  return {
    rules: {
      'my-rule': myRule,
    },
  };
};

export default plugin;
