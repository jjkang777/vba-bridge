import { StubClass, StubMember } from './types';
import { excelClasses, globalFunctions } from './excel';

export { StubClass, StubMember, StubParameter } from './types';

const classMap = new Map<string, StubClass>();
for (const cls of excelClasses) {
  classMap.set(cls.name.toLowerCase(), cls);
}

const globalMap = new Map<string, StubMember>();
for (const fn of globalFunctions) {
  globalMap.set(fn.name.toLowerCase(), fn);
}

export function getStubClass(name: string): StubClass | undefined {
  return classMap.get(name.toLowerCase());
}

export function getStubMember(className: string, memberName: string): StubMember | undefined {
  const cls = classMap.get(className.toLowerCase());
  if (!cls) return undefined;
  return cls.members.find(m => m.name.toLowerCase() === memberName.toLowerCase());
}

export function getAllStubClasses(): StubClass[] {
  return excelClasses;
}

export function getGlobalFunction(name: string): StubMember | undefined {
  return globalMap.get(name.toLowerCase());
}

export function getAllGlobalFunctions(): StubMember[] {
  return globalFunctions;
}
