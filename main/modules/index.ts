import { BaseModuleClass } from './BaseModule';
import { CommonModule, CommonModuleInvokeMap } from './CommonModule';
import { SnapshotModule, SnapshotModuleInvokeMap, SnapshotModuleMessageMap } from './SnapshotModule';
import { WindowModule, WindowModuleInvokeMap } from './WindowModule';

export const bundleModules: BaseModuleClass[] = [
  CommonModule,
  SnapshotModule,
  WindowModule,
];

export type BundleModuleInvokeMap = CommonModuleInvokeMap &
  WindowModuleInvokeMap & SnapshotModuleInvokeMap;

export type BundleModuleMessageMap = SnapshotModuleMessageMap;
