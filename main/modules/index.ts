import { AppModuleClass } from './AppModule';
import { CommonModule, CommonModuleInvokeMap } from './CommonModule';
import { SnapshotModule } from './SnapshotModule';
import { WindowModule } from './WindowModule';

export const bundleModules: AppModuleClass[] = [
  CommonModule,
  SnapshotModule,
  WindowModule,
];

export type BundleModuleInvokeMap = CommonModuleInvokeMap;
