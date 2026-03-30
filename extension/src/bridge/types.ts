export interface BridgeRequest {
  command: 'list' | 'pull' | 'push';
  workbook?: string;
  outDir?: string;
  modules?: string[];
}

export interface BridgeResponse {
  ok: boolean;
  error?: string;
  code?: string;
}

export interface WorkbookInfo {
  name: string;
  path: string;
}

export interface ListResponse extends BridgeResponse {
  workbooks: WorkbookInfo[];
}

export interface ModuleInfo {
  name: string;
  type: string;
  file: string;
}

export interface PullResponse extends BridgeResponse {
  modules: ModuleInfo[];
}

export interface PushResponse extends BridgeResponse {
  pushed: number;
}
