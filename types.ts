export interface Member {
  id: string;
  name: string;
  category: string;
  company: string;
  color: string;
}

export interface SpinResult {
  member: Member;
  rotation: number;
}
