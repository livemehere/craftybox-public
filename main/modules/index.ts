import { BaseModuleClass } from './BaseModule';
import { CommonModule, CommonModuleInvokeMap } from './CommonModule';
import { SnapshotModule, SnapshotModuleMessageMap } from './SnapshotModule';
import { WindowModule, WindowModuleInvokeMap } from './WindowModule';

export const bundleModules: BaseModuleClass[] = [
  CommonModule,
  SnapshotModule,
  WindowModule,
];

export type BundleModuleInvokeMap = CommonModuleInvokeMap &
  WindowModuleInvokeMap;

export type BundleModuleMessageMap = SnapshotModuleMessageMap;
