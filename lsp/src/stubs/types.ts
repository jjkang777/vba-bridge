export interface StubParameter {
  name: string;
  type: string;
  optional?: boolean;
  defaultValue?: string;
  description?: string;
}

export interface StubMember {
  name: string;
  kind: 'property' | 'method' | 'event';
  returnType: string;
  parameters?: StubParameter[];
  description: string;
  readonly?: boolean;
}

export interface StubClass {
  name: string;
  description: string;
  members: StubMember[];
  defaultMember?: string;
}
