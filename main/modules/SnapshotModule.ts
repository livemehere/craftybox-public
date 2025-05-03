import { BrowserWindow, desktopCapturer, globalShortcut, screen } from 'electron';
import { Monitor } from 'node-screenshots';
import { mainIpc } from '@electron-buddy/ipc/main';
import { App } from '@main/core/App';

import { BaseModule, TModuleShortcut } from './BaseModule';

export type SnapshotModuleMessageMap = {
  'snapshot:get': {
    response: {
      base64: string;
      x: number;
      y: number;
      width: number;
      height: number;
      scaleFactor: number;
    }; // base64
  };
  'snapshot:reset': {
    response: void;
  };
};

export type SnapshotModuleInvokeMap = {
  "snapshot:list":{
    payload: {
      type:'screen'|'window';
    },
    response:{
      id:string;
      name:string;
      x:number;
      y:number;
      width:number;
      height:number;
      scaleFactor:number;
      dataUrl:string; 
      appIcon?:string;
    }[]
  }
  "snapshot:capture":{
    payload:{
      type:'screen'|'window';
      id:string;
      width:number;
      height:number;
    },
    response:{
      dataUrl:string;
    }
  }
}

export class SnapshotModule extends BaseModule {
  constructor(app: App) {
    super(app, 'SnapshotModule');
  }

  override getShortcuts(): TModuleShortcut[] {
    return [
      {
        key: 'shortcut:capture:cursor',
        fallbackAccelerator: 'Control+1',
        callback: this.handleCaptureWithRenderer.bind(
          this,
          this.app.windowManager.snapshot.win
        ),
      },
    ];
  }

  async registerIpcHandlers() {
    // 스냅샷 관련 IPC 핸들러 등록

    mainIpc.handle('snapshot:list', async ({type})=>{
      const sources = await desktopCapturer.getSources({
        types:[type],
        thumbnailSize: {
          width: 720,
          height: 480,
        },
        fetchWindowIcons:true,
      })
      if(type === 'screen'){
        const displays = screen.getAllDisplays();
        return Array.from({length: displays.length},(_,i)=>{
          const display = displays[i];
          const source = sources[i];
          return {
            id:source.id,
            name:source.name,
            x:display.bounds.x,
            y:display.bounds.y,
            width:display.bounds.width,
            height:display.bounds.height,
            scaleFactor:display.scaleFactor,
            dataUrl:source.thumbnail.toDataURL(),
            appIcon:source.appIcon?.toDataURL(),
          }
        })
      }else{
        return sources.map((source) => {
          return {
            id: source.id,
            name: source.name,
            x: 0,
            y: 0,
            width:0,
            height:0,
            scaleFactor: 1,
            dataUrl: source.thumbnail.toDataURL(),
            appIcon: source.appIcon?.toDataURL(),
          };
        }
        );
      }
    })

    mainIpc.handle('snapshot:capture', async ({type,id,width,height})=>{
      const sources = await desktopCapturer.getSources({
        types:[type],
        thumbnailSize: {
          width,
          height,
        },
      })
      const source = sources.find((source) => source.id === id);
      if(!source){
        throw new Error('Source not found');
      }
      return {
        dataUrl:source.thumbnail.toDataURL(),
      }
    })

  }

  getCurrentCursorMonitor() {
    const point = screen.getCursorScreenPoint();
    return Monitor.fromPoint(point.x, point.y);
  }

  handleCaptureWithRenderer(snapshotWin: BrowserWindow) {
    const monitor = this.getCurrentCursorMonitor();
    if (!monitor) {
      this.logger.error('Monitor not found');
      return;
    }
    const image = monitor?.captureImageSync();
    const buffer = image.toPngSync();
    const base64 = `data:image/png;base64,${buffer.toString('base64')}`;

    snapshotWin.setBounds({
      x: monitor.x,
      y: monitor.y,
      width: monitor.width,
      height: monitor.height,
    });

    mainIpc.send(snapshotWin.webContents, 'snapshot:get', {
      base64,
      x: monitor.x,
      y: monitor.y,
      width: monitor.width,
      height: monitor.height,
      scaleFactor: monitor.scaleFactor,
    });

    globalShortcut.register('esc', () => {
      snapshotWin.hide();
      mainIpc.send(snapshotWin.webContents, 'snapshot:reset', void 0);
      globalShortcut.unregister('esc');
    });

    snapshotWin.show();
    setImmediate(() => {
      snapshotWin.focus();
    });
  }
}
